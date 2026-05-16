import json
import requests
import time

BASE = "http://127.0.0.1:8000"

# Load the synthetic data
with open("synthetic_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

calls = data["calls"]
prospects = data["prospects"]

print(f"🚀 Seeding {len(prospects)} prospects with {len(calls)} calls into DealMind AI...\n")

success = 0
failed = 0

for call in calls:
    r = requests.post(f"{BASE}/log-call", json=call)
    if r.status_code == 200:
        result = r.json()
        success += 1
        print(f"✅ {result['prospect']} — Call {result['call_number']} stored ({result['total_calls_remembered']} total)")
    else:
        failed += 1
        print(f"❌ Failed: {call['prospect_name']} Call {call['call_number']} — {r.text[:100]}")

print(f"\n{'='*50}")
print(f"✅ Successfully seeded: {success} calls")
print(f"❌ Failed: {failed} calls")
print(f"{'='*50}")

# Verify by checking prospects endpoint
print(f"\n📋 Verifying prospects in memory...")
r = requests.get(f"{BASE}/prospects")
data = r.json()
print(f"Total prospects in memory: {data['total']}")
for p in data["prospects"]:
    print(f"  → {p['prospect_name']} ({p['company']}) — {p['total_calls']} calls | Deal: {p['deal_size']}")