"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import { createClient } from "@/lib/supabase/client"

// Fix for default marker icons in Leaflet (required for mobile)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

interface Pharmacy {
  id: string
  name: string
  latitude: number
  longitude: number
  rating: number
  status: "مفتوح" | "مغلق"
  is_verified?: boolean
  distance?: number
}

interface InteractiveMapProps {
  pharmacies: Pharmacy[]
  selectedPharmacy: Pharmacy | null
  onSelectPharmacy: (pharmacy: Pharmacy) => void
  onNavigate?: (pharmacy: Pharmacy) => void
}

// Function to fetch route from OSRM
async function fetchRouteFromOSRM(start: [number, number], end: [number, number]): Promise<L.LatLngExpression[] | null> {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
    )

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      const coordinates = route.geometry.coordinates

      // Convert from [lng, lat] to [lat, lng] for Leaflet
      return coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as L.LatLngExpression)
    }

    return null
  } catch (error) {
    console.error("Error fetching route from OSRM:", error)
    return null
  }
}

export default function InteractiveMap({ pharmacies, selectedPharmacy, onSelectPharmacy, onNavigate }: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const userMarkerRef = useRef<L.CircleMarker | null>(null)
  const routeLayerRef = useRef<L.Polyline | null>(null)
  const [currentZoom, setCurrentZoom] = useState<number>(13)
  const infoControlRef = useRef<L.Control | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [mapError, setMapError] = useState(false)

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(userCoords)
          console.log("User location:", userCoords)
        },
        (error) => {
          // Silently handle geolocation error and use fallback
          setUserLocation([36.7538, 3.0588]) // Algiers fallback
        },
      )
    } else {
      setUserLocation([36.7538, 3.0588])
    }
  }, [])

  useEffect(() => {
    if (!userLocation) return

    if (!mapRef.current && typeof window !== "undefined") {
      const mapContainer = document.getElementById("map")
      if (!mapContainer) return

      // Ensure container has dimensions
      if (mapContainer.offsetHeight === 0) {
        mapContainer.style.height = '400px'
      }

      try {
        mapRef.current = L.map("map", {
          zoomControl: true,
          attributionControl: true,
          preferCanvas: true, // Better performance on mobile
          tap: true, // Enable tap on mobile
          touchZoom: true,
        }).setView(userLocation, 13)

        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
          detectRetina: true, // Better display on high-DPI screens
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // Transparent 1x1 pixel
        })

        tileLayer.on('tileerror', () => {
          if (!navigator.onLine) {
            setMapError(true)
          }
        })

        tileLayer.addTo(mapRef.current)

        // Force resize after initialization (fixes mobile display issues)
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, 100)

        // Add zoom event listener
        mapRef.current.on('zoomend', () => {
          const zoom = mapRef.current!.getZoom()
          setCurrentZoom(zoom)
        })

      // Add custom info control to show filter information
      const infoControl = L.Control.extend({
        onAdd: function() {
          const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar')
          div.style.backgroundColor = 'white'
          div.style.padding = '10px'
          div.style.borderRadius = '8px'
          div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
          div.innerHTML = `
            <div style="font-size: 12px; color: #374151; font-weight: bold; white-space: nowrap;">
              📍 صيدليات: ${pharmacies.length}
            </div>
          `
          return div
        }
      })
      new infoControl({ position: 'topright' }).addTo(mapRef.current)

      userMarkerRef.current = L.circleMarker(userLocation, {
        radius: 12,
        fillColor: "#3b82f6",
        color: "#ffffff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .bindPopup("<div style='text-align: center; font-weight: bold;'>📍 موقعك الحالي</div>")
        .addTo(mapRef.current)
      
      console.log("✅ Map initialized at user location:", userLocation)
      } catch (error) {
        console.error("Error initializing map:", error)
        setMapError(true)
      }
    }

    if (!mapRef.current) return

    // Clear existing pharmacy markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    const pharmaciesToShow = pharmacies

    console.log("🔷 InteractiveMap received pharmacies:", pharmaciesToShow.length, "pharmacies")
    console.log("📍 Pharmacy details:", pharmaciesToShow.map(p => ({ 
      name: p.name, 
      lat: p.latitude, 
      lng: p.longitude, 
      distance: p.distance,
      status: p.status,
      validCoords: isFinite(p.latitude) && isFinite(p.longitude)
    })))
    
    if (pharmaciesToShow.length === 0) {
      console.warn("⚠️ No pharmacies to show on map!")
    }

    pharmaciesToShow.forEach((pharmacy) => {
      // Validate coordinates before adding marker
      if (!isFinite(pharmacy.latitude) || !isFinite(pharmacy.longitude)) {
        console.error(`❌ Invalid coordinates for pharmacy: ${pharmacy.name}`, {
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude
        })
        return
      }

      const isSelected = selectedPharmacy?.id === pharmacy.id
      const isOpen = pharmacy.status === "مفتوح"

      // Calculate dynamic icon size based on zoom level
      // Base size at zoom 13, scale down for lower zoom, cap at reasonable max
      const baseSize = 35
      const zoomFactor = Math.max(0.3, Math.min(1.5, currentZoom / 13)) // Min 0.3, max 1.5
      const iconSize = Math.round(baseSize * zoomFactor)
      const fontSize = Math.round(26 * zoomFactor)
      const borderWidth = Math.max(2, Math.round(4 * zoomFactor))
      const padding = Math.max(4, Math.round(6 * zoomFactor))
      const labelFontSize = Math.max(10, Math.round(12 * zoomFactor))

      const icon = L.divIcon({
        html: `
          <div style="text-align: center; width: ${iconSize + 30}px;">
            <div style="
              width: ${iconSize}px;
              height: ${iconSize}px;
              background: ${isOpen ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"};
              border-radius: 50%;
              border: ${borderWidth}px solid white;
              box-shadow: 0 6px 20px rgba(0,0,0,0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto ${Math.round(8 * zoomFactor)}px auto;
              transition: all 0.3s;
              ${isSelected ? "transform: scale(1.3); box-shadow: 0 8px 28px rgba(16, 185, 129, 0.6);" : ""}
            ">
              <span style="font-size: ${fontSize}px;">💊</span>
            </div>
            <div style="
              background: white;
              padding: ${padding}px ${padding + 4}px;
              border-radius: 12px;
              font-size: ${labelFontSize}px;
              font-weight: bold;
              color: ${isOpen ? "#10b981" : "#ef4444"};
              white-space: nowrap;
              max-width: 120px;
              overflow: hidden;
              text-overflow: ellipsis;
              box-shadow: 0 4px 10px rgba(0,0,0,0.2);
              border: 2px solid ${isOpen ? "#10b981" : "#ef4444"};
            ">${pharmacy.name}</div>
          </div>
        `,
        className: "pharmacy-marker-cute",
        iconSize: [iconSize + 30, iconSize + 35],
        iconAnchor: [Math.round((iconSize + 30) / 2), iconSize + 10],
        popupAnchor: [0, -iconSize - 10],
      })

      const marker = L.marker([pharmacy.latitude, pharmacy.longitude], { icon })

      marker.bindPopup(`
        <div style="padding: 14px; text-align: center; min-width: 160px;">
          <div style="font-size: 32px; margin-bottom: 10px;">💊</div>
          <h3 style="margin: 0 0 10px 0; font-size: 17px; font-weight: bold; color: #1f2937;">${pharmacy.name}</h3>
          <p style="margin: 8px 0; font-size: 14px; color: #6b7280;">⭐ ${pharmacy.rating.toFixed(1)}</p>
          <p style="margin: 8px 0; font-size: 14px; font-weight: bold; color: ${isOpen ? "#10b981" : "#ef4444"};
             background: ${isOpen ? "#d1fae5" : "#fee2e2"}; padding: 6px 10px; border-radius: 8px;">
            ${pharmacy.status}
          </p>
          ${pharmacy.distance ? `<p style="margin: 8px 0; font-size: 14px; color: #374151; font-weight: bold;">
            📍 المسافة: ${pharmacy.distance.toFixed(2)} كم
          </p>` : ''}
        </div>
      `)

      marker.on("click", () => {
        onSelectPharmacy(pharmacy)

        if (userLocation) {
          if (routeLayerRef.current) {
            routeLayerRef.current.remove()
          }

          // Fetch route from OSRM
          fetchRouteFromOSRM(userLocation, [pharmacy.latitude, pharmacy.longitude])
            .then((routeCoordinates) => {
              if (routeCoordinates && routeCoordinates.length > 0) {
                routeLayerRef.current = L.polyline(routeCoordinates, {
                  color: "#10b981",
                  weight: 6,
                  opacity: 0.8,
                  lineCap: "round"
                }).addTo(mapRef.current!)

                console.log("OSRM route drawn from user to pharmacy")
              } else {
                // Fallback to straight line if OSRM fails
                console.warn("OSRM failed, using straight line")
                const latlngs: L.LatLngExpression[] = [
                  [userLocation[0], userLocation[1]],
                  [pharmacy.latitude, pharmacy.longitude]
                ]

                routeLayerRef.current = L.polyline(latlngs, {
                  color: "#10b981",
                  weight: 6,
                  opacity: 0.8,
                  dashArray: "15, 10",
                  lineCap: "round"
                }).addTo(mapRef.current!)

                mapRef.current!.fitBounds(routeLayerRef.current.getBounds(), {
                  padding: [70, 70],
                  maxZoom: 14
                })
              }
            })
            .catch((error) => {
              console.error("Error fetching route from OSRM:", error)
              // Fallback to straight line
              const latlngs: L.LatLngExpression[] = [
                [userLocation[0], userLocation[1]],
                [pharmacy.latitude, pharmacy.longitude]
              ]

              routeLayerRef.current = L.polyline(latlngs, {
                color: "#10b981",
                weight: 6,
                opacity: 0.8,
                dashArray: "15, 10",
                lineCap: "round"
              }).addTo(mapRef.current!)

              mapRef.current!.fitBounds(routeLayerRef.current.getBounds(), {
                padding: [70, 70],
                maxZoom: 14
              })
            })
        }

        marker.openPopup()
      })

      marker.addTo(mapRef.current!)
      markersRef.current.set(pharmacy.id, marker)
    })

    // User has complete freedom - no zoom changes, no map movement
    // Only draw the route when pharmacy is selected
    console.log("📍 Pharmacy markers added. Map is completely free for user.")

    if (selectedPharmacy && mapRef.current) {
      if (routeLayerRef.current) {
        routeLayerRef.current.remove()
      }

      // Only draw route, don't move or zoom the map
      fetchRouteFromOSRM(userLocation, [selectedPharmacy.latitude, selectedPharmacy.longitude])
        .then((routeCoordinates) => {
          if (routeCoordinates && routeCoordinates.length > 0) {
            routeLayerRef.current = L.polyline(routeCoordinates, {
              color: "#10b981",
              weight: 6,
              opacity: 0.8,
              lineCap: "round"
            }).addTo(mapRef.current!)

            console.log("✅ Route drawn from user to pharmacy")
          } else {
            // Fallback to straight line if OSRM fails
            console.warn("⚠️ OSRM failed, using straight line")
            const latlngs: L.LatLngExpression[] = [
              [userLocation[0], userLocation[1]],
              [selectedPharmacy.latitude, selectedPharmacy.longitude]
            ]

            routeLayerRef.current = L.polyline(latlngs, {
              color: "#10b981",
              weight: 6,
              opacity: 0.8,
              dashArray: "15, 10",
              lineCap: "round"
            }).addTo(mapRef.current!)
          }
        })
        .catch((error) => {
          console.error("Error fetching route:", error)
          // Fallback to straight line
          const latlngs: L.LatLngExpression[] = [
            [userLocation[0], userLocation[1]],
            [selectedPharmacy.latitude, selectedPharmacy.longitude]
          ]

          routeLayerRef.current = L.polyline(latlngs, {
            color: "#10b981",
            weight: 6,
            opacity: 0.8,
            dashArray: "15, 10",
            lineCap: "round"
          }).addTo(mapRef.current!)
        })
    }
  }, [pharmacies, selectedPharmacy, onSelectPharmacy, onNavigate, userLocation, currentZoom])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Show offline message when no internet
  if (!isOnline || mapError) {
    return (
      <div className="w-full h-96 rounded-2xl border-2 border-emerald-100 shadow-lg overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-sm">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 animate-ping" />
            <div className="relative bg-white rounded-full p-5 shadow-lg">
              <svg className="w-14 h-14 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-emerald-900">
              {!isOnline ? '📡 لا يوجد اتصال بالإنترنت' : '🗺️ خطأ في تحميل الخريطة'}
            </h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              {!isOnline 
                ? 'يرجى التحقق من اتصالك بالإنترنت لعرض الخريطة والصيدليات القريبة منك'
                : 'حدث خطأ أثناء تحميل الخريطة. يرجى المحاولة مرة أخرى'
              }
            </p>
          </div>
          {!isOnline && (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 bg-white/50 rounded-lg p-3 backdrop-blur-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-semibold">غير متصل</span>
            </div>
          )}
          {isOnline && mapError && (
            <button
              onClick={() => {
                setMapError(false)
                window.location.reload()
              }}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              🔄 إعادة المحاولة
            </button>
          )}
        </div>
      </div>
    )
  }

  return <div id="map" className="w-full h-96 rounded-2xl border-2 border-emerald-100 shadow-lg overflow-hidden" />
}
