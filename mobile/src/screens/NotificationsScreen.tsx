import React, { useEffect, useState } from 'react'
import { View, Text, Button, Alert, ScrollView } from 'react-native'
import * as Notifications from 'expo-notifications'
import { supabase } from '../lib/supabase'

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function NotificationsScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    registerForPushNotifications()
    const subscription = Notifications.addNotificationResponseListener((response) => {
      console.log('📢 Notification received:', response)
    })
    return () => subscription.remove()
  }, [])

  async function registerForPushNotifications() {
    try {
      const { status } = await Notifications.getPermissionsAsync()
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync()
        if (newStatus !== 'granted') {
          Alert.alert('تنبيه', 'لم يتم منح إذن الإشعارات')
          return
        }
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data
      setExpoPushToken(token)
      console.log('✅ Expo Push Token:', token)

      // Save token to Supabase
      const { data: user } = await supabase.auth.getUser()
      if (user?.user?.id) {
        await supabase.from('user_tokens').upsert({
          user_id: user.user.id,
          expo_push_token: token,
          updated_at: new Date(),
        })
      }
    } catch (error) {
      console.error('❌ Failed to register for push:', error)
    }
  }

  async function sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'تنبيه اختبار',
        body: 'هذا تنبيه اختباري من تطبيق دوائي',
        sound: true,
        vibrate: [0, 250, 250, 250],
      },
      trigger: { seconds: 2 },
    })
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>إدارة الإشعارات</Text>

      {expoPushToken && (
        <View style={{ backgroundColor: '#f0f9ff', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: '#0066cc' }}>رمز الإشعارات:</Text>
          <Text style={{ fontSize: 10, color: '#666', marginTop: 4, fontFamily: 'monospace' }}>
            {expoPushToken.substring(0, 50)}...
          </Text>
        </View>
      )}

      <Button title="إرسال تنبيه اختباري" onPress={sendTestNotification} color="#10b981" />

      <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>الإشعارات الأخيرة</Text>
      {notifications.length === 0 ? (
        <Text style={{ color: '#999' }}>لا توجد إشعارات حتى الآن</Text>
      ) : (
        notifications.map((notif, i) => (
          <View key={i} style={{ padding: 12, backgroundColor: '#f5f5f5', marginBottom: 8, borderRadius: 8 }}>
            <Text style={{ fontWeight: '600' }}>{notif.title}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{notif.body}</Text>
          </View>
        ))
      )}
    </ScrollView>
  )
}
