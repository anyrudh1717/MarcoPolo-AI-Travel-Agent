import sys
import io
from datetime import datetime, timedelta
from crewai import Agent, Task, Crew, Process, LLM
import re

# Force UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Ensure proper CLI arguments
if len(sys.argv) != 5:
    print("Usage: planner.py <start_location> <destination> <start_date> <end_date>")
    sys.exit(1)

# Parse input arguments
start_location = sys.argv[1]
destination = sys.argv[2]
start_date_str = sys.argv[3]
end_date_str = sys.argv[4]

# ✅ Calculate number of days from dates
try:
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    days = (end_date - start_date).days + 1
    if days <= 0:
        print("Invalid date range. End date must be after start date.")
        sys.exit(1)
except ValueError:
    print("Invalid date format. Use YYYY-MM-DD.")
    sys.exit(1)

# ✅ Generate date labels
date_labels = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days)]
date_heading_guide = "\n".join([f"Day {i+1} ({label}):" for i, label in enumerate(date_labels)])

# Initialize LLM
llm = LLM(
    model="groq/llama3-8b-8192",
    api_key="api"
)

# Single Merged Agent
travel_agent = Agent(
    role="itinerary planner",
    goal="Plan a detailed travel itinerary with estimated costs",
    backstory=(
        "You're a travel expert who creates detailed, cost-aware itineraries."
    ),
    allow_delegation=False,
    llm=llm
)

# Define task using calculated days
plan_task = Task(
    description=(
        f"Plan a {days}-day itinerary from {start_location} to {destination}, "
        f"starting on {start_date_str} and ending on {end_date_str}. "
        f"Each day must be labeled with its number and actual date like:\n"
        f"{date_heading_guide}\n\n"
        "Include flights, hotels, food, activities, and estimated costs. "
        "Format the itinerary day-by-day and end each day's plan with a paragraph break. "
        "Ensure the output is neat, well-spaced, and easy to follow."
    ),
    agent=travel_agent,
    expected_output="A complete day-by-day travel itinerary with estimated costs and dates"
)

# Run CrewAI pipeline
crew = Crew(
    agents=[travel_agent],
    tasks=[plan_task],
    process=Process.sequential
)

try:
    result = crew.kickoff()

    if isinstance(result, dict) and 'plan' in result:
        raw_text = result['plan'].replace('\r\n', '\n')  # Normalize line breaks

        # Clean up formatting
        clean_text = re.sub(r"\*\*(.*?)\*\*", r"\1", raw_text)        # Remove markdown bold
        clean_text = re.sub(r"\n\s*[\*\-]\s*", " ", clean_text)       # Remove bullet points
        clean_text = re.sub(r"\n+", "\n", clean_text)                 # Normalize newlines
        clean_text = re.sub(r"\s{2,}", " ", clean_text)               # Remove extra spaces
        clean_text = clean_text.strip()

        print(clean_text)
    else:
        print(result)

except Exception as e:
    print(f"Error: {e}")
