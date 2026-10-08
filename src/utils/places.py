"""
Developer: Rohith P GitHub: @rohithp29
Date: 2025-07-13

Wrapper around the Google Places and Tavily Places tools.
"""

# import
import os, requests, sys, json
from dotenv import load_dotenv
sys.path.append("../../")
from tralogger import get_logger
logger = get_logger(__name__)
load_dotenv()

from langchain_tavily import TavilySearch
from langchain_google_community import GooglePlacesTool, GooglePlacesAPIWrapper 

__all__ = [
    "GooglePlaces",
    "TavilyPlaces",
]

class GooglePlaces:
    """
    Google Places wrapper.
    """
    def __init__(self):
        self.places_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not self.places_api_key:
            logger.warning("GOOGLE_MAPS_API_KEY is not set.")
            self.places_tool = None
        else:
            self.places_wrapper = GooglePlacesAPIWrapper(gplaces_api_key=self.places_api_key)
            self.places_tool = GooglePlacesTool(gplaces_wrapper=self.places_wrapper) 
        
    def fetch_places(self, city: str) -> dict:
        if not self.places_tool:
            raise RuntimeError("Google Places API key is not configured.")
        return self.places_tool.run(f"top attractive places in and around {city}")

    def fetch_restaurants(self, city: str) -> dict:
        if not self.places_tool:
            raise RuntimeError("Google Places API key is not configured.")
        return self.places_tool.run(f"what are the top 10 restaurants and eateries in and around {city}?")

    def fetch_activity(self, city: str) -> dict:
        if not self.places_tool:
            raise RuntimeError("Google Places API key is not configured.")
        return self.places_tool.run(f"Activities in and around {city}")

    def fetch_transport(self, city: str) -> dict:
        if not self.places_tool:
            raise RuntimeError("Google Places API key is not configured.")
        return self.places_tool.run(f"What are the different modes of transportations available in {city}")


class TavilyPlaces:
    """
    Tavily Places wrapper.
    """
    def __init__(self):
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")
        if not self.tavily_api_key:
            logger.warning("TAVILY_API_KEY is not set.")
            self.tavily_tool = None
        else:
            self.tavily_tool = TavilySearch(topic="general", include_answer="advanced")

    def fetch_places(self, city: str) -> dict:
        if not self.tavily_tool:
            raise RuntimeError("Tavily API key is not configured.")
        result = self.tavily_tool.invoke({"query": f"top attractive places in and around {city}"})
        if isinstance(result, dict) and result.get("answer"):
            return result["answer"]
        return result

    def fetch_restaurants(self, city: str) -> dict:
        if not self.tavily_tool:
            raise RuntimeError("Tavily API key is not configured.")
        result = self.tavily_tool.invoke({"query": f"what are the top 10 restaurants and eateries in and around {city}."})
        if isinstance(result, dict) and result.get("answer"):
            return result["answer"]
        return result

    def fetch_activity(self, city: str) -> dict:
        if not self.tavily_tool:
            raise RuntimeError("Tavily API key is not configured.")
        result = self.tavily_tool.invoke({"query": f"activities in and around {city}"})
        if isinstance(result, dict) and result.get("answer"):
            return result["answer"]
        return result

    def fetch_transport(self, city: str) -> dict:
        if not self.tavily_tool:
            raise RuntimeError("Tavily API key is not configured.")
        result = self.tavily_tool.invoke({"query": f"What are the different modes of transportations available in {city}"})
        if isinstance(result, dict) and result.get("answer"):
            return result["answer"]
        return result


# # testing
# google_places = GooglePlaces()
# tavily_places = TavilyPlaces()
# print(google_places.fetch_places("New York"))
# print(tavily_places.fetch_places("New York"))
# print(google_places.fetch_restaurants("New York"))
# print(tavily_places.fetch_restaurants("New York"))
# print(google_places.fetch_activity("New York"))
# print(tavily_places.fetch_activity("New York"))
# print(google_places.fetch_transport("New York"))
# print(tavily_places.fetch_transport("New York"))