import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TripPlan } from "@voltph/shared";
import {
  Navigation,
  MapPin,
  Battery,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { getEvModels, optimizeTrip } from "../api/client";

// Temporary demo coordinates used until Places Autocomplete (geocoding) is wired
// up; the text inputs are sent as the human-readable address only. Replace with
// geocoded coordinates from the origin/destination fields when autocomplete lands.
const DEMO_ORIGIN = { lat: 14.5995, lng: 120.9842 }; // Manila
const DEMO_DESTINATION = { lat: 15.145, lng: 120.5887 }; // Angeles
const DEFAULT_INITIAL_BATTERY_PERCENT = 100;

const TripPlanner: React.FC = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  // Shared cache with EVModelList; used to send a real EV model id.
  const { data: models = [] } = useQuery({
    queryKey: ["ev-models"],
    queryFn: getEvModels,
  });

  const {
    mutate,
    data: result,
    isPending: isPlanning,
  } = useMutation({ mutationFn: optimizeTrip });

  const handlePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const plan: TripPlan = {
      origin: { ...DEMO_ORIGIN, address: origin },
      destination: { ...DEMO_DESTINATION, address: destination },
      evModelId: models[0]?.id ?? "",
      initialBatteryPercentage: DEFAULT_INITIAL_BATTERY_PERCENT,
    };
    mutate(plan);
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
