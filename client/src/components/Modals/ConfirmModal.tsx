import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ConfirmModal({ show, setShow, navigate }: any) {
    const handleClose = () => {
        setShow({ show: false });
        navigate('/mypage/option');
    };

    return (
        <>
            {/* 변경 완료 되었을 시에 모달! */}
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title
                        style={{
                            color: 'rgb(91, 91, 238)',
                            fontWeight: 'bold',
                        }}
                    >
                        완료!
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>변경이 완료되었습니다.</Modal.Body>
                <Modal.Footer>
                    <Button
                        style={{ backgroundColor: '#dabca8b3', color: 'black' }}
                        variant="secondary"
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ConfirmModal;
