from utils.supplement_prompt import warning_chain, recommendation_chain
import json
import re
from langchain.schema import AIMessage

def parse_json_response(response, step_name=""):
    """LLM 응답을 JSON으로 파싱합니다."""
    try:
        if isinstance(response, AIMessage):
            content = response.content
        else:
            content = response

        # 불필요한 ```json과 ``` 제거
        content = re.sub(r"```json\s*|\s*```", "", content.strip())
        return json.loads(content)  # JSON 형식으로 파싱
    
    except (json.JSONDecodeError, TypeError) as e:
        return []  # 파싱 실패 시 빈 리스트 반환

def generate_supplement_guide(user_info: dict, context: list):
    """
    사용자 정보와 검색된 컨텍스트를 바탕으로 부작용 경고와 맞춤형 섭취 가이드를 생성합니다.
    """
    # Context 결합
    docs_content = "\n\n".join(doc.page_content for doc in context)

    # 부작용 경고 생성
    warning_result = warning_chain.invoke({
        "current_medications": ", ".join(user_info.get("current_medications", [])),
        "past_history": ", ".join(user_info.get("past_history", [])),
        "context": docs_content
    })

    # 맞춤형 섭취 가이드 생성
    recommendation_result = recommendation_chain.invoke({
        "name": user_info["name"],
        "age": user_info["age"],
        "gender": user_info["gender"],
        "health_interests": ", ".join(user_info.get("health_interests", [])),
        "context": docs_content
    })

    # JSON 응답 파싱
    recommendations = parse_json_response(recommendation_result, "recommendations")

    # Warning 출력 확인
    warnings = warning_result.content if isinstance(warning_result, AIMessage) else warning_result

    # 최종 결과 반환
    return {
        "warnings": warnings,
        "recommendations": recommendations
    }
