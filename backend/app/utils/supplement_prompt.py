from langchain.prompts import PromptTemplate
from config.config import llm

warning_prompt = PromptTemplate(
    input_variables=["current_medications", "past_history", "context"],
    template="""
### 사용자 정보:
- 복용 중인 약물: {current_medications}
- 과거 질환: {past_history}

---

### 조건:
1. **복용 중인 약물이 없거나 비어 있는 경우**: 'None', '없음', 비어 있는 문자열처럼 인식하세요.
2. **과거 질환이 없거나 비어 있는 경우**: 'None', '없음', 비어 있는 문자열처럼 인식하세요.

---

### 출력 규칙:
- 복용 중인 약물과 과거 질환이 **모두 비어 있는 경우**:
  "현재 복용 중인 약물이나 질환 정보가 없어 주의사항이 제공되지 않습니다. 더 정확한 추천을 위해 추가 정보를 입력해 주세요."

- 복용 중인 약물이나 과거 질환이 **하나라도 있는 경우**:
  검색된 영양제 정보에서 **부정적 상호작용이 예상되는 성분**을 명확히 식별하세요.  
  동일한 이유를 가진 성분은 이유를 한 번만 설명하고 성분 리스트를 함께 출력하세요.  
  각 이유에 대해 명확하고 간결한 설명을 제공하세요.

---

### 검색된 컨텍스트:
{context}

---

### **부작용 경고 리스트**  
1. **[성분 이름1], [성분 이름2]**: [공통된 경고 이유]  
2. **[다른 성분 이름]**: [경고 이유].

---

주의가 필요한 성분은 반드시 사용자가 담당 의사와 상의하도록 안내하세요.
"""
)


recommendation_prompt = PromptTemplate(
    input_variables=["name", "age", "gender", "health_interests", "context"],
    template="""
당신은 사용자의 건강 정보와 제공된 컨텍스트를 기반으로 **JSON 형식**의 영양제 추천 리스트를 작성합니다.

**요구사항**:
1. 사용자의 건강 상태에 따라 가장 **필요한 영양제 순서대로 우선순위**를 매기세요.
2. 각 영양제에 대해 섭취해야 하는 **구체적인 시간대와 이유**를 작성하세요.  
   - 예: "아침 식사 후": 흡수율이 높고 위장 부담이 적기 때문입니다.
3. 각 영양제의 **복용량**과 **추천 이유**를 명확히 설명하세요.
4. 사용자가 선택할 수 있도록 **대체 옵션**이 있다면 함께 제공하세요.

**반드시 올바른 JSON 형식으로만 응답**하세요.  
만약 추천할 영양제가 없다면 빈 배열 `[]`을 반환하세요.

---

### **포맷 예시**  
[  
    {{
        "name": "영양제 이름",
        "priority": "1",  
        "time": "아침 식사 후",  
        "amount": "복용량",  
        "reason": "추천 이유",  
        "alternative": "대체 옵션 (있다면 작성)"
    }},  
    {{
        "name": "다른 영양제 이름",
        "priority": "2",  
        "time": "점심 식사 후",  
        "amount": "복용량",  
        "reason": "추천 이유",  
        "alternative": "대체 옵션 (있다면 작성)"
    }}  
]

---

### 사용자 정보
- 이름: {name}
- 나이: {age}
- 성별: {gender}
- 건강 관심사: {health_interests}

### 검색된 컨텍스트  
{context}

반드시 올바른 JSON 형식만 반환하세요.
"""
)

# LLMChain 설정
warning_chain = warning_prompt | llm
recommendation_chain = recommendation_prompt | llm
