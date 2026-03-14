import { useState } from 'react';
import '../../styles/MonoChatHeader.scss';
import { useNavigate } from 'react-router-dom';
import CreateMonoChatModal from '../Modals/CreateMonoChatModal';

function MonoChatHeader() {
    const navigate = useNavigate();
    // 모달 창 상태 변화
    const [showConfirmModal, setShowConfirmModal] = useState<any>({
        // 모달 초기 상태 false!
        show: false,
    });
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
            <CreateMonoChatModal
                show={showConfirmModal.show}
                setShow={setShowConfirmModal}
                navigate={navigate}
            />
            <div className="monochat-header-container">
                <div className="monochat-logo"></div>
                <div
                    className="create-monochat"
                    onClick={() => {
                        handleConfirmModal();
                    }}
                >방 생성</div>
            </div>
        </>
    );
}

export default MonoChatHeader;
