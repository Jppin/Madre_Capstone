from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableSequence
from config.config import llm

# YouTube 키워드 생성 프롬프트
youtube_keyword_prompt = PromptTemplate(
    input_variables=["health_interests"],
    template="""
    아래 긴 검색 키워드를 2~3 단어의 핵심 키워드로 간략화하세요.
    사용자는 YouTube Shorts 영상을 검색하려고 하며, 핵심 키워드는 짧고 명확해야 합니다.
    불필요한 단어나 장황한 표현을 제거하고 핵심 주제만 남기세요.

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
