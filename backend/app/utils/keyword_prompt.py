from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableSequence
from config.config import llm

# YouTube 키워드 생성 프롬프트
youtube_keyword_prompt = PromptTemplate(
    input_variables=["health_interests"],
    template="""
    아래 사용자의 건강 정보를 바탕으로 YouTube Shorts 영상을 검색할 수 있는 키워드를 생성하세요.
    생성된 키워드는 단순히 입력된 건강 관심사를 반영하는 것이 아니라, 이를 기반으로 한 창의적이고 응용된 주제여야 합니다.
    예를 들어, \"면역력 강화\"를 입력받았을 때 \"저염식 레시피\"와 같이 관련된 특정 사례나 응용된 접근법을 포함해야 합니다.

    반환 키워드는 다음 조건을 충족해야 합니다:
    - 사용자의 건강 상태와 관심사를 반영한 창의적인 연결
    - 단순 반복을 피하고 관련된 응용 주제를 제시
    - 2~4 단어로 간결하게 작성

    검색 키워드:
    {health_interests}

    반환 형식:
    - 키워드1
    - 키워드2
    - 키워드3
    """
)

# LLMChain 설정
youtube_keyword_chain = youtube_keyword_prompt | llm
