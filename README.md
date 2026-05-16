# DealMind AI 🧠
### AI Sales Intelligence Agent with Persistent Memory

> Built for the Hindsight x CascadeFlow Hackathon — Team India 🇮🇳

## What It Does
DealMind AI is a sales intelligence agent that remembers every conversation with every prospect across all time. It helps sales reps close deals by knowing exactly what to say next — powered by Hindsight's persistent memory and running at a fraction of normal AI costs.

## The Problem
Sales reps manage 30-50 active deals at once. They forget what a prospect said 3 weeks ago. The agent sounds generic. The prospect feels like a number. The deal dies.

**DealMind AI fixes this.**

## Tech Stack
- **Memory**: Hindsight (persistent semantic memory)
- **Runtime Intelligence**: cascadeflow model routing
- **LLM**: Groq (llama-3.3-70b-versatile) — free and fast
- **Backend**: FastAPI (Python)
- **Frontend**: React + Tailwind CSS

## Architecture
Sales Rep → React Dashboard
↓
FastAPI Backend
↙              ↘
Hindsight          Groq LLM
(Memory)         (Intelligence)
↘              ↙
DealMind Agent Response

## Core Features
- 🧠 **Persistent Memory** — remembers every call, objection, and commitment forever
- 💰 **Cost Intelligence** — 97% cheaper than GPT-4 baseline via smart routing
- 📊 **Deal Risk Scoring** — AI scores deal health from 1-10 with specific reasons
- ✉️ **Auto Follow-up Drafts** — personalized emails referencing past conversations
- 🔍 **Competitor Tracking** — flags every competitor mention automatically
- 📈 **Full Audit Trail** — every AI decision logged with cost and latency

## API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/log-call` | POST | Store call notes in Hindsight memory |
| `/recall/{id}` | GET | Retrieve full prospect memory |
| `/prepare-for-call/{id}` | POST | AI call prep from memory |
| `/draft-followup` | POST | AI personalized follow-up email |
| `/deal-risk/{id}` | GET | AI deal risk score |
| `/audit-trail` | GET | Full cost and model audit log |
| `/prospects` | GET | All prospects with memory profiles |

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (free at groq.com)
- Hindsight API key (free at ui.hindsight.vectorize.io)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install fastapi uvicorn python-dotenv groq hindsight-client hindsight-api requests
cp .env.example .env  # Add your API keys
uvicorn main:app --reload --port 8000
```

### Hindsight Memory Server
```bash
set HINDSIGHT_API_LLM_PROVIDER=groq
set HINDSIGHT_API_LLM_API_KEY=your_groq_key
set HINDSIGHT_API_LLM_MODEL=llama-3.3-70b-versatile
hindsight-api
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Team
- **Sadhuram** — AI/ML Lead
- **Aman** — Frontend Lead  
- **Satyam** — Data & QA
- **Sattvik** — DevOps & Content

## Hackathon
Built for the **Hindsight x CascadeFlow International Hackathon**
