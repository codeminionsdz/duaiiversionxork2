import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert('خطأ', error.message)
    else Alert.alert('تم', 'تم تسجيل الدخول')
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) Alert.alert('خطأ', error.message)
    else Alert.alert('تم', 'تحقق من بريدك الإلكتروني')
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>تسجيل الدخول / إنشاء حساب</Text>
      <TextInput placeholder="البريد الإلكتروني" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }} />
      <TextInput placeholder="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }} />
      <Button title="تسجيل الدخول" onPress={signIn} />
      <Button title="إنشاء حساب" onPress={signUp} />
    </View>
  )
}
