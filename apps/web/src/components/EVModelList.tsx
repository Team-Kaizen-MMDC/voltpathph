import React, { useEffect, useState } from 'react';
import { EVModel } from '@voltph/shared';

const EVModelList: React.FC = () => {
  const [models, setModels] = useState<EVModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/ev-models')
      .then(res => res.json())
      .then(data => {
        setModels(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch EV models", err);
        // Fallback mock data for demo
        setModels([
          { id: '1', make: 'BYD', model: 'Atto 3', batteryCapacityKWh: 60.5, averageConsumptionKWhPerKm: 0.16, plugTypes: ['Type 2', 'CCS2'] },
          { id: '2', make: 'Jetour', model: 'Ice Cream', batteryCapacityKWh: 13.9, averageConsumptionKWhPerKm: 0.1, plugTypes: ['Type 2'] },
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading EV models...</div>;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        {models.map(model => (
          <div key={model.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
            <h3>{model.make} {model.model}</h3>
            <p>Battery: {model.batteryCapacityKWh} kWh</p>
            <p>Plugs: {model.plugTypes.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EVModelList;
