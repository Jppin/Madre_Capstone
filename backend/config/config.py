#config.py

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

openai_api_key = os.getenv("OPENAI_API_KEY")
openai_api_url = os.getenv("OPENAI_API_URL")
mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

try:
    client = MongoClient(mongo_uri)
    db = client[db_name]
    # 표준 출력이 아닌 표준 오류로 로깅하거나 제거
    sys.stderr.write(f"✅ Connected to MongoDB database: {db_name}\n")
except Exception as e:
    sys.stderr.write(f"❌ MongoDB 연결 실패: {e}\n")
    db = None
