# LifeLink AI 🚑✨

> **An all-in-one emergency and healthcare super-app that unifies fragmented medical services into a single real-time platform.**

---

## 🌟 Overview

When medical emergencies strike, every second counts. However, patients and families are often forced to juggle multiple disconnected services—calling separate numbers for ambulances, searching for hospital bed availability, coordinating with local pharmacies, and hunting down medical equipment rentals.

**LifeLink AI** solves this fragmentation crisis. It is an enterprise-grade, emergency-first healthcare platform that bridges critical gaps by connecting users instantly with ambulances, hospitals, doctors, pharmacies, and medical equipment suppliers in real time. Designed with a high-performance, dark-mode glassmorphic interface, LifeLink delivers a seamless, synchronized healthcare experience from pre-hospital emergency response to long-term home recovery.

---

## 🚀 Key Features & Modules

* **⚡ Emergency SOS & Quick Actions:** Instant-access triggers for ambulances, nearest hospitals, doctors on-call, blood networks, and automated symptom checks to minimize latency during critical events.
* **🗺️ Unified Live Tracking (`LifeLink Tracking`):** A centralized tracking engine monitoring real-time GPS movements and ETAs for ambulances, lab sample pickups, and home-care equipment deliveries.
* **🛏️ Two-Sided Medical Equipment Marketplace (Rent | Buy):** A dedicated marketplace for home recovery gear (hospital beds, wheelchairs, oxygen concentrators, CPAP/BiPAP) featuring flexible rental terms and an automated B2B supplier sanitization pipeline (`Returned → Inspection → Sanitization → Available`).
* **🤖 Intelligent AI Assistant:** Built-in clinical assistant providing instant, WHO-aligned symptom triage and trusted medical guidance, with automated emergency interception that triggers immediate SOS actions during acute distress.
* **🛡️ Secure QR Health Records:** Instant, secure access to personal and family medical history via scanned QR codes for rapid emergency room admission.
* **🤝 Community Support Ecosystem:** A safe space for patients to ask questions, share recovery experiences, and connect with peers facing similar health journeys.
* **📋 Comprehensive Insurance Hub:** Side-by-side comparison engine evaluating health insurance policies based on sum insured, waiting periods, network hospitals, and claim ratios.
* **👥 Role-Based Portals:** Tailored, secure dashboards optimized for every stakeholder—Patients/Families, Doctors, First Responders (Ambulance Crews), Facility Partners (Hospitals/Labs), and B2B Equipment Providers.

---

## 🛠️ Technology Stack

### **Frontend (Web)**

* **Core Framework:** React 19 with TypeScript & Vite (for lightning-fast module bundling)
* **Styling & UI:** Tailwind CSS v4, Framer Motion (animations), Lucide React (icons)
* **Routing & State:** React Router DOM, Zustand (state management)
* **Maps & GPS:** Leaflet & `react-leaflet` for interactive routing
* **Progressive Web App (PWA):** `vite-plugin-pwa` and IndexedDB for robust offline capabilities
* **Tele-health & Utilities:** `@jitsi/react-sdk` (video consultations), `axios`, `date-fns`, `react-qr-code`

### **Backend & Architecture**

* **Framework:** Python FastAPI powered by Uvicorn (async high-performance API handling)
* **Database & ORM:** SQLAlchemy (Async) & Alembic for migrations
* **Spatial & Relational Data:** PostgreSQL (`asyncpg`) with **PostGIS** for advanced spatial ambulance routing and hospital mapping (with SQLite/`aiosqlite` support)
* **Real-Time & Caching:** WebSockets for live telemetry and Redis for high-speed caching

### **Security & Integrations**

* **Authentication:** Python-Jose (JWT), Passlib (Bcrypt) for secure session management and encrypted user auth flows
* **Communication & Notifications:** Twilio (SMS/Voice alerts), Resend (Transactional emails), Firebase Admin (Push notifications)
* **AI Engine:** Advanced LLM inference integration for clinical triage and guidance

### **Deployment & Infrastructure**

* **Backend:** Hosted on **Render** (via `render.yaml`)
* **Frontend:** Deployed on **Vercel** (via `vercel.json`)

---

## 📂 Project Structure

```text
LifeLink-AI/
├── backend/                  # FastAPI backend service
│   ├── app/
│   │   ├── api/              # Routers (Auth, SOS, Equipment, Telehealth)
│   │   ├── models/           # SQLAlchemy models & PostGIS schemas
│   │   ├── schemas/          # Pydantic validation schemas
│   │   └── core/             # Security, config, and database sessions
│   ├── alembic/              # Database migration scripts
│   └── render.yaml           # Backend deployment configuration
├── src/                      # React TypeScript frontend
│   ├── components/           # Reusable UI elements (Glass cards, modals, navigation)
│   ├── pages/                # Role-based views (Patient, Provider, Dashboard, SOS)
│   ├── context/              # State and authentication contexts
│   └── utils/                # Helper functions, API clients, and offline storage
├── vercel.json               # Frontend deployment configuration
└── README.md                 # Project documentation

```

---

## 🚀 Getting Started Locally

### **Prerequisites**

* Node.js & npm (for frontend)
* Python 3.10+ & pip (for backend)
* PostgreSQL with PostGIS extension (recommended for local spatial DB setup)

### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/lifelink-ai.git
cd lifelink-ai

```

### **2. Setup Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

```

### **3. Setup Frontend**

```bash
cd ../src  # or root directory depending on your structure
npm install
npm run dev

```

---

## 🌐 Live Demo

Explore the live application and test out the interactive role portals:
👉 **[LifeLink AI Live Portal](https://life-link-ai-psi.vercel.app/role-select)**

---


## 📝 License

Distributed under the **MIT License**. See `LICENSE` for more information.
