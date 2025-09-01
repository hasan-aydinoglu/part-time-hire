import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { MOCK_LISTINGS } from '../lib/mock';
import { loadListings, saveListings } from '../lib/storage';

export default function TabsLayout() {
  // İlk açılışta mock verileri kaydet
  useEffect(() => {
    (async () => {
      const current = await loadListings();
      if (!current || current.length === 0) {
        await saveListings(MOCK_LISTINGS);
      }
    })();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarStyle: { backgroundColor: '#0b1220', borderTopColor: '#1f2937' },
        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#9ca3af',
        headerStyle: { backgroundColor: '#0b1220' },
        headerTitleStyle: { color: 'white' },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'İlan Ver',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          title: 'İlanlarım',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
