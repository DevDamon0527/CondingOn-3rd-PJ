# NaiClover 로컬 개발 환경 실행 가이드

> 작성 기준: 2026-03 복구 작업
> 대상: 프론트엔드 담당자 (마이페이지, SearchUser, 채팅 프론트)

---

## 빠른 시작 요약

```
1. MySQL 로컬 설치 + DB 생성
2. server/.env 설정 (MySQL 비밀번호 입력)
3. 터미널 두 개 열어서 서버/클라이언트 각각 실행
```

---

## 1. 사전 준비

### Node.js / npm

- Node.js 20.x 이하 권장 (README 기준: 20.9.0)
- npm 10.x

### MySQL

로컬에 MySQL이 설치되어 있어야 합니다.

```bash
# macOS (Homebrew)
brew install mysql
brew services start mysql

# Windows
# MySQL Installer(공식 사이트)에서 설치하거나 XAMPP 사용
```

MySQL 설치 후 DB 생성:

```sql
CREATE DATABASE naiclover CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Sequelize가 서버 시작 시 테이블을 자동 생성합니다 (`sync({ force: false })`).

---

## 2. 환경변수 설정

### server/.env

`server/.env` 파일이 이미 생성되어 있습니다. MySQL 비밀번호만 본인 환경에 맞게 수정하세요.

```env
MYSQLUSERNAME=root
MYSQLUSERPASSWORD=여기에_본인_MySQL_비밀번호
DATABASENAME=naiclover
MYSQLPORT=3306
SERVERIPNO=localhost
SERVERPORT=4000
SERVERURL=http://localhost:4000
CLIENTURL=http://localhost:3000
SECRETKEY=local-dev-secret-key-change-in-production
```

### client/.env

`client/.env`도 이미 생성되어 있습니다. 기본값 그대로 사용 가능합니다.

```env
REACT_APP_SERVERURL=http://localhost:4000
```

---

## 3. 의존성 설치

```bash
# 프론트엔드
cd client
npm install

# 백엔드
cd ../server
npm install
```

> node_modules가 이미 있으면 생략해도 됩니다.

---

## 4. 실행

**터미널 1 — 백엔드 서버**

```bash
cd server
npm start
# → http://localhost:4000 에서 실행
# → MySQL 연결 성공 시 "Server is running on http://localhost:4000" 출력
```

**터미널 2 — 프론트엔드**

```bash
cd client
npm start
# → http://localhost:3000 에서 자동으로 브라우저 열림
# → 백엔드 proxy: package.json의 "proxy": "http://localhost:4000" 설정으로 자동 연결
```

---

## 5. 포트 정리

| 서비스 | 포트 | 비고 |
|--------|------|------|
| 프론트엔드 (React) | 3000 | react-scripts 기본값 |
| 백엔드 (Express) | 4000 | server/.env의 SERVERPORT |
| MySQL | 3306 | 기본값 |
| Socket.io | 4000 | 백엔드 포트와 동일 |

---

## 6. 문제 해결

### 서버가 DB 연결 실패로 안 뜰 때

```
Error: Access denied for user 'root'@'localhost'
```

→ `server/.env`의 `MYSQLUSERPASSWORD` 확인

```
Error: Unknown database 'naiclover'
```

→ MySQL에서 `CREATE DATABASE naiclover;` 실행

### 프론트에서 API 요청이 실패할 때

- 백엔드가 4000 포트에서 실행 중인지 확인
- `client/.env`의 `REACT_APP_SERVERURL=http://localhost:4000` 확인
- 브라우저 개발자도구 > Network 탭에서 요청 URL 확인

### MySQL이 로컬에 없을 때 (프론트만 확인하고 싶을 때)

백엔드 없이 프론트만 실행하면 API 요청은 실패하지만 화면 구조는 확인 가능합니다.

```bash
cd client
npm start
```

---

## 7. 프로젝트 구조 요약

```
CondingOn-3rd-PJ/
├── client/                  # 프론트엔드 (React 18 + TypeScript)
│   ├── src/
│   │   ├── App.tsx          # 라우팅 정의
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── components/      # 재사용 컴포넌트
│   │   ├── utils/           # 유틸리티 함수
│   │   └── styles/          # SCSS 스타일
│   └── public/
└── server/                  # 백엔드 (Express + TypeScript)
    ├── app.ts               # 진입점 (Express + Socket.io 설정)
    ├── routes/              # API 라우트
    ├── controllers/         # 비즈니스 로직
    ├── model/               # Sequelize DB 모델
    ├── config/              # DB, 세션, 파일 업로드 설정
    └── public/              # 업로드된 이미지 저장 (mypage/, posts/)
```

---

## 8. 페이지 및 라우팅

| URL | 페이지 | 담당 영역 |
|-----|--------|-----------|
| `/` | LoginPage (비로그인) / PostsPage (로그인) | |
| `/login` | LoginPage | |
| `/signup` | SignupPage | |
| `/posts` | PostsPage | |
| `/mypage` | Mypage | **내 담당** |
| `/mypage/option` | MypageOption | **내 담당** |
| `/mypage/edit/password` | MypageEditPassword | **내 담당** |
| `/mypage/edit/Language` | MypageEditLanguage | **내 담당** |
| `/searchuser/:userid` | SearchUser | **내 담당** |
| `/message` | PersonalChat | **내 담당** |
| `/chat/:roomId` | ChatRoomPage | **내 담당** |
| `/monochat` | MonoChatPage | |
| `/c-postdetail/:id` | CulturePostDetailPage | |
| `/l-postdetail/:id` | LanguagePostDetailPage | |
| `/alert` | AlertPage | |
| `/errorlog` | ErrorLogPage | |

---

## 9. API 서버 주소 관리 방식

모든 axios 요청은 `process.env.REACT_APP_SERVERURL`을 prefix로 사용합니다.

```typescript
// 예시
axios.get(`${process.env.REACT_APP_SERVERURL}/getMyPage`)
```

- 로컬: `http://localhost:4000`
- 운영: `http://3.34.47.72` (현재 내려간 상태)

---

## 10. 배포 vs 로컬 차이점

| 항목 | 운영 (과거) | 로컬 |
|------|-------------|------|
| 서버 | AWS EC2 + Nginx + PM2 | `npm start` |
| 프론트 | 빌드 후 Express가 서빙 | `react-scripts start` 직접 |
| DB | AWS RDS or EC2 MySQL | 로컬 MySQL |
| 포트 | 80 (Nginx 프록시) | 3000 / 4000 |
| CORS | EC2 IP 기준 | localhost 기준 |
