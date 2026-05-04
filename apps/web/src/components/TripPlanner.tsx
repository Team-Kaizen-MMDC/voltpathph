import React, { useState } from "react";
import { TripPlan, TripResult } from "@voltph/shared";
import {
  Navigation,
  MapPin,
  Battery,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { API_URL } from "../config";

const TripPlanner: React.FC = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [evModelId] = useState("1");
  const [result, setResult] = useState<TripResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanning(true);
    const plan: TripPlan = {
      origin: { lat: 14.5995, lng: 120.9842, address: origin }, // Manila
      destination: { lat: 15.145, lng: 120.5887, address: destination }, // Angeles
      evModelId,
      initialBatteryPercentage: 100,
    };

    try {
      const res = await fetch(`${API_URL}/api/trips/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Failed to plan trip", err);
      // Fallback result for demo if backend is offline
      setResult({
        totalDistanceKm: 85.2,
        totalDurationMin: 110,
        estimatedBatteryConsumptionKWh: 13.6,
        remainingBatteryPercentage: 77.5,
        recommendedChargingStops: [],
      });
    } finally {
      setIsPlanning(false);
    }
  };

  const inputStyle = {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: "#F8FAFC",
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <form
        onSubmit={handlePlan}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div style={{ position: "relative" }}>
          <MapPin
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "14px",
              color: "#94A3B8",
            }}
          />
          <input
            type="text"
            placeholder="Origin (e.g. Manila)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            style={{
              ...inputStyle,
              paddingLeft: "44px",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <Navigation
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "14px",
              color: "#94A3B8",
            }}
          />
          <input
            type="text"
            placeholder="Destination (e.g. Baguio)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{
              ...inputStyle,
              paddingLeft: "44px",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isPlanning}
          style={{
            backgroundColor: "#22C55E",
            color: "white",
            padding: "14px",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: isPlanning ? 0.7 : 1,
          }}
          onMouseEnter={(e) =>
            !isPlanning && (e.currentTarget.style.backgroundColor = "#16A34A")
          }
          onMouseLeave={(e) =>
            !isPlanning && (e.currentTarget.style.backgroundColor = "#22C55E")
          }
        >
          {isPlanning ? (
            "Calculating..."
          ) : (
            <>
              Plan Trip <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: "24px",
            padding: "24px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #DCFCE7",
          }}
        >
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "1.2rem",
              color: "#0F172A",
              fontWeight: 600,
            }}
          >
            Trip Summary
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span style={{ fontSize: "0.85rem", color: "#64748B" }}>
                Distance
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                <Navigation size={14} color="#3B82F6" />{" "}
                {result.totalDistanceKm} km
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span style={{ fontSize: "0.85rem", color: "#64748B" }}>
                Duration
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                <Clock size={14} color="#3B82F6" /> {result.totalDurationMin}{" "}
                mins
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span style={{ fontSize: "0.85rem", color: "#64748B" }}>
                Efficiency
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                <Zap size={14} color="#22C55E" />{" "}
                {result.estimatedBatteryConsumptionKWh} kWh
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span style={{ fontSize: "0.85rem", color: "#64748B" }}>
                Remaining
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 600,
                  color: "#22C55E",
                }}
              >
                <Battery size={14} />{" "}
                {result.remainingBatteryPercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;
