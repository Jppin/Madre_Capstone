from services.vector_service import init_vector_store

# 벡터 스토어 초기화
vector_store = init_vector_store(collection_name="Supplement_Info", index_name="vector_index")

def retrieve(question: str):
    """
    question을 기반으로 벡터 유사도 검색을 수행합니다.
    """
    retrieved_docs = vector_store.similarity_search(question)
    return {"context": retrieved_docs}
