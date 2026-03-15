import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useCookies } from 'react-cookie';
import '../../styles/DeleteModal.scss';

function DeleteModal({ show, setShow, navigate }: any) {
    const [cookies, setCookies, removeCookies] = useCookies(['id']);

    const handleClose = () => {
        setShow({ show: false });
        removeCookies('id');
        navigate('/login');
        userdelete();
    };
    const handleCancle = () => {
        setShow({ show: false });
    };

    // 계정 탈퇴 요청
    const userdelete = async () => {
        try {
            await axios({
                method: 'delete',
                url: `${process.env.REACT_APP_SERVERURL}/mypage/deleteuser`,
                withCredentials: true,
            });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <Modal show={show} onHide={handleCancle} centered dialogClassName="delete-modal-dialog">
                <Modal.Header closeButton className="delete-modal-header">
                    <Modal.Title className="delete-modal-title">
                        회원 탈퇴
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="delete-modal-body">
                    <p className="delete-modal-text">정말로 계정을 삭제하시겠습니까?</p>
                    <p className="delete-modal-subtext">탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
                </Modal.Body>
                <Modal.Footer className="delete-modal-footer">
                    <Button
                        className="delete-btn-cancel"
                        variant="secondary"
                        onClick={handleCancle}
                    >
                        취소
                    </Button>
                    <Button
                        className="delete-btn-confirm"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        탈퇴하기
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DeleteModal;
