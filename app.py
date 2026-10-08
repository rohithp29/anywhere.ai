import os
import sys
import datetime
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

# Add current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tralogger import get_logger
from src.agent.graph_wf import GraphWorkflow
from src.utils.utils_main import save_document
from langchain_core.messages import HumanMessage

logger = get_logger(__name__)

app = FastAPI(title="anywhere.ai - AI Travel Planner", version="1.0.0")

# Setup Static & Template Directories
BASE_DIR = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")

# Cached compiled graph workflow
graph_instance = None

def get_graph(provider: str = "groq"):
    global graph_instance
    if graph_instance is None:
        logger.info(f"Initializing GraphWorkflow with provider: {provider}")
        agent_wf = GraphWorkflow(model_provider=provider)
        graph_instance = agent_wf.build_graph()
    return graph_instance


class PlanRequest(BaseModel):
    destination: str
    days: Optional[int] = 5
    duration_text: Optional[str] = "5 - 6 Days"
    persona: Optional[str] = "Couple"
    vibes: Optional[List[str]] = []
    pace: Optional[str] = "Balanced"
    cities: Optional[List[str]] = []
    budget_tier: Optional[str] = "Balanced / Comfort"
    prompt: Optional[str] = None
    provider: Optional[str] = "groq"


FEATURED_PACKAGES = [
    {
        "id": "singapore-wonders",
        "title": "Singapore Wonders",
        "destination": "Singapore",
        "days": 5,
        "price": "₹50,000",
        "duration": "5 Nights",
        "persona": "Family",
        "image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop&q=80",
        "badge": "Popular"
    },
    {
        "id": "bali-thrills",
        "title": "Bali Thrills & Serenity",
        "destination": "Bali",
        "days": 6,
        "price": "₹40,000",
        "duration": "6 Nights",
        "persona": "Couple",
        "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80",
        "badge": "Top Rated"
    },
    {
        "id": "maldives-paradise",
        "title": "Cocogiri Maldives Luxury Escape",
        "destination": "Maldives",
        "days": 4,
        "price": "₹80,266",
        "duration": "4 Nights",
        "persona": "Couple",
        "image": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&auto=format&fit=crop&q=80",
        "badge": "Honeymoon"
    },
    {
        "id": "japan-cherry",
        "title": "Land of the Rising Sun",
        "destination": "Japan",
        "days": 8,
        "price": "₹1,15,000",
        "duration": "8 Nights",
        "persona": "Couple",
        "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80",
        "badge": "Bucketlist"
    },
    {
        "id": "switzerland-alps",
        "title": "Beauty of Central Europe",
        "destination": "Switzerland",
        "days": 7,
        "price": "₹1,45,000",
        "duration": "7 Nights",
        "persona": "Family",
        "image": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&auto=format&fit=crop&q=80",
        "badge": "Scenic"
    },
    {
        "id": "finland-aurora",
        "title": "Chase the Northern Lights",
        "destination": "Finland",
        "days": 6,
        "price": "₹1,29,000",
        "duration": "6 Nights",
        "persona": "Friends",
        "image": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80",
        "badge": "Exclusive"
    }
]


DESTINATIONS_DATA = [
    {
        "name": "Finland",
        "tagline": "Chase the Northern Lights",
        "image": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&auto=format&fit=crop&q=80",
        "cities": ["Helsinki", "Rovaniemi (Lapland)", "Kemi", "Tampere"]
    },
    {
        "name": "Switzerland",
        "tagline": "Beauty of Central Europe",
        "image": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=500&auto=format&fit=crop&q=80",
        "cities": ["Zurich", "Lucerne", "Interlaken", "Geneva", "Zermatt"]
    },
    {
        "name": "Japan",
        "tagline": "Land of Rising Sun",
        "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&auto=format&fit=crop&q=80",
        "cities": ["Tokyo", "Kyoto", "Osaka", "Hakone", "Hiroshima"]
    },
    {
        "name": "Maldives",
        "tagline": "Create Memories in Maldives",
        "image": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&auto=format&fit=crop&q=80",
        "cities": ["Male", "Maafushi", "Ari Atoll", "Baa Atoll"]
    },
    {
        "name": "Bali",
        "tagline": "Cultural Paradise",
        "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&auto=format&fit=crop&q=80",
        "cities": ["Ubud", "Seminyak", "Canggu", "Nusa Penida", "Uluwatu"]
    },
    {
        "name": "Singapore",
        "tagline": "The Lion City",
        "image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&auto=format&fit=crop&q=80",
        "cities": ["Marina Bay", "Sentosa Island", "Chinatown", "Orchard Road"]
    },
    {
        "name": "Thailand",
        "tagline": "The Kingdom of Thailand",
        "image": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=500&auto=format&fit=crop&q=80",
        "cities": ["Bangkok", "Phuket", "Chiang Mai", "Krabi", "Pattaya"]
    },
    {
        "name": "France",
        "tagline": "City of Light & Romance",
        "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop&q=80",
        "cities": ["Paris", "Nice", "Lyon", "Bordeaux", "Marseille"]
    }
]


