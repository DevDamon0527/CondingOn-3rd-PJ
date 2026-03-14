import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import useErrorHandler from '../utils/useErrorHandler';

const socket = io(`${process.env.REACT_APP_SERVERURL}`);

const MainPage: React.FC = () => {
    const { errorHandler } = useErrorHandler();
    const [cookies] = useCookies(['id']);
    const userid = cookies['id'];
    const [newRoomName, setNewRoomName] = useState<string>('');
    const [useridTo, setUseridTo] = useState<string>('monoChat');
    const [restrictedLang, setRestrictLang] = useState<string | null>(null);
    const [chatRooms, setChatRooms] = useState<{ id: string; name: string }[]>(
        []
    );
    const [enteredRoomUrl, setEnteredRoomUrl] = useState<string>('');
    const [userChatRooms, setUserChatRooms] = useState<string[]>([]);
    const [personalRooms, setPersonalRooms] = useState<any>();
    const [monoRooms, setMonoRooms] = useState<any>();

    const fetchPersonalRooms = async () => {
        try {
            const res = await axios({
                url: `${process.env.REACT_APP_SERVERURL}/fetch/personalrooms`,
                method: 'get',
                withCredentials: true,
            });
            setPersonalRooms(res.data.personalRooms);
        } catch (err: any) {
            errorHandler(err.response.status);
        }
    };

    const fetchMonoRooms = async () => {
        try {
            const res = await axios({
                url: `${process.env.REACT_APP_SERVERURL}/fetch/monorooms`,
                method: 'get',
                withCredentials: true,
            });
            setMonoRooms(res.data.monoRooms);
        } catch (err: any) {
            errorHandler(err.response.status);
        }
    };

    useEffect(() => {
        // 데이터베이스에 있는 room 불러오기
        fetchPersonalRooms();
        fetchMonoRooms();

        const savedChatRooms = Cookies.get('chatRooms');
        const savedUserChatRooms = Cookies.get('userChatRooms');

        if (savedChatRooms) {
            const parsedChatRooms = JSON.parse(savedChatRooms);
            if (JSON.stringify(chatRooms) !== JSON.stringify(parsedChatRooms)) {
                setChatRooms(parsedChatRooms);
            }
        }

        if (savedUserChatRooms) {
            const parsedUserChatRooms = JSON.parse(savedUserChatRooms);
            setUserChatRooms(parsedUserChatRooms);
        }

        const handleRoomCreated = ({
            roomNum,
            roomName,
            userId,
        }: {
            roomNum: string;
            roomName: string;
            userId: string;
        }) => {
            fetchMonoRooms();
            const isUniqueId = !chatRooms.some((room) => room.id === roomNum);

            if (isUniqueId) {
                const updatedChatRooms = [
                    ...chatRooms,
                    { id: roomNum, name: roomName },
                ];
                setChatRooms(updatedChatRooms);
                Cookies.set('chatRooms', JSON.stringify(updatedChatRooms));

                // 방이 생성되면 해당 방으로 이동
                window.location.href = `/chat/${roomNum}`;
            }
        };

        socket.on('roomCreated', handleRoomCreated);

        return () => {
            socket.off('roomCreated', handleRoomCreated);
        };
    }, [chatRooms]);

    // 방 생성 버튼 함수
    // useridTo === 'monoChat' 일때
    // 모노챗으로 생성

    const handleAddRoom = () => {
        if (newRoomName.trim() !== '') {
            socket.emit('createRoom', {
                roomName: newRoomName,
                userid: userid,
                // mono chat에선 = ''monoChat'
                useridTo: useridTo,
                restrictedLang: restrictedLang,
            });
            setNewRoomName('');
        }
    };

    const handleEnterRoom = (roomUrl: string) => {
        // URL이 이미 채팅방 목록에 있는지 확인
        const isRoomExist = chatRooms.some(
            (room) => `/chat/${room.id}` === roomUrl
        );

        // URL이 채팅방 목록에 없을 경우에만 새로운 버튼 생성
        if (!isRoomExist) {
            const roomId = roomUrl.split('/').pop() || '';
            const roomName = `Room ${roomId}`;
            const updatedChatRooms = [
                ...chatRooms,
                { id: roomId, name: roomName },
            ];
            setChatRooms(updatedChatRooms);
            Cookies.set('chatRooms', JSON.stringify(updatedChatRooms));
        }

        // 입력 필드 초기화t
        setEnteredRoomUrl('');
    };

    const handleEnterUrl = () => {
        if (enteredRoomUrl.trim() !== '') {
            const roomUrl = enteredRoomUrl;

            // URL이 이미 채팅방 목록에 있는지 확인
            const isRoomExist = chatRooms.some(
                (room) => `/chat/${room.id}` === roomUrl
            );

            // URL이 채팅방 목록에 없을 경우에만 새로운 버튼 생성
            if (!isRoomExist) {
                const roomId = roomUrl.split('/').pop() || '';
                const roomName = `Room ${roomId}`;
                const updatedChatRooms = [
                    ...chatRooms,
                    { id: roomId, name: roomName },
                ];
                setChatRooms(updatedChatRooms);
                Cookies.set('chatRooms', JSON.stringify(updatedChatRooms));
            }

            // 새 창 열기
            window.open(roomUrl, '_blank');

            // 입력 필드 초기화
            setEnteredRoomUrl('');
        }
    };

    return (
        <div>
            <h1>채팅방 목록</h1>
            {chatRooms.map((room) => (
                <div key={room.id} className="chat-room-item">
                    <Link to={`/chat/${room.id}`} className="room-link">
                        {room.name}
                    </Link>
                </div>
            ))}
            <div>
                {/* DB 이용, personalRooms */}
                <h1>개인 채팅</h1>
                {!(personalRooms === undefined) &&
                    personalRooms.map((elem: any) => {
                        return (
                            <ul key={elem.roomNum}>
                                <Link to={`/chat/${elem.roomNum}`}>
                                    <li>{elem.realRoomName[0].name}</li>
                                    <li>{elem.realRoomName[0].nation}</li>
                                    <li>
                                        {`${process.env.REACT_APP_SERVERURL}${elem.realRoomName[0].profileImgPath}`}
                                    </li>
                                </Link>
                            </ul>
                        );
                    })}
            </div>
            <div>
                {/* DB 이용, monoRooms */}
                <h1>단체 채팅</h1>
                {!(monoRooms === undefined) &&
                    monoRooms.map((elem: any) => {
                        return (
                            <ul key={elem.roomNum}>
                                <Link to={`/chat/${elem.roomNum}`}>
                                    <li>{elem.roomName}</li>
                                    <li>{elem.restrictedLang}</li>
                                </Link>
                            </ul>
                        );
                    })}
            </div>

            {userChatRooms.map((roomUrl, index) => (
                <div key={index} className="user-chat-room-item">
                    <Link to={roomUrl} className="room-link">
                        {roomUrl}
                    </Link>
                </div>
            ))}
            <div className="create-room-container">
                <input
                    type="text"
                    placeholder="방 이름을 입력하세요"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="상대방 아이디"
                    value={useridTo}
                    onChange={(e) => setUseridTo(e.target.value)}
                />
                <select
                    value={restrictedLang || ''}
                    onChange={(e) => setRestrictLang(e.target.value)}
                >
                    <option value="">언어 선택</option>
                    <option value="korean">한국어</option>
                    <option value="english">영어</option>
                </select>
                <button onClick={handleAddRoom} className="enter-button">
                    방 만들기
                </button>
            </div>
            <div className="enter-room-container">
                <input
                    type="text"
                    placeholder="방 URL을 입력하세요"
                    value={enteredRoomUrl}
                    onChange={(e) => setEnteredRoomUrl(e.target.value)}
                />
                <button onClick={handleEnterUrl} className="enter-url">
                    입장
                </button>
            </div>
        </div>
    );
};

export default MainPage;
