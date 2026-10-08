# imports
import os, sys
sys.path.append("../../")

from tralogger import get_logger
logger = get_logger(__name__)
from dotenv import load_dotenv
load_dotenv()
sys.path.append("../")
from src.utils.utils_main import ModelLoader
from langgraph.graph import StateGraph, MessagesState, START, END
from constants import SYSTEM_PROMPT
from langgraph.prebuilt import ToolNode, tools_condition
from src.tools.weather_tool import WeatherTool
from src.tools.place_explorer_tool import PlaceExplorerTool
from src.tools.expenses_calc_tool import ExpensesCalcTool

from graphviz import Digraph


class GraphWorkflow:

    def __init__(self, model_provider: str = "groq"):
        self.model_provider = model_provider
        self.model_loader = ModelLoader(model_provider=model_provider)
        self.tools = list()

        self.weather_tool = WeatherTool()
        self.place_explorer_tool = PlaceExplorerTool()
        self.expenses_calc_tool = ExpensesCalcTool()
        self.tools.extend([
            * self.weather_tool.weather_tool_list, 
            * self.place_explorer_tool.place_search_tool_list, 
            * self.expenses_calc_tool.expenser_tool_list])

        self.llm = self.model_loader.load_llm()
        self.llm_with_tools = self.llm.bind_tools(tools=self.tools)
        self.system_prompt = SYSTEM_PROMPT

    def agent_workflow(self, state: MessagesState):
        user_message = state["messages"]
        input = [self.system_prompt] + user_message
        response = self.llm_with_tools.invoke(input)
        return {"messages": [response]}

    def build_graph(self):
        graph = StateGraph(MessagesState)
        graph.add_node("agent", self.agent_workflow)
        graph.add_node("tools", ToolNode(tools=self.tools))
        graph.add_edge(START, "agent")
        graph.add_conditional_edges("agent", tools_condition)
        graph.add_edge("tools", "agent")
        graph.add_edge("agent", END)
        self.graph = graph.compile()
        return self.graph

    def save_graph(self):
        print(os.getcwd())
        gv: Digraph = self.build_graph()
        gv.render("travel_agent_state_graph", format="png", cleanup=True)
        logger.info("Graph saved successfully to ./travel_agent_state_graph.png")
        

    def __call__(self):
        self.save_graph()
        return self.build_graph()