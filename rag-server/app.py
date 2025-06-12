# app.py

import os
from dotenv import load_dotenv
from flask import Flask

# RAG 유틸 함수 import
from utils.rag_utils import initialize_vectorstore, load_vectorstore, build_retrieval_qa_chain

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise RuntimeError("APP: ANTHROPIC_API_KEY가 설정되어 있지 않습니다.")
if not OPENAI_API_KEY:
    raise RuntimeError("APP: OPENAI_API_KEY가 설정되어 있지 않습니다.")

app = Flask(__name__)

# 1) 벡터스토어 저장 경로 및 컬렉션 이름
PERSIST_DIR = "./chroma_db"
COLLECTION_NAME = "nutrition_guidelines"

# 2) 기존 인덱스가 있으면 load, 없으면 initialize
if os.path.isdir(PERSIST_DIR) and os.listdir(PERSIST_DIR):
    vectordb = load_vectorstore(
        persist_directory=PERSIST_DIR,
        collection_name=COLLECTION_NAME
    )
else:
    vectordb = initialize_vectorstore(
        persist_directory=PERSIST_DIR,
        collection_name=COLLECTION_NAME
    )

# 3) QA 체인 생성 및 app.config에 저장
qa_chain = build_retrieval_qa_chain(vectordb)
app.config["QA_CHAIN"] = qa_chain

# 4) controller 모듈을 import하되, mealplan_controller.py는
#     current_app.config["QA_CHAIN"]로 qa_chain을 가져가게 수정되어 있어야 함
from controllers.mealplan_controller import bp as mealplan_bp

app.register_blueprint(mealplan_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
