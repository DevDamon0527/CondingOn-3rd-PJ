import { Link, useNavigate } from 'react-router-dom';
import '../../styles/MypageHeader.scss';
import '../../styles/SearchUserHeader.scss';
import axios from 'axios';
import { getImageUrl } from '../../utils/getImageUrl';
import { useCookies } from 'react-cookie';
import { useEffect, useState } from 'react';
function SearchUserHeader(props: any) {
    const [cookies] = useCookies(['id']);
    const idCookie = cookies['id'];
    const {
        followingNum,
        followerNum,
        userData,
        learningLang,
        profileImg,
        handleAddRoom,
        isFollowing,
        setIsFollowing,
        setFollowerNum,
    } = props;

    const [isFollow, setIsFollow] = useState<boolean>();
    const navigate = useNavigate();

    const currentFlag = userData.nation;

    useEffect(() => {
        setIsFollow(!isFollowing);
    }, [isFollowing]);

    const shortName = (nation: string): string | undefined => {
        if (nation === 'China' || nation === 'Chinese') {
            return 'CN';
        } else if (nation === 'America' || nation === 'English') {
            return 'EN';
        } else if (nation === 'France' || nation === 'French') {
            return 'FR';
        } else if (nation === 'Germany' || nation === 'German') {
            return 'GM';
        } else if (nation === 'Japan' || nation === 'Japanese') {
            return 'JP';
        } else {
            return 'KR';
        }
    };

    const doFollow = async () => {
        try {
            const res = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVERURL}/followexec`,
                data: {
                    followId: userData.userid,
                },
                withCredentials: true,
            });
            setIsFollowing(!isFollowing);
            if (isFollowing === true) {
                setFollowerNum(followerNum - 1);
            } else if (isFollowing === false) {
                setFollowerNum(followerNum + 1);
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <div className="mypageHeaderC">
                <div className="followC">
                    <div className="aDiv">
                        <div>팔로워</div>
                        <div>
                            <img src="/images/Divider.png" alt="" />
                        </div>
                        <div>{followerNum}</div>
                    </div>
                    <div className="bDiv">
                        {/* 프로필 이미지 */}
                        <div className="imageC">
                            <div className="profile-image">
                                <img
                                    src={getImageUrl(profileImg)}
                                    alt=""
                                />
                            </div>
                            <div className="flag-image">
                                <img
                                    src={`/images/flag/${currentFlag}.png`}
                                    alt=""
                                />
                            </div>
                        </div>
                        {/* 프로필 요약정보 */}
                        <div className="contentC">
                            <div className="nameInfo">
                                <div>
                                    {userData.gender == 'm' ? (
                                        <img
                                            src="/images/manIcon.png"
                                            alt="man"
                                        />
                                    ) : (
                                        <img
                                            src="/images/womenIcon.png"
                                            alt="wo"
                                        />
                                    )}
                                </div>
                                <div>{userData.name}</div>
                            </div>
                            <div className="countryInfo">
                                <div>{userData.nation}</div>
                            </div>
                            <div className="languageInfo">
                                <div className="languageDiv">
                                    {shortName(userData.firLang)}
                                </div>
                                <div className="arrowImage">
                                    <img src="/images/Arrow.png" alt="" />
                                </div>
                                <div className="languageDiv">
                                    {shortName(learningLang[0])}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="cDiv">
                        <div>팔로잉</div>
                        <img src="/images/Divider.png" alt="" />
                        <div>{followingNum}</div>
                    </div>
                </div>
                <div className="personal-container">
                    <button
                        className={`profile-followBtn ${
                            isFollow
                                ? 'profile-followBtn'
                                : 'profile-unfollowBtn'
                        }`}
                        onClick={() => doFollow()}
                    >
                        {isFollow ? '팔로우' : '팔로우 취소'}
                    </button>
                    <button
                        className="profile-messageBtn"
                        onClick={handleAddRoom}
                    >
                        메시지
                    </button>
                </div>
            </div>
        </>
    );
}

export default SearchUserHeader;
