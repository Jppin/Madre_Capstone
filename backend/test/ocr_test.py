# 기말 시연 핵심 요소기술 1: ocr->텍스트 처리
# ocr_test.py



import re
import datetime
import sys
import uuid
import requests
import json
from PIL import Image, ImageSequence
import os
import base64


sys.stdout.reconfigure(encoding='utf-8')  # Python 3.7 이상
sys.stderr.reconfigure(encoding='utf-8')

# ocr_test.py 파일이 backend/test에 있다고 가정하고, 부모 디렉토리(backend)를 sys.path에 추가
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config.config import db, openai_api_key, openai_api_url



# 부모 디렉터리를 모듈 검색 경로에 추가
sys.path.insert(0, parent_dir)

from config.config import db, openai_api_key, openai_api_url


# MongoDB 연결
user_info_col = db["UserInfo"]
medication_col = db["medicines"]




# ✅ 네이버 클로바 OCR API 정보
CLOVA_OCR_URL = "https://64nrlt36wx.apigw.ntruss.com/custom/v1/38666/507f569ea5238517c3acbe956e508e06e94c2e71a4abf80fbb00d8d44f4da6c3/general"
CLOVA_SECRET_KEY = "UEZYcllRRWRrWHl4YXpSaFlybVh0Smt6b0lQR2JyT1g="  # 환경 변수에서 API 키 가져오기



# OpenAI API 키 / URL 설정

# 1. MPO -> PNG로
def convert_mpo_to_png(image_path, output_path):
    try:
        image = Image.open(image_path)
        for frame in ImageSequence.Iterator(image):
            frame.convert("RGB").save(output_path, "PNG")
            sys.stderr.write(f"이미지가 {output_path}로 변환되었습니다.\n")
            break
    except Exception as e:
        sys.stderr.write(f"MPO 변환 중 오류 발생: {e}\n")



