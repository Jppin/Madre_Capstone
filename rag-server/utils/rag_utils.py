# utils/rag_utils.py

import os
from dotenv import load_dotenv

# — Document Loader
# langchain-community 에서 제공하는 document loader들은 유지해도 되지만,
# 만약 여기서도 deprecation 경고를 피하고 싶으면 langchain-openai 버전으로 확인해 보세요. 
from langchain_community.document_loaders import (
    PDFMinerLoader, 
    TextLoader, 
    DirectoryLoader, 
    JSONLoader
)

# — Text Splitter (아직 langchain.text_splitter 에 남아 있습니다)
from langchain.text_splitter import RecursiveCharacterTextSplitter

# — Embeddings & ChatModel: langchain-openai 패키지에서 가져오기 
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

from langchain_anthropic import ChatAnthropic

# 변경 후
from langchain_chroma import Chroma

# — RetrievalQA 자체는 langchain 쪽에서 가져와도 무방합니다.
from langchain.chains import RetrievalQA


load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("RAG_UTILS: OPENAI_API_KEY가 설정되어 있지 않습니다.")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise RuntimeError("RAG_UTILS: ANTHROPIC_API_KEY가 설정되어 있지 않습니다.")


def initialize_vectorstore(
    persist_directory: str = "chroma_db",
    collection_name: str = "nutrition_guidelines",
    embedding_model_name: str = "text-embedding-3-small",
    chunk_size: int = 1000,
    chunk_overlap: int = 200
):
    from langchain_community.document_loaders import (
        PDFMinerLoader, TextLoader, DirectoryLoader, JSONLoader
    )
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_openai import OpenAIEmbeddings
    from langchain_chroma import Chroma

    # 1) 문서 로드
    loader = DirectoryLoader(
        "data",
        glob="**/*.*",
        loader_cls_mapping={
            ".txt": TextLoader,
            ".pdf": PDFMinerLoader,
            ".json": JSONLoader
        }
    )
    documents = loader.load()

    print(f"[📄] 문서 {len(documents)}개 로드됨")

    # 2) 텍스트 분할
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len
    )
    docs = text_splitter.split_documents(documents)

    print(f"[✂️] 총 {len(docs)}개의 chunk 생성됨")
    print("[🔍] 첫 chunk 미리보기:\n", docs[0].page_content[:300])

    # 3) 임베딩 및 인덱싱
    embeddings = OpenAIEmbeddings(
        openai_api_key=OPENAI_API_KEY,
        model=embedding_model_name
    )

    vectordb = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=persist_directory,
        collection_name=collection_name
    )
    vectordb.persist()
    return vectordb



def load_vectorstore(
    persist_directory: str = "chroma_db",
    collection_name: str = "nutrition_guidelines",
    embedding_model_name: str = "text-embedding-3-small"
):
    """
    이미 인덱싱 완료된 Chroma 벡터스토어를 로드해서 반환
    """
    embeddings = OpenAIEmbeddings(
        openai_api_key=OPENAI_API_KEY,
        model=embedding_model_name
    )
    vectordb = Chroma(
        embedding_function=embeddings,
        persist_directory=persist_directory,
        collection_name=collection_name
    )
    return vectordb


def build_retrieval_qa_chain(
    vectorstore: Chroma,
    llm_model_name: str = "claude-3-5-sonnet-20241022",
    llm_temperature: float = 0.7,
    MAX_TOKENS: int = 2048
):
    """
    (1) vectorstore.as_retriever() -> retriever 생성
    (2) ChatOpenAI(llm_model_name, api_key, temperature) -> LLM 객체 생성
    (3) RetrievalQA.from_chain_type(llm, retriever) -> QA 체인 생성 후 반환
    """
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5, "lambda_mult": 0.8}
    )

    # llm = ChatOpenAI(
    #     model_name=llm_model_name,
    #     openai_api_key=OPENAI_API_KEY,
    #     temperature=llm_temperature
    # )
    llm = ChatAnthropic(
        model_name=llm_model_name,
        anthropic_api_key=ANTHROPIC_API_KEY,
        temperature=llm_temperature,
        max_tokens=MAX_TOKENS
    )

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True
    )
    return qa_chain
