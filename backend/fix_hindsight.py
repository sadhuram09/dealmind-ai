import requests

base = "http://localhost:8888"

# Step 1 - Check what API routes exist
print("=== Checking API docs ===")
r = requests.get(f"{base}/docs")
print(f"Docs status: {r.status_code}")

# Step 2 - Try creating a bank with correct format
print("\n=== Creating bank ===")
r = requests.post(f"{base}/api/v1/banks", json={
    "id": "dealmind-p001",
    "mission": "Sales intelligence agent for Vikram Sharma from TechCorp India"
})
print(f"Status: {r.status_code}")
print(r.text[:500])

# Step 3 - Try retaining memory directly
print("\n=== Storing memory directly ===")
r = requests.post(f"{base}/api/v1/banks/dealmind-p001/memories", json={
    "content": "Call 1 with Vikram Sharma. CFO wants ROI proof. Budget 12L approved for Q3. Using legacy CRM. Compared with SalesForce."
})
print(f"Status: {r.status_code}")
print(r.text[:500])

# Step 4 - Wait and recall
import time
print("\nWaiting 8 seconds...")
time.sleep(8)

print("\n=== Recalling ===")
r = requests.post(f"{base}/api/v1/banks/dealmind-p001/recall", json={
    "query": "objections budget",
    "top_k": 5
})
print(f"Status: {r.status_code}")
print(r.text[:1000])