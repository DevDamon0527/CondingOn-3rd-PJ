import { Link } from 'react-router-dom';
import '../../styles/MypageHeader.scss';
import { useState, useEffect } from 'react';
import FollowModal from '../Modals/FollowModal';
import axios from 'axios';
import { getImageUrl } from '../../utils/getImageUrl';

function MypageHeader(props: any) {
    const { followingNum, followerNum, userData, learningLang, profileImg } =
        props;
    const currentFlag = userData.nation;
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [followerList, setFollowerList] = useState([]);
    const [followingList, setFollowingList] = useState([]);

    useEffect(() => {
        const fetchFollowLists = async () => {
            try {
                const resFollowers = await axios.get(
                    `${process.env.REACT_APP_SERVERURL}/followListGet`,
                    {
                        params: { userid: userData.userid },
                        withCredentials: true,
                    }
                );
                // 팔로워 목록에 ID 포함
                const followerListWithId = resFollowers.data.followerList.map(
                    (user: any) => ({ ...user, id: user.userid })
                );
                setFollowerList(followerListWithId);

                const resFollowing = await axios.get(
                    `${process.env.REACT_APP_SERVERURL}/followListGet`,
                    {
                        params: { userid: userData.userid },
                        withCredentials: true,
                    }
                );
                // 팔로잉 목록에 ID 포함
                const followingListWithId = resFollowing.data.followingList.map(
                    (user: any) => ({ ...user, id: user.userid })
                );
                setFollowingList(followingListWithId);
            } catch (error) {
                console.log(error);
            }
        };

        fetchFollowLists();
    }, [userData.userid]);

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
    return (
        <>
            <div className="mypageHeaderC">
                <div className="followC">
                    <div
                        className="aDiv"
                        onClick={() => {
                            setShowFollowersModal(true);
                            setShowFollowingModal(false);
                        }}
                    >
                        <div>팔로워</div>
                        <div>
                            <img src="/images/Divider.png" alt="" />
                        </div>
                        <div>{followerNum}</div>
                    </div>
                    <div className="bDiv">
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
                        <div className="contentC">
                            <div className="nameInfo">
                                <div>
                                    {userData.gender === 'm' ? (
                                        <img
                                            src="images/manIcon.png"
                                            alt="man"
                                        />
                                    ) : (
                                        <img
                                            src="images/womenIcon.png"
                                            alt="woman"
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
                                    <img src="images/Arrow.png" alt="" />
                                </div>
                                <div className="languageDiv">
                                    {shortName(learningLang[0])}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="cDiv"
                        onClick={() => {
                            setShowFollowingModal(true);
                            setShowFollowersModal(false);
                        }}
                    >
                        <div>팔로잉</div>
                        <img src="/images/Divider.png" alt="" />
                        <div>{followingNum}</div>
                    </div>

                    {showFollowersModal && (
                        <FollowModal
                            closeModal={() => setShowFollowersModal(false)}
                            title="나를 팔로우한 사람"
                            userId={userData.userid} // userId 전달
                            users={followerList}
                            modalContent={null} // 모달 컨텐츠에 대한 내용을 채워주세요.
                        />
                    )}
                    {showFollowingModal && (
                        <FollowModal
                            closeModal={() => setShowFollowingModal(false)}
                            title="내가 팔로우한 사람"
                            userId={userData.userid} // userId 전달
                            users={followingList}
                            modalContent={null} // 모달 컨텐츠에 대한 내용을 채워주세요.
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default MypageHeader;
