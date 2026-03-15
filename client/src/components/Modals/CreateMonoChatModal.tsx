import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import '../../styles/CreateMonoChatModal.scss';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { io } from 'socket.io-client';

const socket = io(`${process.env.REACT_APP_SERVERURL}`);

function CreateMonoChatModal({ show, setShow, navigate }: any) {
    const [newRoomName, setNewRoomName] = useState<string>('');
    const [restrictedLang, setRestrictLang] = useState<string | null>('Korean');
    const [cookies] = useCookies(['id']);
    const userid = cookies['id'];

    const handleClose = () => {
        setShow({ show: false });
    };
    // 방 추가 함수
    const handleAddRoom = () => {
        if (newRoomName.trim() !== '') {
            socket.emit('createRoom', {
                roomName: newRoomName,
                userid: userid,
                useridTo: 'monoChat',
                restrictedLang: restrictedLang, // 이 부분 수정
            });
            setNewRoomName('');
            handleClose();
        }
    };

    useEffect(() => {
        const handleRoomCreated = ({ roomNum }: { roomNum: string }) => {
            window.location.href = `/chat/${roomNum}`;
        };
        socket.on('roomCreated', handleRoomCreated);
        return () => {
            socket.off('roomCreated', handleRoomCreated);
        };
    }, []);

    return (
        <>
            {/* 변경 완료 되었을 시에 모달! */}
            <Modal show={show} onHide={handleClose} centered dialogClassName="mono-chat-modal-dialog">
                <Modal.Header closeButton className="mono-modal-header">
                    <Modal.Title className="mono-modal-title">
                        방 만들기
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="mono-modal-body">
                    <Form>
                        <Form.Group className="mb-4" controlId="monoForm.roomName">
                            <Form.Label className="mono-form-label">방 이름</Form.Label>
                            <Form.Control
                                className="mono-form-input"
                                type="text"
                                placeholder="방 이름을 입력하세요 (최대 18자)"
                                autoFocus
                                maxLength={18}
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2" controlId="monoForm.lang">
                            <Form.Label className="mono-form-label">언어 선택</Form.Label>
                            <Form.Control
                                className="mono-form-select"
                                as="select"
                                value={restrictedLang || ''}
                                onChange={(e) => setRestrictLang(e.target.value)}
                            >
                                <option value="Korean">🇰🇷 한국어</option>
                                <option value="English">🇺🇸 영어</option>
                                <option value="Chinese">🇨🇳 중국어</option>
                                <option value="Japanese">🇯🇵 일본어</option>
                                <option value="French">🇫🇷 프랑스어</option>
                                <option value="German">🇩🇪 독일어</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="mono-modal-footer">
                    <Button
                        className="mono-btn-cancel"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        취소
                    </Button>
                    <Button
                        className="mono-btn-create"
                        variant="secondary"
                        onClick={handleAddRoom}
                        disabled={newRoomName.trim() === ''}
                    >
                        만들기
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CreateMonoChatModal;
