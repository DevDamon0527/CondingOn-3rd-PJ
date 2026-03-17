import { Link } from 'react-router-dom';
import '../styles/Mypage.scss';
import Footer from '../components/Footer';
import MypageHeader from '../components/Mypage/MypageHeader';
import MypageProfile from '../components/Mypage/MypageProfile';
import { useCookies } from 'react-cookie';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Post, User } from '../types/types';
import useErrorHandler from '../utils/useErrorHandler';
import '../styles/Font.scss';
import '../styles/MypagePost.scss';
import LanguagePost from '../components/postspage/LanguagePost';
import CulturePost from '../components/postspage/CulturePost';

function Mypage() {
    const [showProfile, setShowProfile] = useState(true);
    const { errorHandler } = useErrorHandler();

    function toggleView(isProfile: boolean) {
        if ((isProfile && showProfile) || (!isProfile && !showProfile)) {
            return;
        }
        setShowProfile(!showProfile);
    }

    const [cookies, setCookies, removeCookies] = useCookies(['id']);
    const [followingNum, setFollowingNum] = useState<Number>(0);
    const [followerNum, setFollowerNum] = useState<Number>(0);
    const [profileImg, setProfileImg] = useState<string>('');
    const idCookie = cookies['id'];

    const [userData, setUserData] = useState<User>();
    const [sortedPostData, setsortedPostData] = useState<any>();
    const [learningLang, setLearningLang] = useState();
    const getMyPage = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/getMyPage`,
                withCredentials: true,
            });
            setUserData(res.data.userDataObj);
            setProfileImg(res.data.userDataObj.profileImgPath);
            setLearningLang(res.data.learningLang);
            const { postCulDatas, postLangDatas } = res.data;
            for (const postCulData of postCulDatas) {
                postCulData.type = 'cul';
            }
            for (const postLangData of postLangDatas) {
                postLangData.type = 'lang';
            }
            const postDatas: any = postCulDatas.concat(postLangDatas);
            const sortedPostDatas = postDatas.sort(function (a: Post, b: Post) {
                const aDate = new Date(a.createdAt).getTime();
                const bDate = new Date(b.createdAt).getTime();
                return bDate - aDate;
            });
            setsortedPostData(sortedPostDatas);
        } catch (error: any) {
            console.log('error', error);
            errorHandler(error.response?.status);
        }
    };

    const followNumGet = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/followNumGet`,
                params: {
                    userid: idCookie,
                },
                withCredentials: true,
            });
            setFollowingNum(res.data.followingNumber);
            setFollowerNum(res.data.followerNumber);
        } catch (error) {
            console.log('error:', error);
        }
    };

    useEffect(() => {
        getMyPage();
        followNumGet();
    }, []);

    if (!userData) {
        return (
            <>
                {/* 실제 logoC와 동일한 fixed top bar */}
                <div className="logoC">
                    <span className="mypage-header-title">마이페이지</span>
                    <Link to={'/mypage/option'}>
                        <div className="gaerOption">
                            <img src="images/Gear.png" alt="" />
                        </div>
                    </Link>
                </div>
                {/* 실제 mypage-container 구조 그대로 재사용 */}
                <div className="mypage-container mypage-skeleton">
                    {/* MypageHeader: followC 3열 구조 */}
                    <div className="mypageHeaderC">
                        <div className="followC">
                            {/* 팔로워 — aDiv 구조 그대로 */}
                            <div className="aDiv">
                                <div>팔로워</div>
                                <div>
                                    <img src="/images/Divider.png" alt="" />
                                </div>
                                <div>
                                    <div className="skeleton-line sk-count-num" />
                                </div>
                            </div>
                            {/* 중앙: 프로필 이미지 + 이름/국가/언어 */}
                            <div className="bDiv">
                                <div className="imageC">
                                    <div className="skeleton-circle sk-profile-circle" />
                                </div>
                                <div className="contentC">
                                    <div className="nameInfo">
                                        <div className="skeleton-line sk-name-line" />
                                    </div>
                                    <div className="countryInfo">
                                        <div className="skeleton-line sk-nation-line" />
                                    </div>
                                    <div className="languageInfo">
                                        <div className="languageDiv">
                                            <div className="skeleton-line sk-lang-short" />
                                        </div>
                                        <div className="arrowImage">
                                            <img src="images/Arrow.png" alt="" />
                                        </div>
                                        <div className="languageDiv">
                                            <div className="skeleton-line sk-lang-short" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* 팔로잉 — cDiv 구조 그대로 */}
                            <div className="cDiv">
                                <div>팔로잉</div>
                                <div>
                                    <img src="/images/Divider.png" alt="" />
                                </div>
                                <div>
                                    <div className="skeleton-line sk-count-num" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 탭 — 정적 텍스트 그대로 표시 */}
                    <div className="clickDiv">
                        <div className="profileClick active changed">프로필</div>
                        <div className="postClick">게시물</div>
                    </div>
                    {/* mypageProfile-C: 섹션 타이틀은 정적이므로 실제 텍스트 유지 */}
                    <div className="mypageProfile-C">
                        <div className="introduce-C">
                            <div className="introduce-C-Header">
                                <div className="header-title">자기 소개</div>
                                <div className="modify-C">
                                    <div className="skeleton-line sk-modify-btn" />
                                </div>
                            </div>
                            <div className="textarea-C">
                                <div className="skeleton-line sk-textarea-block" />
                            </div>
                        </div>
                        <div className="nativLang-C">
                            <div className="nativLang-C-Header">
                                <div className="header-title">모국어</div>
                            </div>
                            <div className="native-result-c">
                                <div className="skeleton-line sk-badge-pill" />
                            </div>
                        </div>
                        <div className="learnLang-C">
                            <div className="learnLang-C-Header">
                                <div className="header-title">학습 언어</div>
                            </div>
                            <div className="learn-result-c">
                                <div className="skeleton-line sk-badge-pill" />
                                <div className="skeleton-line sk-badge-pill" />
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <div className="logoC">
                <span className="mypage-header-title">마이페이지</span>
                <Link to={'/mypage/option'}>
                    <div className="gaerOption">
                        <img src="images/Gear.png" alt="" />
                    </div>
                </Link>
            </div>
            <div className="mypage-container">
                <MypageHeader
                    followingNum={followingNum}
                    followerNum={followerNum}
                    userData={userData}
                    learningLang={learningLang}
                    profileImg={profileImg}
                />
                <div className="clickDiv">
                    {/* click 이벤트 추가 */}
                    <div
                        className={`profileClick ${
                            showProfile ? 'active changed' : ''
                        } `}
                        onClick={() => toggleView(true)}
                    >
                        프로필
                    </div>
                    <div
                        className={`postClick ${
                            !showProfile ? 'active changed' : ''
                        } `}
                        onClick={() => toggleView(false)}
                    >
                        게시물
                    </div>
                </div>
                {showProfile ? (
                    <MypageProfile
                        userData={userData}
                        learningLang={learningLang}
                    />
                ) : (
                    <div className="mypagePostItems-C">
                        <div className="mypage-post-container">
                            {sortedPostData.map((post: any) => {
                                return post.postType === 'c' ? (
                                    <CulturePost
                                        key={post.postId}
                                        userid={post.userid}
                                        id={post.postId}
                                        name={post.User.name}
                                        createdAt={post.createdAt}
                                        content={post.content}
                                        nation={post.User.nation}
                                        gender={post.User.gender}
                                        images={post}
                                        profileImgPath={
                                            post.User.profileImgPath
                                        }
                                        firLang={post.User.firLang}
                                        likeCount={post.likeCount}
                                        isLiked={post.isLiked}
                                        getCulturePosts={getMyPage}
                                    />
                                ) : post.postType === 'l' ? (
                                    <LanguagePost
                                        key={post.postId}
                                        userid={post.userid}
                                        name={post.userid}
                                        id={post.postId}
                                        createdAt={post.createdAt}
                                        content={post.content}
                                        nation={post.User.nation}
                                        gender={post.User.gender}
                                        profileImgPath={
                                            post.User.profileImgPath
                                        }
                                        firLang={post.User.firLang}
                                        likeCount={post.likeCount}
                                        isLiked={post.isLiked}
                                        getLanguagePosts={getMyPage}
                                    />
                                ) : null;
                            })}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default Mypage;
