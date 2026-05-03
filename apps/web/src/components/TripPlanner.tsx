import React, { useState } from 'react';
import { TripPlan, TripResult } from '@voltph/shared';

const TripPlanner: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [evModelId, setEvModelId] = useState('1');
  const [result, setResult] = useState<TripResult | null>(null);

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const plan: TripPlan = {
      origin: { lat: 14.5995, lng: 120.9842, address: origin }, // Manila
      destination: { lat: 15.145, lng: 120.5887, address: destination }, // Angeles
      evModelId,
      initialBatteryPercentage: 100
    };

    try {
      const res = await fetch('http://localhost:3001/api/trips/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Failed to plan trip", err);
    }
  };

  return (
    <div>
      <form onSubmit={handlePlan} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input type="text" placeholder="Origin (e.g. Manila)" value={origin} onChange={e => setOrigin(e.target.value)} />
        <input type="text" placeholder="Destination (e.g. Baguio)" value={destination} onChange={e => setDestination(e.target.value)} />
        <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>Plan Trip</button>
      </form>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
          <h3>Trip Summary</h3>
          <p>Distance: {result.totalDistanceKm} km</p>
          <p>Duration: {result.totalDurationMin} mins</p>
          <p>Estimated Consumption: {result.estimatedBatteryConsumptionKWh} kWh</p>
          <p>Remaining Battery: {result.remainingBatteryPercentage.toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;
