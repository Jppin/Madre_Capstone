# Madre: 임산부 맞춤 영양 가이드 앱

**Madre**는 OCR 기반 약물 인식과 LangChain 구조의 RAG + GPT-4o 프롬프트를 활용하여
사용자의 복약 이력 및 건강 상태에 맞춘 권장/주의 영양소 추천 및 개인 맞춤형 식단을 자동 생성하는 모바일 앱입니다.

---

## 📁 Repository 구성

* `/frontend`: React Native 기반 모바일 앱 소스코드
* `/backend`: Node.js + Express 기반 API 서버 (내부 Python 스크립트 실행 포함)
* `/rag-server`: GPT-4o + LangChain 기반 RAG (Retrieval-Augmented Generation) 서버 소스코드
  └── 임산부 맞춤형 식단을 생성하는 백엔드 기능 담당
  └── 벡터DB에서 관련 영양·식품 정보를 검색한 후, 해당 정보를 기반으로 GPT가 식단을 생성
  └── `.env` 설정 필요 : OpenAI API Key (GPT 호출용) 와 Vector DB 경로
  └── API 사용법 : `POST /query` API로 사용자 건강 정보를 바탕으로 식단 생성 요청 가능
* `/sample-data`: 프로젝트 테스트를 위한 샘플 데이터 (약봉투 OCR 이미지, 테스트 유저 정보 등)

---

## 🛠️ How to Install & Build

Madre 프로젝트를 로컬 환경에서 실행하는 방법을 안내합니다.
프론트엔드(React Native 앱), 백엔드(Node.js 서버), RAG 서버(Flask)를 각각 구성해야 하며,
백엔드는 RAG 서버를 내부에서 자동 호출합니다.

### ✅ 0. 사전 요구사항 (Pre-requisites)

* Node.js (v18 이상)
* npm
* Python 3.10+
* Android Studio + Android SDK (React Native 앱 실행용)
* MongoDB Atlas 계정 (또는 로컬 MongoDB 서버)
* GPT-4 API Key
* NAVER CLOVA OCR Key
* Android device 또는 에뮬레이터 (adb 연결 필요)

---

### 1️⃣ 레포지토리 클론

```bash
git clone https://github.com/Jppin/Madre_Capstone.git
cd Madre_Capstone
```

---

### 2️⃣ 프론트엔드 설치 및 실행 (React Native)

```bash
cd frontend
npm install
npx react-native run-android
```

* Android 디바이스 또는 에뮬레이터가 adb로 연결되어 있어야 합니다.
* Metro bundler가 자동 실행되며 앱이 디바이스에 설치됩니다.

#### 🔧 프론트 환경설정 확인사항

* `config/config.js` 파일에서 `LOCAL_PC_IP` 변수 확인:

```js
export const LOCAL_PC_IP = "http://192.168.x.x:5001"; // 실기기: PC의 IPv4 주소
// 에뮬레이터: http://10.0.2.2:5001
```

* npm install로 `node_modules`가 정상 설치되었는지 확인
* 실기기 빌드 시 Android 기기 USB 연결 + 개발자 모드 + 디버깅 허용
* 연결 확인 명령어:

```bash
adb devices
```

---

### 3️⃣ 백엔드 설치 및 실행 (Node.js API 서버)

```bash
cd backend
npm install
npx nodemon app
```

#### 🔑 .env 예시 (backend/.env)

```
PORT=5001
JWT_SECRET=<Your JWT Secret>
MONGODB_URI=<Your MongoDB URI>
CLOVA_API_KEY=<Your CLOVA OCR Key>
CLOVA_SECRET=<Your CLOVA OCR Secret>
```

#### 🔧 백엔드 확인사항

* `.env` 키가 정확히 입력되었는지 확인
* BASE\_URL 설정:

  * 실기기 테스트 시: PC의 `ipconfig` → IPv4 주소 입력
  * 에뮬레이터 테스트 시: `http://10.0.2.2:5001`
* npm install로 `node_modules`가 정상 설치되었는지 확인
* Redis 로컬 설치 필요:

```bash
redis-cli
```

* 백엔드 내부에서 Python 스크립트를 호출하므로, Python 환경 구성 필요:

```bash
cd backend/python
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

### 4️⃣ RAG 서버 설치 및 실행 (Flask + LangChain)

```bash
cd rag-server
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### 🔑 .env 예시 (rag-server/.env)

```
OPENAI_API_KEY=<Your OpenAI API Key>
VECTOR_DB_PATH=./path_to_vector_store
```

#### 🔧 RAG 서버 확인사항

* `.env` 파일 생성 및 키 정확히 입력
* `pip install -r requirements.txt`로 의존성 설치

---

## ▶️ How to Test

1. 앱 실행 후 회원가입 → 건강 정보 입력
2. 홈 화면에서 권장/주의 영양소 확인
3. OCR로 처방전 이미지 등록
4. YouTube 추천 탭 확인
5. MyPage → 건강 정보 수정 → 추천 재생성

---

## 🧪 Sample Data

`/sample-data/`

* `prescription1.jpg`: OCR 테스트용 처방 이미지
* `userInfo.json`: 사용자 초기 건강 정보
* `drugData.json`: 약품 정보 샘플 (식약처 API 기반)

---

## 🗄️ Database Info

MongoDB Atlas 사용

### 주요 Collection

* `UserInfo`: 사용자 건강 정보
* `OCRRecords`: 인식된 약물 기록
* `LikedNutrient`: 사용자가 저장한 영양 성분
* `YouTubeCache`: 추천된 유튜브 영상 메타데이터

---

## 💡 사용 기술 스택 및 오픈소스

| 구분             | 사용 기술 및 오픈소스                                 |
| -------------- | -------------------------------------------- |
| Frontend       | React Native (MIT License)                   |
| Backend        | Node.js + Express (MIT License)              |
| Python Backend | Flask (BSD License), LangChain (MIT License) |
| DB             | MongoDB Atlas, Redis (BSD License)           |
| OCR API        | NAVER CLOVA OCR (상업 API 사용)                  |
| AI API         | OpenAI GPT-4 API (상업 API 사용)                 |
| 영상 추천          | YouTube Data API v3 (Google API)             |

> ※ 모든 오픈소스 패키지는 각각의 라이선스를 따릅니다. 자세한 내용은 각 패키지의 공식 문서를 참조하세요.

---

## 🔁 재현용 통합 실행 스크립트

### `scripts/setup_all.sh` (예시)

```bash
#!/bin/bash
# 백엔드 설치 및 실행
cd backend
npm install
cd python
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
npx nodemon app &

# RAG 서버 실행
cd ../rag-server
source venv/bin/activate
python app.py &

# 프론트 빌드는 수동 실행 권장 (에뮬레이터 연결 후)
cd ../frontend
npm install
```

> 참고: 실제 스크립트는 각 환경에 맞게 조정 필요

---

## 📌 기타 안내

* 모든 외부 API Key는 `.env.example` 파일을 참고하여 `.env`에 직접 설정하세요.
* GitHub 저장소에는 테스트용 샘플 이미지 및 JSON 파일이 포함되어 있습니다.
* 과제 채점 기준에 따라 레포지토리만으로 전체 실행 가능하도록 구성되었습니다.
* `git clone` 후 본 문서의 순서대로 따라가면 재생성 가능한 상태입니다 ✅

---

## 👩‍💻 Authors

이화여대 소프트웨어공학과 졸업 프로젝트 팀 – Madre (2025)

> 본 프로젝트는 졸업 과제 제출용으로 개발되었으며, 외부 공개용 상용 서비스는 아닙니다.
