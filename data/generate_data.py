import json
import random
from datetime import datetime, timedelta

# 10 realistic Indian B2B prospects
prospects_data = [
    {
        "id": "p001",
        "name": "Vikram Sharma",
        "company": "TechCorp India",
        "role": "VP Sales",
        "deal_size": "₹12L",
        "city": "Bangalore"
    },
    {
        "id": "p002",
        "name": "Priya Mehta",
        "company": "FinanceFirst Ltd",
        "role": "CTO",
        "deal_size": "₹25L",
        "city": "Mumbai"
    },
    {
        "id": "p003",
        "name": "Rajesh Kumar",
        "company": "LogiTech Solutions",
        "role": "CEO",
        "deal_size": "₹8L",
        "city": "Delhi"
    },
    {
        "id": "p004",
        "name": "Ananya Singh",
        "company": "HealthPlus India",
        "role": "Head of Operations",
        "deal_size": "₹50L",
        "city": "Hyderabad"
    },
    {
        "id": "p005",
        "name": "Arjun Nair",
        "company": "EduTech Ventures",
        "role": "Founder",
        "deal_size": "₹5L",
        "city": "Chennai"
    },
    {
        "id": "p006",
        "name": "Deepika Joshi",
        "company": "RetailMax Pvt Ltd",
        "role": "Director IT",
        "deal_size": "₹18L",
        "city": "Pune"
    },
    {
        "id": "p007",
        "name": "Suresh Patel",
        "company": "ManufacturePro",
        "role": "COO",
        "deal_size": "₹35L",
        "city": "Ahmedabad"
    },
    {
        "id": "p008",
        "name": "Kavya Reddy",
        "company": "AgriSmart Technologies",
        "role": "VP Technology",
        "deal_size": "₹15L",
        "city": "Hyderabad"
    },
    {
        "id": "p009",
        "name": "Mohit Agarwal",
        "company": "LegalEase India",
        "role": "Managing Partner",
        "deal_size": "₹20L",
        "city": "Delhi"
    },
    {
        "id": "p010",
        "name": "Sneha Pillai",
        "company": "TravelTech Solutions",
        "role": "Head of Product",
        "deal_size": "₹10L",
        "city": "Bangalore"
    }
]

objections_pool = [
    "Budget needs CFO approval before Q3 ends",
    "Currently evaluating Salesforce as alternative",
    "Had a failed CRM implementation with previous vendor",
    "Security compliance documentation needed before signing",
    "Need ROI proof with case studies from similar companies",
    "Board approval required for deals above ₹10L",
    "IT team needs to review integration requirements",
    "Legal team needs to review data privacy clauses",
    "Comparing pricing with Zoho CRM",
    "Previous vendor locked them into 3-year contract",
    "Team not ready for change management",
    "Q4 budget already allocated elsewhere",
    "Need reference customers in same industry",
    "Concerned about implementation timeline",
    "Data migration from legacy system is a blocker"
]

notes_pool = [
    "Expressed strong interest in the memory features. Currently using spreadsheets to track deals.",
    "Frustrated with current CRM — says it takes too long to get insights. Very receptive.",
    "Asked detailed questions about data security and GDPR compliance.",
    "Mentioned their team of 50 sales reps needs better visibility into pipeline.",
    "Had a demo with competitor last week. Said our UI is better.",
    "CFO joined the call unexpectedly and asked about ROI timeline.",
    "Requested a pilot program for 3 months before full commitment.",
    "Very positive about the AI features. Wants to see memory demo again.",
    "Raised concerns about data migration timeline from their legacy system.",
    "Asked about integration with their existing ERP system.",
    "Mentioned board meeting next month — wants proposal ready before that.",
    "Competitor mention — currently trialing Zoho for free.",
    "Positive call — asked for security whitepaper and compliance docs.",
    "Decision maker confirmed budget is approved, just needs legal sign-off.",
    "Requested case study from a company in same industry vertical."
]

outcomes = ["positive", "positive", "positive", "needs follow-up", "needs follow-up", "neutral"]

def random_date(days_ago_max=60, days_ago_min=1):
    days = random.randint(days_ago_min, days_ago_max)
    return (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

all_calls = []

for prospect in prospects_data:
    num_calls = random.randint(3, 6)
    prospect_objections = random.sample(objections_pool, k=random.randint(3, 5))
    
    for call_num in range(1, num_calls + 1):
        call_objections = random.sample(prospect_objections, k=random.randint(1, 2))
        
        call = {
            "prospect_id": prospect["id"],
            "prospect_name": prospect["name"],
            "company": prospect["company"],
            "deal_size": prospect["deal_size"],
            "call_number": call_num,
            "notes": f"{random.choice(notes_pool)} [{prospect['role']} at {prospect['company']}, {prospect['city']}]",
            "objections": call_objections,
            "outcome": random.choice(outcomes)
        }
        all_calls.append(call)

# Save to JSON
output = {
    "prospects": prospects_data,
    "calls": all_calls,
    "total_prospects": len(prospects_data),
    "total_calls": len(all_calls)
}

with open("synthetic_data.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"✅ Generated {len(prospects_data)} prospects")
print(f"✅ Generated {len(all_calls)} total calls")
print(f"✅ Saved to synthetic_data.json")

# Preview first prospect
print(f"\n📋 Preview — First prospect calls:")
for call in all_calls[:3]:
    print(f"  Call {call['call_number']} — {call['prospect_name']}: {call['notes'][:60]}...")
    print(f"  Objections: {call['objections']}")
    print(f"  Outcome: {call['outcome']}\n")