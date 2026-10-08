"""
Developer: Rohith P GitHub: @rohithp29
Date: 2025-07-13

Wrapper around the simple math operators.
"""

# imports
import os, sys
from dotenv import load_dotenv
load_dotenv()
sys.path.append("../../")
from tralogger import get_logger
logger = get_logger(__name__)

from langchain.tools import tool
# from langchain_community.alpha_vantage import AlphaVantageAIWrapper

@tool
def multiply(a: float, b: float) -> float:
    """
    Multiplies two numbers.

    Example
    -------
        >>> from utils import simple_math_operators
        >>> simple_math_operators.multiply(2, 3)
        6

    Returns
    -------
        float: The product of the two numbers
    """
    logger.info(f"Multiplying {a} and {b}")
    return a * b


@tool
def add(a: float, b: float) -> float:
    """
    Adds two numbers.

    Example
    -------
        >>> from utils import simple_math_operators
        >>> simple_math_operators.add(2, 3)
        5

    Returns
    -------
        float: The sum of the two numbers
    """
    logger.info(f"Adding {a} and {b}")
    return a + b