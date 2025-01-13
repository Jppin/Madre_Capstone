from config.config import db

user_info_collection = db["UserInfo"]

def get_user_info_byname(name: str):
    user_info = user_info_collection.find_one({"name": name})
    return user_info

def get_health_interests_byname(name: str):
    user_info = user_info_collection.find_one({"name": name}, {"health_interests": 1, "_id": 0})
    if user_info and "health_interests" in user_info:
        return user_info["health_interests"]
    return []