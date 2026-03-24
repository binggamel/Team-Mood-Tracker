
<img width="1279" height="919" alt="스크린샷 2026-03-24 오후 6 25 40" src="https://github.com/user-attachments/assets/56020cf9-ceeb-451c-ad53-967d00461fde" />
<img width="1271" height="764" alt="스크린샷 2026-03-24 오후 6 25 28" src="https://github.com/user-attachments/assets/93919cc7-528f-4d45-b591-485057aa72a8" />
<img width="1279" height="919" alt="스크린샷 2026-03-24 오후 6 25 40" src="https://github.com/user-attachments/assets/0c252ec3-4b8e-4d27-9919-afa7e43cc7c1" />



----


# Team Mood Tracker

팀 전용 무드트래커 웹앱입니다.

- 백엔드: Django + DRF + JWT
- 프론트: React + TypeScript + Vite + Tailwind
- 핵심 기능:
  - 월 캘린더 뷰
  - 팀 매트릭스 뷰
  - 날짜별 "오늘의 한마디"
  - Admin 사전 계정 생성 후 간단 로그인

## 1) Backend 실행

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Admin 초기 세팅

1. `http://localhost:8000/admin` 접속
2. `users > User` 에서 팀원 계정 9명 생성
   - `login_id`, `name`, `password` 설정
   - `role`은 일반 팀원은 `member`, 관리자만 `admin`
3. `moods > Mood type` 에서 이모티콘 타입 생성
   - 예) fantastic / great / good / sad / anxiety

## 2) Frontend 실행

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후 로그인.

## 3) API 개요

- `POST /api/auth/login/` : 로그인 (login_id, password)
- `GET /api/auth/me/` : 내 정보 조회
- `GET /api/moods/` : 무드 타입 목록
- `GET /api/entries/?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `POST /api/entries/upsert/` : 선택 날짜 내 기록 저장/수정
- `GET /api/entries/date/YYYY-MM-DD/` : 해당 날짜 상세 목록
- `GET /api/entries/matrix/?start=...&end=...`

## 4) 디자인 방향

처음 공유한 레퍼런스처럼 아래 원칙으로 구성했습니다.

- 여백 많은 카드형 UI
- 파스텔 톤 배경
- 둥근 모서리 + 얇은 보더
- 감정 이모티콘 중심의 시각 정보
- 모바일에서도 가로 스크롤/탭 방식으로 정보 확인 가능
