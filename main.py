import argparse
import sys
import os
from dotenv import load_dotenv

load_dotenv()

from tralogger import get_logger
from src.agent.graph_wf import GraphWorkflow
from src.utils.utils_main import save_document
from langchain_core.messages import HumanMessage

logger = get_logger(__name__)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def main():
    parser = argparse.ArgumentParser(description="anywhere.ai - AI Travel Planner & Expense Planner CLI")
    parser.add_argument("--destination", type=str, help="Destination city or country (e.g. 'Paris', 'Goa')")
    parser.add_argument("--days", type=int, default=3, help="Duration of trip in days (default: 3)")
    parser.add_argument("--budget", type=str, help="Total budget or budget tier (e.g. '$1000' or 'budget/luxury')")
    parser.add_argument("--prompt", type=str, help="Custom trip query")
    parser.add_argument("--provider", type=str, default="groq", choices=["groq", "openai"], help="LLM model provider (default: groq)")
    
    args = parser.parse_args()

    if args.prompt:
        user_query = args.prompt
    elif args.destination:
        budget_str = f" with a budget of {args.budget}" if args.budget else ""
        user_query = f"Plan a {args.days}-day trip to {args.destination}{budget_str}. Provide day-by-day itineraries (highlights & hidden gems), recommendations, weather info, and estimated expenses."
    else:
        print("🌍 Welcome to anywhere.ai - AI Travel Planner!")
        dest = input("Enter destination (e.g. Paris, Tokyo, Goa): ").strip()
        if not dest:
            print("No destination provided. Exiting.")
            sys.exit(0)
        days_in = input("Enter duration in days (default 3): ").strip()
        days = int(days_in) if days_in.isdigit() else 3
        user_query = f"Plan a {days}-day trip to {dest}. Provide day-by-day itineraries, recommendations, weather forecast, and estimated expenses."

    print(f"\n🚀 Initializing anywhere.ai Agent using provider: {args.provider}...")
    try:
        agent_wf = GraphWorkflow(model_provider=args.provider)
        graph = agent_wf.build_graph()
        
        print(f"✈️ Processing request: '{user_query}'\n")
        messages = [HumanMessage(content=user_query)]
        result = graph.invoke({"messages": messages})
        
        last_msg = result["messages"][-1].content
        print("\n" + "=" * 50)
        print("🌍 AI TRAVEL PLAN RESULT")
        print("=" * 50 + "\n")
        print(last_msg)
        
        saved_file = save_document(last_msg)
        if saved_file:
            print(f"\n💾 Travel plan saved successfully to: {saved_file}")
            
    except Exception as e:
        print(f"\n❌ Error running Travel Agent: {e}")
        logger.error(f"Error in CLI main: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
