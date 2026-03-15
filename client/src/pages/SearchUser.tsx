import '../styles/Mypage.scss';
import '../styles/SearchUser.scss';
import Footer from '../components/Footer';
import SearchUserHeader from '../components/SearchUser/SearchUserHeader';
import SearchUserProfile from '../components/SearchUser/SearchUserProfile';
import { useCookies } from 'react-cookie';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Post, User } from '../types/types';
import { useNavigate, useParams } from 'react-router-dom';
import useErrorHandler from '../utils/useErrorHandler';
import CulturePost from '../components/postspage/CulturePost';
import LanguagePost from '../components/postspage/LanguagePost';

const socket = io(`${process.env.REACT_APP_SERVERURL}`);

function SearchUser() {
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(true);
    const userid = useParams().userid;
    const { errorHandler } = useErrorHandler();
    function toggleView(isProfile: boolean) {
        if ((isProfile && showProfile) || (!isProfile && !showProfile)) {
            return;
        }
        setShowProfile(!showProfile);
    }
    const [cookies, setCookies, removeCookies] = useCookies(['id']);
    const [followingNum, setFollowingNum] = useState<number>(0);
    const [followerNum, setFollowerNum] = useState<number>(0);
    const [profileImg, setProfileImg] = useState<string>('');
    const [userData, setUserData] = useState<User>();
    const [learningLang, setLearningLang] = useState();
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [sortedPostData, setSortedPostData] = useState<any>();
    const idCookie = cookies['id'];

    const getMyPage = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/userinfo/${userid}`,
                withCredentials: true,
            });
            setUserData(res.data.userDataObj);
            setFollowingNum(res.data.followingCount);
            setFollowerNum(res.data.followerCount);
            setProfileImg(res.data.userDataObj.profileImgPath);
            setLearningLang(res.data.learningLang);
            setIsFollowing(res.data.isFollowing);
            const { postCulDatas, postLangDatas } = res.data;
            for (const postCulData of postCulDatas) {
                postCulData.type = 'cul';
            }
            for (const postLangData of postLangDatas) {
                postLangData.type = 'lang';
            }
            const postDatas = postCulDatas.concat(postLangDatas);
            const sortedPostDatas = postDatas.sort(function (a: Post, b: Post) {
                const aDate = new Date(a.createdAt).getTime();
                const bDate = new Date(b.createdAt).getTime();
                return bDate - aDate;
            });
            setSortedPostData(sortedPostDatas);
        } catch (error: any) {
            errorHandler(error.response?.status);
            console.log('error', error);
        }
    };

    const handleAddRoom = async () => {
        socket.emit('createRoom', {
            roomName: userid,
            userid: idCookie,
            useridTo: userid,
            restrictedLang: '',
        });
    };

    const handleRoomCreated = ({
        roomId,
        roomName,
        roomNumArr,
    }: {
        roomId: string;
        roomName: string;
        roomNumArr: Array<string>;
    }) => {
        const roomUrl = `/chat/${roomNumArr.toString()}`;
        navigate(roomUrl);
    };

    useEffect(() => {
        getMyPage();
        socket.on('roomCreated', handleRoomCreated);
    }, []);

    if (!userData) {
        return null; // 또는 로딩 스피너 등을 보여줄 수 있음.
    }

    return (
        <>
            <div className="logoC_user">
                <img
                    className="userPageBack"
                    src="/images/BackPoint.png"
                    alt=""
                    onClick={() => navigate(-1)}
                />
                <span className="userpage-header-title">프로필</span>
            </div>

            <div className="userpage-container">
                <SearchUserHeader
                    followingNum={followingNum}
                    followerNum={followerNum}
                    setFollowerNum={setFollowerNum}
                    userData={userData}
                    learningLang={learningLang}
                    profileImg={profileImg}
                    isFollowing={isFollowing}
                    setIsFollowing={setIsFollowing}
                    handleAddRoom={handleAddRoom}
                />
                <div className="clickDiv">
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
                    <SearchUserProfile
                        userData={userData}
                        learningLang={learningLang}
                    />
                ) : (
                    <div className="userpagePostItems-C">
                        <div className="mypage-post-container">
                            {sortedPostData !== undefined &&
                                sortedPostData.map((post: any) => {
                                    return post.postType === 'c' ? (
                                        <CulturePost
                                            key={post.postId}
                                            userid={post.userid}
                                            id={post.postId}
                                            name={post.userid}
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

export default SearchUser;
