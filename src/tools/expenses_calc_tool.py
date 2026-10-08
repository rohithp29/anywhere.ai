"""
Developer: Rohith P GitHub: @rohithp29
Date: 2025-07-14

ExpensesCalcTool is a tool that provides expenses calculation for a given city/place.
"""

# imports
import os, sys
sys.path.append("../../")
from tralogger import get_logger
logger = get_logger(__name__)
from src.utils.utils_main import MathUtils
from langchain.tools import tool
from typing import List, Union

from dotenv import load_dotenv
load_dotenv()

from langchain.tools import tool

__all__ = [
    "ExpensesCalcTool",
]

class ExpensesCalcTool:
    """
    ExpensesCalcTool is a tool that provides expenses calculation for a given city/place.
    """
    logger.info("ExpensesCalcTool initialized")
    def __init__(self):
        self.expenser = MathUtils()
        self.expenser_tool_list = self._setup_tools()

    def _setup_tools(self) -> List[tool]:
        """
        --- Initializes the expenses calculation tools ---

        Initializes the expenses calculation tools.
        
        Returns
        -------
            List[tool]
                The expenses calculation tools.
        """
        @tool
        def calculate_total_hotel_expenses(price_per_night: Union[str, float], number_of_nights: float) -> float:
            """
            Calculate the total hotel expenses for a given price per night and number of nights.
            
            Parameters
            ----------
                price_per_night : Union[str, float]
                    The price per night.
                number_of_nights : float
                    The number of nights.
            
            Returns
            -------
                float
                    The total hotel expenses.
            """
            # return self.expenser.multiply(eval(price_per_night), number_of_nights)
            total_hotel_expense = self.expenser.multiply(float(price_per_night), number_of_nights)
            logger.info(f"Calculating total hotel expenses for {price_per_night} per night for {number_of_nights} nights: {total_hotel_expense}")
            return total_hotel_expense

        @tool
        def calculate_total_expense(*cost: float) -> float:
            """
            Calculate the total expense for a given list of costs.
            
            Parameters
            ----------
                *cost : float
                    The costs.
            
            Returns
            -------
                float
                    The total expense.
            """
            logger.info(f"Calculating total expense for {cost}: {self.expenser.total(*cost)}")
            return self.expenser.total(*cost)

        @tool
        def calculate_budget_per_day(total_budget: float, num_days: int) -> float:
            """
            Calculate the budget per day for a given total budget and number of days.
            
            Parameters
            ----------
                total_budget : float
                    The total budget.
                num_days : int
                    The number of days.
            
            Returns
            -------
                float
                    The budget per day.
            """
            logger.info(f"Calculating budget per day for {total_budget} over {num_days} days: {self.expenser.budget_per_day(total_budget, num_days)}")
            return self.expenser.budget_per_day(total_budget, num_days)

        return [calculate_total_hotel_expenses, calculate_total_expense, calculate_budget_per_day]