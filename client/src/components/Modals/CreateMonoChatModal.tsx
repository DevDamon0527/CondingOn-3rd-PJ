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
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title
                        style={{
                            color: 'rgb(91, 91, 238)',
                            fontWeight: 'bold',
                        }}
                    >
                        방 만들기
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlInput1"
                        >
                            <Form.Label>방 이름</Form.Label>

                            <Form.Control
                                type="text"
                                placeholder="방 이름을 입력하세요 (최대 18자)"
                                autoFocus
                                maxLength={18} // 글자 18자 제한
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlTextarea1"
                        >
                            <Form.Label>언어 선택</Form.Label>
                            <Form.Control
                                as="select"
                                value={restrictedLang || ''}
                                onChange={(e) =>
                                    setRestrictLang(e.target.value)
                                }
                            >
                                <option value="Korean">한국어</option>
                                <option value="English">영어</option>
                                <option value="Chinese">중국어</option>
                                <option value="Japanese">일본어</option>
                                <option value="French">프랑스어</option>
                                <option value="German">독일어</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
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
                    <Button
                        style={{ backgroundColor: '#56eebbb3', color: 'black' }}
                        variant="secondary"
                        onClick={handleAddRoom}
                    >
                        만들기
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CreateMonoChatModal;
