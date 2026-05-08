# 🚦 TrafficSim — Real-Time Traffic Simulation & Modeling

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-00ff88?style=for-the-badge)](https://traffic-simulation-modeling.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-4f8ef7?style=for-the-badge)](https://github.com/vrajardeshana19-bit/traffic_simulation_modeling)

A real-time, browser-based traffic simulation tool built to model traffic behavior, analyze different scenarios, and propose improvements to existing traffic systems.

---

## 🎯 Problem Statement

Traffic congestion is one of the biggest urban challenges worldwide. Poor signal timing, accidents, and rush hour density cause millions of hours of lost productivity daily. TrafficSim allows urban planners, researchers, and students to:

- Simulate real traffic scenarios in real time
- Analyze congestion patterns visually
- Compare different signal timing strategies
- Propose data-driven improvements

---

## ✨ Features

### 🚗 Core Simulation
- **4x4 Road Network** — 16 intersections with bidirectional roads
- **Vehicle Agents** — Intelligent vehicles with BFS pathfinding
- **Traffic Signals** — Automatic green → yellow → red phase cycling
- **Real-time Rendering** — Smooth 60fps HTML5 Canvas animation
- **Speed Control** — 1x, 2x, 5x, 10x simulation speed

### 📊 Analytics Dashboard
- **Live Metrics** — Average wait time, throughput, active vehicles, completed trips
- **Real-time Charts** — Line charts tracking metrics over time
- **Header Stats** — Instant overview of key performance indicators

### 🎮 Scenario Control
- **4 Preset Scenarios:**
  - 🟢 Normal Traffic — Balanced flow, standard signals
  - 🔴 Rush Hour — High density, 8 vehicles/sec spawn rate
  - 🟡 Accident — Lane blocked at center, observe rerouting
  - 🔵 Signal Optimized — Short cycles for maximum throughput
- **Custom Settings** — Manual sliders for vehicle count, spawn rate, signal timing
- **Apply & Restart** — Instantly apply new configuration

### 🔗 Sharing
- **URL Sharing** — Encode any scenario as a shareable URL
- **One-click Copy** — Share exact simulation state with anyone

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React + TypeScript | UI Framework |
| HTML5 Canvas | Simulation Rendering |
| Zustand | State Management |
| Recharts | Analytics Charts |
| Vite | Build Tool |
| Vercel | Deployment |

---

## 🏗️ Architecture


src/
├── engine/           # Core simulation logic
│   ├── types.ts      # TypeScript interfaces
│   ├── RoadNetwork.ts # Graph-based road system
│   ├── Vehicle.ts    # Vehicle agent class
│   ├── TrafficSignal.ts # Signal phase controller
│   └── SimulationEngine.ts # Main tick loop
├── components/       # React UI components
│   ├── SimulationCanvas.tsx # Canvas renderer
│   ├── ScenarioPanel.tsx    # Scenario controls
│   ├── MetricsDashboard.tsx # Live charts
│   └── ControlBar.tsx       # Play/pause/speed
├── store/
│   └── simulationStore.ts   # Zustand state
└── scenarios/
└── presets.ts           # Preset configurations


### Import Chain (Zero Circular Dependencies)


types.ts ← RoadNetwork.ts, Vehicle.ts, TrafficSignal.ts
← SimulationEngine.ts ← simulationStore.ts
← App.tsx ← SimulationCanvas.tsx


---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/vrajardeshana19-bit/traffic_simulation_modeling.git

# Navigate to project
cd traffic_simulation_modeling

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

---

## 🎮 How to Use

1. **Open the live demo** or run locally
2. Click **Play** — simulation starts automatically
3. **Select a preset** scenario from the sidebar
4. **Adjust sliders** to customize vehicle count, spawn rate, signal timing
5. **Watch metrics** update in real time on the dashboard
6. **Share your scenario** using the Share button

---

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| Vraj Ardeshana | Core Engine, Canvas Renderer, Simulation Logic | [@vrajardeshana19-bit](https://github.com/vrajardeshana19-bit) |
| Yuktha P | Analytics Dashboard, UI Components, Deployment | [@yukthaprakash](https://github.com/yukthaprakash) |

---

## 🏆 Built For

This project was built as part of a **Traffic Simulation and Modeling** hackathon problem statement:

> *"Build a simulation tool to model traffic behavior, analyze different scenarios, and propose improvements to existing traffic systems"*

---

## 🔮 Future Roadmap

- [ ] Custom road layout designer (draw your own map)
- [ ] Google Maps image upload + AI road detection
- [ ] AI-powered signal optimization suggestions
- [ ] Multi-city comparison
- [ ] Export reports as PDF

---

## 📄 License

MIT License — feel free to use this project for learning and research.

---

<div align="center">
  <strong>Built with ❤️ by Vraj Ardeshana & Yuktha P</strong>
  <br>
  <a href="https://traffic-simulation-modeling.vercel.app">🌐 Live Demo</a>
</div>