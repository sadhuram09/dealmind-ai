import requests
import time
import json

base = 'http://localhost:8888/v1/default'
bank = 'dealmind-p001'

# Try format 1
r = requests.post(f'{base}/banks/{bank}/memories', 
    json={'items': [{'content': 'Vikram from TechCorp has budget of 12L and needs ROI proof'}]})
print(f'Format 1: {r.status_code} - {r.text[:200]}')

# Try format 2 - with type
r = requests.post(f'{base}/banks/{bank}/memories', 
    json={'items': [{'content': 'CFO Rajesh wants security compliance docs', 'type': 'world'}]})
print(f'Format 2: {r.status_code} - {r.text[:200]}')

print('Waiting 10 seconds...')
time.sleep(10)

# Check what's stored
r = requests.get(f'{base}/banks/{bank}/memories/list')
data = r.json()
print(f'Total memories: {data["total"]}')
print(json.dumps(data, indent=2)[:1000])