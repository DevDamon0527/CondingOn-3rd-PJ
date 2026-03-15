import '../../styles/MypageOption.scss';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Mypage.scss';
import { useCookies } from 'react-cookie';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { User } from '../../types/types';
import DeleteModal from '../Modals/DeleteModal';
import Footer from '../Footer';
import { getImageUrl } from '../../utils/getImageUrl';

const langToKorean = (lang: string): string => {
    const map: { [key: string]: string } = {
        Korean: '한국어', English: '영어', Chinese: '중국어',
        Japanese: '일본어', French: '프랑스어', German: '독일어',
    };
    return map[lang] || lang;
};

function MypageOption() {
    const [cookies, , removeCookies] = useCookies(['id']);
    const idCookie = cookies['id'];
    const [profileImg, setProfileImg] = useState<string>('');

    const [userData, setUserData] = useState<User>();
    const [learningLang, setLearningLang] = useState('');

    // 모달 창
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState<any>({
        show: false,
    });

    const getMyPage = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/getMyPage`,
                params: {
                    userid: idCookie,
                },
                withCredentials: true,
            });
            setUserData(res.data.userDataObj);
            setLearningLang(res.data.learningLang);
            setProfileImg(res.data.userDataObj.profileImgPath);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        getMyPage();
    }, []);

    if (!userData) {
        return null;
    }
    // 로그아웃 요청
    const userlogout = async () => {
        try {
            await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVERURL}/mypage/logout`,
                withCredentials: true,
            });
            removeCookies('id');
            navigate('/login');
        } catch (err) {
            console.log(err);
        }
    };

    //  모달 창 실행 함수
    const handleDeleteModal = () => {
        setShowDeleteModal({
            show: true,
        });
    };

    return (
        <>
            <DeleteModal
                show={showDeleteModal.show}
                setShow={setShowDeleteModal}
                navigate={navigate}
            />
            <div className="myPageOption-C-Header">
                <Link to="/mypage">
                    <div>
                        <img src="/images/BackPoint.png" alt="" />
                    </div>
                </Link>
                <div className="settingBack">설정</div>
                <div
                    className="logout-btn"
                    onClick={() => {
                        userlogout();
                    }}
                >
                    <span className="settingLogout">로그아웃</span>
                    <div className="settingLogoutImage">
                        <img src="/images/Logout.png" alt="" />
                    </div>
                </div>
            </div>
            <div className="myPageOption-container">
                {/* 프로필 수정 */}
                <div className="settingProfile">
                    <div className="imageC">
                        <div className="profile-image">
                            <img
                                src={getImageUrl(profileImg)}
                                alt=""
                            />
                        </div>
                        <div className="flag-image">
                            <img
                                src={`/images/flag/${userData.nation}.png`}
                                alt=""
                            />
                        </div>
                    </div>
                    <div className="contentC">
                        <div className="nameInfo">
                            <div>{userData.userid}</div>
                        </div>
                        <div className="countryInfo">
                            <div>{userData.nation}</div>
                        </div>
                    </div>
                    <Link to={'/multermypage'} className="edit-profile-btn">
                        프로필 수정
                    </Link>
                </div>

                {/* 상세정보 수정 */}
                <div className="settingDetail">
                    {/* My Info */}
                    <div className="myInformation-container">
                        <div className="settingDetail-Header">
                            <div>
                                <img src="/images/DecoBar.png" alt="" />
                            </div>
                            <div className="settingDetail-Header-text">
                                내 정보
                            </div>
                        </div>
                        <div className="settingDetail-Content">
                            <div className="settingDetail-Content-items">
                                <div>닉네임</div>
                                <div className="result-Content-items">
                                    {userData.name}
                                </div>
                            </div>
                            <div className="settingDetail-Content-items">
                                <div>비밀번호</div>
                                <Link to={'/mypage/edit/password'} className="option-edit-btn">
                                    수정
                                </Link>
                            </div>
                            <div className="settingDetail-Content-items">
                                <div>성별</div>
                                <div className="result-Content-items">
                                    {userData.gender === 'm' ? '남성' : '여성'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Learning Language Info */}
                    <div className="myInformation-container">
                        <div className="settingDetail-Header">
                            <div>
                                <img src="/images/DecoBar.png" alt="" />
                            </div>
                            <div className="settingDetail-Header-text">
                                학습 언어 정보
                            </div>
                        </div>
                        <div className="settingDetail-Content">
                            <div className="settingDetail-Content-items">
                                <div>모국어</div>
                                <div className="result-Content-items">
                                    {langToKorean(userData.firLang)}
                                </div>
                            </div>
                            <div className="settingDetail-Content-items">
                                <div>학습 언어</div>
                                <div className="result-Content-items">
                                    {langToKorean(learningLang[0])}
                                </div>
                                <Link to={'/mypage/edit/language'} className="option-edit-btn">
                                    수정
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Service Info */}
                    <div className="myInformation-container">
                        <div className="settingDetail-Header">
                            <div>
                                <img src="/images/DecoBar.png" alt="" />
                            </div>
                            <div className="settingDetail-Header-text">
                                서비스 정보
                            </div>
                        </div>
                        <div className="settingDetail-Content">
                            <div className="settingDetail-Content-items">
                                <div className="withdrawal">회원 탈퇴</div>
                                <button
                                    className="option-delete-btn"
                                    onClick={handleDeleteModal}
                                >
                                    탈퇴
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default MypageOption;
