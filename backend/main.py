from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import time
import json
import re
import requests as http_requests
from dotenv import load_dotenv
from groq import Groq
from datetime import datetime

load_dotenv()

app = FastAPI(title="DealMind AI", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Clients ─────────────────────────────────────────────
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
HINDSIGHT_BASE = "https://api.hindsight.vectorize.io/v1/default"

# ── Dual memory store ────────────────────────────────────
local_memory: Dict[str, List[dict]] = {}
audit_log: List[dict] = []

# ── Auto-seed on startup ─────────────────────────────────
DEMO_PROSPECTS = [
    {"id": "p001", "name": "Vikram Sharma", "company": "TechCorp India", "role": "VP Sales", "deal_size": "₹12L", "city": "Bangalore"},
    {"id": "p002", "name": "Priya Mehta", "company": "FinanceFirst Ltd", "role": "CTO", "deal_size": "₹25L", "city": "Mumbai"},
    {"id": "p003", "name": "Rajesh Kumar", "company": "LogiTech Solutions", "role": "CEO", "deal_size": "₹8L", "city": "Delhi"},
    {"id": "p004", "name": "Ananya Singh", "company": "HealthPlus India", "role": "Head of Operations", "deal_size": "₹50L", "city": "Hyderabad"},
    {"id": "p005", "name": "Arjun Nair", "company": "EduTech Ventures", "role": "Founder", "deal_size": "₹5L", "city": "Chennai"},
    {"id": "p006", "name": "Deepika Joshi", "company": "RetailMax Pvt Ltd", "role": "Director IT", "deal_size": "₹18L", "city": "Pune"},
    {"id": "p007", "name": "Suresh Patel", "company": "ManufacturePro", "role": "COO", "deal_size": "₹35L", "city": "Ahmedabad"},
    {"id": "p008", "name": "Kavya Reddy", "company": "AgriSmart Technologies", "role": "VP Technology", "deal_size": "₹15L", "city": "Hyderabad"},
    {"id": "p009", "name": "Mohit Agarwal", "company": "LegalEase India", "role": "Managing Partner", "deal_size": "₹20L", "city": "Delhi"},
    {"id": "p010", "name": "Sneha Pillai", "company": "TravelTech Solutions", "role": "Head of Product", "deal_size": "₹10L", "city": "Bangalore"},
]

DEMO_CALLS = [
    {"prospect_idx": 0, "call_number": 1, "notes": "Requested a pilot program for 3 months before full commitment. VP Sales at TechCorp India, Bangalore.", "objections": ["Legal team needs to review data privacy clauses", "Currently evaluating Salesforce as alternative"], "outcome": "positive"},
    {"prospect_idx": 0, "call_number": 2, "notes": "Asked about integration with their existing ERP system. Currently using legacy CRM, very frustrated.", "objections": ["IT team needs to review integration requirements"], "outcome": "positive"},
    {"prospect_idx": 0, "call_number": 3, "notes": "Asked detailed questions about data security and GDPR compliance. Budget approved for Q3.", "objections": ["Had a failed CRM implementation with previous vendor", "Currently evaluating Salesforce as alternative"], "outcome": "needs follow-up"},
    {"prospect_idx": 1, "call_number": 1, "notes": "Expressed strong interest in memory features. Currently using spreadsheets to track deals.", "objections": ["Board approval required for deals above ₹10L", "Comparing pricing with Zoho CRM"], "outcome": "positive"},
    {"prospect_idx": 1, "call_number": 2, "notes": "CFO joined the call unexpectedly and asked about ROI timeline. Very receptive overall.", "objections": ["IT team needs to review integration requirements"], "outcome": "positive"},
    {"prospect_idx": 1, "call_number": 3, "notes": "Requested case study from a company in same industry vertical. Decision by end of month.", "objections": ["Need reference customers in same industry"], "outcome": "positive"},
    {"prospect_idx": 2, "call_number": 1, "notes": "Frustrated with current CRM. Says it takes too long to get insights.", "objections": ["Budget needs CFO approval before Q3 ends", "Team not ready for change management"], "outcome": "positive"},
    {"prospect_idx": 2, "call_number": 2, "notes": "Had a demo with competitor last week. Said our UI is better.", "objections": ["Need reference customers in same industry"], "outcome": "positive"},
    {"prospect_idx": 2, "call_number": 3, "notes": "Mentioned board meeting next month. Wants proposal ready before that.", "objections": ["Budget needs CFO approval before Q3 ends"], "outcome": "needs follow-up"},
    {"prospect_idx": 3, "call_number": 1, "notes": "Positive call — asked for security whitepaper and compliance docs. Head of Operations at HealthPlus India.", "objections": ["Board approval required for deals above ₹10L", "Budget needs CFO approval before Q3 ends"], "outcome": "positive"},
    {"prospect_idx": 3, "call_number": 2, "notes": "Raised concerns about data migration timeline from their legacy system.", "objections": ["Board approval required for deals above ₹10L", "Budget needs CFO approval before Q3 ends"], "outcome": "positive"},
    {"prospect_idx": 3, "call_number": 3, "notes": "Requested a pilot program for 3 months before full commitment.", "objections": ["Legal team needs to review data privacy clauses", "Budget needs CFO approval before Q3 ends"], "outcome": "positive"},
    {"prospect_idx": 3, "call_number": 4, "notes": "Requested case study from a company in same industry vertical.", "objections": ["Board approval required for deals above ₹10L"], "outcome": "positive"},
    {"prospect_idx": 3, "call_number": 5, "notes": "Very positive about the AI features. Wants to see memory demo again.", "objections": ["Budget needs CFO approval before Q3 ends", "Board approval required for deals above ₹10L"], "outcome": "needs follow-up"},
    {"prospect_idx": 4, "call_number": 1, "notes": "Board approval required for deals. Previously locked into 3-year contract with old vendor.", "objections": ["Board approval required for deals above ₹10L", "Previous vendor locked them into 3-year contract"], "outcome": "positive"},
    {"prospect_idx": 4, "call_number": 2, "notes": "Currently evaluating Salesforce as alternative. Had failed CRM implementation before.", "objections": ["Currently evaluating Salesforce as alternative", "Had a failed CRM implementation with previous vendor"], "outcome": "positive"},
    {"prospect_idx": 4, "call_number": 3, "notes": "Asked about data migration support. Team of 20 sales reps needs better visibility.", "objections": ["Data migration from legacy system is a blocker"], "outcome": "needs follow-up"},
    {"prospect_idx": 4, "call_number": 4, "notes": "Positive about AI features. Wants security compliance docs before next meeting.", "objections": ["Security compliance documentation needed before signing"], "outcome": "positive"},
    {"prospect_idx": 4, "call_number": 5, "notes": "Final evaluation stage. Comparing us with Salesforce on price.", "objections": ["Currently evaluating Salesforce as alternative"], "outcome": "needs follow-up"},
    {"prospect_idx": 5, "call_number": 1, "notes": "Concerned about implementation timeline. Previous vendor locked into 3-year contract.", "objections": ["Concerned about implementation timeline", "Previous vendor locked them into 3-year contract"], "outcome": "positive"},
    {"prospect_idx": 5, "call_number": 2, "notes": "Data migration from legacy system is a major blocker. IT team reviewing.", "objections": ["Data migration from legacy system is a blocker"], "outcome": "needs follow-up"},
    {"prospect_idx": 5, "call_number": 3, "notes": "Need reference customers in same retail industry before signing.", "objections": ["Need reference customers in same industry"], "outcome": "positive"},
    {"prospect_idx": 5, "call_number": 4, "notes": "Very positive call. Director IT confirmed budget is approved.", "objections": ["Concerned about implementation timeline"], "outcome": "positive"},
    {"prospect_idx": 5, "call_number": 5, "notes": "Legal team reviewing data privacy clauses. Expected sign-off next week.", "objections": ["Legal team needs to review data privacy clauses"], "outcome": "positive"},
    {"prospect_idx": 5, "call_number": 6, "notes": "Deal almost closed. Final legal sign-off pending.", "objections": [], "outcome": "positive"},
    {"prospect_idx": 6, "call_number": 1, "notes": "Comparing pricing with Zoho CRM. Previous vendor locked them in for 3 years.", "objections": ["Comparing pricing with Zoho CRM", "Previous vendor locked them into 3-year contract"], "outcome": "needs follow-up"},
    {"prospect_idx": 6, "call_number": 2, "notes": "Team not ready for change management. COO wants phased rollout.", "objections": ["Team not ready for change management"], "outcome": "neutral"},
    {"prospect_idx": 6, "call_number": 3, "notes": "Requested ROI proof with case studies from manufacturing sector.", "objections": ["Need ROI proof with case studies from similar companies"], "outcome": "positive"},
    {"prospect_idx": 6, "call_number": 4, "notes": "Budget discussion — ₹35L approved if ROI proof is satisfactory.", "objections": ["Comparing pricing with Zoho CRM"], "outcome": "positive"},
    {"prospect_idx": 6, "call_number": 5, "notes": "Positive outcome. COO confirmed phased rollout plan works for them.", "objections": [], "outcome": "positive"},
    {"prospect_idx": 7, "call_number": 1, "notes": "Budget needs CFO approval. Currently evaluating Salesforce as alternative.", "objections": ["Budget needs CFO approval before Q3 ends", "Currently evaluating Salesforce as alternative"], "outcome": "positive"},
    {"prospect_idx": 7, "call_number": 2, "notes": "Security compliance documentation needed before signing. VP Technology confirmed.", "objections": ["Security compliance documentation needed before signing"], "outcome": "needs follow-up"},
    {"prospect_idx": 7, "call_number": 3, "notes": "Positive call. Shared security whitepaper. CFO approval expected next week.", "objections": ["Budget needs CFO approval before Q3 ends"], "outcome": "positive"},
    {"prospect_idx": 7, "call_number": 4, "notes": "CFO approved budget. Moving to contract stage.", "objections": [], "outcome": "positive"},
    {"prospect_idx": 8, "call_number": 1, "notes": "Need reference customers in legal industry. Previous vendor locked them in.", "objections": ["Need reference customers in same industry", "Previous vendor locked them into 3-year contract"], "outcome": "needs follow-up"},
    {"prospect_idx": 8, "call_number": 2, "notes": "ROI proof needed with case studies from legal sector.", "objections": ["Need ROI proof with case studies from similar companies"], "outcome": "positive"},
    {"prospect_idx": 8, "call_number": 3, "notes": "Shared legal sector case study. Managing Partner very impressed.", "objections": ["Need reference customers in same industry"], "outcome": "positive"},
    {"prospect_idx": 8, "call_number": 4, "notes": "Contract review stage. Legal team reviewing terms.", "objections": ["Legal team needs to review data privacy clauses"], "outcome": "positive"},
    {"prospect_idx": 9, "call_number": 1, "notes": "Q4 budget already allocated. Comparing with Zoho CRM on price.", "objections": ["Q4 budget already allocated elsewhere", "Comparing pricing with Zoho CRM"], "outcome": "needs follow-up"},
    {"prospect_idx": 9, "call_number": 2, "notes": "Security compliance documentation needed. Head of Product confirmed requirements.", "objections": ["Security compliance documentation needed before signing"], "outcome": "positive"},
    {"prospect_idx": 9, "call_number": 3, "notes": "Budget discussion for Q1 next year. Very positive about AI features.", "objections": ["Q4 budget already allocated elsewhere"], "outcome": "positive"},
    {"prospect_idx": 9, "call_number": 4, "notes": "Q1 budget confirmed. Moving forward with implementation planning.", "objections": [], "outcome": "positive"},
    {"prospect_idx": 9, "call_number": 5, "notes": "Final call before contract. All objections resolved.", "objections": [], "outcome": "positive"},
]

def auto_seed():
    for call_data in DEMO_CALLS:
        p = DEMO_PROSPECTS[call_data["prospect_idx"]]
        pid = p["id"]
        if pid not in local_memory:
            local_memory[pid] = []
        local_memory[pid].append({
            "prospect_name": p["name"],
            "company": p["company"],
            "deal_size": p["deal_size"],
            "call_number": call_data["call_number"],
            "notes": call_data["notes"],
            "objections": call_data["objections"],
            "outcome": call_data["outcome"],
            "timestamp": datetime.now().isoformat()
        })

auto_seed()
print(f"✅ Auto-seeded {len(DEMO_PROSPECTS)} prospects with {len(DEMO_CALLS)} calls on startup")
# ── Models ──────────────────────────────────────────────
class CallNote(BaseModel):
    prospect_id: str
    prospect_name: str
    company: str
    deal_size: str
    call_number: int
    notes: str
    objections: List[str]
    outcome: str

class FollowUpRequest(BaseModel):
    prospect_id: str
    call_summary: str

# ── Hindsight Cloud helpers ──────────────────────────────
def get_hindsight_headers():
    return {
        "Authorization": f"Bearer {os.getenv('HINDSIGHT_API_KEY')}",
        "Content-Type": "application/json"
    }

def get_bank_id(prospect_id: str) -> str:
    return f"dealmind-{prospect_id}"

def hindsight_ensure_bank(bank_id: str, prospect_name: str, company: str):
    try:
        http_requests.put(
            f"{HINDSIGHT_BASE}/banks/{bank_id}",
            json={"mission": f"Sales intelligence for {prospect_name} from {company}. Track all objections, budget details, competitor mentions, and commitments."},
            headers=get_hindsight_headers(),
            timeout=5
        )
    except:
        pass

def hindsight_store(bank_id: str, content: str):
    try:
        r = http_requests.post(
            f"{HINDSIGHT_BASE}/banks/{bank_id}/memories",
            json={"items": [{"content": content}]},
            headers=get_hindsight_headers(),
            timeout=5
        )
        return r.status_code == 200
    except:
        return False

def hindsight_recall(bank_id: str, query: str) -> str:
    try:
        r = http_requests.post(
            f"{HINDSIGHT_BASE}/banks/{bank_id}/memories/recall",
            json={"query": query, "top_k": 10},
            headers=get_hindsight_headers(),
            timeout=5
        )
        if r.status_code == 200:
            data = r.json()
            results = data.get("results", [])
            if results:
                return "\n".join([item.get("text", "") for item in results if item.get("text")])
    except:
        pass
    return ""

def hindsight_reflect(bank_id: str, query: str) -> str:
    try:
        r = http_requests.post(
            f"{HINDSIGHT_BASE}/banks/{bank_id}/reflect",
            json={"query": query},
            headers=get_hindsight_headers(),
            timeout=10
        )
        if r.status_code == 200:
            data = r.json()
            return data.get("text", "") or data.get("response", "") or ""
    except:
        pass
    return ""

# ── Local memory helpers ─────────────────────────────────
def local_store(prospect_id: str, call_data: dict):
    if prospect_id not in local_memory:
        local_memory[prospect_id] = []
    local_memory[prospect_id].append({
        **call_data,
        "timestamp": datetime.now().isoformat()
    })

def local_recall(prospect_id: str) -> str:
    if prospect_id not in local_memory:
        return ""
    calls = local_memory[prospect_id]
    lines = []
    for c in calls:
        lines.append(
            f"Call {c['call_number']} ({c.get('timestamp','')[:10]}): "
            f"{c['notes']} | "
            f"Objections: {', '.join(c['objections']) if c['objections'] else 'None'} | "
            f"Deal size: {c['deal_size']} | "
            f"Outcome: {c['outcome']}"
        )
    return "\n".join(lines)

def get_best_memory(prospect_id: str, query: str = "objections budget decisions") -> str:
    bank_id = get_bank_id(prospect_id)

    # Try Hindsight Cloud first (semantic search)
    hs_memory = hindsight_recall(bank_id, query)
    if hs_memory and len(hs_memory) > 50:
        return f"[Hindsight Cloud Memory]\n{hs_memory}"

    # Try Hindsight reflect (most intelligent)
    hs_reflect = hindsight_reflect(bank_id, query)
    if hs_reflect and len(hs_reflect) > 50:
        return f"[Hindsight Cloud Reflection]\n{hs_reflect}"

    # Fallback to local memory
    local = local_recall(prospect_id)
    if local:
        return f"[Local Memory]\n{local}"

    return "No previous interactions found."

# ── Groq AI helper ───────────────────────────────────────
def ask_groq(prompt: str, system: str = "You are an elite AI sales assistant.") -> dict:
    start = time.time()
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1024,
            temperature=0.7
        )
        latency = round((time.time() - start) * 1000)
        text = response.choices[0].message.content
        cost = round((response.usage.total_tokens / 1000) * 0.0001, 6)

        audit_log.append({
            "timestamp": datetime.now().isoformat(),
            "model": "llama-3.3-70b-versatile (Groq)",
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
            "latency_ms": latency,
            "cost_usd": cost
        })

        return {
            "text": text,
            "model": "llama-3.3-70b-versatile (Groq)",
            "cost_usd": cost,
            "latency_ms": latency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq error: {str(e)}")

# ── ENDPOINTS ────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "status": "DealMind AI v3.0 is live 🚀",
        "memory_primary": "Hindsight Cloud (persistent semantic)",
        "memory_fallback": "Local store (always available)",
        "llm": "Groq llama-3.3-70b-versatile",
        "prospects_in_memory": len(local_memory)
    }

