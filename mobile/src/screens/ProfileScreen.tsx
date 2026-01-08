import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, Alert, ScrollView, ActivityIndicator } from 'react-native'
import { supabase } from '../lib/supabase'

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: authUser } = await supabase.auth.getUser()
      setUser(authUser?.user)

      if (authUser?.user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.user.id)
          .single()

        if (data) {
          setName(data.name || '')
          setPhone(data.phone || '')
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      if (!user?.id) return

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name,
        phone,
        updated_at: new Date(),
      })

      if (error) {
        Alert.alert('خطأ', error.message)
      } else {
        Alert.alert('نجاح', 'تم تحديث الملف الشخصي')
      }
    } catch (error) {
      Alert.alert('خطأ', String(error))
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>الملف الشخصي</Text>

      {user && (
        <View style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ color: '#666' }}>البريد الإلكتروني:</Text>
          <Text style={{ fontWeight: '600', fontSize: 14 }}>{user.email}</Text>
        </View>
      )}

      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ marginBottom: 4, fontWeight: '600' }}>الاسم</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="أدخل اسمك الكامل"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }}
          />
        </View>

        <View>
          <Text style={{ marginBottom: 4, fontWeight: '600' }}>رقم الهاتف</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="أدخل رقم هاتفك"
            keyboardType="phone-pad"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }}
          />
        </View>

        <Button title="حفظ التعديلات" onPress={updateProfile} color="#10b981" />
        <Button title="تسجيل الخروج" onPress={signOut} color="#ef4444" />
      </View>
    </ScrollView>
  )
}