@app.get("/", response_class=HTMLResponse)
async def serve_home(request: Request):
    return templates.TemplateResponse(request, "index.html", {"packages": FEATURED_PACKAGES, "destinations": DESTINATIONS_DATA})


@app.get("/builder", response_class=HTMLResponse)
async def serve_builder(request: Request):
    return templates.TemplateResponse(request, "builder.html", {"destinations": DESTINATIONS_DATA})


@app.get("/api/destinations")
async def get_destinations():
    return JSONResponse({"status": "success", "destinations": DESTINATIONS_DATA})


@app.get("/api/packages")
async def get_packages():
    return JSONResponse({"status": "success", "packages": FEATURED_PACKAGES})


@app.post("/api/plan")
async def generate_plan(payload: PlanRequest):
    try:
        logger.info(f"Received wizard trip request for {payload.destination} ({payload.duration_text}, {payload.persona})")
        
        if payload.prompt:
            user_query = payload.prompt
        else:
            vibes_part = f" Travel Vibes: {', '.join(payload.vibes)}." if payload.vibes else ""
            cities_part = f" Preferred Cities: {', '.join(payload.cities)}." if payload.cities else ""
            pace_part = f" Travel Pace: {payload.pace}." if payload.pace else ""
            
            vibes_str = f"Travel Vibes: {', '.join(payload.vibes)}. " if payload.vibes else ""
            cities_str = f"Must-visit cities: {', '.join(payload.cities)}. " if payload.cities else ""
            
            user_query = (
                f"Create a detailed, structured {payload.duration_text} ({payload.days}-day) trip itinerary to {payload.destination} "
                f"for a {payload.persona} group. {vibes_str}{cities_str}"
                f"Travel pace: {payload.pace or 'Balanced'}. Budget style: {payload.budget_tier}.\n\n"
                f"FORMAT REQUIREMENTS (very important):\n"
                f"- Start with a 2-sentence destination overview\n"
                f"- Group days by CITY. For each city use a heading: ## CITY NAME — N Nights\n"
                f"- For each day use: ### Day N: Brief Title\n"
                f"- Under each day, list 2-4 activities as bullet points. Each bullet must start with the time "
                f"(Morning / Afternoon / Evening / Full Day / Morning to Noon) followed by the activity.\n"
                f"- Mark activities with their type in brackets: [Food & Drink], [Culture], [Attraction], [Adventure], [Leisure]\n"
                f"- Include transit between cities (e.g. 'Transfer by train to Kyoto')\n"
                f"- End with: ## Budget Summary (table), ## Weather Tips, ## Packing Tips\n\n"
                f"Include Unsplash markdown image links for 3-4 key highlights using this format: "
                f"![Description](https://images.unsplash.com/photo-XXXXX?w=600&auto=format&fit=crop&q=80)"
            )

        graph = get_graph(provider=payload.provider or "groq")
        messages = [HumanMessage(content=user_query)]
        
        result = graph.invoke({"messages": messages})
        last_message = result["messages"][-1].content
        
        saved_file = save_document(last_message)
        
        return JSONResponse({
            "status": "success",
            "destination": payload.destination,
            "duration": payload.duration_text,
            "persona": payload.persona,
            "vibes": payload.vibes,
            "cities": payload.cities,
            "pace": payload.pace,
            "budget": payload.budget_tier,
            "itinerary_markdown": last_message,
            "saved_file": saved_file,
            "generated_at": datetime.datetime.now().strftime('%Y-%m-%d at %H:%M')
        })
        
    except Exception as e:
        logger.error(f"Error generating travel plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []
    provider: Optional[str] = "groq"


@app.post("/api/chat")
async def chat_with_agent(payload: ChatRequest):
    """Free-form chat endpoint for the AI chatbot widget."""
    try:
        logger.info(f"Chat request: {payload.message[:80]}...")

        # Build message list including prior context (last 6 exchanges max)
        from langchain_core.messages import AIMessage
        msgs = []
        for turn in (payload.history or [])[-6:]:
            role = turn.get("role", "")
            content = turn.get("content", "")
            if role == "user":
                msgs.append(HumanMessage(content=content))
            elif role == "assistant":
                msgs.append(AIMessage(content=content))

        # Append current user message
        msgs.append(HumanMessage(content=payload.message))

        graph = get_graph(provider=payload.provider or "groq")
        result = graph.invoke({"messages": msgs})
        reply = result["messages"][-1].content

        return JSONResponse({
            "status": "success",
            "reply": reply,
            "generated_at": datetime.datetime.now().strftime('%Y-%m-%d at %H:%M')
        })

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

