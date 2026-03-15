import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import '../../styles/ConfirmModal.scss';

function ConfirmModal({ show, setShow, navigate }: any) {
    const handleClose = () => {
        setShow({ show: false });
        navigate('/mypage/option');
    };

    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
                dialogClassName="confirm-modal-dialog"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="confirm-modal-title">
                        변경 완료
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="confirm-modal-body">
                    변경이 완료되었습니다.
                </Modal.Body>
                <Modal.Footer className="confirm-modal-footer">
                    <Button
                        className="confirm-btn-close"
                        onClick={handleClose}
                    >
                        확인
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ConfirmModal;
