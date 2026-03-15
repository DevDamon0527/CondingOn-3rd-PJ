# NaiClover — 다이어그램 모음

> 이 파일은 `NAICLOVER_PORTFOLIO.md`에서 분리된 다이어그램 전용 파일입니다.

---

## 1. DB 구조도 (추정 ERD)

```mermaid
erDiagram
    User {
        string userid PK
        string password
        string name
        string gender
        string nation
        string profileImgPath
        string introduction
        string firLang
    }
    Lang {
        int index PK
        string userid FK
        string language
    }
    Post {
        int postId PK
        string userid FK
        string postType
        text content
        datetime createdAt
        datetime updatedAt
    }
    LangPost {
        int postId PK
        string userid FK
        string postType
        text content
        datetime createdAt
        datetime updatedAt
    }
    PostImages {
        string path PK
        int postId FK
        string userid FK
    }
    Comment {
        int index PK
        int postId FK
        string userid FK
        text content
        boolean isrevised
        datetime createdAt
    }
    LangComment {
        int index PK
        int postId FK
        string userid FK
        text content
        boolean isrevised
        datetime createdAt
    }
    PostLike {
        int postId FK
        string userid FK
    }
    LangPostLike {
        int postId FK
        string userid FK
    }
    Follow {
        int index PK
        string userid FK
        string followerId FK
    }
    Room {
        string roomNum PK
        string roomName
        string userid FK
        string useridTo
        string restrictedLang
    }
    Chat {
        int chatIndex PK
        string roomNum FK
        string userid FK
        string toWhom
        text content
        boolean isrevised
        boolean isFirst
        datetime createdAt
    }
    ChatCount {
        int index PK
        string roomNum FK
        int chatIndex FK
        string userid FK
        string useridTo
    }
    CurrentNOPIM {
        int index PK
        string roomNum FK
        int count
    }
    Alarm {
        int index PK
        string userid FK
        string otherUserId
        string option1
        string option2
        int alarmType
        boolean checked
    }

    User ||--o{ Lang : "학습 언어 등록"
    User ||--o{ Post : "문화 포스트 작성"
    User ||--o{ LangPost : "언어 포스트 작성"
    User ||--o{ Comment : "댓글 작성"
    User ||--o{ LangComment : "댓글 작성"
    User ||--o{ Follow : "팔로우(주체 userid)"
    User ||--o{ Follow : "팔로우(대상 followerId)"
    User ||--o{ Room : "채팅방 생성"
    User ||--o{ Chat : "메시지 발신"
    User ||--o{ Alarm : "알림 수신"
    Post ||--o{ Comment : "댓글"
    Post ||--o{ PostLike : "좋아요"
    Post ||--o{ PostImages : "이미지"
    LangPost ||--o{ LangComment : "댓글"
    LangPost ||--o{ LangPostLike : "좋아요"
    Room ||--o{ Chat : "메시지 저장"
    Room ||--o{ ChatCount : "읽음 추적"
    Room ||--o{ CurrentNOPIM : "참가자 수"
```

---

## 2. 화면 흐름도

```mermaid
flowchart TD
    A([앱 진입]) --> B{로그인 여부}
    B -->|미인증| C[LoginPage\n/login]
    B -->|인증됨| POSTS[PostsPage\n/posts\n메인 피드]

    C --> SIGNUP[SignupPage\n/signup]
    C --> POSTS

    POSTS --> NP[NewPostPage\n/newpost\n포스트 작성]
    POSTS --> CPD[CulturePostDetailPage\n/c-postdetail/:id]
    POSTS --> LPD[LanguagePostDetailPage\n/l-postdetail/:id]
    POSTS --> SU[SearchUser\n/searchuser/:userid]
    POSTS --> AL[AlertPage\n/alert]
    POSTS --> MP[Mypage\n/mypage]
    POSTS --> PC[PersonalChat\n/message]
    POSTS --> MC[MonoChatPage\n/monochat]
    POSTS --> EL[ErrorLogPage\n/errorlog]

    CPD --> CEP[EditPostPage\n/c-postedit/:id]
    CPD --> CCP[CultureCorrectingPage\n/c-postdetail/:id/correcting]
    LPD --> LEP[EditPostPage\n/l-postedit/:id]
    LPD --> LCP[LanguageCorrectingPage\n/l-postdetail/:id/correcting]

    MP --> OPT[MypageOption\n/mypage/option]
    OPT --> PWD[MypageEditPassword\n/mypage/edit/password]
    OPT --> LANG[MypageEditLanguage\n/mypage/edit/Language]
    OPT --> IMG[MulterMypage\n/multermypage]

    PC --> CR[NewPage\n/chat/:roomId\n1:1 채팅방]
    CR --> CCR[ChatCorrectingPage\n/chat/.../correcting]

    MC --> MAIN[MainPage\n/mainpage\n채팅방 관리]

    style POSTS fill:#4CAF50,color:#fff
    style CR fill:#2196F3,color:#fff
    style MAIN fill:#2196F3,color:#fff
    style EL fill:#FF9800,color:#fff
    style AL fill:#FF9800,color:#fff
```

