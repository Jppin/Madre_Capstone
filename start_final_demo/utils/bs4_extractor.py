from bs4 import BeautifulSoup
import re

def bs4_extractor(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    center_elements = soup.find_all(class_="center")
    filtered_text = "\n\n".join(element.get_text(strip=True) for element in center_elements)
    return re.sub(r"\n\n+", "\n\n", filtered_text).strip()
