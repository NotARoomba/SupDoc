import FontAwesome from '@expo/vector-icons/Octicons';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store'
import { UserType } from 'components/utils/Types';

export default function TabLayout() {
  const [userType, setUserType] = useState<UserType>();
  useEffect(() => {
    const updateData = async () => {
      const ut = await SecureStore.getItemAsync(
        process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
      ) as UserType
        setUserType(ut);
    }
    updateData()
  }, [])
  return (
    <Tabs  screenOptions={({route}) => ({
      tabBarLabel: () => null,
      tabBarStyle: {
        display:'flex',
        backgroundColor: '#071932',
        position: 'absolute',
        bottom: 40,
        borderRadius: 12,
        width: 350,
        left: '50%',
        marginLeft: -175,
        height: 60,
        paddingBottom: 0,
        alignItems: 'center',
        shadowColor: '#000000',
        elevation: 0,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        borderTopWidth: 0,
        
      },
      headerTransparent: true,
      headerShown: false,
      tabBarInactiveTintColor: 'gray',
      tabBarActiveTintColor: '#fbfff1'
    })}
    
    sceneContainerStyle={{
      zIndex: -900,
      backgroundColor: '#000000',
    }} >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={38} name="home" color={color} />,
        }}
      />
      {userType == UserType.DOCTOR ? <Tabs.Screen
        name="pins"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={38} name="pin" color={color} />,
        }}
      /> : <Tabs.Screen
      name="upload"
      options={{
        tabBarIcon: ({ color }) => <FontAwesome size={38} name="plus-circle" color={color} />,
      }}
    />}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={38} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
