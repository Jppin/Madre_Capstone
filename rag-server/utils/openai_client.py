# utils/openai_client.py

import os
from dotenv import load_dotenv
#from langchain_community.chat_models import ChatOpenAI, ChatAnthropic
from langchain_anthropic import ChatAnthropic

from langchain.schema import HumanMessage

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise RuntimeError("ANTHROPIC_API_KEY가 설정되어 있지 않습니다.")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY가 설정되어 있지 않습니다.")

def generate_mealplan_with_langchain(prompt: str, api_key: str, temperature: float = 0.7) -> str:
    """
    - prompt: LLM에 보낼 텍스트
    - temperature: 샘플링 온도 (기본 0.7)
    """
    # llm = ChatOpenAI(
    #     model_name="gpt-4-0613",
    #     openai_api_key=OPENAI_API_KEY,
    #     temperature=temperature,
    # )
    
    
    llm = ChatAnthropic()

    raw = llm.invoke([HumanMessage(content=prompt)])
    if isinstance(raw, tuple):
        response_obj = raw[0]
    else:
        response_obj = raw
    return response_obj.content