@app.get("/health")
def health():
    try:
        r = http_requests.get(
            "https://api.hindsight.vectorize.io/health",
            headers=get_hindsight_headers(),
            timeout=3
        )
        hs = "connected" if r.status_code == 200 else "error"
    except:
        hs = "disconnected"
    return {
        "status": "ok",
        "hindsight": hs,
        "groq": "connected",
        "local_memory_profiles": len(local_memory),
        "audit_entries": len(audit_log)
    }

@app.post("/log-call")
def log_call(data: CallNote):
    content = (
        f"Call {data.call_number} with {data.prospect_name} from {data.company}. "
        f"Deal size: {data.deal_size}. "
        f"Notes: {data.notes}. "
        f"Objections: {', '.join(data.objections) if data.objections else 'None'}. "
        f"Outcome: {data.outcome}."
    )

    bank_id = get_bank_id(data.prospect_id)
    hindsight_ensure_bank(bank_id, data.prospect_name, data.company)
    hs_ok = hindsight_store(bank_id, content)

    local_store(data.prospect_id, {
        "prospect_name": data.prospect_name,
        "company": data.company,
        "deal_size": data.deal_size,
        "call_number": data.call_number,
        "notes": data.notes,
        "objections": data.objections,
        "outcome": data.outcome
    })

    return {
        "status": "memory stored",
        "prospect": data.prospect_name,
        "company": data.company,
        "call_number": data.call_number,
        "bank_id": bank_id,
        "hindsight": "✅ stored in cloud" if hs_ok else "⚠️ fallback used",
        "local": "✅ stored",
        "total_calls_remembered": len(local_memory.get(data.prospect_id, []))
    }

