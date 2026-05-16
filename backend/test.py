import requests
import json
import time

BASE = "http://127.0.0.1:8000"

# Test 1 — Log a call
print("Testing /log-call...")
r = requests.post(f"{BASE}/log-call", json={
    "prospect_id": "p001",
    "prospect_name": "Vikram Sharma",
    "company": "TechCorp India",
    "deal_size": "12L",
    "call_number": 1,
    "notes": "Vikram mentioned they are currently using a legacy CRM and are frustrated with it. Budget approved for Q3. CFO wants ROI proof before signing. They previously had a failed implementation with CompetitorX.",
    "objections": ["Needs ROI proof", "CFO approval pending", "Worried about implementation failure"],
    "outcome": "positive"
})
print(json.dumps(r.json(), indent=2))

# Log a second call to show memory building
print("\nLogging call 2...")
r = requests.post(f"{BASE}/log-call", json={
    "prospect_id": "p001",
    "prospect_name": "Vikram Sharma",
    "company": "TechCorp India",
    "deal_size": "12L",
    "call_number": 2,
    "notes": "Vikram confirmed the budget is 12 lakhs. CFO Rajesh Mehta wants a security compliance document before signing. They are comparing us with SalesForce India.",
    "objections": ["Security compliance docs needed", "Comparing with SalesForce"],
    "outcome": "needs follow-up"
})
print(json.dumps(r.json(), indent=2))

# Wait for Hindsight to process
print("\nWaiting 5 seconds for Hindsight to process memories...")
time.sleep(5)

# Test 2 — Recall memory
print("\nTesting /recall...")
r = requests.get(f"{BASE}/recall/p001")
print(json.dumps(r.json(), indent=2))

# Test 3 — Prepare for call
print("\nTesting /prepare-for-call (calling Groq AI)...")
r = requests.post(f"{BASE}/prepare-for-call/p001")
print(json.dumps(r.json(), indent=2))

# Test 4 — Deal risk
print("\nTesting /deal-risk...")
r = requests.get(f"{BASE}/deal-risk/p001")
print(json.dumps(r.json(), indent=2))

# Test 5 — Draft follow-up
print("\nTesting /draft-followup...")
r = requests.post(f"{BASE}/draft-followup", json={
    "prospect_id": "p001",
    "call_summary": "Discussed security compliance requirements with Vikram. He confirmed CFO Rajesh needs the docs by end of month."
})
print(json.dumps(r.json(), indent=2))

# Test 6 — Audit trail
print("\nTesting /audit-trail...")
r = requests.get(f"{BASE}/audit-trail")
print(json.dumps(r.json(), indent=2))