---

## 3. 프론트엔드 아키텍처 다이어그램

```mermaid
graph TD
    subgraph Router["App.tsx — React Router DOM"]
        R[클라이언트 사이드 라우팅\n24개 라우트 정의]
    end

    subgraph Pages["Pages (18개)"]
        PP[PostsPage]
        MP[Mypage]
        SU[SearchUser]
        NP_[NewPage\n1:1채팅]
        MCP[MonoChatPage]
        AP[AlertPage]
        ELP[ErrorLogPage]
    end

    subgraph Components["Components (40+)"]
        POSTCARD[CulturePost / LanguagePost\n포스트 카드]
        COMMENT[Comment / RevisedComment\n댓글]
        PROFILE[MypageProfile / SearchUserProfile\n프로필]
        CHAT[PersonalChatList / MonoChatList\n채팅 목록]
        ALERT_C[FollowAlert / CommentAlert\nPostAlert / MonotalkAlert]
        MODAL[ConfirmModal / DeleteModal\nFollowModal / CreateMonoChatModal]
        HEADER[PostsHeader / MypageHeader 등\n페이지별 헤더]
        COMMON[Footer / Topbar\n공통 UI]
    end

    subgraph DataLayer["Data Layer"]
        AXIOS[Axios\nREST API 호출]
        SOCKET[Socket.IO Client\n실시간 채팅]
        COOKIE[js-cookie\n세션 인증]
    end

    subgraph Utils["Utils"]
        DATE[getCurrentData.ts\n날짜 포맷]
        COOKIE_CONF[cookieConfig.ts\n쿠키 설정]
    end

    subgraph Backend["Backend (Express + Sequelize)"]
        REST[REST API\n포스트/댓글/팔로우/마이페이지/검색]
        WS[Socket.IO Server\n채팅 이벤트]
        DB[MySQL\n16개 테이블]
    end

    Router --> Pages
    Pages --> Components
    Pages --> DataLayer
    Components --> DataLayer
    DataLayer --> AXIOS
    DataLayer --> SOCKET
    DataLayer --> COOKIE
    Pages --> Utils

    AXIOS --> REST
    SOCKET --> WS
    REST --> DB
    WS --> DB
```

---

## 4. 실시간 채팅 데이터 흐름

```mermaid
sequenceDiagram
    participant U1 as 사용자 A (발신)
    participant C as NewPage.tsx
    participant S as Socket.IO Client
    participant SRV as Socket.IO Server (app.ts)
    participant DB as MySQL (Chat, ChatCount)
    participant U2 as 사용자 B (수신)

    U1->>C: 메시지 입력 + 전송 버튼 클릭
    C->>S: emit('chat message', payload)
    S->>SRV: 소켓 이벤트 전달
    SRV->>DB: createChatDb() — Chat 테이블 저장
    SRV->>DB: ChatCount 테이블 읽음 상태 초기화
    SRV-->>U2: broadcast to room — 메시지 수신
    SRV-->>C: emit('needReload') — UI 업데이트 트리거
    C->>C: 채팅 목록 상태 업데이트
```

---

## 5. 알림 시스템 흐름

```mermaid
flowchart LR
    subgraph Triggers["알림 트리거 이벤트"]
        T1[팔로우 발생\nalarmType=1]
        T2[포스트 댓글\nalarmType=2]
        T3[포스트 좋아요\nalarmType=3]
        T4[댓글 교정\nalarmType=4]
        T5[MonoChat 메시지\nalarmType=5]
    end

    subgraph Server["서버 처리"]
        AC[Alarm 테이블\nINSERT]
    end

    subgraph Client["클라이언트"]
        BADGE[미확인 알림 수 뱃지\nGET /newAlarmNumGet]
        LIST[AlertPage\nGET /getAlarmList]
        DEL[개별 삭제\nDELETE /alarm/:index]
    end

    subgraph Components_A["알림 컴포넌트 분기"]
        FA[FollowAlert]
        CA[CommentAlert]
        PA[PostAlert]
        MA[MonotalkAlert]
    end

    T1 & T2 & T3 & T4 & T5 --> AC
    AC --> BADGE
    BADGE --> LIST
    LIST --> FA & CA & PA & MA
    LIST --> DEL
```
