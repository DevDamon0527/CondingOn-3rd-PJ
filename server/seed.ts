/**
 * 개발용 더미데이터 seed 스크립트
 *
 * 실행: npx ts-node seed.ts
 * 재실행 안전: findOrCreate / 중복 체크로 멱등성 보장
 * 개발 공통 비밀번호: dev1234!
 */

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { db } from './model';

const {
    User, Lang, Post, LangPost, PostImages,
    Follow, Room, Chat, CurrentNOPIM,
} = db;

const DEV_PASSWORD = 'dev1234!';

// ──────────────────────────────────────────────────────────
// 메인
// ──────────────────────────────────────────────────────────
async function main() {
    await db.sequelize.authenticate();
    console.log('✅ DB 연결 성공\n');

    const hashedPw = await bcrypt.hash(DEV_PASSWORD, 10);

    // ── 0. 시스템 플레이스홀더 유저 ────────────────────────
    // Room.useridTo FK 제약: 단체방(mono)은 'monoChat'을 식별자로 사용하므로
    // 해당 userid가 User 테이블에 반드시 존재해야 함
    console.log('── [0] 시스템 유저 ──');
    const [, monoCreated] = await User.findOrCreate({
        where: { userid: 'monoChat' },
        defaults: {
            userid: 'monoChat',
            password: await bcrypt.hash('__system__', 10),
            name: 'monoChat',
            gender: 'M',
            nation: 'System',
            firLang: 'Korean',
            profileImgPath: '/public/mypage/default.png',
        },
    });
    console.log(monoCreated ? '  ✅ 생성: monoChat (시스템)' : '  ⏭  이미 존재: monoChat');

    // ── 1. 유저 3명 ────────────────────────────────────────
    console.log('── [1] 유저 생성 ──');
    const usersData = [
        {
            userid: 'seed_yuna_kr',
            password: hashedPw,
            name: '김유나',
            gender: 'F',
            nation: 'Korean',
            firLang: 'Korean',
            profileImgPath: '/public/mypage/default.png',
            introduction:
                '안녕하세요! 일본어를 배우고 있는 대학원생 유나입니다 😊\n' +
                '애니메이션과 일드로 시작했지만 이제는 실제 회화까지 도전 중이에요.\n' +
                '영어도 같이 연습하고 싶어요. 한국어 교환 파트너 언제든 환영합니다!',
        },
        {
            userid: 'seed_james_us',
            password: hashedPw,
            name: 'James Park',
            gender: 'M',
            nation: 'American',
            firLang: 'English',
            profileImgPath: '/public/mypage/default.png',
            introduction:
                'Hi! 한국계 미국인으로 서울 거주 중인 James예요.\n' +
                '한국어 공부 2년 차, 특히 사투리가 재밌어요.\n' +
                '영어 도움 필요하신 분 편하게 연락주세요!',
        },
        {
            userid: 'seed_mei_cn',
            password: hashedPw,
            name: '리메이',
            gender: 'F',
            nation: 'Chinese',
            firLang: 'Chinese',
            profileImgPath: '/public/mypage/default.png',
            introduction:
                '你好! 한국 교환학생 중인 메이입니다.\n' +
                '한국 드라마 덕분에 한국어 공부 시작했어요.\n' +
                '중국어 회화 가르쳐드릴 수 있어요. 같이 언어 교환해요~',
        },
    ];

    for (const u of usersData) {
        const [, created] = await User.findOrCreate({
            where: { userid: u.userid },
            defaults: u,
        });
        console.log(created ? `  ✅ 생성: ${u.userid}` : `  ⏭  이미 존재: ${u.userid}`);
    }

    // ── 2. 학습 언어 ────────────────────────────────────────
    console.log('\n── [2] 학습 언어 ──');
    const langsData = [
        { userid: 'seed_yuna_kr',  learningLang: 'Japanese' },
        { userid: 'seed_yuna_kr',  learningLang: 'English'  },
        { userid: 'seed_james_us', learningLang: 'Korean'   },
        { userid: 'seed_mei_cn',   learningLang: 'Korean'   },
        { userid: 'seed_mei_cn',   learningLang: 'Japanese' },
    ];

    for (const l of langsData) {
        const exists = await Lang.findOne({ where: l });
        if (!exists) {
            await Lang.create(l);
            console.log(`  ✅ ${l.userid} → ${l.learningLang}`);
        } else {
            console.log(`  ⏭  이미 존재: ${l.userid} → ${l.learningLang}`);
        }
    }

    // ── 3. 언어 게시글 (각 4개) ─────────────────────────────
    console.log('\n── [3] 언어 게시글 ──');
    const langPostsData = [
        // 김유나
        {
            userid: 'seed_yuna_kr', postType: 'l',
            content: '일본어로 자기소개 연습 중인데 틀린 부분 고쳐주실 분 계신가요?\n「私はユナです。大学院で教育学を勉強しています。趣味はアニメを見ることとカフェ巡りです。」\n자연스러운지 피드백 부탁드려요!',
        },
        {
            userid: 'seed_yuna_kr', postType: 'l',
            content: '일본어 경어(敬語)가 진짜 어렵네요. 친한 친구한테 쓰는 말과 직장·공식 자리에서 쓰는 표현이 완전히 달라지잖아요. 한국어 존댓말이랑 비슷하면서도 달라서 헷갈려요. 일본어 원어민분들은 경어 어떻게 마스터했는지 궁금해요 😅',
        },
        {
            userid: 'seed_yuna_kr', postType: 'l',
            content: '영어 이메일 쓸 때 어색한 표현들이 있어요. "I hope this email finds you well" 같은 표현 요즘도 자연스러운가요? 아니면 더 캐주얼하게 시작하는 게 좋을까요? 교수님께 보내는 이메일 vs 회사 이메일 차이도 알고 싶어요.',
        },
        {
            userid: 'seed_yuna_kr', postType: 'l',
            content: '외국인 친구들이 한국어 배울 때 받침이 제일 어렵다고 하더라고요. "국어"가 "구거"로 소리나는 연음 규칙이 특히 헷갈린다고 해요. 한국어 공부하시는 분들 어떤 부분이 제일 어려웠나요? 일본어 배우면서 비슷한 고민을 했어서 공감해드릴 수 있을 것 같아요.',
        },
        // James Park
        {
            userid: 'seed_james_us', postType: 'l',
            content: '한국어 공부 2년 차인데 아직도 "에" vs "에서" 구분이 헷갈려요. "집에 가요"는 되고 "집에서 가요"는 어색하다는데... 장소 조사 정리해봐요! 저는 영어로도 설명해드릴 수 있어요 😄',
        },
        {
            userid: 'seed_james_us', postType: 'l',
            content: 'Hello everyone! 영어 발음 교정 도와드릴 수 있어요. 한국분들이 어려워하는 R/L 구분, TH 발음, intonation 같이 연습해봐요. 저도 한국어 발음 피드백 받고 싶어요. 교환해요 🙌',
        },
        {
            userid: 'seed_james_us', postType: 'l',
            content: '한국어 관용표현이 재밌어요. "발이 넓다"가 인맥이 넓다는 뜻인 거 처음 알았을 때 신기했어요. "눈이 높다"도 그렇고요. 영어에도 신체 관련 idiom이 많은데 언어마다 달라서 재밌지 않나요?',
        },
        {
            userid: 'seed_james_us', postType: 'l',
            content: '미국 영어 vs 영국 영어 차이 궁금한 분들 있나요? color/colour, elevator/lift 같은 단어 차이 말고도 발음·문화 뉘앙스도 꽤 달라요. 한국 교과서는 미국 영어 기준인데 영국 드라마 보다가 혼란스러웠던 경험 있으신 분?',
        },
        // 리메이
        {
            userid: 'seed_mei_cn', postType: 'l',
            content: '중국어 성조 때문에 포기하셨던 분들 계세요? 저는 한국어 배울 때 존댓말/반말 체계가 제일 어려웠어요. 중국어 4성 연습 팁 알려드릴 수 있어요 ~ 한국어 표현법도 같이 배워요!',
        },
        {
            userid: 'seed_mei_cn', postType: 'l',
            content: '한국어 "ㅇㅈ", "ㄱㅅ" 같은 줄임말이 아직도 어려워요. 카톡에서 친구들이 쓰는 줄임말 다 알고 싶어요! 자주 쓰는 줄임말 정리해서 알려주실 분 계세요?',
        },
        {
            userid: 'seed_mei_cn', postType: 'l',
            content: '중국어와 한국어 한자어 공통점 찾는 게 재밌어요. "학교(學校)", "도서관(圖書館)" 같은 단어들은 한자가 같아서 의미 파악이 쉬워요. 한자 공부하면 중·일·한 어휘력이 동시에 는다고 생각해요. 다들 어떻게 생각하세요?',
        },
        {
            userid: 'seed_mei_cn', postType: 'l',
            content: '要不要交换语言? 중국어 가르쳐드릴 수 있고, 한국어 or 일본어 배우고 싶어요. 일상 회화 위주로 주말 화상통화 30분씩 교환하는 거 어떨까요? 관심 있으신 분 댓글 달아주세요 😊',
        },
    ];

    for (const p of langPostsData) {
        const allByUser = await LangPost.findAll({ where: { userid: p.userid } });
        const exists = (allByUser as any[]).some((r: any) => r.content === p.content);
        if (!exists) {
            await LangPost.create(p);
            console.log(`  ✅ LangPost: ${p.userid}`);
        } else {
            console.log(`  ⏭  이미 존재: ${p.userid} 언어글`);
        }
    }

    // ── 4. 문화 게시글 (각 3개) + 이미지 ───────────────────
    console.log('\n── [4] 문화 게시글 + 이미지 ──');
    const cultureData = [
        // 김유나
        {
            post: { userid: 'seed_yuna_kr', postType: 'c', content: '일본 편의점 문화가 진짜 신기해요. 한국 편의점도 엄청 발달했지만 일본은 레벨이 달라요. 오니기리 종류만 수십 가지, 계절 한정 상품도 자주 바뀌고... 특히 겨울 おでん(오뎅) 코너가 너무 그리워요. 여러분이 경험한 일본 편의점 추천 아이템 알려주세요!' },
            images: ['/public/posts/seed_konbini.jpg'],
        },
        {
            post: { userid: 'seed_yuna_kr', postType: 'c', content: '한국의 "눈치" 문화를 외국 친구들한테 설명하기가 너무 어려워요. 직접 말 안 해도 상황 파악하고 배려하는 것... 영어로 딱 맞는 번역이 없잖아요. 일본 친구는 "KY(空気が読めない)" 문화랑 비슷하다고 하더라고요. 여러분 나라에도 이런 암묵적 규칙이 있나요?' },
            images: ['/public/posts/seed_nunchi1.jpg', '/public/posts/seed_nunchi2.jpg'],
        },
        {
            post: { userid: 'seed_yuna_kr', postType: 'c', content: '요즘 한국 카페 문화 정말 재밌어요. 테마 카페, 북카페, 루프탑 카페... 카공족 문화도 완전히 자리잡았잖아요. 외국 친구들은 카페에서 몇 시간씩 앉아있어도 눈치 안 주는 게 신기하다고 해요. 카페 어떻게 활용하세요?' },
            images: ['/public/posts/seed_cafe.jpg'],
        },
        // James Park
        {
            post: { userid: 'seed_james_us', postType: 'c', content: '미국에서 한국 왔을 때 제일 충격이었던 건 배달 문화예요. 치킨이 30분 만에 오다니! 미국은 피자도 45분~1시간이 기본인데... 쿠팡이츠, 배달의민족 쓰다 보니 미국 돌아가면 어떻게 살지 걱정이에요 😂 한국 배달 문화 진짜 최고예요.' },
            images: ['/public/posts/seed_delivery.jpg'],
        },
        {
            post: { userid: 'seed_james_us', postType: 'c', content: '한국에서 두 손으로 물건 드리거나 받는 예절, 처음엔 몰랐어요. 한 손으로 드렸다가 친구한테 귀띔 받고 그다음부터 신경 쓰게 됐어요. 미국은 이런 예절이 없는데 이런 작은 차이들을 배우는 게 재밌어요. 여러분 나라만의 독특한 예절 문화 있나요?' },
            images: ['/public/posts/seed_manner1.jpg', '/public/posts/seed_manner2.jpg'],
        },
        {
            post: { userid: 'seed_james_us', postType: 'c', content: '추석 처음 경험했을 때 정말 인상적이었어요. 한복 입은 사람들, 차례 지내는 모습, 온 가족이 모여 전 부치는 냄새... 미국 추수감사절이랑 비슷하면서도 달라요. 갈비찜, 잡채, 송편 다 손으로 직접 만드는 거잖아요. 명절 음식 뭐가 제일 좋아요?' },
            images: ['/public/posts/seed_chuseok.jpg'],
        },
        // 리메이
        {
            post: { userid: 'seed_mei_cn', postType: 'c', content: '중국 춘절(春節) 문화 소개할게요! 한국 설날이랑 비슷하지만 규모가 달라요. 폭죽 소리가 밤새 들리고, 红包(훙바오) 세뱃돈 봉투를 나눠요. 요즘은 WeChat 디지털 훙바오가 대세예요. 한국 세뱃돈 문화랑 어떻게 다른지 비교해봐요!' },
            images: ['/public/posts/seed_chunje1.jpg', '/public/posts/seed_chunje2.jpg'],
        },
        {
            post: { userid: 'seed_mei_cn', postType: 'c', content: '한국 치맥 문화가 중국에도 퍼졌다는 거 알고 계세요? K드라마 영향으로 중국 젊은 세대 사이에서 치킨+맥주가 유행이에요. 근데 중국에서 진짜 한국 치킨 소스 구하기가 어려워서... 한국 오면 제일 먼저 치맥 하러 갔어요! 한국 음식 중에 중국에서 유명해진 거 또 있으면 알려주세요.' },
            images: ['/public/posts/seed_chimac.jpg'],
        },
        {
            post: { userid: 'seed_mei_cn', postType: 'c', content: '한국에 와서 제일 놀란 점이 "빨리빨리" 문화예요. 음식도 빨리 나오고, 인터넷도 빠르고, 걷는 속도도 빨라요. 처음엔 당황했지만 이제 오히려 좋아요. 기다리는 스트레스가 없잖아요. 여러분 나라는 "빠름" vs "느림" 문화 어느 쪽인가요?' },
            images: ['/public/posts/seed_ppalri1.jpg', '/public/posts/seed_ppalri2.jpg'],
        },
    ];

    for (const item of cultureData) {
        const allByUser = await Post.findAll({ where: { userid: item.post.userid } });
        const exists = (allByUser as any[]).some((r: any) => r.content === item.post.content);
        if (!exists) {
            const newPost: any = await Post.create(item.post);
            for (const imgPath of item.images) {
                await PostImages.create({
                    postId: newPost.postId,
                    userid: item.post.userid,
                    path: imgPath,
                });
            }
            console.log(`  ✅ Post: ${item.post.userid} (이미지 ${item.images.length}개)`);
        } else {
            console.log(`  ⏭  이미 존재: ${item.post.userid} 문화글`);
        }
    }

    // ── 5. 팔로우 ──────────────────────────────────────────
    console.log('\n── [5] 팔로우 관계 ──');
    // userid = 팔로우 당하는 사람, followerId = 팔로우 하는 사람
    const followPairs = [
        { userid: 'seed_yuna_kr',  followerId: 'seed_james_us' }, // james → yuna
        { userid: 'seed_yuna_kr',  followerId: 'seed_mei_cn'   }, // mei → yuna
        { userid: 'seed_james_us', followerId: 'seed_yuna_kr'  }, // yuna → james
        { userid: 'seed_james_us', followerId: 'seed_mei_cn'   }, // mei → james
        { userid: 'seed_mei_cn',   followerId: 'seed_yuna_kr'  }, // yuna → mei
        // 기존 유저와의 관계는 아래에서 동적으로 추가
    ];

    // seed 유저 외 기존 유저 1명 찾아서 팔로우 관계 추가
    const existingUser: any = await User.findOne({
        where: { userid: { [Op.notLike]: 'seed_%' } },
    });
    if (existingUser) {
        followPairs.push(
            { userid: existingUser.userid, followerId: 'seed_yuna_kr'  },
            { userid: 'seed_james_us',     followerId: existingUser.userid },
        );
        console.log(`  기존 유저 발견: ${existingUser.userid} — 팔로우 관계에 포함`);
    }

    for (const f of followPairs) {
        const exists = await Follow.findOne({ where: f });
        if (!exists) {
            await Follow.create(f);
            console.log(`  ✅ ${f.followerId} → ${f.userid}`);
        } else {
            console.log(`  ⏭  이미 존재: ${f.followerId} → ${f.userid}`);
        }
    }

    // ── 6. 1:1 채팅방 + 메시지 ────────────────────────────
    console.log('\n── [6] 1:1 채팅 ──');
    const personalRooms = [
        {
            room: {
                roomNum: 'seed_room_yuna_james',
                roomName: '김유나,James Park',
                userid: 'seed_yuna_kr',
                useridTo: 'seed_james_us',
                restrictedLang: null,
            },
            chats: [
                { userid: 'seed_yuna_kr',  toWhom: 'seed_james_us', content: '안녕하세요 James씨! 영어 공부하고 싶어서 연락드렸어요. 혹시 한국어 교환 관심 있으세요?',                         isrevised: false, isFirst: true  },
                { userid: 'seed_james_us', toWhom: 'seed_yuna_kr',  content: '안녕하세요! 물론이죠, 저도 마침 회화 파트너 찾고 있었어요 😄 언제 시작할까요?',                              isrevised: false, isFirst: false },
                { userid: 'seed_yuna_kr',  toWhom: 'seed_james_us', content: '이번 주 토요일 오후 화상통화 어떠세요? 각자 30분씩 번갈아서 하는 거요!',                                       isrevised: false, isFirst: false },
                { userid: 'seed_james_us', toWhom: 'seed_yuna_kr',  content: '좋아요! 토요일 오후 3시 괜찮으세요? 준비할 주제 있으면 미리 알려주세요~',                                       isrevised: false, isFirst: false },
                { userid: 'seed_yuna_kr',  toWhom: 'seed_james_us', content: '완벽해요! 저는 영어 이메일 표현 여쭤보고 싶어요. James씨는 어떤 한국어 주제 원하세요?',                          isrevised: false, isFirst: false },
                { userid: 'seed_james_us', toWhom: 'seed_yuna_kr',  content: '저는 요즘 "이/가" vs "은/는" 차이가 헷갈려요. 그거 설명해주시면 좋겠어요!',                                    isrevised: false, isFirst: false },
            ],
        },
        {
            room: {
                roomNum: 'seed_room_mei_yuna',
                roomName: '리메이,김유나',
                userid: 'seed_mei_cn',
                useridTo: 'seed_yuna_kr',
                restrictedLang: null,
            },
            chats: [
                { userid: 'seed_mei_cn',  toWhom: 'seed_yuna_kr', content: '유나씨 안녕하세요! 게시글 잘 읽었어요. 일본어랑 중국어 둘 다 배우고 싶으신 거예요?', isrevised: false, isFirst: true  },
                { userid: 'seed_yuna_kr', toWhom: 'seed_mei_cn',  content: '네 맞아요! 메이씨는 중국어 원어민이시죠? 한자 좀 알아서 어휘는 빨리 늘 것 같아요 😊',                            isrevised: false, isFirst: false },
                { userid: 'seed_mei_cn',  toWhom: 'seed_yuna_kr', content: '맞아요, 한국분들은 한자 알면 중국어 어휘 쉽게 배워요! 저도 일본어 배우고 싶어요',                                isrevised: false, isFirst: false },
                { userid: 'seed_yuna_kr', toWhom: 'seed_mei_cn',  content: '그럼 메이씨한테 중국어, 저한테 일본어 배우는 거 어때요? 한국어는 제가 도와드릴게요!',                            isrevised: false, isFirst: false },
                { userid: 'seed_mei_cn',  toWhom: 'seed_yuna_kr', content: '완전 좋아요! 언제 시작할까요? 저 이번 주 금요일 저녁 시간 돼요~',                                               isrevised: false, isFirst: false },
            ],
        },
        {
            room: {
                roomNum: 'seed_room_james_mei',
                roomName: 'James Park,리메이',
                userid: 'seed_james_us',
                useridTo: 'seed_mei_cn',
                restrictedLang: null,
            },
            chats: [
                { userid: 'seed_james_us', toWhom: 'seed_mei_cn',  content: '안녕하세요 메이씨! 중국어 성조 배우고 싶은데 도움받을 수 있을까요?',              isrevised: false, isFirst: true  },
                { userid: 'seed_mei_cn',   toWhom: 'seed_james_us', content: '물론이죠! 근데 James씨 영어 잘 하시죠? 영어도 가르쳐 주실 수 있어요? 교환해요!', isrevised: false, isFirst: false },
                { userid: 'seed_james_us', toWhom: 'seed_mei_cn',  content: '당연하죠~ 영어 회화 도와드릴 수 있어요. 성조랑 영어 같이 연습해봐요 😄',         isrevised: false, isFirst: false },
                { userid: 'seed_mei_cn',   toWhom: 'seed_james_us', content: '좋아요! 1성부터 시작해볼까요? 妈(mā) 麻(má) 马(mǎ) 骂(mà) — 들려요?',         isrevised: false, isFirst: false },
            ],
        },
    ];

    for (const { room, chats } of personalRooms) {
        const existingRoom = await Room.findOne({ where: { roomNum: room.roomNum } });
        if (!existingRoom) {
            await Room.create(room);
            for (const chat of chats) {
                await Chat.create({ ...chat, roomNum: room.roomNum });
            }
            console.log(`  ✅ 방: ${room.roomNum} (메시지 ${chats.length}개)`);
        } else {
            console.log(`  ⏭  이미 존재: ${room.roomNum}`);
        }
    }

    // ── 7. 단체 채팅방 (한국어 방) ─────────────────────────
    console.log('\n── [7] 단체 채팅방 ──');
    const MONO_ROOM_NUM = 'seed_mono_korean_001';

    // seed 유저 외 기존 유저 최대 2명 조회
    const existingUsers: any[] = await User.findAll({
        where: { userid: { [Op.notLike]: 'seed_%' } },
        limit: 2,
    });
    console.log(`  기존 유저 ${existingUsers.length}명 조회됨`);

    // 이미 잘못된 useridTo로 저장된 경우 수정
    await Room.update(
        { useridTo: 'monoChat' },
        { where: { roomNum: MONO_ROOM_NUM, useridTo: 'seed_yuna_kr' } }
    );

    const existingMonoRoom = await Room.findOne({ where: { roomNum: MONO_ROOM_NUM } });
    if (!existingMonoRoom) {
        await Room.create({
            roomNum: MONO_ROOM_NUM,
            roomName: '🇰🇷 한국어 같이 공부해요',
            userid: 'seed_yuna_kr',
            useridTo: 'monoChat',
            restrictedLang: 'Korean',
        });
        await CurrentNOPIM.create({
            roomNum: MONO_ROOM_NUM,
            numberOfPeople: 3 + existingUsers.length,
        });

        // 대화 메시지 구성
        const monoChats: Array<{ userid: string; content: string }> = [
            { userid: 'seed_yuna_kr',  content: '안녕하세요! 한국어 같이 공부하는 방 만들었어요. 자유롭게 한국어로 대화해봐요 😊' },
            { userid: 'seed_james_us', content: '오 좋은 생각이에요! 저는 한국어 2년 차인데 존댓말이 아직도 어려워요 ㅠㅠ' },
            { userid: 'seed_mei_cn',   content: '안녕하세요~ 저도 들어왔어요! 교환학생인데 여기서 많이 배울 수 있을 것 같아요' },
        ];

        if (existingUsers[0]) {
            monoChats.push({ userid: existingUsers[0].userid, content: '반갑습니다! 질문 있으면 편하게 물어보세요!' });
        }
        if (existingUsers[1]) {
            monoChats.push({ userid: existingUsers[1].userid, content: '저도 합류했어요~ 언어 교환 커뮤니티 이런 방이 생기니 좋네요 👍' });
        }

        monoChats.push(
            { userid: 'seed_yuna_kr',  content: '오늘 주제는 "좋아하는 한국 음식" 어때요? 저는 삼겹살이요!' },
            { userid: 'seed_james_us', content: '저도 삼겹살!! 미국에서 한국 BBQ 자주 갔는데 한국에서 먹는 맛이 달라요 😍' },
            { userid: 'seed_mei_cn',   content: '저는 떡볶이요~ 처음엔 너무 매워서 못 먹었는데 이제 완전 적응했어요 ㅋㅋ' },
            { userid: 'seed_james_us', content: '떡볶이 + 순대 조합 진짜 맛있어요. 분식집 자주 가요?' },
            { userid: 'seed_mei_cn',   content: '네! 학교 앞 분식집 단골이에요 😄 James씨도 같이 가요 다음에!' },
        );

        for (const msg of monoChats) {
            await Chat.create({
                ...msg,
                roomNum: MONO_ROOM_NUM,
                toWhom: null,
                isrevised: false,
                isFirst: false,
            });
        }

        const totalMembers = 3 + existingUsers.length;
        console.log(`  ✅ 단체방 생성: ${MONO_ROOM_NUM} (참가자 ${totalMembers}명, 메시지 ${monoChats.length}개)`);
    } else {
        console.log(`  ⏭  이미 존재: ${MONO_ROOM_NUM}`);
    }

    // ── 완료 요약 ───────────────────────────────────────────
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Seed 완료!');
    console.log('='.repeat(50));
    console.log('개발 로그인 정보:');
    console.log('  userid: seed_yuna_kr  | pw: dev1234!');
    console.log('  userid: seed_james_us | pw: dev1234!');
    console.log('  userid: seed_mei_cn   | pw: dev1234!');
    console.log('='.repeat(50));
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Seed 실패:', err);
    process.exit(1);
});
