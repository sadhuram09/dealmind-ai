import requests

base = "http://localhost:8888"

# Get the OpenAPI spec which lists ALL routes
r = requests.get(f"{base}/openapi.json")
data = r.json()

print("=== ALL AVAILABLE ROUTES ===")
for path, methods in data["paths"].items():
    for method in methods.keys():
        print(f"{method.upper()} {path}")