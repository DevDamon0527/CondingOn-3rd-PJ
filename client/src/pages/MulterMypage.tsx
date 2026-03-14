import '../styles/MulterMypage.scss';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Topbar from '../components/Topbar';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/Modals/ConfirmModal';
import { useCookies } from 'react-cookie';
import { User } from '../types/types';
import useErrorHandler from '../utils/useErrorHandler';

function MulterMypage() {
    const image = useRef<any>(null);
    const [cookies] = useCookies(['id']);
    const idCookie = cookies['id'];
    const { errorHandler } = useErrorHandler();
    const [profileImg, setProfileImg] = useState<string>('');

    const [userData, setUserData] = useState<User>();
    const navigate = useNavigate();

    // 모달 창 상태 변화
    const [showConfirmModal, setShowConfirmModal] = useState<any>({
        // 모달 초기 상태 false!
        show: false,
    });

    // 페이지 렌더시 실행
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
            setProfileImg(
                `${process.env.REACT_APP_SERVERURL}${res.data.userDataObj.profileImgPath}`
            );
        } catch (error: any) {
            errorHandler(error.response?.status);
            console.log('error', error);
        }
    };
    // 페이지 렌더시 getMyPage 함수 실행
    useEffect(() => {
        getMyPage();
    }, []);
    // userData가 없으면 렌더링 X
    if (!userData) {
        return null; // 또는 로딩 스피너 등을 보여줄 수 있음.
    }

    // 이미지 파일 업로드시 변환
    const change = () => {
        // 이미지 파일이 선택된 경우에만 createObjectURL 함수 호출
        if (image.current.files.length > 0) {
            const file = image.current.files[0];

            // URL.createObjectURL 함수 사용하여 이미지 파일 업로드 시 바로 사진 변경
            // 이미지 파일이 업로드시 변경
            setProfileImg(URL.createObjectURL(file));
        }
    };

    const postMulter = async () => {
        const formData = new FormData();
        formData.append('file', image.current.files[0]);
        try {
            const res = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVERURL}/multermypage`,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // 세션 쿠키 한번에
                withCredentials: true,
            });
            handleConfirmModal();
        } catch (err: any) {
            errorHandler(err.response.status);
        }
    };

    // 모달 창 실행 함수
    const handleConfirmModal = () => {
        // 실행 되면 모달 상태를 true로!
        setShowConfirmModal({
            show: true,
        });
    };

    return (
        <>
            {/* 모달 컴포넌트 */}
            <ConfirmModal
                show={showConfirmModal.show}
                setShow={setShowConfirmModal}
                navigate={navigate}
            />
            {/* 설정 헤드 부분 */}
            <div className="myPageOption-C-Header">
                <Link to="/mypage/option">
                    <div>
                        <img src="/images/BackPoint.png" alt="" />
                    </div>
                </Link>
                <div className="settingBack">프로필 이미지 변경</div>
            </div>
            <div className="myPageOption-container multer">
                <div className="multer-form-container">
                    {/* 이미지 출력 공간 */}
                    <div className="profile-image">
                        {/* 페이지 렌더링 시 가지고 있는 이미지 표시 */}
                        <img src={`${profileImg}`} alt="" />
                    </div>
                    <form action="">
                        <label
                            className="input-file-button"
                            htmlFor="input-file"
                        >
                            사진 선택
                        </label>
                        <input
                            type="file"
                            id="input-file"
                            ref={image}
                            accept=".jpg, .png, .jpeg"
                            // 이미지 업로드시 파일 바로 변환
                            onChange={change}
                        />
                    </form>
                    {/* 서버에 데이터 전송 */}
                    <button
                        className="edit-ConfirmBtn"
                        type="button"
                        onClick={postMulter}
                    >
                        {' '}
                        확인
                    </button>
                </div>
            </div>
        </>
    );
}

export default MulterMypage;
