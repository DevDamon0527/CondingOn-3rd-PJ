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
            errorHandler(error.response.status);
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
        return null; // 또는 로딩 스피너 등을 보여줄 수 있음.
    }

    return (
        <>
            <div className="logoC">
                <div>
                    <img src="images/MypageLogo.png" alt="" />
                </div>
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
                        <div className="addPostImg">
                            <Link to={'/newpost'}>
                                <img src="/images/addpost.png" alt="" />
                            </Link>
                        </div>
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
