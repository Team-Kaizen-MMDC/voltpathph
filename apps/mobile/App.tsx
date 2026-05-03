import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Battery, MapPin, Navigation } from 'lucide-react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VoltPH</Text>
        <Text style={styles.subtitle}>EV Efficiency & Optimization (PH)</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <Navigation color="black" size={24} />
          <Text style={styles.cardTitle}>Plan Trip</Text>
        </View>
        <View style={styles.card}>
          <Battery color="black" size={24} />
          <Text style={styles.cardTitle}>EV Models</Text>
        </View>
        <View style={styles.card}>
          <MapPin color="black" size={24} />
          <Text style={styles.cardTitle}>Stations</Text>
        </View>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});
