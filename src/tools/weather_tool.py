"""
Developer: Rohith P GitHub: @rohithp29
Date: 2025-07-14
WeatherTool is a tool that provides weather information for a given city/place.
"""

# imports
import os, requests, sys
from dotenv import load_dotenv
sys.path.append("../../")
from tralogger import get_logger
logger = get_logger(__name__)
load_dotenv()

from src.utils.weather import WeatherForcast
from langchain.tools import tool
from typing import List

__all__ = [
    "WeatherTool",
]


class WeatherTool:
    """
    WeatherTool is a tool that provides weather information for a given city/place.
    """
    logger.info("WeatherTool initialized")
    def __init__(self):
        self.weather = WeatherForcast()
        self.weather_tool_list = self._setup_tools()
    
    def _setup_tools(self) -> List[tool]:
        """
        --- Initializes the weather tools ---

        Initializes the weather tools.
        
        Returns
        -------
            List[tool]
                The weather tools.
        """
        @tool
        def fetch_weather(city: str) -> dict:
            """
            Fetch the current weather for a given city/place.
            city : str
                The city to fetch the weather for.

            Returns
            -------
                dict
                    The current weather for the given city/place.
            """
            weather_data = self.weather.get_weather(city)
            if weather_data:
                temp, desc = weather_data.get('main', {}).get('temp', 'N/A'), weather_data.get('weather', [{}])[0].get('description', 'N/A')
                logger.info(f"Weather for {city}: {weather_data}")
                return {"temperature": temp, "description": desc}
            logger.info(f"Weather data not found for {city}")
            return {"error": "Weather data not found"}

        @tool
        def fetch_forecast(city: str) -> dict:
            """
            Fetch the forecast for a given city/place.
            city : str
                The city to fetch the forecast for.

            Returns
            -------
                dict
                    The forecast for the given city/place.
            """
            forecast_data = self.weather.forecast(city)
            if forecast_data and 'list' in forecast_data:
                forecast_summary = list()
                for ind in range(len(forecast_data['list'])):
                    item = forecast_data['list'][ind]
                    date = item['dt_txt'].split(' ')[0]
                    temp = item['main']['temp']
                    desc = item['weather'][0]['description']
                    forecast_summary.append(f"{date}: {temp}°C, {desc}")
                logger.info(f"Forecast for {city}: {forecast_summary}")
                return forecast_summary
            logger.info(f"Forecast data not found for {city}")
            return f"Forecast data not found for {city}"
        
        logger.info("WeatherTool._setup_tools() finished")
        return [fetch_weather, fetch_forecast]