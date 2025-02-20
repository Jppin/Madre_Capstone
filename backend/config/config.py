import os
from dotenv import load_dotenv
from pymongo import MongoClient



# 환경 변수 로드 (.env 파일이 있다면)
load_dotenv()

# 환경 변수에서 값 가져오기 (없으면 기본값 사용)
openai_api_key = os.getenv("OPENAI_API_KEY", "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")
openai_api_url = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
mongo_uri = os.getenv("MONGO_URI", "mongodb+srv://dding921:1472uiop!!@graduationpj.w6wq3.mongodb.net/?retryWrites=true&w=majority&appName=graduationpj")
db_name = os.getenv("DB_NAME", "test")


# MongoDB 연결
client = MongoClient(mongo_uri)
db = client[db_name]

