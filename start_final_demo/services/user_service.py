from config.config import db

user_info_collection = db["UserInfo"]

def get_user_info_byname(name: str):
    user_info = user_info_collection.find_one({"name": name})
    return user_info
