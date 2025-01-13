import os
from dotenv import load_dotenv

load_dotenv()

langchain_tracing_v2 = os.getenv("LANGCHAIN_TRACING_V2")
langchain_api_key = os.getenv("LANGCHAIN_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")
openai_api_url = os.getenv("OPENAI_API_URL")
mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")
youtube_api_key = os.getenv("YOUTUBE_API_KEY")


# mongoDB와 연결
from pymongo import MongoClient
client = MongoClient(mongo_uri)
db = client[db_name]


# openAI와 llm 연결
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(model="gpt-4o-mini")


# openAi와 embedding 연결
from langchain_openai import OpenAIEmbeddings
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")