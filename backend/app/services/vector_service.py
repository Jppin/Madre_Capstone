from config.config import db, embeddings
from langchain_mongodb import MongoDBAtlasVectorSearch

def init_vector_store(collection_name: str, index_name: str, score_fn: str = "cosine"):
    collection = db[collection_name]
    vector_store = MongoDBAtlasVectorSearch(
        embedding=embeddings,
        collection=collection,
        index_name=index_name,
        relevance_score_fn=score_fn
    )
    return vector_store
