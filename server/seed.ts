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
    Comment, LangComment, PostLike, LangPostLike,
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
            nation: 'Korea',
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
            nation: 'America',
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
            nation: 'China',
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

    // ── 8. A 계정 (test) ────────────────────────────────────
    console.log('\n── [8] A 계정 (test) ──');
    const testPw = await bcrypt.hash('111111', 10);
    const [, testCreated] = await User.findOrCreate({
        where: { userid: 'test' },
        defaults: {
            userid: 'test',
            password: testPw,
            name: '이준호',
            gender: 'M',
            nation: 'Korea',
            firLang: 'Korean',
            profileImgPath: '/public/mypage/default.png',
            introduction:
                '안녕하세요! 영어 실력을 키우고 싶은 이준호입니다 😊\n' +
                '한국어는 원어민 수준으로 가르쳐드릴 수 있어요.\n' +
                '같이 언어 교환해요! 여행, 문화, 일상 대화 다 좋아요.',
        },
    });
    console.log(testCreated ? '  ✅ 생성: test' : '  ⏭  이미 존재: test');

    // ── 9. test 학습 언어 ───────────────────────────────────
    console.log('\n── [9] test 학습 언어 ──');
    {
        const exists = await Lang.findOne({ where: { userid: 'test', learningLang: 'English' } });
        if (!exists) {
            await Lang.create({ userid: 'test', learningLang: 'English' });
            console.log('  ✅ test → English');
        } else {
            console.log('  ⏭  이미 존재: test → English');
        }
    }

    // ── 10. test 팔로우 관계 ────────────────────────────────
    console.log('\n── [10] test 팔로우 관계 ──');
    const testFollowPairs = [
        { userid: 'seed_yuna_kr',  followerId: 'test'          }, // test → yuna
        { userid: 'seed_james_us', followerId: 'test'          }, // test → james
        { userid: 'seed_mei_cn',   followerId: 'test'          }, // test → mei
        { userid: 'test',          followerId: 'seed_yuna_kr'  }, // yuna → test
        { userid: 'test',          followerId: 'seed_james_us' }, // james → test
        { userid: 'test',          followerId: 'seed_mei_cn'   }, // mei → test
    ];
    for (const f of testFollowPairs) {
        const exists = await Follow.findOne({ where: f });
        if (!exists) {
            await Follow.create(f);
            console.log(`  ✅ ${f.followerId} → ${f.userid}`);
        } else {
            console.log(`  ⏭  이미 존재: ${f.followerId} → ${f.userid}`);
        }
    }

    // ── 11. test 1:1 채팅방 + 메시지 ──────────────────────
    console.log('\n── [11] test 1:1 채팅 ──');
    const testPersonalRooms = [
        {
            room: {
                roomNum: 'seed_room_test_james',
                roomName: '이준호,James Park',
                userid: 'test',
                useridTo: 'seed_james_us',
                restrictedLang: null,
            },
            chats: [
                { userid: 'test',           toWhom: 'seed_james_us', content: '안녕하세요 James씨! 영어 배우고 싶어서 연락드렸어요 😊 언어 교환 해주실 수 있나요?',                                          isrevised: false, isFirst: true  },
                { userid: 'seed_james_us',  toWhom: 'test',          content: '안녕하세요! 저도 한국어 연습 파트너 찾고 있었어요. 잘됐네요! 어떤 영어가 필요하세요?',                                          isrevised: false, isFirst: false },
                { userid: 'test',           toWhom: 'seed_james_us', content: '일상 회화랑 이메일 표현이요. 회사 다니다 보니 영어 이메일 쓸 일이 생겨서요.',                                                   isrevised: false, isFirst: false },
                { userid: 'seed_james_us',  toWhom: 'test',          content: '오 그럼 비즈니스 이메일 표현도 같이 연습해드릴게요. 일단 기본 회화부터 시작해볼까요?',                                           isrevised: false, isFirst: false },
                { userid: 'test',           toWhom: 'seed_james_us', content: 'How was your day? 이게 자연스러운 표현이에요?',                                                                                  isrevised: false, isFirst: false },
                { userid: 'seed_james_us',  toWhom: 'test',          content: '네! 완전 자연스러워요. 거기에 "How\'s it going?" 이나 "What\'s up?" 도 캐주얼하게 써요. 비즈니스에서는 "How do you do?" 가 더 격식체예요 😄', isrevised: false, isFirst: false },
                { userid: 'test',           toWhom: 'seed_james_us', content: '오 이해됐어요! 그럼 "I hope this finds you well" 은 이메일 시작할 때 쓰는 표현이죠?',                                            isrevised: false, isFirst: false },
                { userid: 'seed_james_us',  toWhom: 'test',          content: '맞아요! 근데 요즘은 좀 오래된 표현이라 "Hope you\'re doing well" 이나 그냥 바로 본론으로 들어가기도 해요.',                      isrevised: false, isFirst: false },
                { userid: 'test',           toWhom: 'seed_james_us', content: '정말 도움돼요 감사해요! James씨 한국어 공부는 어떤 부분이 제일 어려우세요?',                                                     isrevised: false, isFirst: false },
                { userid: 'seed_james_us',  toWhom: 'test',          content: '조사요 ㅠㅠ "에" "에서" "으로" 언제 쓰는지 아직도 헷갈려요. 준호씨 설명해주실 수 있어요?',                                       isrevised: false, isFirst: false },
            ],
        },
        {
            room: {
                roomNum: 'seed_room_test_yuna',
                roomName: '이준호,김유나',
                userid: 'test',
                useridTo: 'seed_yuna_kr',
                restrictedLang: null,
            },
            chats: [
                { userid: 'test',          toWhom: 'seed_yuna_kr', content: '안녕하세요 유나씨! 언어 교환 게시글 보고 연락드렸어요. 영어 교환 해보실래요?',           isrevised: false, isFirst: true  },
                { userid: 'seed_yuna_kr',  toWhom: 'test',         content: '안녕하세요! 준호씨 영어 원어민이신가요?',                                                isrevised: false, isFirst: false },
                { userid: 'test',          toWhom: 'seed_yuna_kr', content: '아뇨 저도 학습자예요 ㅎㅎ 근데 한국어는 자신 있어요! 유나씨 영어 레벨은 어느 정도예요?', isrevised: false, isFirst: false },
                { userid: 'seed_yuna_kr',  toWhom: 'test',         content: '중급 정도예요. 읽기는 되는데 회화가 약해요. 준호씨는 어떤 영어 표현 주로 연습하세요?',   isrevised: false, isFirst: false },
                { userid: 'test',          toWhom: 'seed_yuna_kr', content: '비즈니스 영어요. 같이 연습해봐요! 저는 한국어 문법이나 표현 도와드릴게요 😊',           isrevised: false, isFirst: false },
            ],
        },
    ];
    for (const { room, chats } of testPersonalRooms) {
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

    // ── 12. test 언어 게시글 (6개) ─────────────────────────
    console.log('\n── [12] test 언어 게시글 ──');
    const testLangPosts = [
        {
            userid: 'test', postType: 'l',
            content: '영어 이메일 시작 표현을 알고 싶어요!\n제가 쓴 이메일이 자연스러운지 봐주실 수 있나요?\n\n"Dear Mr. Johnson,\nI hope this email finds you well. I am writing to inquire about the project status. Could you please let me know when we can discuss this further?"\n\n혹시 더 자연스러운 표현이 있으면 알려주세요!',
        },
        {
            userid: 'test', postType: 'l',
            content: '영어로 거절 표현하기가 너무 어려워요. "No" 라고 직접 말하는 게 무례하게 들릴까봐 걱정되거든요. 영어 원어민들은 부탁을 거절할 때 어떻게 표현하나요? 예시 문장 좀 알려주세요!',
        },
        {
            userid: 'test', postType: 'l',
            content: '현재완료 vs 과거시제가 헷갈려요 😅\n"I have eaten" vs "I ate" 차이를 이렇게 이해했는데 맞나요?\n- I have eaten: 지금 현재도 관련 있음 (아직 배부름)\n- I ate: 그냥 과거 사실 (언제 먹었는지 상관없음)\n영어 잘하시는 분 피드백 부탁해요!',
        },
        {
            userid: 'test', postType: 'l',
            content: '영어 관사 a/an/the 사용법이 아직도 헷갈려요. 특히 the를 붙여야 할지 아예 없어야 할지... "I go to school" 은 the 없이 쓰는데 "I go to the hospital" 은 the 쓰는 이유가 뭐예요? 규칙이 있나요?',
        },
        {
            userid: 'test', postType: 'l',
            content: '영어 인터뷰 답변 연습 중인데 피드백 받고 싶어요!\nQ: Tell me about yourself.\nA: "My name is Junho. I have been working as a developer for three years. I am very passionate about my work and always try to improve my skills. I am looking for new challenges."\n너무 딱딱한가요? 더 자연스럽게 고쳐주시면 감사해요!',
        },
        {
            userid: 'test', postType: 'l',
            content: '영어 전치사 "in/on/at" 구분이 어렵네요.\n시간 표현 정리해봤어요:\n- in: in the morning, in 2024, in July\n- on: on Monday, on my birthday\n- at: at 3 o\'clock, at night\n이게 맞나요? 장소 전치사도 같은 규칙인지 헷갈려요. 알려주세요!',
        },
    ];
    for (const p of testLangPosts) {
        const allByUser = await LangPost.findAll({ where: { userid: p.userid } });
        const exists = (allByUser as any[]).some((r: any) => r.content === p.content);
        if (!exists) {
            await LangPost.create(p);
            console.log(`  ✅ LangPost: ${p.userid}`);
        } else {
            console.log(`  ⏭  이미 존재: test 언어글`);
        }
    }

    // ── 13. test 문화 게시글 (5개) + 이미지 ───────────────
    console.log('\n── [13] test 문화 게시글 + 이미지 ──');
    const testCultureData = [
        {
            post: { userid: 'test', postType: 'c', content: '한국의 찜질방 문화를 소개할게요! 외국 친구들이 처음 오면 신기해하는 곳 중 하나예요. 각종 온도의 방에서 쉬고, 식혜랑 계란 먹고, 가족끼리 오는 문화가 독특하죠. 저는 어릴 때부터 주말에 가족이랑 찜질방 가는 게 루틴이었어요. 여러분 나라에 비슷한 문화 있나요?' },
            images: ['/public/posts/seed_jjimjilbang.jpg'],
        },
        {
            post: { userid: 'test', postType: 'c', content: '한국의 노래방 문화! 외국에도 카라오케 있지만 한국처럼 "방" 단위로 친구들끼리 빌려서 노는 문화가 독특한 것 같아요. 개인 공간에서 창피함 없이 마음껏 노래할 수 있어서 좋죠. 저는 스트레스 받을 때 친구들이랑 노래방 가는 게 제일 좋아요 🎤 여러분도 노래방 가본 적 있나요?' },
            images: ['/public/posts/seed_norebang1.jpg', '/public/posts/seed_norebang2.jpg'],
        },
        {
            post: { userid: 'test', postType: 'c', content: '한국 군대 문화에 대해 얘기해볼까요? 저도 군 복무 마치고 나왔는데, 외국 친구들이 의무복무 제도에 엄청 신기해하더라고요. 군대 다녀오면 사회적으로 의무를 다했다는 인식이 있고, 군대 경험이 하나의 공통 화제가 돼요. 여러분 나라는 군복무 어떤가요?' },
            images: ['/public/posts/seed_military.jpg'],
        },
        {
            post: { userid: 'test', postType: 'c', content: '한국 편의점 음식 문화 진짜 발전했어요! 삼각김밥, 컵라면, 핫바는 기본이고 요즘은 편의점마다 고메 간편식이 늘어났잖아요. 저는 야근할 때 편의점 도시락으로 해결하는 편인데 퀄리티가 갈수록 좋아지는 것 같아요. 외국 편의점이랑 비교해서 어떤 것 같아요?' },
            images: ['/public/posts/seed_cvs_food.jpg'],
        },
        {
            post: { userid: 'test', postType: 'c', content: '한국 교육 문화, 특히 학원 문화에 대해서 이야기해봐요. 저도 어릴 때 영어학원, 수학학원 달고 살았는데 외국 친구들한테 설명하면 다들 놀라더라고요. 입시 경쟁이 치열한 만큼 사교육 시장도 크죠. 여러분 나라는 교육 문화가 어때요? 한국이랑 다른 점이 궁금해요!' },
            images: ['/public/posts/seed_hakwon1.jpg', '/public/posts/seed_hakwon2.jpg'],
        },
    ];
    for (const item of testCultureData) {
        const allByUser = await Post.findAll({ where: { userid: item.post.userid } });
        const exists = (allByUser as any[]).some((r: any) => r.content === item.post.content);
        if (!exists) {
            const newPost: any = await Post.create(item.post);
            for (const imgPath of item.images) {
                await PostImages.create({ postId: newPost.postId, userid: item.post.userid, path: imgPath });
            }
            console.log(`  ✅ Post: test (이미지 ${item.images.length}개)`);
        } else {
            console.log(`  ⏭  이미 존재: test 문화글`);
        }
    }

    // ── 14. 추가 단체 채팅방 (영어방, 일본어방) ────────────
    console.log('\n── [14] 추가 단체 채팅방 ──');
    const additionalMonoRooms = [
        {
            roomNum: 'seed_mono_english_001',
            room: {
                roomNum: 'seed_mono_english_001',
                roomName: '🇺🇸 영어 회화 연습방',
                userid: 'seed_james_us',
                useridTo: 'monoChat',
                restrictedLang: 'English',
            },
            chats: [
                { userid: 'seed_james_us', content: 'Hey everyone! Welcome to the English conversation practice room 😄 Let\'s speak English here!' },
                { userid: 'test',          content: 'Hi James! Happy to join. I\'ll try my best to practice English here.' },
                { userid: 'seed_yuna_kr',  content: 'Hello everyone~ This is so exciting! I can practice my English here too.' },
                { userid: 'seed_mei_cn',   content: 'Hi! My English is not very good but I will try hard 😊' },
                { userid: 'seed_james_us', content: 'That\'s the spirit! Today\'s topic: What\'s your favorite food and why? I\'ll start — I love Korean BBQ because the flavor is amazing!' },
                { userid: 'test',          content: 'I love tteokbokki! It\'s spicy and chewy. Perfect snack after work.' },
                { userid: 'seed_yuna_kr',  content: 'I like sushi and ramen! Japanese food makes me so happy. Also I love Korean samgyeopsal.' },
                { userid: 'seed_mei_cn',   content: 'I miss Chinese hotpot so much! Also Korean fried chicken is very delicious here.' },
                { userid: 'seed_james_us', content: 'Great answers everyone! Junho, "chewy" is a perfect word for tteokbokki 👍 Yuna, your English is really good!' },
                { userid: 'test',          content: 'Thanks James! I have a question — what\'s the difference between "delicious" and "yummy"?' },
                { userid: 'seed_james_us', content: '"Yummy" is more casual and childlike — you\'d say it to a friend. "Delicious" is more formal. Both are positive though!' },
            ],
        },
        {
            roomNum: 'seed_mono_japanese_001',
            room: {
                roomNum: 'seed_mono_japanese_001',
                roomName: '🇯🇵 일본어 같이 배워요',
                userid: 'seed_yuna_kr',
                useridTo: 'monoChat',
                restrictedLang: 'Japanese',
            },
            chats: [
                { userid: 'seed_yuna_kr',  content: 'みなさん、こんにちは！日本語の練習部屋を作りました。一緒に勉強しましょう！(안녕하세요! 일본어 연습방 만들었어요. 같이 공부해요!)' },
                { userid: 'test',          content: '안녕하세요! 일본어 초보인데 들어와도 될까요? こんにちは 정도만 알아요 ㅎㅎ' },
                { userid: 'seed_mei_cn',   content: '私も日本語を勉強しています！중국어랑 한자가 겹쳐서 단어는 좀 알아요 😊' },
                { userid: 'seed_yuna_kr',  content: '물론이죠! 准호씨도 환영해요. 오늘은 기본 인사말부터 해봐요. おはようございます、こんにちは、こんばんは 차이 아시나요?' },
                { userid: 'test',          content: '아침인사, 낮인사, 저녁인사 아닌가요? おはようございます가 아침이고...' },
                { userid: 'seed_yuna_kr',  content: '정확해요! 그리고 친한 사이엔 おはよう、こんにちは、こんばんは 이렇게 줄여서 써요. 경어 주의!' },
                { userid: 'seed_mei_cn',   content: '中国語の「你好」みたいですね！でも日本語の敬語はとても複雑です... 경어 체계가 진짜 어렵네요.' },
                { userid: 'test',          content: 'すみません과 ごめんなさい 차이도 알고 싶어요!' },
                { userid: 'seed_yuna_kr',  content: 'すみません은 실례합니다/감사합니다 모두 쓸 수 있어요. ごめんなさい는 진심으로 사과할 때요. 길 물어볼 때는 すみません이 맞아요!' },
            ],
        },
    ];
    for (const { roomNum, room, chats } of additionalMonoRooms) {
        const existingRoom = await Room.findOne({ where: { roomNum } });
        if (!existingRoom) {
            await Room.create(room);
            await CurrentNOPIM.create({ roomNum, numberOfPeople: 4 });
            for (const msg of chats) {
                await Chat.create({ ...msg, roomNum, toWhom: null, isrevised: false, isFirst: false });
            }
            console.log(`  ✅ 단체방: ${roomNum} (메시지 ${chats.length}개)`);
        } else {
            console.log(`  ⏭  이미 존재: ${roomNum}`);
        }
    }

    // ── 15. 댓글 ────────────────────────────────────────────
    // LangComment: 언어 게시글 댓글 (isrevised=false: 일반댓글)
    // Comment: 문화 게시글 댓글
    console.log('\n── [15] 댓글 ──');

    // test의 언어 게시글에 달린 댓글
    const testLangPostsAll = await LangPost.findAll({ where: { userid: 'test' }, order: [['postId', 'ASC']] }) as any[];
    const yunaLangPostsAll = await LangPost.findAll({ where: { userid: 'seed_yuna_kr' }, order: [['postId', 'ASC']] }) as any[];
    const jamesLangPostsAll = await LangPost.findAll({ where: { userid: 'seed_james_us' }, order: [['postId', 'ASC']] }) as any[];

    const langCommentData: Array<{ postId: number; userid: string; content: string; isrevised: boolean }> = [];

    if (testLangPostsAll[0]) {
        langCommentData.push(
            { postId: testLangPostsAll[0].postId, userid: 'seed_james_us', content: '이메일 표현 자연스러워요! 한 가지 팁은 "I hope this email finds you well" 대신 "I hope you\'re doing well" 이 좀 더 현대적이에요.', isrevised: false },
            { postId: testLangPostsAll[0].postId, userid: 'seed_yuna_kr',  content: '저도 영어 이메일 쓸 때 비슷한 고민을 해요! James씨 팁 감사해요 😊', isrevised: false },
        );
    }
    if (testLangPostsAll[1]) {
        langCommentData.push(
            { postId: testLangPostsAll[1].postId, userid: 'seed_james_us', content: '"I\'m afraid I can\'t..." 또는 "I\'d love to, but..." 이런 표현들이 영어로 부드럽게 거절할 때 자주 써요!', isrevised: false },
        );
    }
    if (testLangPostsAll[2]) {
        langCommentData.push(
            { postId: testLangPostsAll[2].postId, userid: 'seed_james_us', content: '정확하게 이해하셨어요! 현재완료는 현재와 연결고리가 있을 때, 과거는 그냥 과거 사실이에요. "I\'ve lost my keys" (아직 못 찾음) vs "I lost my keys yesterday" (그냥 어제 잃어버린 사실) 처럼요.', isrevised: false },
            { postId: testLangPostsAll[2].postId, userid: 'seed_mei_cn',   content: '중국어에는 시제가 없어서 이게 진짜 어려워요... 준호씨 이해 빠르시네요!', isrevised: false },
        );
    }
    // 유나 글에 test가 댓글
    if (yunaLangPostsAll[0]) {
        langCommentData.push(
            { postId: yunaLangPostsAll[0].postId, userid: 'test', content: '자연스러운 자기소개예요! 한 가지 더하면 "趣味は〜することです" 패턴 기억해두면 취미 표현할 때 많이 써요 😊', isrevised: false },
        );
    }
    // james 글에 test가 댓글
    if (jamesLangPostsAll[0]) {
        langCommentData.push(
            { postId: jamesLangPostsAll[0].postId, userid: 'test', content: '"에"는 방향/위치, "에서"는 동작이 일어나는 장소예요! "학교에 가요" (학교 방향으로), "학교에서 공부해요" (학교라는 공간에서 동작). 설명이 도움됐으면 해요!', isrevised: false },
            { postId: jamesLangPostsAll[0].postId, userid: 'seed_yuna_kr',  content: '준호씨 설명 완벽해요! James씨 이해됐나요?', isrevised: false },
        );
    }

    for (const lc of langCommentData) {
        const exists = await LangComment.findOne({ where: { postId: lc.postId, userid: lc.userid, content: lc.content } });
        if (!exists) {
            await LangComment.create(lc);
            console.log(`  ✅ LangComment: ${lc.userid} → postId ${lc.postId}`);
        } else {
            console.log(`  ⏭  이미 존재: LangComment ${lc.userid} → postId ${lc.postId}`);
        }
    }

    // 문화 게시글 댓글 (Comment)
    const testPostsAll = await Post.findAll({ where: { userid: 'test' }, order: [['postId', 'ASC']] }) as any[];
    const yunaPostsAll = await Post.findAll({ where: { userid: 'seed_yuna_kr' }, order: [['postId', 'ASC']] }) as any[];
    const jamesPostsAll = await Post.findAll({ where: { userid: 'seed_james_us' }, order: [['postId', 'ASC']] }) as any[];
    const meiPostsAll = await Post.findAll({ where: { userid: 'seed_mei_cn' }, order: [['postId', 'ASC']] }) as any[];

    const commentData: Array<{ postId: number; userid: string; content: string; isrevised: boolean }> = [];

    if (testPostsAll[0]) {
        commentData.push(
            { postId: testPostsAll[0].postId, userid: 'seed_yuna_kr',  content: '찜질방 진짜 최고죠! 저도 어릴 때 가족이랑 자주 갔어요 😊 일본에는 비슷하게 온천(온센)이 있어요!', isrevised: false },
            { postId: testPostsAll[0].postId, userid: 'seed_james_us', content: '저 처음 찜질방 갔을 때 충격이었어요ㅋㅋ 황토방이 진짜 뜨거웠어요. 근데 나오고 나서 개운해요!', isrevised: false },
        );
    }
    if (testPostsAll[1]) {
        commentData.push(
            { postId: testPostsAll[1].postId, userid: 'seed_mei_cn',   content: '노래방 완전 좋아해요! 중국에도 KTV가 있는데 한국 노래방이랑 비슷해요. 같이 노래방 가요~', isrevised: false },
            { postId: testPostsAll[1].postId, userid: 'seed_james_us', content: 'Norebang is honestly the best invention 😂 In the US we have karaoke bars but it\'s public and embarrassing!', isrevised: false },
        );
    }
    if (yunaPostsAll[0]) {
        commentData.push(
            { postId: yunaPostsAll[0].postId, userid: 'test',          content: '편의점 오뎅 저도 진짜 좋아해요! 일본 오뎅은 한국이랑 맛이 또 달라서 신기하죠 ㅎㅎ', isrevised: false },
            { postId: yunaPostsAll[0].postId, userid: 'seed_james_us', content: '일본 편의점 저도 가봤는데 퀄리티가 진짜 대단해요. 음식 말고도 생활용품 구색이 엄청 다양하더라고요!', isrevised: false },
        );
    }
    if (jamesPostsAll[0]) {
        commentData.push(
            { postId: jamesPostsAll[0].postId, userid: 'test',         content: '배달문화 진짜 한국이 최고죠 ㅎㅎ 요즘은 편의점도 배달되니까 세상 편해졌어요!', isrevised: false },
            { postId: jamesPostsAll[0].postId, userid: 'seed_mei_cn',  content: '맞아요! 중국도 배달이 빨라요. 메이퇀 앱으로 30분이면 와요. 한국이랑 비슷한 것 같아요~', isrevised: false },
        );
    }
    if (meiPostsAll[0]) {
        commentData.push(
            { postId: meiPostsAll[0].postId, userid: 'test',          content: '춘절 문화 너무 재밌네요! 디지털 훙바오 개념이 진짜 신선해요. 한국 카카오페이 송금이랑 비슷한 느낌인가요?', isrevised: false },
            { postId: meiPostsAll[0].postId, userid: 'seed_yuna_kr',  content: '춘절 폭죽 소리 진짜 엄청 크다고 들었어요! 한국 설날이랑 분위기 비교해보고 싶어요 😊', isrevised: false },
        );
    }

    for (const c of commentData) {
        const exists = await Comment.findOne({ where: { postId: c.postId, userid: c.userid, content: c.content } });
        if (!exists) {
            await Comment.create(c);
            console.log(`  ✅ Comment: ${c.userid} → postId ${c.postId}`);
        } else {
            console.log(`  ⏭  이미 존재: Comment ${c.userid} → postId ${c.postId}`);
        }
    }

    // ── 16. 좋아요 ──────────────────────────────────────────
    console.log('\n── [16] 좋아요 ──');

    // LangPostLike
    const langLikeData: Array<{ postId: number; userid: string }> = [];
    if (testLangPostsAll[0]) langLikeData.push({ postId: testLangPostsAll[0].postId, userid: 'seed_james_us' }, { postId: testLangPostsAll[0].postId, userid: 'seed_yuna_kr' });
    if (testLangPostsAll[1]) langLikeData.push({ postId: testLangPostsAll[1].postId, userid: 'seed_james_us' });
    if (testLangPostsAll[2]) langLikeData.push({ postId: testLangPostsAll[2].postId, userid: 'seed_mei_cn' }, { postId: testLangPostsAll[2].postId, userid: 'seed_yuna_kr' });
    if (testLangPostsAll[3]) langLikeData.push({ postId: testLangPostsAll[3].postId, userid: 'seed_james_us' });
    if (yunaLangPostsAll[0]) langLikeData.push({ postId: yunaLangPostsAll[0].postId, userid: 'test' }, { postId: yunaLangPostsAll[0].postId, userid: 'seed_james_us' });
    if (jamesLangPostsAll[0]) langLikeData.push({ postId: jamesLangPostsAll[0].postId, userid: 'test' }, { postId: jamesLangPostsAll[0].postId, userid: 'seed_mei_cn' });

    for (const l of langLikeData) {
        const exists = await LangPostLike.findOne({ where: l });
        if (!exists) {
            await LangPostLike.create(l);
            console.log(`  ✅ LangPostLike: ${l.userid} → postId ${l.postId}`);
        } else {
            console.log(`  ⏭  이미 존재: LangPostLike ${l.userid}`);
        }
    }

    // PostLike (문화)
    const postLikeData: Array<{ postId: number; userid: string }> = [];
    if (testPostsAll[0]) postLikeData.push({ postId: testPostsAll[0].postId, userid: 'seed_yuna_kr' }, { postId: testPostsAll[0].postId, userid: 'seed_james_us' });
    if (testPostsAll[1]) postLikeData.push({ postId: testPostsAll[1].postId, userid: 'seed_mei_cn' }, { postId: testPostsAll[1].postId, userid: 'seed_yuna_kr' });
    if (testPostsAll[2]) postLikeData.push({ postId: testPostsAll[2].postId, userid: 'seed_james_us' });
    if (yunaPostsAll[0]) postLikeData.push({ postId: yunaPostsAll[0].postId, userid: 'test' }, { postId: yunaPostsAll[0].postId, userid: 'seed_mei_cn' });
    if (jamesPostsAll[0]) postLikeData.push({ postId: jamesPostsAll[0].postId, userid: 'test' }, { postId: jamesPostsAll[0].postId, userid: 'seed_yuna_kr' });
    if (meiPostsAll[0]) postLikeData.push({ postId: meiPostsAll[0].postId, userid: 'test' });

    for (const l of postLikeData) {
        const exists = await PostLike.findOne({ where: l });
        if (!exists) {
            await PostLike.create(l);
            console.log(`  ✅ PostLike: ${l.userid} → postId ${l.postId}`);
        } else {
            console.log(`  ⏭  이미 존재: PostLike ${l.userid}`);
        }
    }

    // ── 17. 오류 교정 댓글 (LangComment isrevised=true) ────
    // isrevised=true = 교정 코멘트 (ErrorLog에 표시됨)
    console.log('\n── [17] 오류 교정 댓글 (isrevised=true) ──');

    const correctionData: Array<{ postId: number; userid: string; content: string; isrevised: boolean }> = [];

    // test의 글을 james가 교정
    if (testLangPostsAll[0]) {
        correctionData.push({
            postId: testLangPostsAll[0].postId,
            userid: 'seed_james_us',
            content: '✏️ 교정: "I am writing to inquire" → "I\'m writing to inquire" (이메일에서도 축약형이 더 자연스러워요)\n"Could you please let me know when we can discuss this further?" → "Would it be possible to schedule a time to discuss this?" (더 격식체)',
            isrevised: true,
        });
    }
    if (testLangPostsAll[2]) {
        correctionData.push({
            postId: testLangPostsAll[2].postId,
            userid: 'seed_james_us',
            content: '✏️ 교정: 이해 완벽해요! 추가로 "I\'ve been to Japan" (지금도 경험이 남아있음) vs "I went to Japan last year" (작년에 간 사실만) 차이도 같은 맥락이에요.',
            isrevised: true,
        });
    }
    if (testLangPostsAll[4]) {
        correctionData.push({
            postId: testLangPostsAll[4].postId,
            userid: 'seed_james_us',
            content: '✏️ 교정: "I am very passionate" → "I\'m passionate" (very 빼는 게 더 자연스러움)\n"always try to improve" → "continuously work on improving" (더 구체적으로 들려요)\n전반적으로 좋아요! 조금 더 구체적인 예시를 추가하면 완벽해요 👍',
            isrevised: true,
        });
    }
    // test가 yuna의 글을 교정
    if (yunaLangPostsAll[0]) {
        correctionData.push({
            postId: yunaLangPostsAll[0].postId,
            userid: 'test',
            content: '✏️ 교정: 자기소개 정말 자연스러워요! 한 가지 제안: 「趣味はアニメを見ることとカフェ巡りです」→「趣味はアニメ鑑賞とカフェ巡りです」 — 「鑑賞」을 쓰면 더 세련된 느낌이에요. 나머지는 완벽합니다!',
            isrevised: true,
        });
    }
    // test가 james의 글을 교정
    if (jamesLangPostsAll[0]) {
        correctionData.push({
            postId: jamesLangPostsAll[0].postId,
            userid: 'test',
            content: '✏️ 교정: "집에 가요"는 맞아요! 그런데 "집에서 가요"는 문법적으로 틀리지 않지만 어색한 건 "집에서"가 출발지 표현이 되기 때문이에요. "집에서 나가요"(집에서 나옴)는 자연스럽지만 "집에서 가요"는 불완전해요. 조사 정리 잘 하고 계세요!',
            isrevised: true,
        });
    }

    for (const lc of correctionData) {
        const exists = await LangComment.findOne({ where: { postId: lc.postId, userid: lc.userid, isrevised: true } });
        if (!exists) {
            await LangComment.create(lc);
            console.log(`  ✅ 교정 LangComment (isrevised=true): ${lc.userid} → postId ${lc.postId}`);
        } else {
            console.log(`  ⏭  이미 존재: 교정 ${lc.userid} → postId ${lc.postId}`);
        }
    }

    // ── 완료 요약 ───────────────────────────────────────────
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Seed 완료!');
    console.log('='.repeat(50));
    console.log('개발 로그인 정보:');
    console.log('  userid: seed_yuna_kr  | pw: dev1234!');
    console.log('  userid: seed_james_us | pw: dev1234!');
    console.log('  userid: seed_mei_cn   | pw: dev1234!');
    console.log('  userid: test          | pw: 111111   ← A 계정');
    console.log('='.repeat(50));
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Seed 실패:', err);
    process.exit(1);
});
