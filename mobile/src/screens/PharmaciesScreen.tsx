import React, { useEffect, useState } from 'react'
import { View, Text, Button, Alert, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'
import Slider from '@react-native-community/slider'

interface Pharmacy {
  id: string
  pharmacy_name: string
  latitude: number
  longitude: number
  address: string
  phone?: string
  is_verified: boolean
  is_open: boolean
  distance?: number
}

export default function PharmaciesScreen() {
  const [location, setLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([])
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null)
  const [maxDistance, setMaxDistance] = useState(50) // Default 50km
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    requestLocation()
  }, [])

  useEffect(() => {
    // Filter pharmacies when distance filter changes
    if (pharmacies.length > 0) {
      const filtered = pharmacies.filter(p => (p.distance || 0) <= maxDistance)
      setFilteredPharmacies(filtered)
    }
  }, [maxDistance, pharmacies])

  async function requestLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('خطأ', 'الإذن مرفوض. يرجى السماح بالوصول للموقع')
        setLoading(false)
        return
      }
      
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      setLocation(loc.coords)

      // Fetch real pharmacies from Supabase
      await fetchPharmacies(loc.coords.latitude, loc.coords.longitude)
    } catch (error) {
      console.error('Error getting location:', error)
      Alert.alert('خطأ', 'فشل في تحديد الموقع')
      setLoading(false)
    }
  }

  async function fetchPharmacies(userLat: number, userLng: number) {
    try {
      const { data, error } = await supabase
        .from('pharmacy_profiles')
        .select('id, pharmacy_name, latitude, longitude, address, phone, is_verified, is_open')
        .eq('is_verified', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (error) {
        console.error('Error fetching pharmacies:', error)
        Alert.alert('خطأ', 'فشل في جلب الصيدليات')
        setPharmacies([])
        setFilteredPharmacies([])
      } else if (data) {
        // Calculate distances
        const pharmaciesWithDistance = data.map(pharmacy => ({
          ...pharmacy,
          is_open: pharmacy.is_open ?? true, // Default to open if null
          distance: calculateDistance(
            userLat,
            userLng,
            pharmacy.latitude,
            pharmacy.longitude
          )
        }))
        
        // Sort by distance
        pharmaciesWithDistance.sort((a, b) => a.distance - b.distance)
        
        console.log(`Found ${pharmaciesWithDistance.length} verified pharmacies`)
        setPharmacies(pharmaciesWithDistance)
        
        // Apply initial filter
        const filtered = pharmaciesWithDistance.filter(p => p.distance <= maxDistance)
        setFilteredPharmacies(filtered)
      }
    } catch (error) {
      console.error('Error:', error)
      setPharmacies([])
      setFilteredPharmacies([])
    } finally {
      setLoading(false)
    }
  }

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>جاري تحميل الموقع...</Text>
      </View>
    )
  }

  if (!location) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ marginBottom: 16 }}>لا يمكن تحديد موقعك</Text>
        <Button title="حاول مجددًا" onPress={requestLocation} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Filter Panel */}
      {showFilter && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>تصفية حسب المسافة</Text>
            <TouchableOpacity onPress={() => setShowFilter(false)}>
              <Text style={styles.closeFilter}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.distanceLabel}>
              حتى {maxDistance} كم
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={100}
              step={1}
              value={maxDistance}
              onValueChange={setMaxDistance}
              minimumTrackTintColor="#10B981"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#10B981"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 كم</Text>
              <Text style={styles.sliderLabel}>100 كم</Text>
            </View>
          </View>
          <Text style={styles.resultCount}>
            {filteredPharmacies.length} صيدلية في النطاق
          </Text>
        </View>
      )}

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {/* User's location marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="موقعك"
          pinColor="blue"
        />
        
        {/* Pharmacy markers */}
        {filteredPharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy.id}
            coordinate={{
              latitude: pharmacy.latitude,
              longitude: pharmacy.longitude,
            }}
            title={pharmacy.pharmacy_name}
            description={`${pharmacy.address} • ${pharmacy.is_open ? 'مفتوحة' : 'مغلقة'}`}
            onPress={() => setSelectedPharmacy(pharmacy)}
          >
            <View style={styles.markerContainer}>
              <View style={[
                styles.marker,
                { backgroundColor: pharmacy.is_open ? '#10B981' : '#EF4444' }
              ]}>
                <Text style={styles.markerText}>🏥</Text>
              </View>
              {!pharmacy.is_open && (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedBadgeText}>مغلق</Text>
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilter(!showFilter)}
      >
        <Text style={styles.filterButtonText}>🔍 تصفية ({maxDistance} كم)</Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            الصيدليات القريبة ({filteredPharmacies.length})
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => location && fetchPharmacies(location.latitude, location.longitude)}
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
        
        {selectedPharmacy ? (
          <View style={styles.selectedCard}>
            <View style={styles.statusBadgeContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: selectedPharmacy.is_open ? '#D1FAE5' : '#FEE2E2' }
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  { color: selectedPharmacy.is_open ? '#065F46' : '#991B1B' }
                ]}>
                  {selectedPharmacy.is_open ? '● مفتوحة الآن' : '● مغلقة'}
                </Text>
              </View>
            </View>
            <Text style={styles.pharmacyName}>{selectedPharmacy.pharmacy_name}</Text>
            <Text style={styles.pharmacyAddress}>{selectedPharmacy.address}</Text>
            {selectedPharmacy.phone && (
              <Text style={styles.pharmacyPhone}>📞 {selectedPharmacy.phone}</Text>
            )}
            {selectedPharmacy.distance && (
              <Text style={styles.pharmacyDistance}>
                📍 {selectedPharmacy.distance.toFixed(1)} كم من موقعك
              </Text>
            )}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.callButton,
                  !selectedPharmacy.is_open && styles.disabledButton
                ]}
                onPress={() => {
                  if (selectedPharmacy.is_open) {
                    Alert.alert('اتصال', `سيتم الاتصال بـ ${selectedPharmacy.pharmacy_name}`)
                  } else {
                    Alert.alert('مغلقة', 'الصيدلية مغلقة حالياً')
                  }
                }}
              >
                <Text style={styles.buttonText}>اتصل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedPharmacy(null)}
              >
                <Text style={styles.closeButtonText}>إغلاق</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredPharmacies}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pharmacyItem}
                onPress={() => setSelectedPharmacy(item)}
              >
                <View style={[
                  styles.pharmacyIcon,
                  { backgroundColor: item.is_open ? '#F0FDF4' : '#FEF2F2' }
                ]}>
                  <Text style={styles.iconText}>🏥</Text>
                  {!item.is_open && (
                    <View style={styles.closedOverlay}>
                      <Text style={styles.closedText}>✕</Text>
                    </View>
                  )}
                </View>
                <View style={styles.pharmacyInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.itemName}>{item.pharmacy_name}</Text>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: item.is_open ? '#10B981' : '#EF4444' }
                    ]} />
                  </View>
                  <Text style={styles.itemAddress}>{item.address}</Text>
                  <View style={styles.metaRow}>
                    {item.distance && (
                      <Text style={styles.distance}>
                        📍 {item.distance.toFixed(1)} كم
                      </Text>
                    )}
                    <Text style={[
                      styles.statusText,
                      { color: item.is_open ? '#10B981' : '#EF4444' }
                    ]}>
                      {item.is_open ? 'مفتوحة' : 'مغلقة'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  لا توجد صيدليات في نطاق {maxDistance} كم
                </Text>
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setMaxDistance(Math.min(100, maxDistance + 20))}
                >
                  <Text style={styles.expandButtonText}>توسيع البحث</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 0.6,
  },
  filterPanel: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeFilter: {
    fontSize: 24,
    color: '#6B7280',
    padding: 4,
  },
  sliderContainer: {
    marginBottom: 12,
  },
  distanceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultCount: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  filterButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    zIndex: 999,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    fontSize: 20,
  },
  closedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  closedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  listContainer: {
    flex: 0.4,
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  selectedCard: {
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  statusBadgeContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pharmacyName: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
    color: '#065F46',
  },
  pharmacyAddress: {
    color: '#6B7280',
    marginBottom: 4,
  },
  pharmacyPhone: {
    color: '#6B7280',
    marginBottom: 4,
  },
  pharmacyDistance: {
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  pharmacyItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  pharmacyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  iconText: {
    fontSize: 28,
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  closedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  pharmacyInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  itemAddress: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distance: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  expandButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  expandButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
})
