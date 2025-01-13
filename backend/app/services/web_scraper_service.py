from langchain_community.document_loaders import RecursiveUrlLoader
from utils.bs4_extractor import bs4_extractor

def load_documents(url: str, base_url: str, link_regex: str, max_depth: int = 1):
    loader = RecursiveUrlLoader(
        url,
        max_depth=max_depth,
        extractor=bs4_extractor,
        timeout=10,
        prevent_outside=True,
        base_url=base_url,
        link_regex=link_regex
    )
    return loader.load()
