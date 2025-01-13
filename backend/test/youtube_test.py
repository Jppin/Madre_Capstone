# 기말 시연 핵심 요소기술 3: Youtube shorts 키워드 생성 및 보여주기
from googleapiclient.discovery import build
import isodate
from jinja2 import Environment, FileSystemLoader
from services.user_service import get_health_interests_byname
from config.config import youtube_api_key
from utils.keyword_prompt import youtube_keyword_chain

EXCLUDE_KEYWORDS=["판매", "중고", "문의", "의료기", "매입", "프로모션", 
                  "특가", "공동구매", "장비", "렌탈", "컨설팅", "A/S", "협찬", "질병" ]

# LLM으로 키워드 생성
def generate_youtube_keywords(health_interests):
    interests_text = ", ".join(health_interests)
    response = youtube_keyword_chain.invoke({"health_interests": interests_text})
    response_text = response.content
    keywords = [line.strip('- ').strip() for line in response_text.splitlines() if line.startswith('-')]
    return keywords

# 제목과 설명이 광고성 키워드를 포함하지 않는지 검사
def is_relevant_video(title, description): 
    title = title.lower().strip()
    description = description.lower().strip()
    if any(word.lower() in title for word in EXCLUDE_KEYWORDS):
        return False
    if any(word.lower() in description for word in EXCLUDE_KEYWORDS):
        return False
    return True

# 키워드 통해 Youtube API 호출
def search_youtube_videos(keywords, max_results=5):
    youtube = build("youtube", "v3", developerKey=youtube_api_key)
    results = {}

    for keyword in keywords:
        print(f"\n[키워드: {keyword}] loading....")
        search_request = youtube.search().list(
            part="snippet",
            q=f"{keyword} Shorts",
            type="video",
            videoDuration="short",
            maxResults=max_results
        )
        search_response = search_request.execute()
        
        video_ids = [item['id']['videoId'] for item in search_response.get("items", [])]
        video_request = youtube.videos().list(
            part="contentDetails,snippet,status,player",
            id=",".join(video_ids)
        )
        video_response = video_request.execute()

        videos = []
        
        for video in video_response['items']:
            duration = video['contentDetails']['duration']
            total_seconds = isodate.parse_duration(duration).total_seconds()
            embeddable = video['status'].get('embeddable', False)
            embed_html = video['player'].get('embedHtml', '')
            title = video['snippet']['title']
            description = video['snippet']['description']

            if (
                15 <= total_seconds <= 60 and
                embeddable and embed_html and
                is_relevant_video(title, description)
            ):
                video_info = {
                    "title": title,
                    "embedHtml": embed_html,
                    "link": f"https://www.youtube.com/watch?v={video['id']}",
                    "duration": f"{int(total_seconds // 60)}분 {int(total_seconds % 60)}초"
                }
                videos.append(video_info)
        results[keyword] = videos
    return results

# Youtube 링크 포함한 html파일 생성
def render_html_template(video_results, template_path="templates", output_file="youtube_shorts_results.html"):
    env = Environment(loader=FileSystemLoader(template_path))
    template = env.get_template("youtube_results.html")
    rendered_html = template.render(video_results=video_results)

    with open(output_file, "w", encoding="utf-8") as file:
        file.write(rendered_html)
    print(f"\nHTML 파일이 생성되었습니다: {output_file}")

# main
if __name__ == "__main__":
    user_name = "이영훈"
    health_interests = get_health_interests_byname(user_name)
    
    if not health_interests:
        print(f"사용자 '{user_name}'의 health_interests 정보를 찾을 수 없습니다.")
    else:
        keywords = generate_youtube_keywords(health_interests)
    
    for keyword in keywords:
        print(keyword)
        
    video_results = search_youtube_videos(keywords)

    render_html_template(video_results)
    
    for keyword, videos in video_results.items():
        print(f"\n=== 키워드: {keyword} ===")
        for idx, video in enumerate(videos, start=1):
            print(f"{idx}. 제목: {video['title']}")
            print(f"   링크: {video['link']}")
            print(f"   길이: {video['duration']}")

