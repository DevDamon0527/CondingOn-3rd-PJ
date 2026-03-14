import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';

import { useCookies } from 'react-cookie';

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
            {/* 변경 완료 되었을 시에 모달! */}
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header>
                    <Modal.Title style={{ color: 'red', fontWeight: 'bold' }}>
                        경고!
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ fontWeight: 'bold' }}>
                    정말로 계정을 삭제하시겠습니까?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => {
                            handleCancle();
                        }}
                    >
                        취소
                    </Button>
                    <Button
                        style={{ backgroundColor: 'red', color: 'black' }}
                        variant="secondary"
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        확인
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DeleteModal;
