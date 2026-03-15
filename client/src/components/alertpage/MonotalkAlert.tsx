import { useEffect, useState } from 'react';
import '../../styles/AlertPageMonotalkAlert.scss';

interface TimeObject {
    howLong: string;
}

function MonotalkAlert(props: any) {
    const { alarmObj, validTime, onDelete } = props;
    const [alarmClassName, setAlarmClassName] = useState(
        'monotalkalert-container'
    );
    const [timeObj, setTimeObj] = useState<TimeObject | null>(null);

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
        return { howLong };
    };

    useEffect(() => {
        setTimeObj(getTimeObj(alarmObj.createdAt));
        if (!validTime && alarmObj.checked) {
            setAlarmClassName('monotalkalert-oldcontainer');
        }
    }, []);

    return (
        <div className={alarmClassName}>
            <div className="alert-body">
                <div className="monotalkalert-title">
                    <span className="monotalkalert-username">
                        {alarmObj.otherUserId}
                    </span>
                    님이 새 모노톡을 개설했습니다
                </div>
                <div className="monotalkalert-content">{timeObj?.howLong}</div>
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

export default MonotalkAlert;
