import os
from dotenv import load_dotenv
from langchain_openai import OpenAI
from langsmith import Client

# .env 파일 로드
load_dotenv()

class LangChainService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.langsmith_api_key = os.getenv("LANGSMITH_API_KEY")
        self.llm = OpenAI(api_key=self.api_key, temperature=0.7)
        self.langsmith_client = Client(api_key=self.langsmith_api_key)

    def generate_response(self, prompt: str) -> str:
        return self.llm.invoke(prompt)
