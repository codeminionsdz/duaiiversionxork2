import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { supabase } from '../lib/supabase'

interface Prescription {
  id: string
  image_url: string
  status: string
  created_at: string
  medicines?: string[]
}

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadPrescriptions()
  }, [])

  async function loadPrescriptions() {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user?.id) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error loading prescriptions:', error)
        Alert.alert('خطأ', error.message)
      } else {
        // Get public URLs for images
        const prescriptionsWithUrls = (data || []).map((p) => ({
          ...p,
          image_url: p.image_url
            ? supabase.storage.from('prescriptions').getPublicUrl(p.image_url).data.publicUrl
            : null,
        }))
        setPrescriptions(prescriptionsWithUrls)
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function onRefresh() {
    setRefreshing(true)
    await loadPrescriptions()
    setRefreshing(false)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار'
      case 'processing':
        return 'جاري المعالجة'
      case 'ready':
        return 'جاهزة'
      case 'delivered':
        return 'تم التوصيل'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b'
      case 'processing':
        return '#3b82f6'
      case 'ready':
        return '#10b981'
      case 'delivered':
        return '#6366f1'
      default:
        return '#999'
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 12, color: '#666' }}>جاري تحميل الوصفات...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>وصفاتي</Text>

      {prescriptions.length === 0 ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999', textAlign: 'center' }}>
            لم يتم رفع أي وصفات حتى الآن
          </Text>
          <Text style={{ fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' }}>
            استخدم تبويب "الرفع" لإضافة وصفتك الأولى
          </Text>
        </View>
      ) : (
        prescriptions.map((prescription) => (
          <TouchableOpacity
            key={prescription.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {prescription.image_url && (
              <Image
                source={{ uri: prescription.image_url }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 8,
                  marginBottom: 12,
                  backgroundColor: '#f5f5f5',
                }}
                resizeMode="cover"
              />
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: getStatusColor(prescription.status),
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                  {getStatusText(prescription.status)}
                </Text>
              </View>

              <Text style={{ color: '#999', fontSize: 12 }}>
                {new Date(prescription.created_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>

            {prescription.medicines && prescription.medicines.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 4 }}>
                  الأدوية:
                </Text>
                {prescription.medicines.map((med, i) => (
                  <Text key={i} style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                    • {med}
                  </Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  )
}