# 2. OCR 처리 함수
def extract_text(image_path):
    try:

        if not os.path.exists(image_path):
            sys.stderr.write(f"❌ 이미지 파일이 존재하지 않음: {image_path}\n")
            return None



        with open(image_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode("utf-8")

        headers = {
            "X-OCR-SECRET": CLOVA_SECRET_KEY,
            "Content-Type": "application/json",
        }

        payload = {
    "version": "V2",  # API 버전 명시
    "requestId": str(uuid.uuid4()),  # 고유 요청 ID (UUID 사용)
    "timestamp": int(datetime.datetime.now().timestamp() * 1000),  # 현재 시간 (밀리초 단위)
    "images": [
        {
            "format": "jpg",
            "name": "ocr_test",
            "data": image_data  # Base64 인코딩된 이미지 데이터
        }
    ],
}

        response = requests.post(CLOVA_OCR_URL, headers=headers, json=payload)

        if response.status_code == 200:
            ocr_result = response.json()
            extracted_text = " ".join(
                field["inferText"] for field in ocr_result["images"][0]["fields"]
            )
            sys.stderr.write(f"OCR 추출 텍스트: {extracted_text}\n")
            # 일반 출력
            print(f"OCR 추출 텍스트: {extracted_text}")
            return extracted_text
        else:
            sys.stderr.write(f"❌ OCR 요청 실패: {response.text}\n")
            return None
    except Exception as e:
        sys.stderr.write(f"OCR 처리 중 오류 발생: {e}\n")
        return None




# 3. GPT API 호출 / JSON 처리 함수
def process_text_with_gpt(ocr_text):
    headers = {
        "Authorization": f"Bearer {openai_api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "gpt-4",
        "messages": [
            {"role": "system", "content": "당신은 OCR 데이터를 JSON 형식으로 정확히 추출하는 전문가입니다. 다른 설명이나 추가적인 문장은 절대 포함하지 마세요."},
            {"role": "user", "content": f"""
다음은 OCR로 추출된 텍스트입니다:
'{ocr_text}'

주어진 텍스트에서 **반드시** "name" 필드를 포함하여 약 정보를 JSON 형식으로 반환하세요. 
📌 **반드시 OCR 텍스트에서 '약물명'을 정확하게 추출해야 합니다.**
💡 **약물명이 불분명한 경우에도 반드시 가장 가능성이 높은 단어를 `name` 필드에 포함하세요.**
💡 **약 이름을 확신하지 못하면 `"name": "디곡신(추정)"`처럼 반환하세요.**
❌ "약물명 미확인"은 되도록이면 금지!

- OCR 데이터에서 반드시 약 이름을 추출해야 합니다.
- 약과 관련 없는 단어는 제외하세요. **(사람 이름, 장소 이름 등 불필요한 정보는 포함하지 마세요)**
- 단어 내의 불필요한 띄어쓰기는 제거하고, null 값이 아닌 경우만 필드를 포함하세요.
- **약물 정보는 여러 개일 수도 있으므로 반드시 모든 약물을 반환해야 합니다.**

{{
    "name": "약 이름(사람 이름 아님. 약품 이름임에 주의)",
    "prescriptionDate": "처방 날짜",
    "registerDate": "{datetime.datetime.now().strftime('%Y-%m-%d')}",
    "pharmacy": "처방 약국",
    "dosageGuide": "복용법",
    "warning": "주의사항",
    "sideEffects": "부작용",
    "active": true
}}
🚨 "name" 필드는 무조건 포함해야 합니다.
만약 약 이름을 인식하지 못하면 "name": "약물명 미확인"으로 반환하세요.
오직 위 내용만을 담은 JSON 형식만 반환하고 다른 문장은 포함하지 마세요."""}
        ],
        "max_tokens": 700,
        "temperature": 0.0
    }

    response = requests.post(openai_api_url, headers=headers, json=data)
    if response.status_code != 200:
        sys.stderr.write(f"❌ OpenAI API 요청 실패: {response.status_code}, {response.text}\n")
        return None

    gpt_response = response.json()["choices"][0]["message"]["content"].strip()
    cleaned_response = re.sub(r'```json\s*|\s*```', '', gpt_response).strip()

    try:
        json_data = json.loads(cleaned_response)  # ✅ JSON 파싱 검증
        sys.stderr.write(f"GPT API 응답 (정제): {json.dumps(json_data, ensure_ascii=False)}\n")
        return json_data
    except json.JSONDecodeError as e:
        sys.stderr.write(f"❌ JSON 변환 오류: {e}, GPT 응답: {gpt_response}\n")
        return None  # JSON 변환 실패 시 `None` 반환




# 4. DB 업데이트 (중복 체크 후 저장)
def update_database(ocr_data):
    try:
        existing_medicine = medication_col.find_one({"name": ocr_data.get("name")})

        if existing_medicine:
            sys.stderr.write(f"⚠️ 이미 존재하는 약품: {ocr_data['name']}. 저장을 취소합니다.\n")
        else:
            new_medicine = medication_col.insert_one(ocr_data)
            sys.stderr.write(f"✅ DB 저장 완료: {new_medicine.inserted_id}\n")
    except Exception as e:
        sys.stderr.write(f"❌ DB 저장 오류: {e}\n")



from bson import ObjectId  # ✅ ObjectId 변환을 위해 추가

def convert_objectid_to_str(data):
    """ObjectId를 문자열로 변환하는 함수"""
    if isinstance(data, dict):
        return {k: convert_objectid_to_str(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_objectid_to_str(v) for v in data]
    elif isinstance(data, ObjectId):
        return str(data)
    return data





# 5. 실행 코드 (업로드된 이미지 사용)
if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.stderr.write("❌ 이미지 파일 경로가 제공되지 않음.\n")
        sys.exit(1)

    image_path = sys.argv[1]  # 업로드된 이미지 경로


    if not os.path.exists(image_path):
        sys.stderr.write(f"❌ 이미지 파일이 존재하지 않음: {image_path}\n")
        sys.exit(1)

    sys.stderr.write(f"🔍 OCR 실행 중... 파일 경로: {image_path}\n")


    ocr_text = extract_text(image_path)

    if ocr_text:
        gpt_result = process_text_with_gpt(ocr_text)

        if gpt_result:
            #update_database(gpt_result)

            # ✅ ObjectId 변환 후 JSON으로 변환
            safe_json_result = convert_objectid_to_str(gpt_result)
            print(json.dumps(safe_json_result, ensure_ascii=False))

        else:
            sys.stderr.write("GPT 처리 실패 - JSON 변환 실패\n")
            sys.exit(1)
    else:
        sys.stderr.write("OCR 처리 실패\n")
        sys.exit(1)
