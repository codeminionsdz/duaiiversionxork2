import React from 'react'
import { View, Text, Button } from 'react-native'
import * as Location from 'expo-location'

export default function HomeScreen() {
  async function askLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      return
    }
    await Location.getCurrentPositionAsync()
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>دوائي (نسخة أصلية)</Text>
      <Button title="طلب الموقع" onPress={askLocation} />
    </View>
  )
}
