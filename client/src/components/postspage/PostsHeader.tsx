import { useRef } from 'react';
import '../../styles/PostHeader.scss';
import { useNavigate } from 'react-router-dom';

function Header(props: any) {
    const { newAlarmNum } = props;
    const navigate = useNavigate();
    const alarm = useRef<HTMLDivElement>(null);
    let alarmClass = 'alertAllChecked';
    if (newAlarmNum > 0) {
        alarmClass = 'alertArrived';
    }
    return (
        <>
            <div className="header-container">
                <div className="posts-title"></div>
                <div
                    className={`${alarmClass}`}
                    ref={alarm}
                    onClick={() => navigate('/alert')}
                ></div>
                <button
                    className="create-post"
                    onClick={() => navigate('/newpost')}
                >글 쓰기</button>
            </div>
        </>
    );
}

export default Header;
