import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/MypageEditPassword.scss';
import { useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import ConfirmModal from '../Modals/ConfirmModal';

function MypageEditPassword() {
    const [cookies] = useCookies(['id']);
    const idCookie = cookies['id'];
    const [editPasswordErrorMsg, setEditPasswordErrorMsg] = useState<string>('');

    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState<any>({ show: false });

    const inputCurrentPasswordRef = useRef<HTMLInputElement>(null);
    const inputNewPasswordRef = useRef<HTMLInputElement>(null);
    const inputConfirmNewPasswordRef = useRef<HTMLInputElement>(null);

    const submitEditForm = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const currentPassword = inputCurrentPasswordRef.current?.value;
        const newPassword = inputNewPasswordRef.current?.value;
        const confirmNewPassword = inputConfirmNewPasswordRef.current?.value;

        // 클라이언트 유효성 검사
        if (!currentPassword) {
            setEditPasswordErrorMsg('현재 비밀번호를 입력해주세요.');
            return;
        }
        if (!newPassword || newPassword.trim().length < 6) {
            setEditPasswordErrorMsg('새 비밀번호는 6자 이상이어야 합니다.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setEditPasswordErrorMsg('비밀번호 확인이 일치하지 않습니다.');
            return;
        }

        try {
            const res = await axios({
                method: 'patch',
                url: `${process.env.REACT_APP_SERVERURL}/mypage/changeuserpassword`,
                data: {
                    userid: idCookie,
                    currentPassword,
                    newPassword,
                    confirmPassword: confirmNewPassword,
                },
                withCredentials: true,
            });
            if (res.data.isError === false) {
                handleConfirmModal();
            } else if (res.data.isError === true) {
                setEditPasswordErrorMsg(res.data.msg);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleConfirmModal = () => {
        setShowConfirmModal({ show: true });
    };

    return (
        <>
            <ConfirmModal
                show={showConfirmModal.show}
                setShow={setShowConfirmModal}
                navigate={navigate}
            />
            <div className="myPageOption-C-Header">
                <Link to="/mypage/option">
                    <div>
                        <img src="/images/BackPoint.png" alt="" />
                    </div>
                </Link>
                <div className="settingBack">비밀번호 변경</div>
            </div>
            <div className="myPageOption-container multer2">
                <div className="editPassword-Container">
                    <div className="editContainer-title">비밀번호 변경</div>
                    <div className="editContainer-smalltitle">
                        변경할 비밀번호를 입력해주세요
                    </div>
                    <form className="editPassword-Form">
                        <div className="edit-form-group">
                            <label>현재 비밀번호</label>
                            <input
                                type="password"
                                placeholder="현재 비밀번호를 입력해주세요"
                                ref={inputCurrentPasswordRef}
                                onChange={() => setEditPasswordErrorMsg('')}
                            />
                        </div>
                        <div className="edit-form-group">
                            <label>새 비밀번호</label>
                            <input
                                type="password"
                                placeholder="6자 이상 입력해주세요"
                                ref={inputNewPasswordRef}
                                onChange={() => setEditPasswordErrorMsg('')}
                            />
                        </div>
                        <div className="edit-form-group">
                            <label>새 비밀번호 확인</label>
                            <input
                                type="password"
                                placeholder="비밀번호를 다시 입력해주세요"
                                ref={inputConfirmNewPasswordRef}
                                onChange={() => setEditPasswordErrorMsg('')}
                            />
                        </div>
                        {editPasswordErrorMsg && (
                            <div className="edit-error-msg">{editPasswordErrorMsg}</div>
                        )}
                    </form>
                    <button className="edit-ConfirmBtn" onClick={submitEditForm}>
                        변경 완료
                    </button>
                </div>
            </div>
        </>
    );
}

export default MypageEditPassword;
