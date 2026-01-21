# Travel Agent AI Planner 🌍✈️

A professional, full-stack AI-powered travel planning application built with FastAPI and React. This project demonstrates a sophisticated multi-turn agentic workflow capable of tool use, structured data extraction, and real-time UI synchronization.

## 🚀 What was built and why
**Why this use case?**
Travel planning is a classic **coordination problem** that goes beyond simple Q&A. It requires an agent to:
1. **Gather High-Entropy Data**: Fetching dynamic weather, varying show times, and diverse attractions.
2. **Apply User Constraints**: Cross-referencing findings with specific user dates, budget, and persona-based interests.
3. **Proactive State Management**: Automatically syncing the "mental model" of the trip into a visual UI (forms/tables) so the user doesn't have to track details manually.

- **Intelligent State-Sync**: Travel planning is inherently visual. Instead of just providing wall-of-text answers, this system uses "Client Actions" to proactively sync the agent's findings with the interactive UI—filling out preparation forms and building live recommendation tables as the conversation progresses.
- **Persona Alignment**: The agent utilizes local "Knowledge" (interests like 'Theater' or 'Outdoors') to filter the massive search space of a city, ensuring recommendations are relevant, not generic.

## 🛠 Capabilities & Actions

The system operates using a bi-directional communication protocol via NDJSON streams.

### Server-Side Tools
The agent has access to the following programmatic tools to gather real-time or curated data:
- `get_weather(city)`: Fetches current weather (Real-time via OpenWeatherMap API).
- `get_attractions(city)`: Retrieves top-rated tourist landmarks.
- `get_shows(city)`: Finds current entertainment, theater, and sports events.

### Client-Side Actions
The backend can trigger specific UI state changes on the user's screen by emitting action events:
- `update_travel_form`: Automatically populates the sidebar form (Destination, Dates, Checklist) when the agent detects relevant information in the conversation.
- `enable_download`: Informs the UI when a plan is ready and provides the necessary metadata for PDF generation.
- `auto_select_preferences`: Highlights specific recommendations in the table that perfectly match the user's stored interests.

## 🧠 Knowledge Management
**Location**: `backend/knowledge.json`

**How it's used**:
1. **Persona Consistency**: The agent is primed with the user's name and bio, allowing it to address the user personally (e.g., "Hello Sahil!").
2. **Interest Alignment**: The agent uses the `preferences.interests` field to rank and highlight attractions. If a user likes "Theater," the agent will prioritize the West End in London over sports stadiums.
3. **Implicit Context**: This knowledge acts as a "long-term memory" that persists across sessions, unlike the conversation history which is short-term.

## 🏗 Tech Stack
- **Backend**: FastAPI, OpenAI GPT-4o, Pydantic.
- **Frontend**: React (Vite), Lucide Icons, Vanilla CSS (Modular).
- **Automation**: PowerShell (`run.ps1`) and Bash (`run.sh`) scripts for one-click deployment.

## ⚙️ How to Run

### 1. Prerequisites
- Python 3.9+ and Node.js 18+.
- **API Keys**: OpenAI and OpenWeatherMap.

### 2. Environment Setup
Create a `.env` file in the `backend/` directory:
```env
OPENAI_API_KEY=your_key
OPENWEATHERMAP_API_KEY=your_key
```

### 3. Execution
The project includes unified run scripts that manage virtual environments, install dependencies, and launch both services simultaneously.

**Windows (PowerShell):**
```powershell
./run.ps1
```

**macOS / Linux (Bash):**
```bash
chmod +x run.sh
./run.sh
```

## ⚖️ Tradeoffs & Next Steps

### Tradeoffs
- **In-Memory Sessions**: Conversation history is currently stored in memory (`sessions` dict). For production, this would be moved to Redis or PostgreSQL.
- **Static Knowledge**: Preferences are loaded from a JSON file. Real-world apps would use an `/api/profile` endpoint backed by a database.
- **Mocked Content**: While weather is real-time, attractions and shows for several cities are currently pulled from curated lists to ensure consistent demo performance.

### Next Steps
- **Production Persistence**: Integrate a database (Supabase/Firebase) for user profiles and chat history.
- **Complex Multi-City Routing**: Support planning trips that span multiple destinations in a single itinerary.
- **Architectural Scaling**: If the agent grew to handle multiple concurrent goals, complex conditional branching, or multi-day long-running workflows, I would migrate the core logic to **LangGraph** for more robust stateful execution and use **LangChain** for standardized tool abstractions.
