import '../styles/NewPage.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import useErrorHandler from '../utils/useErrorHandler';
import { getCurrentData3 } from '../utils/getCurrentData';
import { cookieConfig } from '../utils/cookieConfig';

interface Message {
    text: string;
    isSentByMe?: boolean;
    userId?: string | null;
}

interface ChatLog {
    chatIndex: number;
    roomNum: string;
    userid: string;
    User: userInterface;
    content: string;
    createdAt: string;
    updataedAt: string;
    chatCounting: number;
    isFirst: boolean;
    isrevised: boolean;
}

interface userInterface {
    name: string;
    profileImgPath: string;
    nation: string;
}
// 쿠키 아이디 저장
const socket = io(`${process.env.REACT_APP_SERVERURL}`);
const USER_ID_COOKIE_KEY = 'id';

const ChatRoomPage: React.FC = () => {
    const [cookies, setCookies, removeCookies] = useCookies(['id', 'content']);
    const { errorHandler } = useErrorHandler();
    const { roomId } = useParams<{ roomId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [userId, setUserId] = useState<string | null>(null);
    const [chatLog, setChatLog] = useState<ChatLog[]>([]);
    const [allowedLanguage, setAllowedLanguage] = useState<string | null>(null);
    const [roomName, setRoomName] = useState();
    const [roomPeopleNum, setroomPeopleNum] = useState();
    const [useridTo, setUserIdTo] = useState();
    const [roomType, setRoomType] = useState();
    const userid = cookies['id'];

    const navigate = useNavigate();
    // 채팅 끝난 시점
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            });
        }
    };

    useEffect(() => {
        // 페이지 로드될 때 쿠키에서 ID를 가져와서 상단에 표시
        const userIdFromCookie = Cookies.get(USER_ID_COOKIE_KEY) || null;
        setUserId(userIdFromCookie);

        socket.emit('joinRoom', roomId);

        socket.on('chat message', (msg: Message) => {
            if (msg.userId !== userIdFromCookie) {
                setMessages((prevMessages) => [...prevMessages, msg]);
            }
        });

        socket.on('needReload', () => {
            fetchChatLog();
        });

        // 여기서 사용자의 ID를 쿠키에서 읽어와서 socket.id로 전달합니다.
        socket.emit('userId', userIdFromCookie);

        const handleBeforeUnload = () => {
            socket.emit('leaveRoom', roomId);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            socket.off('chat message');
        };
    }, [roomId]);

    const fetchChatLog = async () => {
        try {
            const res = await axios({
                url: `${process.env.REACT_APP_SERVERURL}/getchatlog/${roomId}`,
                method: 'get',
                withCredentials: true,
            });
            setChatLog(res.data.chatLog);
            setRoomName(res.data.roomInfo.roomName);
            setRoomType(res.data.roomInfo.useridTo);
            setroomPeopleNum(res.data.chatNumber);
            setUserIdTo(res.data.roomInfo.useridTo);
        } catch (err: any) {
            errorHandler(err.response.status);
        }
    };
    useEffect(() => {
        // 페이지 로드될 때 쿠키에서 ID를 가져와서 상단에 표시
        fetchChatLog();
        fetchRoomLanguage();
        setNewMessage('');
    }, [messages]);

    const fetchRoomLanguage = async () => {
        try {
            const res = await axios({
                url: `${process.env.REACT_APP_SERVERURL}/fetch/language/${roomId}`,
                method: 'get',
            });
            const roomLanguage = res.data.language;

            // 상단에 설정된 언어 표시
            setAllowedLanguage(roomLanguage);
        } catch (error) {
            console.error('Error', error);
        }
    };

    const handleSendMessage = () => {
        const message = ` ${newMessage}`;
        // 허용된 언어인지 확인
        if (allowedLanguage) {
            let regex;

            if (allowedLanguage.toLowerCase() === 'korean') {
                regex =
                    /^[ㄱ-ㅎㅏ-ㅣ가-힣0-9\s!@#$%^&*()-_+=\[\]{}|;:'",.<>/?\\]*$/;
            } else if (allowedLanguage.toLowerCase() === 'english') {
                regex = /^[a-zA-Z0-9\s!@#$%^&*()-_+=\[\]{}|;:'",.<>/?]*$/;
            }

            // 초기화되지 않은 경우 빈 정규식으로 초기화
            regex = regex || new RegExp('');

            if (!regex.test(newMessage)) {
                const langNameMap: Record<string, string> = {
                    korean: '한국어',
                    english: '영어',
                    chinese: '중국어',
                    japanese: '일본어',
                    french: '프랑스어',
                    german: '독일어',
                };
                const langKo = langNameMap[allowedLanguage.toLowerCase()] || allowedLanguage;
                alert(`이 채팅방은 ${langKo}만 사용할 수 있습니다.`);
                return;
            }
        }

        socket.emit('chat message', {
            room: roomId,
            text: message,
            isSentByMe: true,
            userId: userid,
        });
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                text: message,
                isSentByMe: false,
                userId: userid,
            },
        ]);
        setNewMessage('');
    };
    useEffect(() => {
        scrollToBottom();
    }, [chatLog]);

    return (
        <>
            <div className="chat-room-container">
                {/* 설정 헤드 부분 */}
                <div className="chat-room-C-Header">
                    <div
                        onClick={() => {
                            roomType === 'monoChat'
                                ? (window.location.href = '/monochat')
                                : (window.location.href = '/message');
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src="/images/BackPoint.png" alt="" />
                    </div>
                    <div className="chat-room-name">{roomName}</div>
                    <div className="chat-room-peopleNum">{roomPeopleNum}</div>
                </div>

                <div className="chating-content-area">
                    {chatLog.map((elem) => {
                        let toWhom = '';
                        let correctedLines: any = [];
                        if (elem.isrevised) {
                            const useridAndContent =
                                elem.content.split('@@.,.@@');
                            toWhom = useridAndContent[0];
                            const lines = useridAndContent[1]?.split('&&&&');
                            let i = -1;
                            let j = -1;
                            correctedLines = [];
                            while (lines[++i]) {
                                if (lines[i].includes('/./')) {
                                    correctedLines.push(lines[i].split('/./'));
                                    j++;
                                    correctedLines[j][0] = correctedLines[
                                        j
                                    ][0].replace(
                                        /\{([^}]+)\}/g,
                                        '<span style = "color: red;text-decoration: line-through">$1</span>'
                                    );
                                    correctedLines[j][1] = correctedLines[
                                        j
                                    ][1].replace(
                                        /\{([^}]+)\}/g,
                                        '<span style="color : green">$1</span>'
                                    );
                                } else {
                                }
                            }
                        }
                        return (
                            <div key={elem.chatIndex}>
                                {/* 모노 챗 */}
                                {useridTo === 'monoChat' ? (
                                    <>
                                        {/* 입장 알림 */}
                                        {elem.isFirst === true ? (
                                            <div className="alert-message-div">
                                                <div className="user-id">
                                                    {elem.User.name} 님이
                                                    입장했습니다.
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="messages-container">
                                                {elem.userid === userid ? (
                                                    <div className="sent-message">
                                                        <div className="sent-message-footer">
                                                            <div className="sent-message-time">
                                                                {getCurrentData3(
                                                                    new Date(
                                                                        elem.createdAt
                                                                    )
                                                                )}
                                                            </div>
                                                            <div
                                                                className={
                                                                    elem.chatCounting ===
                                                                    0
                                                                        ? 'sent-message-read hide'
                                                                        : 'sent-message-read'
                                                                }
                                                            >
                                                                {
                                                                    elem.chatCounting
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="sent-message-content">
                                                            <div className="sent-message-contentarea">
                                                                {elem.isrevised ? (
                                                                    <div>
                                                                        <div
                                                                            style={{
                                                                                fontWeight:
                                                                                    'bold',
                                                                            }}
                                                                        >
                                                                            @
                                                                            {
                                                                                toWhom
                                                                            }
                                                                        </div>
                                                                        {correctedLines.map(
                                                                            (
                                                                                line: any
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        line.index
                                                                                    }
                                                                                >
                                                                                    <div
                                                                                        style={{
                                                                                            display:
                                                                                                'flex',
                                                                                        }}
                                                                                    >
                                                                                        <div
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: line[0],
                                                                                            }}
                                                                                        ></div>
                                                                                        <div className="beforecheck-emoji"></div>
                                                                                    </div>
                                                                                    <div
                                                                                        style={{
                                                                                            display:
                                                                                                'flex',
                                                                                        }}
                                                                                    >
                                                                                        <div
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: line[1],
                                                                                            }}
                                                                                        ></div>
                                                                                        <div className="correction-emoji"></div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        {
                                                                            elem.content
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="received-message">
                                                        <div className="received-message-header">
                                                            <div className="received-message-image">
                                                                <img
                                                                    src={`${process.env.REACT_APP_SERVERURL}${elem.User.profileImgPath}`}
                                                                    alt=""
                                                                />
                                                            </div>
                                                            <div className="received-message-flag">
                                                                <img
                                                                    src={`/images/flag/${elem.User.nation}.png`}
                                                                    alt=""
                                                                />
                                                            </div>
                                                            <div className="received-message-username">
                                                                <div>
                                                                    {
                                                                        elem
                                                                            .User
                                                                            .name
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="received-message-middle">
                                                            <div
                                                                className="received-message-content"
                                                                onClick={() => {
                                                                    if (
                                                                        !elem.isrevised
                                                                    ) {
                                                                        setCookies(
                                                                            'content',
                                                                            elem.content,
                                                                            cookieConfig
                                                                        );
                                                                        navigate(
                                                                            `/chat/${elem.roomNum}/${elem.User.name}/${elem.userid}/correcting`
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <div className="received-message-contentarea">
                                                                    {elem.isrevised ? (
                                                                        <div>
                                                                            <div
                                                                                style={{
                                                                                    fontWeight:
                                                                                        'bold',
                                                                                }}
                                                                            >
                                                                                @
                                                                                {
                                                                                    toWhom
                                                                                }
                                                                            </div>
                                                                            {correctedLines.map(
                                                                                (
                                                                                    line: any
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            line.index
                                                                                        }
                                                                                    >
                                                                                        <div className="beforecheck-emoji"></div>
                                                                                        <div
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: line[0],
                                                                                            }}
                                                                                        ></div>
                                                                                        <div className="correction-emoji"></div>
                                                                                        <div
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: line[1],
                                                                                            }}
                                                                                        ></div>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            {
                                                                                elem.content
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="received-message-footer">
                                                                <div className="received-message-time">
                                                                    {getCurrentData3(
                                                                        new Date(
                                                                            elem.createdAt
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div
                                                                    className={
                                                                        elem.chatCounting ===
                                                                        0
                                                                            ? 'received-message-read hide'
                                                                            : 'received-message-read'
                                                                    }
                                                                >
                                                                    {
                                                                        elem.chatCounting
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* 1:1 대화창 */}
                                        {elem.isFirst === true ? null : (
                                            <div className="messages-container">
                                                {elem.userid === userid ? (
                                                    <div className="sent-message">
                                                        <div className="sent-message-footer">
                                                            <div className="sent-message-time">
                                                                {getCurrentData3(
                                                                    new Date(
                                                                        elem.createdAt
                                                                    )
                                                                )}
                                                            </div>
                                                            <div
                                                                className={
                                                                    elem.chatCounting ===
                                                                    0
                                                                        ? 'sent-message-read hide'
                                                                        : 'sent-message-read'
                                                                }
                                                            >
                                                                {
                                                                    elem.chatCounting
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="sent-message-content">
                                                            <div className="sent-message-contentarea">
                                                                {elem.isrevised ? (
                                                                    <div>
                                                                        <div
                                                                            style={{
                                                                                fontWeight:
                                                                                    'bold',
                                                                            }}
                                                                        >
                                                                            @
                                                                            {
                                                                                toWhom
                                                                            }
                                                                        </div>
                                                                        {correctedLines.map(
                                                                            (
                                                                                line: any
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        line.index
                                                                                    }
                                                                                >
                                                                                    <div
                                                                                        style={{
                                                                                            display:
                                                                                                'flex',
                                                                                        }}
                                                                                    >
                                                                                        <div
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: line[0],
                                                                                            }}
                                                                                        ></div>
                                                                                        <div className="beforecheck-emoji"></div>
                                                                                    </div>
                                                                                    <div
                                                                                        style={{
                                                                                            display:
                                                                                                'flex',
                                                                                        }}
                                                                                    >
                                                                                        <div
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: line[1],
                                                                                            }}
                                                                                        ></div>
                                                                                        <div className="correction-emoji"></div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        {
                                                                            elem.content
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="received-message">
                                                        <div className="received-message-header">
                                                            <div
                                                                className="received-message-image"
                                                                onClick={() => {
                                                                    navigate(
                                                                        `/searchUser/${elem.userid}`
                                                                    );
                                                                }}
                                                            >
                                                                <img
                                                                    src={`${process.env.REACT_APP_SERVERURL}${elem.User.profileImgPath}`}
                                                                    alt=""
                                                                />
                                                            </div>
                                                            <div className="received-message-flag">
                                                                <img
                                                                    src={`/images/flag/${elem.User.nation}.png`}
                                                                    alt=""
                                                                />
                                                            </div>
                                                            <div
                                                                className="received-message-username"
                                                                onClick={() => {
                                                                    navigate(
                                                                        `/searchUser/${elem.userid}`
                                                                    );
                                                                }}
                                                            >
                                                                <div>
                                                                    {
                                                                        elem
                                                                            .User
                                                                            .name
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="received-message-middle">
                                                            <div
                                                                className="received-message-content"
                                                                onClick={() => {
                                                                    if (
                                                                        !elem.isrevised
                                                                    ) {
                                                                        setCookies(
                                                                            'content',
                                                                            elem.content,
                                                                            cookieConfig
                                                                        );
                                                                        navigate(
                                                                            `/chat/${elem.roomNum}/${elem.User.name}/${elem.userid}/correcting`
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <div className="received-message-contentarea">
                                                                    {elem.isrevised ? (
                                                                        <div>
                                                                            <div
                                                                                style={{
                                                                                    fontWeight:
                                                                                        'bold',
                                                                                }}
                                                                            >
                                                                                @
                                                                                {
                                                                                    toWhom
                                                                                }
                                                                            </div>
                                                                            {correctedLines.map(
                                                                                (
                                                                                    line: any
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            line.index
                                                                                        }
                                                                                    >
                                                                                        <div className="beforecheck-emoji"></div>
                                                                                        <div
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: line[0],
                                                                                            }}
                                                                                        ></div>
                                                                                        <div className="correction-emoji"></div>
                                                                                        <div
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: line[1],
                                                                                            }}
                                                                                        ></div>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            {
                                                                                elem.content
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="received-message-footer">
                                                                <div className="received-message-time">
                                                                    {getCurrentData3(
                                                                        new Date(
                                                                            elem.createdAt
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div
                                                                    className={
                                                                        elem.chatCounting ===
                                                                        0
                                                                            ? 'received-message-read hide'
                                                                            : 'received-message-read'
                                                                    }
                                                                >
                                                                    {
                                                                        elem.chatCounting
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="message-input-container">
                    <input
                        type="text"
                        placeholder={`메시지를 입력하세요${allowedLanguage ? ` (${allowedLanguage})` : ''}`}
                        className="message-input"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (
                                e.key === 'Enter' &&
                                !e.nativeEvent.isComposing
                            ) {
                                handleSendMessage();
                            }
                        }}
                    />
                    <button onClick={handleSendMessage} className="send-button">
                        전송
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatRoomPage;
