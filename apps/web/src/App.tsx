import React from 'react';
import { Battery, MapPin, Navigation } from 'lucide-react';
import EVModelList from './components/EVModelList';
import TripPlanner from './components/TripPlanner';

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#007bff' }}>VoltPH</h1>
        <p style={{ fontSize: '1.2rem', color: '#555' }}>EV Efficiency & Optimization in the Philippines</p>
      </header>
      
      <main>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
          <section style={{ border: '1px solid #eee', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Navigation size={24} /> Plan Your Trip</h2>
            <p>Predict traffic and calculate battery efficiency.</p>
            <TripPlanner />
          </section>

          <section style={{ border: '1px solid #eee', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Battery size={24} /> Supported EV Models</h2>
            <p>PH Market: BYD, Jetour, Geely, Vinfast and more.</p>
            <EVModelList />
          </section>

          <section style={{ border: '1px solid #eee', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={24} /> Charging Stations</h2>
            <p>Find the nearest station to stay powered.</p>
            <div style={{ height: '200px', backgroundColor: '#e9ecef', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Map Placeholder
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