@app.get("/recall/{prospect_id}")
def recall(prospect_id: str, query: str = "all interactions objections budget"):
    memory = get_best_memory(prospect_id, query)
    local_calls = len(local_memory.get(prospect_id, []))
    return {
        "prospect_id": prospect_id,
        "memory": memory,
        "total_calls": local_calls,
        "source": "Hindsight Cloud + Local dual memory"
    }

@app.post("/prepare-for-call/{prospect_id}")
def prepare_for_call(prospect_id: str):
    memory = get_best_memory(
        prospect_id,
        "objections budget competitors decision makers commitments timeline"
    )

    if memory == "No previous interactions found.":
        return {
            "text": "First interaction. Start with discovery — understand their current setup, pain points, budget, and decision timeline.",
            "model": "rule-based",
            "cost_usd": 0,
            "latency_ms": 0
        }

    prompt = f"""
You are an elite sales coach preparing a rep for their next call.

Memory intelligence on this prospect:
{memory}

Give EXACTLY this format — hyper-specific, reference real details:

TOP 3 THINGS TO REMEMBER:
1. [specific fact from memory]
2. [specific fact from memory]
3. [specific fact from memory]

BIGGEST OBJECTION TO HANDLE TODAY:
Objection: [exact objection from memory]
Script: "[exact words to say to handle it]"

COMPETITOR WATCH:
[any competitor mentioned, or 'None mentioned so far']

SINGLE BEST NEXT STEP TO CLOSE THIS DEAL:
[one concrete, specific action referencing memory]

Be hyper-specific. Every line must reference something real.
"""
    return ask_groq(prompt)

