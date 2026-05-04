import React, { useEffect, useState } from "react";
import { EVModel } from "@voltph/shared";
import { Zap, Cpu } from "lucide-react";
import { API_URL } from "../config";

const EVModelList: React.FC = () => {
  const [models, setModels] = useState<EVModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/ev-models`)
      .then((res) => res.json())
      .then((data) => {
        setModels(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch EV models", err);
        // Fallback mock data for demo
        setModels([
          {
            id: "1",
            make: "BYD",
            model: "Atto 3",
            batteryCapacityKWh: 60.5,
            averageConsumptionKWhPerKm: 0.16,
            plugTypes: ["Type 2", "CCS2"],
          },
          {
            id: "2",
            make: "Jetour",
            model: "Ice Cream",
            batteryCapacityKWh: 13.9,
            averageConsumptionKWhPerKm: 0.1,
            plugTypes: ["Type 2"],
          },
          {
            id: "3",
            make: "Geely",
            model: "Geometry C",
            batteryCapacityKWh: 70,
            averageConsumptionKWhPerKm: 0.17,
            plugTypes: ["Type 2", "CCS2"],
          },
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#64748B" }}>
        Loading EV models...
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {models.map((model) => (
          <div
            key={model.id}
            style={{
              backgroundColor: "#FFFFFF",
              padding: "20px",
              borderRadius: "16px",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              border: "1px solid #F1F5F9",
              transition: "transform 0.2s ease-in-out",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#DCFCE7",
                  padding: "8px",
                  borderRadius: "10px",
                }}
              >
                <Zap size={18} color="#22C55E" />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  color: "#0F172A",
                  fontWeight: 600,
                }}
              >
                {model.make} {model.model}
              </h3>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#64748B",
                  fontSize: "0.9rem",
                }}
              >
                <Cpu size={14} />
                <span>{model.batteryCapacityKWh} kWh Battery</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginTop: "4px",
                }}
              >
                {model.plugTypes.map((plug) => (
                  <span
                    key={plug}
                    style={{
                      fontSize: "0.75rem",
                      backgroundColor: "#F8FAFC",
                      color: "#475569",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    {plug}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EVModelList;
