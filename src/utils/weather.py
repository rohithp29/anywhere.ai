"""
Developer: Rohith P GitHub: @rohithp29
Date: 2025-07-13

Wrapper around the OpenWeatherMap API.

Example
-------
    >>> from weather import WeatherForecast
    >>> wf = WeatherForecast()
    >>> print(wf.current("New York"))

Environment
-----------
* ``OPENWEATHER_API_KEY`` – your API key (required)

If you prefer not to set the env var, you can pass the key explicitly:
    ``wf = WeatherForecast(api_key="…")``
"""

# imports
import os, requests, sys
from dotenv import load_dotenv
sys.path.append("../../")
from tralogger import get_logger
logger = get_logger(__name__)
load_dotenv()

__all__ = [
    "WeatherForecast",
]


class WeatherForcast:
    """
    This class is a wrapper around the OpenWeatherMap API, which fetches the current weather and forecast for a given city/place.
    """
    def __init__(self):
        """
        Initialize the WeatherForcast object.
        """
        logger.info("WeatherForcast initialized")
        self.base_url = "http://api.openweathermap.org/data/2.5"
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        if not self.api_key:
            logger.warning("OPENWEATHER_API_KEY is not set in environment.")

    def get_weather(self, city: str):
        """
        Fetch the current weather for a given city/place.
        """
        if not self.api_key:
            logger.warning("No OPENWEATHER_API_KEY provided.")
            return dict()
        try:
            url = f"{self.base_url}/weather"
            params = {"q": city, "appid": self.api_key, "units": "metric"}
            response = requests.get(url, params=params)
            logger.info(f"Weather for {city}: {response.json()}")
            return response.json() if response.status_code == 200 else dict()
        except Exception as e:
            logger.error(f"Error fetching weather: {e}")
            return dict()
        finally:
            logger.info("WeatherForcast.get_weather() finished")
            
    def forecast(self, city: str):
        """
        Fetch the forecast for a given city/place.
        """
        if not self.api_key:
            logger.warning("No OPENWEATHER_API_KEY provided.")
            return dict()
        try:
            url = f"{self.base_url}/forecast"
            params = {"q": city, "appid": self.api_key, "cnt": 10, "units": "metric"}
            response = requests.get(url, params=params)
            logger.info(f"Forecast for {city}: {response.json()}")
            return response.json() if response.status_code == 200 else dict()
        except Exception as e:
            logger.error(f"Error fetching forecast: {e}")
            return dict()
        finally:
            logger.info("WeatherForcast.forecast() finished")


# # testing
# weather = WeatherForcast()
# print(weather.get_weather("New York"))
# print(weather.forecast("New York"))