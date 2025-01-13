from langgraph.graph import START, StateGraph
from typing_extensions import TypedDict, List
from services.retrieve_service import retrieve
from services.generate_service import generate_supplement_guide
from langchain_core.documents import Document

# State 정의
class State(TypedDict):
    question: str
    user_info: dict
    context: List[Document]
    warnings: str
    recommendations: list

def retrieve_step(state: State):
    retrieved_data = retrieve(state["question"])
    context = retrieved_data.get("context", [])
    return {"context": context}

def generate_step(state: State):
    result = generate_supplement_guide(state["user_info"], state["context"])
    return {"warnings": result.get("warnings", ""), "recommendations": result.get("recommendations", [])}

graph_builder = StateGraph(State)

graph_builder.add_node("retrieve_step", retrieve_step)
graph_builder.add_edge(START, "retrieve_step")  # 시작 -> retrieve_step

graph_builder.add_node("generate_step", generate_step)
graph_builder.add_edge("retrieve_step", "generate_step")  # retrieve_step -> generate_step

graph = graph_builder.compile()