@app.post("/draft-followup")
def draft_followup(data: FollowUpRequest):
    memory = get_best_memory(
        data.prospect_id,
        "past conversations objections personal details commitments promises"
    )

    prompt = f"""
You are an expert sales rep writing a follow-up email.

Relationship intelligence:
{memory}

Today's call summary:
{data.call_summary}

Write a follow-up email that:
1. References something specific from a PAST call — make it obvious you remembered
2. Directly addresses their main objection with a concrete solution
3. Has ONE clear CTA with a specific date
4. Sounds human, not templated
5. Under 150 words

Format:
Subject: [subject line]

[email body]
"""
    return ask_groq(prompt)

@app.get("/deal-risk/{prospect_id}")
def deal_risk(prospect_id: str):
    memory = get_best_memory(
        prospect_id,
        "objections red flags stalled decisions engagement competitors timeline"
    )
    local_calls = len(local_memory.get(prospect_id, []))

    if memory == "No previous interactions found.":
        return {
            "risk_score": 5,
            "risk_reason": "No interaction data yet",
            "recommended_action": "Schedule discovery call",
            "deal_stage": "discovery",
            "total_calls": local_calls,
            "model": "rule-based",
            "cost_usd": 0
        }

    prompt = f"""
Analyze this sales deal. Return ONLY raw JSON, no markdown, no explanation.

Deal memory:
{memory}

Return exactly:
{{
  "risk_score": <1-10, 10=highest risk>,
  "risk_reason": "<one specific sentence with real details>",
  "recommended_action": "<one concrete next step>",
  "deal_stage": "<discovery|evaluation|negotiation|closing>"
}}
"""
    result = ask_groq(
        prompt,
        system="Sales analytics AI. Return only valid JSON. Nothing else."
    )

    try:
        match = re.search(r'\{.*\}', result["text"], re.DOTALL)
        if match:
            parsed = json.loads(match.group())
            parsed["total_calls"] = local_calls
            parsed["model"] = result["model"]
            parsed["cost_usd"] = result["cost_usd"]
            parsed["latency_ms"] = result["latency_ms"]
            return parsed
    except:
        pass

    return {
        "risk_score": 5,
        "risk_reason": "Parse error",
        "recommended_action": "Review manually",
        "deal_stage": "evaluation",
        "total_calls": local_calls,
        "model": result["model"],
        "cost_usd": result["cost_usd"]
    }

