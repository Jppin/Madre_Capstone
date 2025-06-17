# RAG 서버 설정 가이드

이 문서는 RAG(Retrieval-Augmented Generation) 서버의 환경 설정 방법을 안내합니다.

## 사전 요구사항

- Python 3.8 이상
- pip (Python 패키지 관리자)
- 가상환경 도구 (권장: venv 또는 conda)

## 설치 단계

1. 저장소 클론
```bash
git clone [repository-url]
cd rag-server
```

2. 가상환경 생성 및 활성화
```bash
# venv 사용 시
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# conda 사용 시
conda create -n rag-env python=3.8
conda activate rag-env
```

3. 필요한 패키지 설치
```bash
pip install -r requirements.txt
```

## 환경 변수 설정

`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 변수들을 설정하세요:

```env
OPENAI_API_KEY=your_openai_api_key
VECTOR_DB_PATH=path_to_vector_database
```

## 서버 실행

```bash
python app.py
```

서버는 기본적으로 `http://localhost:5002`에서 실행됩니다.

## API 엔드포인트

- `POST /query`: RAG 쿼리 처리

## 문제 해결

일반적인 문제 해결 방법:

1. 가상환경이 활성화되어 있는지 확인
2. 모든 의존성이 올바르게 설치되었는지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

## 추가 지원

문제가 발생하거나 추가 지원이 필요한 경우, 팀 리드에게 문의하세요.
