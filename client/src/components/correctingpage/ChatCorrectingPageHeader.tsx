import axios from 'axios';
import '../../styles/NewPostHeader.scss';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io(`${process.env.REACT_APP_SERVERURL}`);

const ChatCorrectingPageHeader = (props: any) => {
    const {
        cleanCookie,
        content,
        userid,
        tempLines,
        roomNum,
        toWhom,
        toWhomId,
    } = props;
    const navigate = useNavigate();

    const checkChangeAndSend = () => {
        let i = -1;
        let finalContent = `${toWhom}@@.,.@@${tempLines.join('&&&&')}`;
        while (content[++i]) {
            if (content[i] !== tempLines[i]) {
                socket.emit('chat message', {
                    room: roomNum,
                    text: finalContent,
                    isSentByMe: true,
                    userId: userid,
                    isrevised: true,
                    toWhom: toWhomId,
                });
                break;
            }
        }
    };
    return (
        <>
            <div className="newpost-header-container">
                <div
                    className="back-arrow"
                    onClick={() => {
                        cleanCookie();
                        navigate(-1);
                    }}
                ></div>
                <div className="newpost-header-text">맞춤법 교정</div>
                <div
                    className="create-correction"
                    onClick={() => {
                        checkChangeAndSend();
                        cleanCookie();
                        navigate(-1);
                    }}
                >
                    전송
                </div>
            </div>
        </>
    );
};

export default ChatCorrectingPageHeader;
