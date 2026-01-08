import React, { useState } from 'react'
import { View, Text, Button, Alert, ScrollView, ActivityIndicator, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { supabase } from '../lib/supabase'

export default function UploadScreen() {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  async function pickAndUploadImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled) {
        await uploadFile(result.assets[0].uri, 'image')
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل اختيار الصورة')
    }
  }

  async function pickAndUploadDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      })

      if (result.assets && result.assets.length > 0) {
        await uploadFile(result.assets[0].uri, 'document')
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل اختيار الملف')
    }
  }

  async function uploadFile(fileUri: string, type: 'image' | 'document') {
    setUploading(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user?.id) {
        Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً')
        setUploading(false)
        return
      }

      const fileName = `${type}/${user.user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}`
      const fileBlob = await fetch(fileUri).then((r) => r.blob())

      const { error, data } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, fileBlob, { cacheControl: '3600', upsert: false })

      if (error) {
        Alert.alert('خطأ', error.message)
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage.from('prescriptions').getPublicUrl(fileName)
        
        setUploadedFiles([...uploadedFiles, { name: fileName, type, url: urlData.publicUrl, localUri: fileUri }])
        Alert.alert('نجاح', 'تم رفع الملف بنجاح')
      }
    } catch (error) {
      Alert.alert('خطأ', String(error))
    } finally {
      setUploading(false)
    }
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>رفع الملفات والصور</Text>

      {uploading && <ActivityIndicator size="large" />}

      <View style={{ gap: 12, marginBottom: 24 }}>
        <Button
          title="رفع صورة وصفة"
          onPress={pickAndUploadImage}
          disabled={uploading}
          color="#10b981"
        />
        <Button
          title="رفع ملف PDF"
          onPress={pickAndUploadDocument}
          disabled={uploading}
          color="#3b82f6"
        />
      </View>

      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>الملفات المرفوعة</Text>
      {uploadedFiles.length === 0 ? (
        <Text style={{ color: '#999' }}>لم يتم رفع أي ملفات حتى الآن</Text>
      ) : (
        uploadedFiles.map((file, i) => (
          <View key={i} style={{ padding: 12, backgroundColor: '#f5f5f5', marginBottom: 8, borderRadius: 8 }}>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>
              {file.type === 'image' ? '📷' : '📄'} {file.name.split('/').pop()}
            </Text>
            {file.type === 'image' && file.url && (
              <Image
                source={{ uri: file.url }}
                style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 8 }}
                resizeMode="cover"
              />
            )}
            {file.type === 'image' && !file.url && file.localUri && (
              <Image
                source={{ uri: file.localUri }}
                style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 8 }}
                resizeMode="cover"
              />
            )}
          </View>
        ))
      )}
    </ScrollView>
  )
}