@app.get("/audit-trail")
def get_audit_trail():
    total = sum(e["cost_usd"] for e in audit_log)
    baseline = len(audit_log) * 0.002
    saved = baseline - total
    return {
        "entries": audit_log[-50:],
        "summary": {
            "total_queries": len(audit_log),
            "total_cost_usd": round(total, 6),
            "baseline_cost_usd": round(baseline, 6),
            "cost_saved_usd": round(saved, 6),
            "savings_percent": round((saved / baseline * 100) if baseline > 0 else 0, 1),
            "avg_latency_ms": round(sum(e["latency_ms"] for e in audit_log) / len(audit_log)) if audit_log else 0
        }
    }

@app.get("/prospects")
def get_prospects():
    prospects = []
    for pid, calls in local_memory.items():
        if not calls:
            continue
        latest = calls[-1]
        all_objections = []
        for c in calls:
            all_objections.extend(c.get("objections", []))
        prospects.append({
            "prospect_id": pid,
            "prospect_name": latest["prospect_name"],
            "company": latest["company"],
            "deal_size": latest["deal_size"],
            "total_calls": len(calls),
            "last_outcome": latest["outcome"],
            "all_objections": list(set(all_objections)),
            "bank_id": get_bank_id(pid)
        })
    return {"prospects": prospects, "total": len(prospects)}