#config.py

import os
from dotenv import load_dotenv
from pymongo import MongoClient

# 현재 파일(config.py)이 위치한 폴더 기준으로 .env의 상대경로 설정
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")



# 환경 변수 로드 (.env 파일이 있다면)
load_dotenv()

# 환경 변수에서 값 가져오기 (없으면 기본값 사용)
openai_api_key = os.getenv("OPENAI_API_KEY")
openai_api_url = os.getenv("OPENAI_API_URL")
mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")


# MongoDB 연결
client = MongoClient(mongo_uri)
db = client[db_name]
