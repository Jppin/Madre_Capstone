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

# Retrieve 단계
def retrieve_step(state: State):
    retrieved_data = retrieve(state["question"])  # {"context": [Document(...), Document(...)]}
    context = retrieved_data.get("context", [])  # 리스트 형태의 Document 객체들
    return {"context": context}

# Generate 단계
def generate_step(state: State):
    result = generate_supplement_guide(state["user_info"], state["context"])
    return {"warnings": result.get("warnings", ""), "recommendations": result.get("recommendations", [])}

# LangGraph 설정
graph_builder = StateGraph(State)

# Retrieve 단계 추가
graph_builder.add_node("retrieve_step", retrieve_step)
graph_builder.add_edge(START, "retrieve_step")  # 시작 -> retrieve_step

# Generate 단계 추가
graph_builder.add_node("generate_step", generate_step)
graph_builder.add_edge("retrieve_step", "generate_step")  # retrieve_step -> generate_step

# 그래프 컴파일
graph = graph_builder.compile()