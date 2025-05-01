from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RecommendRequest(BaseModel):
    userId: str = None
    age: int = None
    pregnancyWeek: int
    concerns: list
    medications: list

@app.post("/rag/recommend")
async def recommend_rag(data: RecommendRequest):
    # 임시 데이터, LangChain 붙일 부분!
    recommendations = [
        {
            "supplement": "오메가3",
            "reason": "태아 두뇌 발달에 도움.",
            "caution": "혈액 응고에 영향 줄 수 있음."
        }
    ]

    source_documents = [
        {
            "title": "임산부 영양 가이드라인",
            "url": "https://example.com/docs/pregnancy-nutrition"
        }
    ]

    return {
        "recommendations": recommendations,
        "sourceDocuments": source_documents
    }
