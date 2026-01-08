import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import AuthScreen from './src/screens/AuthScreen'
import HomeScreen from './src/screens/HomeScreen'
import PharmaciesScreen from './src/screens/PharmaciesScreen'
import NotificationsScreen from './src/screens/NotificationsScreen'
import UploadScreen from './src/screens/UploadScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import PrescriptionsScreen from './src/screens/PrescriptionsScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home'
          if (route.name === 'Home') iconName = 'home'
          else if (route.name === 'Pharmacies') iconName = 'location-on'
          else if (route.name === 'Prescriptions') iconName = 'receipt'
          else if (route.name === 'Upload') iconName = 'cloud-upload'
          else if (route.name === 'Profile') iconName = 'person'
          return <MaterialIcons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
        tabBarLabelStyle: { fontSize: 11 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'الرئيسية' }} />
      <Tab.Screen name="Pharmacies" component={PharmaciesScreen} options={{ title: 'الصيدليات' }} />
      <Tab.Screen name="Prescriptions" component={PrescriptionsScreen} options={{ title: 'الوصفات' }} />
      <Tab.Screen name="Upload" component={UploadScreen} options={{ title: 'رفع' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'حسابي' }} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ animationEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
