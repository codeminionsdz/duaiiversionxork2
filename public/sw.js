// Service Worker for دوائي App - PWA + Offline Support + Push Notifications
const CACHE_NAME = 'duaiii-v3-offline'
const STATIC_CACHE = 'duaiii-static-v3'
const API_CACHE = 'duaiii-api-v3'
const PAGES_CACHE = 'duaiii-pages-v3'

// URLs to cache on install (static assets + app shell + all pages)
const URLS_TO_CACHE = [
  '/',
  '/home',
  '/auth/login',
  '/auth/signup',
  '/upload',
  '/prescriptions',
  '/medicines',
  '/favorites',
  '/notifications',
  '/profile',
  '/pharmacy/dashboard',
  '/pharmacy/profile',
  '/images/logo.png',
  '/images/logo-192.png',
  '/icon.svg',
  '/manifest.json',
]

// Install event - cache important files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets...')
        return cache.addAll(URLS_TO_CACHE).catch((err) => {
          console.warn('⚠️ Cache addAll error:', err)
        })
      }),
      // Prepare API cache
      caches.open(API_CACHE),
    ])
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating.')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches (keep only v3 caches)
          if (!cacheName.includes('v3') && !cacheName.includes('map-tiles') && !cacheName.includes('leaflet-assets')) {
            console.log('🗑️ Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Message event - handle messages from client
self.addEventListener('message', (event) => {
  console.log('📨 Message received in SW:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_SUBSCRIPTION') {
    // Handle subscription request
    self.registration.pushManager.getSubscription().then((subscription) => {
      event.ports[0].postMessage({
        subscription: subscription ? subscription.toJSON() : null
      })
    }).catch((error) => {
      console.error('Error getting subscription:', error)
      event.ports[0].postMessage({ error: error.message })
    })
  }
})

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Don't cache POST, PUT, DELETE, PATCH requests
  if (request.method !== 'GET') {
    return
  }

  // Let Next.js assets bypass the SW to avoid chunk caching issues
  if (url.pathname.startsWith('/_next/')) {
    return
  }

  // Don't cache API requests - let them fail gracefully offline
  // This ensures offline detection works properly
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // On offline, return 503 Service Unavailable
        // Let app handle offline detection
        return new Response(
          JSON.stringify({ error: 'Offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // Cache OpenStreetMap tiles for offline map support
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open('map-tiles-v1').then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response
          }

          return fetch(request).then((response) => {
            // Only cache successful responses
            if (response && response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          }).catch(() => {
            // Return transparent 1x1 pixel for failed tiles
            return new Response(
              atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='),
              { 
                status: 200,
                headers: { 'Content-Type': 'image/png' }
              }
            )
          })
        })
      })
    )
    return
  }

  // Cache Leaflet assets
  if (url.hostname.includes('unpkg.com') && url.pathname.includes('leaflet')) {
    event.respondWith(
      caches.open('leaflet-assets-v1').then((cache) => {
        return cache.match(request).then((response) => {
          return response || fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          })
        })
      })
    )
    return
  }

  // Cache static assets (images, CSS, JS)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/)
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          // Return cached version
          return response
        }

        // Try to fetch from network and cache it
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            const responseToCache = response.clone()
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })

            return response
          })
          .catch(() => {
            // Return placeholder for failed static assets
            if (request.destination === 'image') {
              return caches.match('/placeholder.svg')
            }
            return new Response('Offline', { status: 503 })
          })
      })
    )
    return
  }

  // For HTML pages, use CACHE-FIRST strategy for offline support
  // This allows full navigation even without internet
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version immediately if available
      if (cachedResponse) {
        // Update cache in background (stale-while-revalidate)
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(PAGES_CACHE).then((cache) => {
                cache.put(request, response.clone())
              })
            }
          })
          .catch(() => {
            // Silently fail - we already have cached version
          })
        
        return cachedResponse
      }

      // If not cached, try network and cache it
      return fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(PAGES_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // If network fails and no cache, return offline page
          return caches.match('/').then((home) => {
            return home || new Response(
              `<!DOCTYPE html>
              <html lang="ar" dir="rtl">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>دوائي - غير متصل</title>
                <style>
                  body {
                    font-family: 'Cairo', -apple-system, sans-serif;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    color: white;
                    text-align: center;
                    padding: 20px;
                  }
                  .container {
                    max-width: 400px;
                  }
                  h1 { font-size: 2.5rem; margin-bottom: 1rem; }
                  p { font-size: 1.1rem; opacity: 0.9; }
                  .icon { font-size: 4rem; margin-bottom: 1rem; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="icon">📡</div>
                  <h1>لا يوجد اتصال</h1>
                  <p>يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى</p>
                </div>
              </body>
              </html>`,
              { 
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
              }
            )
          })
        })
    })
  )
})

// Push event - handle incoming push notifications for all roles
self.addEventListener('push', (event) => {
  console.log('🔔 Push received:', event)

  let data = {}

  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      console.warn('⚠️ Could not parse push data as JSON:', e)
      data = { body: event.data.text() }
    }
  }

  // Support all roles: patient, pharmacy, admin
  const title = data.title || 'دوائي - Duaiii'
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: data.icon || '/icon.svg',
    badge: '/icon.svg',
    image: data.image,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1,
      url: data.url || '/',
      role: data.role || 'patient', // patient, pharmacy, admin
      userId: data.userId,
      actionType: data.actionType // prescription_received, response_received, etc.
    },
    actions: data.actions || [
      {
        action: 'view',
        title: 'عرض',
        icon: '/icon.svg'
      },
      {
        action: 'dismiss',
        title: 'تجاهل'
      }
    ],
    requireInteraction: true,
    silent: false,
    tag: data.tag || 'default-notification'
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('✅ Notification displayed'))
      .catch((error) => console.error('❌ Error showing notification:', error))
  )
})

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification click received:', event)

  event.notification.close()

  const url = event.notification.data?.url || '/'
  const role = event.notification.data?.role || 'patient'
  
  // Redirect based on action
  let finalUrl = url
  if (event.action === 'view') {
    finalUrl = url
  } else if (event.action === 'dismiss') {
    return
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === finalUrl && 'focus' in client) {
            return client.focus()
          }
        }

        // If not, open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(finalUrl)
        }
      })
      .catch((error) => console.error('Error handling notification click:', error))
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('🚫 Notification closed:', event)
})

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    console.log('⏳ Performing background sync...')
    // Implement background sync logic here
    // This could include syncing offline data, updating cache, etc.
  } catch (error) {
    console.error('❌ Background sync failed:', error)
  }
}

