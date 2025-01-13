from .db_connection import get_database
from bson import ObjectId

# 데이터베이스 객체 가져오기
db = get_database()

# Collections
user_info_collection = db["UserInfo"]
medication_collection = db["medication"]
prescriptions_collection = db["prescriptions"]
chat_logs_collection = db["chat_logs"]
recommendations_collection = db["recommendations"]

# UserInfo 컬렉션 작업
def get_user_info(object_id):
    """
    ObjectId로 특정 사용자의 정보를 조회합니다.
    :param object_id: 문자열 형태의 ObjectId
    :return: 사용자 정보 (딕셔너리 형태)
    """
    try:
        # 문자열을 ObjectId로 변환
        obj_id = ObjectId(object_id)
        # ObjectId를 이용하여 조회
        user = user_info_collection.find_one({"_id": obj_id})
        return user
    except Exception as e:
        print(f"Error occurred: {e}")
        return None

def get_all_user_names():
    """
    UserInfo 컬렉션에서 모든 사용자 이름을 가져옵니다.
    """
    return list(user_info_collection.find({}, {"_id": 1, "name": 1}))

def save_to_custom_logs(data):
    """
    새로운 컬렉션 custom_logs에 데이터를 저장합니다.
    """
    custom_logs_collection = db["custom_logs"]
    custom_logs_collection.insert_one(data)