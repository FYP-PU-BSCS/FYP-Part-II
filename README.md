<div align="center">

<img src="https://img.shields.io/badge/Phase-II%20Mobile%20Application-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Platform-React%20Native-61DAFB?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/Backend-Flask%20%7C%20Python-3776AB?style=for-the-badge&logo=python" />
<img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql" />
<img src="https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=for-the-badge" />

# 📱 SPRMP — Smart Polio Record and Monitoring Portal
### Phase II: Mobile Application

**Final Year Project · BS Computer Science**  
Wisdom Degree College for Women, Channan  
*Affiliated with the University of the Punjab, Lahore*

**Submitted by:**  
Raqeeba Yasin — Roll No. 092873  
Uma Ammara — Roll No. 092869

**Supervised by:** Dr. Muhammad Adeel

---

</div>

## 📌 What Is SPRMP?

**SPRMP (Smart Polio Record and Monitoring Portal)** is a full-stack health informatics system designed to digitise, manage, and monitor Pakistan's national polio vaccination programme at the ground level.

Pakistan remains one of the last countries in the world where wild poliovirus continues to circulate. A persistent challenge in the eradication effort is the fragmentation of vaccination records — field workers often operate in areas with limited connectivity, recording data on paper that must later be manually entered into systems prone to error and delay. SPRMP directly addresses this by providing a purpose-built digital infrastructure that connects field workers, district health coordinators (UCMOs), and system administrators through a unified, role-aware platform.

> **SPRMP is not a generic health app — it is a domain-specific solution engineered for the operational realities of Pakistan's anti-polio campaigns.**

The system is delivered in two phases:

| Phase | Deliverable | Description |
|---|---|---|
| Phase I | Web Portal | Admin dashboard, UCMO analytics console, ChatBot (partial), RBAC management |
| **Phase II** | **Mobile Application** | **Field Worker data-entry app — the focus of this repository** |

---

## 🎯 Phase II — Scope and Purpose

Phase II delivers the **SPRMP Mobile Application**, built for **Field Workers** who conduct house-to-house vaccination drives across Pakistan. Field workers are the frontline of the programme and generate the most critical raw data — yet they are typically the least technically empowered users in the system.

The mobile application solves this by providing:

- A **lightweight, offline-tolerant interface** for registering children, recording vaccination status, and flagging missed or refused cases
- **Real-time synchronisation** with the central PostgreSQL database once connectivity is restored
- **Role-restricted access** — field workers see only what they need; no administrative controls are exposed
- **AES-encrypted data transmission** to protect sensitive health records in transit
- A **GPS-assisted location tagging** capability to geo-reference vaccination records at the household level

The mobile application is the data-entry engine of the entire SPRMP ecosystem. Without accurate, timely field data, the analytics and monitoring capabilities of the Phase I Web Portal are rendered meaningless. Phase II closes that gap.

---

## 🗂️ Repository Structure

```
SPRMP-MobileApp/
│
├── src/
│   ├── screens/                # All application screens (Home, Register, History, Profile)
│   ├── components/             # Reusable UI components (Cards, Buttons, Forms, Modals)
│   ├── navigation/             # React Navigation stack and tab configuration
│   ├── api/                    # Axios service layer — all Flask API calls
│   ├── context/                # Auth context and global state management
│   ├── utils/                  # Encryption helpers, validators, formatting utilities
│   └── assets/                 # Images, icons, and font files
│
├── backend/                    # Flask/Python REST API
│   ├── app.py                  # Application entry point and route registration
│   ├── models/                 # SQLAlchemy ORM models (Child, Vaccination, User, etc.)
│   ├── routes/                 # Modular route blueprints
│   ├── auth/                   # JWT authentication and RBAC enforcement middleware
│   └── encryption/             # AES encryption/decryption utilities
│
├── database/
│   ├── schema.sql              # Full PostgreSQL schema
│   └── seed.sql                # Sample data for development/testing
│
├── docs/                       # Phase II technical documentation
├── .env.example                # Environment variable template (no secrets committed)
├── requirements.txt            # Python dependencies
├── package.json                # Node/React Native dependencies
└── README.md                   # This file
```

---

## ⚙️ Technology Stack

### Mobile Frontend

| Technology | Version | Role |
|---|---|---|
| React Native | 0.73+ | Cross-platform mobile framework (Android & iOS) |
| Tailwind CSS (NativeWind) | 4.x | Utility-first styling adapted for React Native |
| React Navigation | 6.x | Screen routing and navigation stack |
| Axios | 1.x | HTTP client for Flask API communication |
| AsyncStorage | — | Local offline state persistence |

### Backend

| Technology | Version | Role |
|---|---|---|
| Python | 3.11+ | Backend language |
| Flask | 3.x | Lightweight REST API framework |
| SQLAlchemy | 2.x | ORM layer for PostgreSQL |
| Flask-JWT-Extended | — | JSON Web Token authentication |
| PyCryptodome | — | AES encryption for data in transit |

### Database

| Technology | Role |
|---|---|
| PostgreSQL 15 | Primary relational database — stores all child, vaccination, and user records |

---

## 🔐 Security Architecture

Security is not an afterthought in SPRMP — it is a foundational design concern given the sensitivity of child health records.

### AES Encryption
All personally identifiable information (PII) and health records transmitted between the mobile application and the Flask API are encrypted using **AES (Advanced Encryption Standard)** before transmission. This ensures that even if network traffic is intercepted, the data cannot be read without the corresponding decryption key.

### Role-Based Access Control (RBAC)
SPRMP enforces a strict three-role access hierarchy:

