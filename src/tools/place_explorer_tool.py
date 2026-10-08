"""
Developer: Rohith P GitHub: @rohithp29
Date: 2025-07-14

PlaceExplorerTool is a tool that provides place exploration for a given city/place based on attractions, restaurants, activities, etc.
"""

# imports
from dotenv import load_dotenv
load_dotenv()
import os, sys
sys.path.append("../../")
from tralogger import get_logger
logger = get_logger(__name__)
from typing import List

from langchain.tools import tool
from src.utils.places import GooglePlaces, TavilyPlaces

__all__ = [
    "PlaceExplorerTool",
]

class PlaceExplorerTool:
    """
    PlaceExplorerTool is a tool that provides place exploration for a given city/place based on attractions, restaurants, activities, etc.
    """
    logger.info("PlaceExplorerTool initialized")
    def __init__(self):
        """
        --- Initializes the PlaceExplorerTool ---

         - Initializes the GooglePlaces and TavilyPlaces objects.
         - Initializes the place search tool list.
        """
        self.google_search_places = GooglePlaces()
        self.tavily_search_places = TavilyPlaces()
        self.place_search_tool_list = self._setup_tools()
        
    def _setup_tools(self) -> List[tool]:
        """
        --- Initializes the place search tools ---

        Initializes the place search tools.

        Returns
        -------
            List[tool]
                The place search tools.
        """
        @tool
        def fetch_attractions(city: str) -> dict:
            """
            Fetches the top attractive places in and around the given city.
            city : str
                The city to fetch the top attractive places for.

            Returns
            -------
                dict
                    The top attractive places in and around the given city.
            """
            try:
                attractions = self.google_search_places.fetch_places(city)
                if attractions:
                    logger.info(f"Google search attractions for {city}: {attractions}")
                    return f"Following are the attractions of {city} based on Google search: {attractions}"
            except Exception as e1:
                try:
                    attractions = self.tavily_search_places.fetch_places(city)
                    if attractions:
                        logger.info(f"Tavily search attractions for {city}: {attractions}")
                        return f"Following are the attractions of {city} based on Tavily search: {attractions}"
                except Exception as e2:
                    logger.warning(f"No search API keys configured or search failed: {e2}")
                    return f"Search tools not available. Please generate popular attractions for {city} using your internal AI knowledge."
            finally:
                logger.info("PlaceExplorerTool.fetch_attractions() finished")

        @tool
        def search_restaurants(city: str) -> dict:
            """
            Fetches the top 10 restaurants and eateries in and around the given city.
            city : str
                The city to fetch the top 10 restaurants and eateries for.

            Returns
            -------
                dict
                    The top 10 restaurants and eateries in and around the given city.
            """
            try:
                restaurants = self.google_search_places.fetch_restaurants(city)
                if restaurants:
                    logger.info(f"Google search restaurants for {city}: {restaurants}")
                    return f"Following are the restaurants of {city} based on Google search: {restaurants}"
            except Exception as e1:
                try:
                    restaurants = self.tavily_search_places.fetch_restaurants(city)
                    if restaurants:
                        logger.info(f"Tavily search restaurants for {city}: {restaurants}")
                        return f"Following are the restaurants of {city} based on Tavily search: {restaurants}"
                except Exception as e2:
                    logger.warning(f"No search API keys configured or search failed: {e2}")
                    return f"Search tools not available. Please generate top recommended restaurants for {city} using your internal AI knowledge."
            finally:
                logger.info("PlaceExplorerTool.search_restaurants() finished")

        @tool
        def search_activities(city: str) -> dict:
            """
            Fetches the activities in and around the given city.
            city : str
                The city to fetch the activities for.

            Returns
            -------
                dict
                    The activities in and around the given city.
            """
            try:
                activities = self.google_search_places.fetch_activity(city)
                if activities:
                    logger.info(f"Google search activities for {city}: {activities}")
                    return f"Following are the activities of {city} based on Google search: {activities}"
            except Exception as e1:
                try:
                    activities = self.tavily_search_places.fetch_activity(city)
                    if activities:
                        logger.info(f"Tavily search activities for {city}: {activities}")
                        return f"Following are the activities of {city} based on Tavily search: {activities}"
                except Exception as e2:
                    logger.warning(f"No search API keys configured or search failed: {e2}")
                    return f"Search tools not available. Please generate activities for {city} using your internal AI knowledge."
            finally:
                logger.info("PlaceExplorerTool.search_activities() finished")
                
        @tool
        def search_transport(city: str) -> dict:
            """
            Fetches the different modes of transportations available in the given city.
            city : str
                The city to fetch the different modes of transportations for.

            Returns
            -------
                dict
                    The different modes of transportations available in the given city.
            """
            try:
                transport = self.google_search_places.fetch_transport(city)
                if transport:
                    logger.info(f"Google search transport for {city}: {transport}")
                    return f"Following are the transport options of {city} based on Google search: {transport}"
            except Exception as e1:
                try:
                    transport = self.tavily_search_places.fetch_transport(city)
                    if transport:
                        logger.info(f"Tavily search transport for {city}: {transport}")
                        return f"Following are the transport options of {city} based on Tavily search: {transport}"
                except Exception as e2:
                    logger.warning(f"No search API keys configured or search failed: {e2}")
                    return f"Search tools not available. Please generate transport info for {city} using your internal AI knowledge."
            finally:
                logger.info("PlaceExplorerTool.search_transport() finished")
                
        logger.info("PlaceExplorerTool._setup_tools() finished")
        return [fetch_attractions, search_restaurants, search_activities, search_transport]