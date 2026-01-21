# Travel Agent AI Planner 🌍✈️

A professional, full-stack AI-powered travel planning application built with FastAPI and React.

## 🚀 Overview

This application provides a seamless travel planning experience. Users can chat with an AI agent to get weather updates, tourist attractions, and show recommendations for major world cities. The agent intelligently populates a travel preparation form and generates personalized itineraries.

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **AI**: OpenAI GPT-4o
- **Services**: Modular service-oriented architecture
- **Documentation**: Swagger/OpenAPI (at `/docs`)

### Frontend
- **Framework**: React via Vite
- **Styling**: Vanilla CSS (Modular)
- **Icons**: Lucide React
- **PDF Generation**: jsPDF

## 🏗 Architecture

The project follows a clean, modular structure for scalability and maintainability.

```text
SR/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/routers/    # API endpoints (Weather, Attractions, Shows)
│   │   ├── core/           # Configuration and prompts
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Core business logic (Agent, Extractor, Tools)
│   │   └── main.py         # Application entry point
│   ├── knowledge.json      # User preferences mock database
│   ├── .env                # Environment variables
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Application
│   ├── src/
│   │   ├── assets/styles/  # Centralized CSS
│   │   ├── components/
│   │   │   ├── chat/       # Chat-related UI
│   │   │   └── workspace/  # Main layout and form components
│   │   ├── services/       # API integration
│   │   ├── utils/          # PDF generator and helpers
│   │   └── App.jsx         # Root component
│   └── package.json        # Frontend dependencies
├── run.ps1                 # Unified Windows Run Script
├── run.sh                  # Unified Unix/Linux Run Script
└── README.md               # Project documentation
```

## ⚙️ Setup Instructions

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here
```

### Local Development

1. **Prerequisites**:
   - Python 3.9 or higher
   - Node.js 18 or higher
   - OpenAI and OpenWeatherMap API keys

2. **Unified Startup**:
   
   **Windows (PowerShell):**
   ```powershell
   ./run.ps1
   ```
   
   **macOS / Linux:**
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

## 🚩 Troubleshooting

- **CORS Errors**: Ensure the backend allows `http://localhost:5173`.
- **API Keys**: Verify that your `.env` file is in the `backend/` directory and keys are valid.
- **Port Conflicts**: Backend runs on `8000`, Frontend on `5173`.
