def format_prompt(user_info: dict, context: str):
    return {
        "name": user_info["name"],
        "age": user_info["age"],
        "gender": user_info["gender"],
        "health_interests": ", ".join(user_info["health_interests"]),
        "past_history": ", ".join(user_info["past_history"]),
        "current_medications": ", ".join(user_info["current_medications"]),
        "context": context
    }
