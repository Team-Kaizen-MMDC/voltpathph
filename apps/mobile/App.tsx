import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Battery, MapPin, Navigation, Zap, ChevronRight } from 'lucide-react-native';

const ELECTRIC_GREEN = '#22C55E';
const CHARGE_BLUE = '#3B82F6';
const CARBON_BLACK = '#0F172A';
const SLATE_600 = '#475569';
const CLOUD_WHITE = '#F8FAFC';

export default function App() {
  const MenuItem = ({ icon: Icon, title, subtitle, color }: any) => (
    <TouchableOpacity style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={24} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight color="#CBD5E1" size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Volt<Text style={{ color: ELECTRIC_GREEN }}>PH</Text></Text>
          <Text style={styles.subtitle}>EV Efficiency & Optimization</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Battery</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>320km</Text>
            <Text style={styles.statLabel}>Range</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Services</Text>
          <MenuItem 
            icon={Navigation} 
            title="Plan Trip" 
            subtitle="Route & battery optimization"
            color={ELECTRIC_GREEN}
          />
          <MenuItem 
            icon={Battery} 
            title="EV Models" 
            subtitle="Explore supported vehicles"
            color={CHARGE_BLUE}
          />
          <MenuItem 
            icon={MapPin} 
            title="Charging Stations" 
            subtitle="Find power near you"
            color="#F59E0B"
          />
          <MenuItem 
            icon={Zap} 
            title="Fast Charge" 
            subtitle="Quick locate DC chargers"
            color={ELECTRIC_GREEN}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CLOUD_WHITE,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: CARBON_BLACK,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: SLATE_600,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: CARBON_BLACK,
  },
  statLabel: {
    fontSize: 12,
    color: SLATE_600,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CARBON_BLACK,
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: CARBON_BLACK,
  },
  cardSubtitle: {
    fontSize: 14,
    color: SLATE_600,
    marginTop: 2,
  },
});
