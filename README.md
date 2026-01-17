# AquaSense AI

**AI-powered hydration tracking and biometric analysis system**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📖 Overview

AquaSense AI is an advanced, AI-driven hydration management app. It analyzes tongue and urine photos to generate health insights. With multi-factor biometric analysis, AquaSense delivers personalized hydration guidance and reports.

## ✨ Core Features

- **AI Tongue Analysis**: Evaluates tongue color, coating, and texture to assess hydration and wellness signals.
- **Urine Color Analysis**: Uses image-based color metrics to estimate dehydration risk.
- **Hydration Reporting**: Generates summarized hydration status and recommendations.
- **Personalized Drink Recommendation**: Selects the best hydration option based on profile and analysis.
- **History Tracking**: Stores reports to view hydration trends over time.

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (UI framework)
- **Material Icons** (icon library)

### Backend
- **FastAPI** (Python web framework)
- **Qwen (DashScope)** (AI analysis)
- **SQLite** (database)
- **Aliyun OSS** (object storage)

---

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/lihe8811/AquaSense.git
cd AquaSense
```

### 2. Backend setup
1. Enter the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # macOS/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables: create `.env` in `backend` and add:
   ```env
   DASHSCOPE_API_KEY=your_key_here
   OSS_ACCESS_KEY_ID=your_id
   OSS_ACCESS_KEY_SECRET=your_secret
   OSS_ENDPOINT=your_endpoint
   OSS_BUCKET_NAME=your_bucket
   ```
5. Start the backend:
   ```bash
   uvicorn main:app --reload
   ```

### 3. Frontend setup
1. Return to the repo root and install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000`

---

## 📂 Project Structure

```text
AquaSense/
├── backend/                # Python FastAPI backend
│   ├── data/               # SQLite database
│   ├── services/           # AI, storage, auth, and core logic
│   └── main.py             # API entrypoint
├── src/                    # React frontend source
│   ├── components/         # Shared components (charts, progress, etc.)
│   ├── views/              # Screens (analysis, report, overview, etc.)
│   └── App.tsx             # App shell and routing
├── types.ts                # TypeScript type definitions
└── README.md               # Project documentation
```

## 📄 License

This project is licensed under the MIT License.
