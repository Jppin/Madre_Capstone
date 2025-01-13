from utils.supplement_prompt import warning_chain, recommendation_chain
import json
import re
from langchain.schema import AIMessage

# LLM 응답을 JSON으로 파싱
def parse_json_response(response, step_name=""):
    try:
        if isinstance(response, AIMessage):
            content = response.content
        else:
            content = response

        content = re.sub(r"```json\s*|\s*```", "", content.strip())
        return json.loads(content)
    
    except (json.JSONDecodeError, TypeError) as e:
        return []

# 부작용 경고와 맞춤형 섭취 가이드 생성
def generate_supplement_guide(user_info: dict, context: list):
    
    docs_content = "\n\n".join(doc.page_content for doc in context)

    warning_result = warning_chain.invoke({
        "current_medications": ", ".join(user_info.get("current_medications", [])),
        "past_history": ", ".join(user_info.get("past_history", [])),
        "context": docs_content
    })

    recommendation_result = recommendation_chain.invoke({
        "name": user_info["name"],
        "age": user_info["age"],
        "gender": user_info["gender"],
        "health_interests": ", ".join(user_info.get("health_interests", [])),
        "context": docs_content
    })

    # 파싱
    recommendations = parse_json_response(recommendation_result, "recommendations")

    warnings = warning_result.content if isinstance(warning_result, AIMessage) else warning_result

    return {
        "warnings": warnings,
        "recommendations": recommendations
    }