| Role | Capabilities | Access Scope |
|---|---|---|
| **Admin** | Full system control — user management, data oversight, system configuration | Web Portal only |
| **UCMO** | Read-only analytics — campaign monitoring, district-level statistics | Web Portal only |
| **Field Worker** | All data entry — child registration, vaccination recording, missed-case flagging | **Mobile Application** |

The mobile application is **exclusively accessible to Field Worker accounts**. Role enforcement is applied at both the API middleware layer and the mobile UI layer — there is no route or screen in the mobile app that an Admin or UCMO account can access.

### JWT Authentication
All API endpoints are protected via **JSON Web Tokens (JWT)**. Unauthenticated requests are rejected with a `401 Unauthorized` response. Tokens are short-lived and refreshed silently to maintain session continuity without requiring re-login during active field operations.

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed on your development machine:

- Node.js v18+ and npm
- Python 3.11+
- PostgreSQL 15
- Android Studio (for Android emulator) or Xcode (for iOS)
- React Native CLI

### 1. Clone the Repository

```bash
git clone https://github.com/RaqeebaYasin/SPRMP-MobileApp.git
cd SPRMP-MobileApp
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your database credentials, JWT secret, and AES key. **Never commit `.env` to version control.**

### 3. Set Up the Backend

```bash
cd backend
pip install -r requirements.txt
```

Initialise the database:
```bash
psql -U postgres -f database/schema.sql
psql -U postgres -f database/seed.sql   # Optional: load test data
```

Start the Flask development server:
```bash
flask run --host=0.0.0.0 --port=5000
```

### 4. Set Up the Mobile Application

```bash
cd ..
npm install
```

Start Metro bundler:
```bash
npx react-native start
```

Run on Android:
```bash
npx react-native run-android
```

Run on iOS:
```bash
npx react-native run-ios
```

---

## 🖼️ Core Features — Mobile Application

### Child Registration
Field workers can register a child by entering the child's name, date of birth, parent/guardian details, and household address. The form includes real-time validation to prevent incomplete or malformed records.

### Vaccination Recording
For each registered child, field workers record:
- Vaccine type administered (OPV — Oral Polio Vaccine)
- Date of administration
- Campaign round identifier
- Administering field worker (auto-populated from authenticated session)

### Missed Case and Refusal Flagging
When a household refuses vaccination or a child cannot be reached, field workers log the case with a reason code. This data is surfaced in the Phase I Web Portal for UCMO monitoring and follow-up planning.

### Offline Mode
Network connectivity in target campaign areas is unreliable. Records created offline are queued locally via AsyncStorage and synchronised automatically with the backend when connectivity is restored.

### GPS Location Tagging
Each vaccination or missed-case record is optionally tagged with the device's GPS coordinates, enabling geo-visualisation of campaign coverage in the Web Portal's analytics dashboard.

### Secure Login
Field workers authenticate using credentials provisioned by the Admin. The mobile application enforces role-checking on login — non-Field Worker accounts are rejected with an appropriate error message.

---

## 🔗 Relationship to Phase I (Web Portal)

Phase II does not exist in isolation. The mobile application is the **data-entry interface** for an ecosystem whose analytics and management interface lives in the Phase I Web Portal. The two phases share:

- A **single PostgreSQL database** — records entered via mobile are immediately available on the web dashboard
- The **same Flask REST API backend** — the Web Portal and Mobile Application call the same endpoints, with role-based access control determining what each can read or write
- **Consistent RBAC enforcement** — roles defined in Phase I govern what the mobile application can access

The Phase I Web Portal provides:
- Admin-level user and campaign management
- UCMO read-only analytics and district monitoring dashboards
- A ChatBot interface (partially implemented) for query assistance

---

## 👩‍💻 Authors

| Name | Roll Number | Contribution |
|---|---|---|
| **Raqeeba Yasin** | 092873 | Full-stack development, backend architecture, security implementation, documentation |
| **Uma Ammara** | 092869 | Mobile UI development, API integration, testing and validation |

**Supervisor:** Dr. Muhammad Adeel  
**Institution:** Wisdom Degree College for Women, Channan  
**University Affiliation:** University of the Punjab, Lahore  
**Programme:** BS Computer Science  

---

## ⚠️ Copyright and Usage Restrictions

**© 2024–2025 Raqeeba Yasin and Uma Ammara. All Rights Reserved.**

This repository and all of its contents — including but not limited to source code, architecture design, database schema, API design, documentation, and associated assets — are the original intellectual property of the authors.

**The following are strictly prohibited without prior written permission from the authors:**

- Copying, reproducing, or redistributing any part of this codebase
- Using this project or any portion thereof in academic submissions, coursework, or projects
- Adapting, modifying, or building upon this work for any purpose
- Presenting this work or derivative works as your own

This project is submitted as a Final Year Project to Wisdom Degree College for Women, Channan (affiliated with the University of the Punjab, Lahore) for academic evaluation purposes only. No licence — express or implied — is granted to any third party for any use of this work.

> **Plagiarism and code theft are academic offences. Any unauthorised use of this project may be reported to the relevant academic institution and, where applicable, pursued under applicable intellectual property law.**

For academic collaboration inquiries, contact the authors through official university channels only.

---

## 📄 Documentation

Full technical documentation for both Phase I and Phase II — including system architecture, requirements specification, design documentation, implementation details, testing, and deployment guidance — is maintained separately as the formal FYP report submitted to the university.

For documentation queries, contact the authors or supervisor via official channels.

---

<div align="center">

*Built with purpose. Designed for Pakistan.*  
**SPRMP — Smart Polio Record and Monitoring Portal**

</div>
