import { io } from 'socket.io-client';
import '../../styles/MonoChatList.scss';
import axios from 'axios';
import { getImageUrl } from '../../utils/getImageUrl';
import { useEffect, useState } from 'react';
import useErrorHandler from '../../utils/useErrorHandler';
import { Link } from 'react-router-dom';
import { getCurrentData2, getCurrnetData } from '../../utils/getCurrentData';

const socket = io(`${process.env.REACT_APP_SERVERURL}`);
interface MonoChatListProps {
    selectedLanguage: string;
}
function MonoChatList({ selectedLanguage }: MonoChatListProps) {
    const [monoRooms, setMonoRooms] = useState<any>();
    const [isLoading, setIsLoading] = useState(true);

    const { errorHandler } = useErrorHandler();
    const fetchMonoRooms = async () => {
        setIsLoading(true);
        try {
            const res = await axios({
                url: `${process.env.REACT_APP_SERVERURL}/fetch/monorooms`,
                method: 'get',
                withCredentials: true,
            });
            setMonoRooms(res.data.monoRooms);
        } catch (err: any) {
            errorHandler(err.response.status);
        } finally {
            setIsLoading(false);
        }
    };

    const languageText = (restrictedLang: string) => {
        switch (restrictedLang) {
            case 'Korean':
                return 'KR';
            case 'English':
                return 'EN';
            case 'Japanese':
                return 'JP';
            case 'Chinese':
                return 'CH';
            case 'French':
                return 'FR';
            case 'German':
                return 'GM';

            default:
                return '';
        }
    };

    useEffect(() => {
        // 데이터베이스에 있는 room 불러오기
        fetchMonoRooms();

        socket.on('needReload', () => {
            fetchMonoRooms();
        });
    }, []);
    if (isLoading) {
        return (
            <>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="monochat-skeleton-card">
                        <div className="monochat-skeleton-header">
                            <div className="skeleton-line monochat-skeleton-lang" />
                            <div className="skeleton-line monochat-skeleton-title" />
                        </div>
                        <div className="monochat-skeleton-footer">
                            <div className="skeleton-circle monochat-skeleton-avatar" />
                            <div className="monochat-skeleton-meta">
                                <div className="skeleton-line monochat-skeleton-name" />
                                <div className="skeleton-line monochat-skeleton-count" />
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (!monoRooms || monoRooms.length === 0) {
        return (
            <div className="monochat-empty-state">
                <div className="monochat-empty-icon">🗨️</div>
                <div>참여 가능한 채팅방이 없습니다</div>
            </div>
        );
    }

    return (
        <>
            {monoRooms.map((elem: any) => {
                    if (
                        selectedLanguage === 'ALL' ||
                        languageText(elem.restrictedLang) === selectedLanguage
                    ) {
                        return (
                            <div key={elem.roomNum}>
                                <Link to={`/chat/${elem.roomNum}`}>
                                    <div className="allchatroom-container">
                                        <div className="allheader-container">
                                            <div className="all-title">
                                                {languageText(
                                                    elem.restrictedLang
                                                )}
                                            </div>
                                            <div className="allchatroom-title">
                                                {elem.roomName}
                                            </div>
                                        </div>
                                        <div className="allfooter-container">
                                            <div className="all-participants-container">
                                                <div className="all-participant-container">
                                                    <div className="all-participant">
                                                        <img
                                                            src={getImageUrl(elem.userInfo.profileImgPath)}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="all-flag">
                                                        <img
                                                            src={`/images/flag/${elem.userInfo.nation}.png`}
                                                            alt=""
                                                        />
                                                    </div>
                                                </div>
                                                <div className="etc-roomboss-name">
                                                    {elem.userInfo.name}
                                                </div>
                                                <div className="etc-information">
                                                    <div className="all-participant-date">
                                                        {getCurrentData2(
                                                            new Date(
                                                                elem.Chats[0]?.createdAt
                                                            )
                                                        )}
                                                    </div>

                                                    <div className="all-participants">
                                                        <div className="participants-users">
                                                            {
                                                                elem
                                                                    .CurrentNOPIMs[0]
                                                                    .numberOfPeople
                                                            }
                                                        </div>
                                                        명 참여중 /
                                                        <div className="participants-nums">
                                                            {
                                                                elem.numberOfPeople
                                                            }
                                                        </div>
                                                        명
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    }
                })}
        </>
    );
}

export default MonoChatList;
