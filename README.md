# NaiClover

> 언어를 배우고 싶은 사람과 원어민을 연결하는 **언어 교환 소셜 플랫폼**

<img src="https://github.com/JHSasdf/NaiClover/assets/146299597/548b3c3a-8e12-4792-9427-41a65253d145" width="400" height="350" />

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=React&logoColor=white)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=flat-square&logo=TypeScript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=Express&logoColor=white)](https://expressjs.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat-square&logo=Socket.io&logoColor=white)](https://socket.io)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=MySQL&logoColor=white)](https://www.mysql.com)
[![Railway](https://img.shields.io/badge/Railway-Deploy-0B0D0E?style=flat-square&logo=Railway&logoColor=white)](https://railway.app)

---

## 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [주요 기능](#-주요-기능)
3. [기술 스택](#-기술-스택)
4. [화면 구성](#-화면-구성)
5. [시작 가이드](#-시작-가이드)
6. [폴더 구조](#-폴더-구조)
7. [팀 소개](#-팀-소개)
8. [버전 히스토리](#-버전-히스토리)

---

## 🌿 프로젝트 소개

**개발 기간:** 2025년 1월 15일 ~ 2월 6일 (3주, 5인 팀 프로젝트)
**현재 상태:** 팀 프로젝트 완료 후 개인 UI/UX 리팩토링 및 기능 개선 진행 중

NaiClover는 외국어 학습자와 원어민이 **포스트·채팅·문법 교정**을 통해 서로 배우고 가르칠 수 있는 언어 교환 플랫폼입니다.

- 문화/언어 주제로 글을 올리고, 원어민에게 **문법 교정 피드백**을 받을 수 있습니다.
- 교정 이력은 **ErrorLog 페이지**에 자동으로 아카이빙되어 언제든 복습할 수 있습니다.
- **언어 강제 설정이 있는 그룹 채팅(MonoChat)**으로 특정 언어만 사용하는 몰입 학습 환경을 제공합니다.

### 배포 주소

> Railway를 통해 배포되어 있습니다. 아래 테스트 계정으로 바로 체험해볼 수 있습니다.

| 구분 | ID | PW |
|------|----|----|
| 테스트 계정 | `test` | `111111` |

---

## ✨ 주요 기능

### 피드 (문화 / 언어 포스트)

- 문화·언어 두 카테고리로 포스트 작성 및 조회
- 이미지 다중 업로드 (Cloudinary 저장), 좋아요 토글, 댓글
- 팔로우한 사용자의 글이 우선 정렬되는 팔로우 기반 피드

![naiclovercreatepost](https://github.com/JHSasdf/NaiClover/assets/146299597/7bcab441-15cb-44c9-bb4c-59bbe301bd55)

### 문법 교정 & ErrorLog

- 댓글/채팅 메시지에 교정을 달면 교정 전·후가 비교 UI로 표시
- 내가 받은 모든 교정 내역을 **ErrorLog 페이지**에서 한눈에 복습 가능

![naiclovererrorlog](https://github.com/JHSasdf/NaiClover/assets/146299597/43b9a39c-b381-44c4-8c45-72e3aac37a53)

### 실시간 1:1 채팅

- Socket.IO 기반 실시간 채팅 (새로고침 없이 즉시 반영)
- 읽음 여부 추적, 채팅 메시지 교정 기록 별도 조회 가능

![naiclover-userinfo-personalcaht](https://github.com/JHSasdf/NaiClover/assets/146299597/6565d9e9-5d20-461a-a0d6-2f9cbf1499cf)

### MonoChat (언어 강제 그룹 채팅)

- 방 개설 시 사용 언어(한/영/일/중/프/독 6종) 설정 → 해당 언어만 사용하도록 유도
- 언어별 전용 테마 UI, 실시간 참가자 수 표시, 초대 코드 참가 지원

![naiclovermonochatroom](https://github.com/JHSasdf/NaiClover/assets/146299597/fe8a2b1e-3755-47dc-b94f-487175000b2b)
![naiclover-monochat](https://github.com/JHSasdf/NaiClover/assets/146299597/743fe5ec-7eab-443f-a2b2-0586f36aa13f)

### 팔로우 & 알림

- 유저 팔로우/언팔로우, 팔로워·팔로잉 목록 조회
- 팔로우·좋아요·댓글·교정·MonoChat 5종 알림 통합 관리 + 개별 삭제

### 마이페이지 & 유저 검색

- 프로필 이미지 변경, 자기소개 편집, 학습 언어 수정
- 비밀번호 변경 (클라이언트 유효성 검사 포함), 회원 탈퇴
- 닉네임으로 다른 사용자 프로필 검색 및 팔로우

---

## 🛠 기술 스택

### Frontend

| 기술 | 버전 | 비고 |
|------|------|------|
| React | 18.2.0 | SPA 컴포넌트 기반 UI |
| TypeScript | 4.9.5 | 타입 안전성 확보 |
| React Router DOM | 6.21.3 | 클라이언트 사이드 라우팅 |
| SCSS | — | 컴포넌트별 스코프 스타일 관리 |
| Bootstrap | 5.3.2 | 그리드 시스템 |
| Axios | 1.6.5 | HTTP 클라이언트 |
| Socket.IO Client | 4.7.4 | 실시간 채팅 |
| React Hook Form | 7.49.3 | 폼 상태 관리 |
| Swiper | 11.0.5 | 이미지 캐러셀 |

### Backend

| 기술 | 버전 | 비고 |
|------|------|------|
| Express.js | 4.18.2 | REST API 서버 |
| TypeScript | 5.3.3 | 서버 사이드 타입 |
| Sequelize | 6.35.2 | MySQL ORM |
| MySQL2 | 3.7.0 | DB 드라이버 |
| Socket.IO | 4.7.4 | 실시간 이벤트 서버 |
| Multer + Cloudinary | — | 이미지 업로드 및 CDN 저장 |
| Bcrypt | 5.1.1 | 비밀번호 해싱 |
| Express Session | — | 세션 기반 인증 (MySQL 세션 스토어) |

### 배포

| 기술 | 비고 |
|------|------|
| Railway | 서버(Express) + MySQL DB 통합 호스팅, Git push 자동 배포 |
| Cloudinary | 이미지 클라우드 스토리지 (게시글·프로필 이미지) |

---

## 🖥 화면 구성

### DB 구조도

![DB 구조도](https://github.com/JHSasdf/NaiClover/assets/146299597/67df4336-e94b-41f4-bdce-4f78747005be)

### 화면 흐름도

![화면 흐름도](https://github.com/JHSasdf/NaiClover/assets/146299597/5bf549dd-ea63-4d6f-8918-6d6961c66fea)

### 주요 화면

| 메인 피드 |
|------|
| <img src="https://github.com/JHSasdf/NaiClover/assets/146299597/0218834d-8969-4f36-b337-b0cdbd89674b" width="300" height="500"/> <img src="https://github.com/JHSasdf/NaiClover/assets/146299597/545177b3-8fd0-4ff8-bcf4-0b2b94b42912" width="300" height="500"/> |

| 로그인 · 회원가입 |
|------|
| <img src="https://github.com/JHSasdf/NaiClover/assets/146299597/4bc3b825-ebdd-4b56-8e6a-b3a0362a965b" width="300" height="500"/> <img src="https://github.com/JHSasdf/NaiClover/assets/146299597/d655b49c-7411-49bc-9d7c-82684efab1b4" width="300" height="500"/> |

| 1:1 채팅 · MonoChat |
|------|
| <img src="https://github.com/JHSasdf/NaiClover/assets/146299597/a0cd10fd-c3e9-4f03-81c6-a8aebb90bbb4" width="300" height="500"/> <img src="https://github.com/JHSasdf/NaiClover/assets/146299597/3b8f8b18-d961-45f0-b158-d7c4d0c72721" width="300" height="500"/> <img src="https://github.com/JHSasdf/NaiClover/assets/146299597/f022aa86-ab4b-40f3-9ca8-2b95a32ee49b" width="300" height="500"/> <img src="https://github.com/JHSasdf/NaiClover/assets/146299597/9d4796b8-b465-47b7-b24a-abdad5074890" width="300" height="500"/> |

| 마이페이지 · SearchUser |
|------|
| <img src="https://github.com/JHSasdf/NaiClover/assets/146299597/1fea4b26-9643-4475-8bf9-b312c2b9deab" width="300" height="500"/> <img src="https://github.com/JHSasdf/NaiClover/assets/146299597/10b21a2b-dcf5-44db-8c9f-2b0ebb1ff5e7" width="300" height="500"/> |

---

## 🚀 시작 가이드

### 요구 사항

- Node.js 20.x
- MySQL 8.x
- Cloudinary 계정

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/JHSasdf/NaiClover.git
cd NaiClover

# 클라이언트 의존성 설치
cd client && npm install

# 서버 의존성 설치
cd ../server && npm install
```

### 환경변수 설정

`server/.env` 파일을 생성하고 아래 값을 채워주세요.

```env
# MySQL 접속 정보
MYSQLUSERNAME=root
MYSQLUSERPASSWORD=your_password
DATABASENAME=naiclover
SERVERIPNO=localhost
MYSQLPORT=3306

# 서버 설정
SERVERPORT=4000
SERVERURL=http://localhost:4000
CLIENTURL=http://localhost:3000
SECRETKEY=your-secret-key-32-chars-or-more

# Cloudinary (이미지 업로드용)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

`client/.env` 파일을 생성하세요.

```env
REACT_APP_SERVERURL=http://localhost:4000
```

### 개발 서버 실행

```bash
# 클라이언트 (포트 3000)
cd client && npm start

# 서버 (포트 4000)
cd server && npm start

# 더미 데이터 시딩 (선택)
cd server && npm run seed
```

---

## 📁 폴더 구조

```
NaiClover/
├── client/                   # 프론트엔드 (React + TypeScript)
│   └── src/
│       ├── pages/            # 라우트 단위 페이지 컴포넌트 (18개)
│       ├── components/       # 도메인별 UI 컴포넌트 (40+개)
│       │   ├── postspage/
│       │   ├── postdetailpage/
│       │   ├── Mypage/
│       │   ├── alertpage/
│       │   ├── Modals/
│       │   └── chat/
│       ├── styles/           # SCSS 파일 (컴포넌트 1:1 매핑)
│       ├── types/            # TypeScript 인터페이스
│       └── utils/            # 날짜 포맷, 이미지 URL 변환 유틸
│
└── server/                   # 백엔드 (Express + TypeScript)
    ├── model/                # Sequelize 모델 (16개)
    ├── controllers/          # 비즈니스 로직 (8개)
    ├── routes/               # API 라우트 (8개)
    ├── config/               # DB, 세션, Multer/Cloudinary 설정
    ├── middlewares/          # 에러 핸들링
    ├── utils/                # 채팅방·메시지 생성 유틸
    └── app.ts                # Express + Socket.IO 서버 진입점
```

---

## 👥 팀 소개

| 이름 | 역할 | 담당 |
|------|------|------|
| 김재현 | 프론트엔드 | 마이페이지, SearchUser 페이지, 채팅 프론트, 푸터, 채팅 자동 스크롤 로직 |
| 이시윤 | 프론트엔드 | Post 페이지, 포스트 작성/삭제, 댓글, 포스트 검색 |
| 한우리 | 풀스택 | 팔로우 백엔드, 알림 기능, Sequelize 구조 설계, Correcting 페이지, ErrorLog 페이지 |
| 윤정훈 | 풀스택 | 채팅 로직, MonoChat 언어 제한, 팔로잉/팔로워 인원 로직 |
| 선지훈 | 풀스택 | 회원가입/로그인, 마이페이지 백엔드, 개인채팅/모노채팅 백엔드, 버그 수정, 오류 페이지, 서버 구축 및 배포 |

> 팀 프로젝트 완료 후 **김재현**이 UI/UX 리팩토링, 버그 수정, 기능 추가를 단독으로 진행 중

---

## 📝 버전 히스토리

### v1.1

- 그룹 채팅방 뒤로가기 시 현재 접속 인원 미반영 버그 수정
- ErrorLog 작성 후 새로고침 없이 즉시 반영되도록 수정
- 언어 포스트 댓글 삭제 버그 수정
- 마이페이지 팔로우 목록에서 상대방 이름 대신 내 이름이 표시되던 버그 수정
- 마이페이지 내 포스트에서 이름 대신 ID가 표시되던 버그 수정

### v1.2 (개인 리팩토링)

- 전체 폰트 시스템 통일 (`Font.scss` 기준 정비)
- 헤더·푸터·본문 컨테이너 폭 일관성 통일
- 국기 이미지 렌더링 오류 수정
- Socket.IO 이벤트 리스너 누수 수정 (`useEffect` cleanup 처리)
- `getPersonalRooms` 빈 채팅방 정렬 crash 수정
- 알림 삭제 기능 추가 (백엔드 API + 프론트 UI)
- 게시글 수정 페이지 추가 (`EditPostPage`)
- 마이페이지 클라이언트 유효성 검사 강화
- 로그인/회원가입 페이지 UI 리디자인
- AWS EC2 → Railway 플랫폼 전환, 이미지 스토리지 Cloudinary 마이그레이션

---

## 관련 링크

- **API 문서:** [Notion API 명세](https://checker-mantis-1cc.notion.site/naiClover-API-9394d7d1d1564d92a78fe17d050ca4aa)
- **프로젝트 회고:** [블로그](https://kimsunji.tistory.com/35)
