import React from 'react';
import { Battery, MapPin, Navigation, Zap } from 'lucide-react';
import EVModelList from './components/EVModelList';
import TripPlanner from './components/TripPlanner';

function App() {
  const ELECTRIC_GREEN = '#22C55E';
  const CARBON_BLACK = '#0F172A';
  const SLATE_600 = '#475569';
  const CLOUD_WHITE = '#F8FAFC';

  const sectionStyle = {
    backgroundColor: '#FFFFFF',
    padding: '32px',
    borderRadius: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid #F1F5F9'
  };

  const iconContainerStyle = (color: string) => ({
    backgroundColor: `${color}15`,
    padding: '10px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: CLOUD_WHITE, minHeight: '100vh' }}>
      <header style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h1 style={{ color: CARBON_BLACK, fontSize: '3rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>
          Volt<span style={{ color: ELECTRIC_GREEN }}>PH</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: SLATE_600, maxWidth: '600px', margin: '0 auto' }}>
          The premium EV optimization platform for the Philippine market.
        </p>
      </header>
      
      <main>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px' }}>
          <section style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={iconContainerStyle('#3B82F6')}>
                <Navigation size={24} color="#3B82F6" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: CARBON_BLACK, fontWeight: 700 }}>Plan Your Trip</h2>
                <p style={{ margin: '4px 0 0 0', color: SLATE_600 }}>Optimize for traffic and battery health.</p>
              </div>
            </div>
            <TripPlanner />
          </section>

          <section style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={iconContainerStyle(ELECTRIC_GREEN)}>
                <Battery size={24} color={ELECTRIC_GREEN} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: CARBON_BLACK, fontWeight: 700 }}>EV Models</h2>
                <p style={{ margin: '4px 0 0 0', color: SLATE_600 }}>Explore the PH electric vehicle catalog.</p>
              </div>
            </div>
            <EVModelList />
          </section>

          <section style={{ ...sectionStyle, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={iconContainerStyle('#F59E0B')}>
                <MapPin size={24} color="#F59E0B" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: CARBON_BLACK, fontWeight: 700 }}>Charging Stations</h2>
                <p style={{ margin: '4px 0 0 0', color: SLATE_600 }}>Real-time availability across the archipelago.</p>
              </div>
            </div>
            <div style={{ 
              height: '300px', 
              backgroundColor: '#F1F5F9', 
              borderRadius: '20px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px dashed #CBD5E1',
              color: SLATE_600,
              gap: '12px'
            }}>
              <Zap size={48} color="#CBD5E1" />
              <span style={{ fontWeight: 500 }}>Interactive Map Coming Soon</span>
            </div>
          </section>
        </div>
      </main>

      <footer style={{ marginTop: '80px', textAlign: 'center', color: SLATE_600, fontSize: '0.9rem' }}>
        <p>&copy; 2026 VoltPH. Driving the future of the Philippines.</p>
      </footer>
    </div>
  );
}

export default App;
