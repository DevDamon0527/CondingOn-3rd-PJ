import { useState, useEffect } from 'react';
import '../../styles/AlertPagePostAlert.scss';
import '../../styles/AlertPageMonotalkAlert.scss';
import { useNavigate } from 'react-router-dom';

interface TimeObject {
    year: string;
    month: string;
    date: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
    howLong: string;
}

function PostAlert(props: any) {
    const { alarmObj, validTime, onDelete } = props;
    const [alarmClassName, setAlarmClassName] = useState(
        'monotalkalert-container'
    );
    const [timeObj, setTimeObj] = useState<TimeObject | null>(null);

    const navigate = useNavigate();
    const getTimeObj = (input: string): TimeObject => {
        const time = new Date(input);
        const now = new Date();
        const gap: number = now.getTime() - time.getTime();
        const secondsLong: number = Math.floor(gap / 1000);
        let howLong;
        if (secondsLong < 60) {
            howLong = `${secondsLong}sec`;
        } else if (secondsLong >= 3600 * 24 * 30) {
            howLong = `${Math.floor(secondsLong / 2592000)}month`;
        } else if (secondsLong >= 3600 * 24) {
            howLong = `${Math.floor(secondsLong / 86400)}day`;
        } else if (secondsLong >= 3600) {
            howLong = `${Math.floor(secondsLong / 3600)}hour`;
        } else {
            howLong = `${Math.floor(secondsLong / 60)}min`;
        }
        let timeObj: TimeObject = {
            year: `${time.getFullYear()}`,
            month: `${time.getMonth() + 1}`,
            date: `${time.getDate()}`,
            day: `${time.getDay()}`,
            hour: `${time.getHours()}`,
            minute: `${time.getMinutes()}`,
            second: `${time.getSeconds()}`,
            howLong: howLong,
        };
        return timeObj;
    };
    useEffect(() => {
        setTimeObj(getTimeObj(alarmObj.createdAt));
        if (!validTime && alarmObj.checked) {
            setAlarmClassName('monotalkalert-oldcontainer');
        }
    }, []);
    return (
        <div className={alarmClassName}>
            <div
                className="alert-body"
                onClick={() =>
                    navigate(
                        `/${alarmObj.option2}-postdetail/${alarmObj.option1}`
                    )
                }
            >
                <div className="postalert-title">
                    <span className="postalert-username">
                        {alarmObj.otherUserId}
                    </span>
                    님이 새 포스트를 작성했습니다
                </div>
                <div className="postalert-content">{timeObj?.howLong}</div>
            </div>
            <button
                className="alert-delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(alarmObj.index);
                }}
            >
                ×
            </button>
        </div>
    );
}

export default PostAlert;
