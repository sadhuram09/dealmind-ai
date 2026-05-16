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