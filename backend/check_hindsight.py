import requests

bank_id = "dealmind-p001"
base = "http://localhost:8888"

print("=== Checking bank ===")
r = requests.get(f"{base}/api/v1/banks/{bank_id}")
print(f"Status: {r.status_code}")
print(r.text[:500])

print("\n=== Checking memories ===")
r = requests.get(f"{base}/api/v1/banks/{bank_id}/memories")
print(f"Status: {r.status_code}")
print(r.text[:1000])

print("\n=== Trying recall directly ===")
r = requests.post(f"{base}/api/v1/banks/{bank_id}/recall", json={
    "query": "objections budget CRM",
    "top_k": 5
})
print(f"Status: {r.status_code}")
print(r.text[:1000])