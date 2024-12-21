

# 🎙️ AI 실시간 음성 채팅 프로젝트
실시간으로 음성을 인식하고 AI와 대화하는 웹 애플리케이션입니다.

## 📋 주요 기능
- 실시간 음성 인식 및 텍스트 변환
- OpenAI GPT를 활용한 AI 응답 생성
- 텍스트를 음성으로 변환하여 응답
- WebSocket을 통한 실시간 양방향 통신
- 대화 내용 실시간 표시

## 🛠️ 기술 스택
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python, FastAPI
- **AI/ML**: OpenAI GPT-3.5
- **APIs**: 
  - Web Speech API (음성 인식/합성)
  - WebSocket (실시간 통신)
  - OpenAI API

## 🔧 설치 및 실행

### 1. 필수 요구사항
- Python 3.7+
- Node.js (선택사항 - 개발 시)
- OpenAI API 키

### 2. 환경 설정
```bash
# 가상환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 필요한 패키지 설치
pip install fastapi uvicorn[standard] python-dotenv openai
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가:
```env
OPENAI_API_KEY=your_api_key_here
```

### 4. 서버 실행
```bash
python -m uvicorn server:app --reload
```

## 📁 프로젝트 구조
```
project/
├── index.html      # 메인 웹 페이지
├── styles.css      # 스타일시트
├── script.js       # 프론트엔드 로직
├── server.py       # 백엔드 서버
└── .env           # 환경 변수
```

## 💻 주요 컴포넌트

### Frontend (script.js)
- 음성 인식 및 합성 관리
- WebSocket 연결 처리
- UI 상태 관리
- 실시간 메시지 표시

### Backend (server.py)
- WebSocket 서버 구현
- OpenAI API 통신
- 정적 파일 제공
- 에러 처리

## 🎯 주요 기능 설명

### 음성 인식
- Web Speech API 사용
- 실시간 음성 텍스트 변환
- 자동 음성 인식 재시작

### AI 응답 처리
- GPT-3.5-turbo 모델 사용
- 실시간 응답 생성
- 문맥 기반 대화 처리

### 음성 합성
- 텍스트를 자연스러운 음성으로 변환
- 문장 단위 음성 출력
- 음성 파라미터 최적화

## ⚙️ 설정 옵션
- 음성 인식 언어: 한국어 (ko-KR)
- 음성 합성 속도: 1.2x
- 침묵 감지 시간: 2초
- WebSocket 재연결 간격: 5초

## 🔒 보안
- API 키는 환경 변수로 관리
- CORS 설정을 통한 접근 제어
- 에러 처리 및 로깅

## 🚀 향후 개선 사항
1. 음성 인식 정확도 향상
2. 응답 지연 시간 최소화
3. UI/UX 개선
4. 대화 히스토리 저장 기능
5. 다국어 지원

## 📝 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.

## 👥 기여
버그 리포트, 기능 제안, 풀 리퀘스트를 환영합니다.

---
이 프로젝트에 대해 추가 문의사항이 있으시면 이슈를 생성해주세요.