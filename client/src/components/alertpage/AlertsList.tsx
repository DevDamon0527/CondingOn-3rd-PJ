import React, { useEffect, useState } from 'react';
import CommentAlert from './CommentAlert';
import FollowAlert from './FollowAlert';
import MonotalkAlert from './MonotalkAlert';
import PostAlert from './PostAlert';
import axios from 'axios';
import '../../styles/AlertPageAlertsList.scss';

function AlertsList(props: any) {
    const { userid } = props;
    const [alarmList, setAlarmList] = useState<any[]>([]);

    const getAlarms = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/getAlarmList`,
                params: {
                    userid: userid,
                },
                withCredentials: true,
            });
            setAlarmList(res.data.list ?? []);
        } catch (error) {
            alert(`잘못된 접근입니다. Error: ${error}`);
        }
    };

    const deleteAlarm = async (alarmIndex: number) => {
        setAlarmList((prev) => prev.filter((a) => a.index !== alarmIndex));
        try {
            await axios({
                method: 'delete',
                url: `${process.env.REACT_APP_SERVERURL}/alarm/${alarmIndex}`,
                withCredentials: true,
            });
        } catch (error) {
            console.error('알림 삭제 실패:', error);
        }
    };

    useEffect(() => {
        getAlarms();
    }, []);

    return (
        <>
            <div className="alertslist-container">
                {alarmList.length === 0 ? (
                    <div className="alertslist-empty">
                        <div className="alertslist-empty-icon">🔔</div>
                        <div>새로운 알림이 없습니다</div>
                    </div>
                ) : (
                    alarmList.reduceRight(
                        (accumulator: any, element: any, key: any) => {
                            const createdAtDate = new Date(element.createdAt);
                            const currentDate = new Date();
                            const validTime =
                                currentDate.getTime() -
                                    createdAtDate.getTime() <
                                30 * 60 * 1000;

                            if (element.alarmType == 0) {
                                accumulator.push(
                                    <div key={key}>
                                        <CommentAlert
                                            alarmObj={element}
                                            validTime={validTime}
                                            onDelete={deleteAlarm}
                                        />
                                    </div>
                                );
                            } else if (element.alarmType == 1) {
                                accumulator.push(
                                    <div key={key}>
                                        <FollowAlert
                                            alarmObj={element}
                                            validTime={validTime}
                                            onDelete={deleteAlarm}
                                        />
                                    </div>
                                );
                            } else if (element.alarmType == 2) {
                                accumulator.push(
                                    <div key={key}>
                                        <PostAlert
                                            alarmObj={element}
                                            validTime={validTime}
                                            onDelete={deleteAlarm}
                                        />
                                    </div>
                                );
                            } else if (element.alarmType == 3) {
                                accumulator.push(
                                    <div key={key}>
                                        <MonotalkAlert
                                            alarmObj={element}
                                            validTime={validTime}
                                            onDelete={deleteAlarm}
                                        />
                                    </div>
                                );
                            }
                            return accumulator;
                        },
                        []
                    )
                )}
            </div>
        </>
    );
}

export default AlertsList;
