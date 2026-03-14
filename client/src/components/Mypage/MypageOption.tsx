import '../../styles/MypageOption.scss';
import Topbar from '../Topbar';
import { Link, useNavigate } from 'react-router-dom';

import '../../styles/Mypage.scss';
import { useCookies } from 'react-cookie';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { User } from '../../types/types';
import DeleteModal from '../Modals/DeleteModal';
import Footer from '../Footer';

function MypageOption() {
    const [cookies, setCookies, removeCookies] = useCookies(['id']);
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
        return null; // 또는 로딩 스피너 등을 보여줄 수 있음.
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
                {/* 설정 헤드 부분 */}
                {/* 프로필 수정 */}
                <div className="settingProfile">
                    <div className="imageC">
                        <div className="profile-image">
                            <img
                                src={`${process.env.REACT_APP_SERVERURL}${profileImg}`}
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

                    <div className="editImage">
                        <Link to={'/multermypage'}>
                            <img src="/images/EditButton.png" alt="" />
                        </Link>
                    </div>
                </div>

                {/* 상세정보 수정 */}
                <div className="settingDetail">
                    {/* My Info */}
                    <div className="myInformation-container">
                        {/* 헤더 */}
                        <div className="settingDetail-Header">
                            <div>
                                <img src="/images/DecoBar.png" alt="" />
                            </div>
                            <div className="settingDetail-Header-text">
                                내 정보
                            </div>
                        </div>
                        {/* 내용 */}
                        <div className="settingDetail-Content">
                            <div className="settingDetail-Content-items">
                                <div>닉네임</div>
                                <div className="result-Content-items">
                                    {userData.name}
                                </div>
                            </div>
                            <div className="settingDetail-Content-items">
                                <div>비밀번호</div>
                                <div className="result-Content-items">
                                    변경
                                </div>
                                <Link to={'/mypage/edit/password'}>
                                    <div className="rightPointImgDiv">
                                        <img
                                            src="/images/RightPoint.png"
                                            alt=""
                                        />
                                    </div>
                                </Link>
                            </div>
                            <div className="settingDetail-Content-items">
                                <div>성별</div>
                                <div className="result-Content-items">
                                    {userData.gender === 'm'
                                        ? '남성'
                                        : '여성'}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Learning Laguage Info */}
                    <div className="myInformation-container">
                        <div className="settingDetail-Header">
                            <div>
                                <img src="/images/DecoBar.png" alt="" />
                            </div>
                            <div className="settingDetail-Header-text">
                                학습 언어 정보
                            </div>
                        </div>
                        {/* 내용 */}
                        <div className="settingDetail-Content">
                            <div className="settingDetail-Content-items">
                                <div>모국어</div>
                                <div className="result-Content-items">
                                    {userData.firLang}
                                </div>
                            </div>
                            <div className="settingDetail-Content-items">
                                <div>학습 언어</div>
                                <div className="result-Content-items">
                                    {learningLang[0]}
                                </div>
                                <Link to={'/mypage/edit/language'}>
                                    <div>
                                        <img
                                            src="/images/RightPoint.png"
                                            alt=""
                                        />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sevice Info */}
                    <div className="myInformation-container">
                        <div className="settingDetail-Header">
                            <div>
                                <img src="/images/DecoBar.png" alt="" />
                            </div>
                            <div className="settingDetail-Header-text">
                                서비스 정보
                            </div>
                        </div>
                        {/* 내용 */}
                        <div className="settingDetail-Content">
                            <div className="settingDetail-Content-items">
                                <div className="withdrawal">회원 탈퇴</div>
                                <div className="result-Content-items"></div>
                                <div className="userdelete-div">
                                    <img
                                        src="/images/RightPoint.png"
                                        alt=""
                                        onClick={() => {
                                            handleDeleteModal();
                                        }}
                                    />
                                </div>
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
