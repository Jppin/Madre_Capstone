# 기말 시연 핵심 요소기술 1: ocr->텍스트 처리
import re
import datetime
import pytesseract
import requests
import json
from PIL import Image, ImageSequence
from config.config import db, openai_api_key, openai_api_url

# Tesseract 설정 (Windows 경로)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# MongoDB 연결
user_info_col = db["UserInfo"]
medication_col = db["medication"]
prescriptions_col = db["prescriptions"]

# OpenAI API 키 / URL 설정

# 1. MPO -> PNG로
def convert_mpo_to_png(image_path, output_path):
    try:
        image = Image.open(image_path)
        for frame in ImageSequence.Iterator(image):
            frame.convert("RGB").save(output_path, "PNG")
            print(f"이미지가 {output_path}로 변환되었습니다.")
            break
    except Exception as e:
        print("MPO 변환 중 오류 발생:", e)

# 2. OCR 처리 함수
def extract_text(image_path):
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image, lang='kor')
        return text
    except Exception as e:
        print("OCR 처리 중 오류 발생:", e)
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

주어진 텍스트에서 다음 정보를 반드시 JSON 형식으로만 추출하세요. 또한 단어 내의 불필요한 띄어쓰기는 제거해주세요.
약물 정보는 여러 개가 있을 수 있으므로 반드시 모든 약물을 인식하여 반환해야 합니다.

{{
    "name": "환자 이름 (없으면 null)",
    "age": "나이 (없으면 기존 값 유지)",
    "prescription_info": {{
        "medical_institution": "처방 의료기관 (없으면 null)",
        "dispensing_date": "처방 날짜(없으면 null)",
    }},
    "medications": [
        {{
           "medication_name": "약물 이름 (없으면 null)",
            "dosage": "복용법 (없으면 null)",
            "duration": "복용 기간 (없으면 null)",
            "general_info": "일반 정보 (없으면 null)",
            "precautions": "주의사항 (없으면 null)",
            "ingredients": [],
            "conflicting_ingredients": []
        }},
    "cost": 
        {{
        "total": "총 금액(없으면 null)",
        "covered_by_insurance": "보험 처리 금액(없으면 null)",
        "patient_share": "환자 부담 금액(없으면 null)"
        }}
    ]
}}
정보가 누락되면 null로 설정하세요. 나이 정보가 없으면 기존 값은 유지해야 하므로 `age` 필드는 반환하지 마세요. 오직 JSON 형식만 반환하고 다른 문장은 포함하지 마세요."""}
        ],
        "max_tokens": 700,
        "temperature": 0.0
    }

    response = requests.post(openai_api_url, headers=headers, json=data)
    if response.status_code == 200:
        gpt_response = response.json()["choices"][0]["message"]["content"].strip()
        # 백틱 제거해
        cleaned_response = re.sub(r'```json\s*|\s*```', '', gpt_response)
        print("GPT API 응답 (정제):", cleaned_response)
        return cleaned_response
    else:
        print("OpenAI API 요청 실패:", response.status_code, response.text)
        return None

# 4. DB 업데이트
def update_database(ocr_data):
    # 먼저 UserInfo에서 사용자 존재하는지
    user = user_info_col.find_one({"name": ocr_data.get("name", None)})
    if not user:
        print("Error: 해당 사용자가 존재하지 않습니다.")
        return
    
    user_id = user["_id"]
    updated_age = ocr_data.get("age", None)
    medication_ids = []

    # medications 컬렉션에 약물 정보 있는지 / 없으면 추가
    for med in ocr_data.get("medications", []):
        med_name = med.get("medication_name", None)
        if med_name:
            existing_med = medication_col.find_one({"medication_name": med_name})
            if not existing_med:
                # 새로 추가
                new_med = {
                    "medication_name": med_name,
                    "dosage": med.get("dosage", None),
                    "duration": med.get("duration", None),
                    "general_info": med.get("general_info", None),
                    "precautions": med.get("precautions", None),
                    "ingredients": med.get("ingredients", []),
                    "conflicting_ingredients": med.get("conflicting_ingredients", [])
                }
                insert_result = medication_col.insert_one(new_med)
                medication_ids.append(insert_result.inserted_id)  # 새로 추가된 약 ID
            else:
                medication_ids.append(existing_med["_id"])  # 기존 약 ID

    # UserInfo: 나이가 있을 때만 업데이트
    update_fields = {"current_medications": medication_ids}
    if updated_age is not None:
        update_fields["age"] = updated_age

    user_info_col.update_one(
        {"_id": user_id},
        {"$set": update_fields}
    )

    # prescriptions
    new_prescription = {
        "patient": {
            "name": ocr_data.get("name", None),
            "age": updated_age if updated_age is not None else user.get("age")  # 나이가 없으면 기존 값 유지
        },
        "prescription_info": {
            "medical_institution": ocr_data.get("prescription_info", {}).get("medical_institution", None),
            "dispensing_date": ocr_data.get("prescription_info", {}).get("dispensing_date", None),
        },
        "medications": medication_ids,  # medications 컬렉션의 ID 참조
        "cost": {
            "total": ocr_data.get("cost", {}).get("total", None),
            "covered_by_insurance": ocr_data.get("cost", {}).get("covered_by_insurance", None),
            "patient_share": ocr_data.get("cost", {}).get("patient_share", None)
        },
        "created_at": datetime.datetime.now()
    }

    prescriptions_col.insert_one(new_prescription)
    print("데이터베이스에 처방전이 성공적으로 저장되었습니다.")


# 5. 실행 코드
if __name__ == "__main__":
    mpo_image_path = "images/집에가고싶다.jpg"
    converted_image_path = "images/집에가고싶다_변환.png"

    convert_mpo_to_png(mpo_image_path, converted_image_path)
    ocr_text = extract_text(converted_image_path)

    if ocr_text:
        print("OCR 결과:", ocr_text)
        gpt_result = process_text_with_gpt(ocr_text)

        if gpt_result:
            try:
                ocr_data = json.loads(gpt_result)
                update_database(ocr_data)
            except json.JSONDecodeError as e:
                print("GPT 결과 JSON 변환 오류:", e)
        else:
            print("GPT 처리 실패")
    else:
        print("OCR 처리 실패")
