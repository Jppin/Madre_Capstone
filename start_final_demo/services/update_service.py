from services.web_scraper_service import load_documents
from services.text_splitter_service import split_documents
from services.vector_service import init_vector_store

def run_update_process():
    print("Starting update process: Crawling and vector embedding...")

    # Step 1: 웹 데이터 크롤링
    docs = load_documents(
        url="https://ods.od.nih.gov/factsheets/list-VitaminsMinerals/",
        base_url="https://ods.od.nih.gov/factsheets",
        link_regex=r'<a\s+(?:[^>]*?\s+)?href="([^"]*(?=HealthProfessional)[^"]*)"'
    )
    print(f"Loaded {len(docs)} documents.")

    # Step 2: 텍스트 분할
    all_splits = split_documents(docs)
    print(f"Split into {len(all_splits)} sub-documents.")

    # Step 3: 벡터 저장소 초기화 및 MongoDB 저장
    vector_store = init_vector_store(collection_name="Supplement_Info", index_name="vector_index")
    document_ids = vector_store.add_documents(documents=all_splits)
    print(f"Added {len(document_ids)} documents to the vector store.")
    print("Update process completed successfully.")
