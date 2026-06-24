---
name: voltph-ev-physics
description: Physics-based modeling of electric vehicle energy consumption. Use when developing or refining the battery prediction algorithm based on road grade, speed, mass, and auxiliary loads.
---

# VoltPH EV Physics & Consumption Skill

Guidance for calculating and predicting EV battery consumption along a route. This model shifts the application from raw averages to highly accurate, physics-backed predictions.

## 🔋 The Energy Consumption Equation
For each route segment, the energy required at the wheels ($E_{wheel}$) is calculated based on physical forces:

$$F_{total} = F_{roll} + F_{drag} + F_{gravity} + F_{accel}$$

Where:
1.  **Rolling Resistance:** $F_{roll} = C_r \cdot m \cdot g \cdot \cos(\theta)$
    - $C_r$: Rolling resistance coefficient (typically ~0.01 - 0.015 for EV tires).
    - $m$: Vehicle mass (including occupants/cargo).
    - $g$: Acceleration due to gravity ($9.81 \text{ m/s}^2$).
    - $\theta$: Road slope (angle of incline from elevation data).
2.  **Aerodynamic Drag:** $F_{drag} = \frac{1}{2} \cdot \rho \cdot C_d \cdot A \cdot v^2$
    - $\rho$: Air density (approx. $1.18 \text{ kg/m}^3$ at 30°C in the Philippines).
    - $C_d$: Drag coefficient (dependent on EV model, e.g., ~0.24 for BYD Atto 3).
    - $A$: Frontal area of the car ($m^2$).
    - $v$: Vehicle velocity ($m/s$). Note the quadratic scaling with speed!
3.  **Gravity Force:** $F_{gravity} = m \cdot g \cdot \sin(\theta)$
    - Adds resistance uphill, recovers energy downhill.
4.  **Inertial Force (Acceleration):** $F_{accel} = m \cdot a$

## ⚡ Battery Consumption & Regeneration
- **Energy at Wheels:** $E_{wheel} = F_{total} \cdot d$ (where $d$ is segment distance).
- **Powertrain Efficiency:** Convert wheel energy to battery energy.
  - When $F_{total} > 0$ (traction): $E_{battery} = E_{wheel} / \eta_{propulsion}$ (efficiency $\eta \approx 0.85 - 0.90$).
  - When $F_{total} < 0$ (deceleration/downhill): $E_{battery} = E_{wheel} \cdot \eta_{regen}$ (regenerative braking efficiency $\eta \approx 0.60 - 0.70$).

## ❄️ Auxiliary Load (Air Conditioning)
- In the Philippines, the ambient temperature is consistently high (28°C - 35°C). Air conditioning is run continuously and consumes significant power.
- **Auxiliary Power ($P_{aux}$):** Air conditioning and electronics draw a constant power (typically $1.0\text{ kW} - 2.5\text{ kW}$ depending on the vehicle scale and setting).
- **Auxiliary Energy:** $E_{aux} = P_{aux} \cdot t$ (where $t$ is the segment duration).
- **Total Consumption:** $E_{total} = E_{battery} + E_{aux}$

## 🇵🇭 Philippine Traffic Adjustment Factor
- Extreme stop-and-go traffic (e.g., EDSA, C5) results in high auxiliary consumption ($E_{aux}$) due to extended travel time, even though aerodynamic drag ($F_{drag}$) is negligible at low speeds.
- Implement a scaling factor or model traffic delay directly as a multiplier to the segment travel time, which naturally scales the A/C draw.
