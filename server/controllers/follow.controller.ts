import { AlarmModel } from './../model/Alarm';
import { Request, Response, NextFunction } from 'express';
import { db } from '../model';
const user = db.User;
const Follow = db.Follow;
const Alarm = db.Alarm;
import { User } from '../../client/src/types/types';

const setAlarm = async (
    userid: string,
    otherUserId: string,
    alarmType: number
) => {
    try {
        await Alarm.create({
            userid: userid,
            otherUserId: otherUserId,
            alarmType: alarmType,
            checked: false,
        });
    } catch (error) {
        console.log(error);
        return error;
    }
};
export async function follow(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    const { followId } = req.body;
    let userid = req.session.userid;
    if (!userid) {
        userid = '';
    }

    try {
        const followCheck = await Follow.findOne({
            where: { userid: followId, followerId: userid },
        });
        if (!followCheck) {
            try {
                await Follow.create({ userid: followId, followerId: userid });
                await setAlarm(followId, userid, 1);
                return res.json({
                    msg: 'complete',
                    result: true,
                });
            } catch (error) {
                return res.json({
                    msg: error,
                    result: false,
                });
            }
        } else {
            try {
                await Follow.destroy({
                    where: { userid: followId, followerId: userid },
                });
                return res.json({
                    msg: 'follow deleted',
                    result: true,
                });
            } catch (error) {
                return res.json({
                    msg: error,
                    result: false,
                });
            }
        }
    } catch (error) {
        return res.json({
            msg: error,
            result: false,
        });
    }
}

export async function unfollow(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    const { userid, followId } = req.body;
    try {
        const followCheck = await Follow.findOne({
            where: { userid: followId, followerId: userid },
        });
        if (followCheck) {
            try {
                await Follow.destroy({
                    where: { userid: followId, followerId: userid },
                });
                return res.json({
                    msg: 'complete',
                    result: true,
                });
            } catch (error) {
                return res.json({
                    msg: error,
                    result: false,
                });
            }
        }
    } catch (error) {
        return res.json({
            msg: error,
            result: false,
        });
    }
}

export async function followNumGet(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    let { userid } = req.query;
    try {
        let tempObj = await Follow.findAll({
            where: { followerId: userid },
        });
        let followingNumber: number = 0;
        let followerNumber: number = 0;
        tempObj.forEach((obj: object) => {
            followingNumber++;
        });
        tempObj = await Follow.findAll({
            where: { userid: userid },
        });
        tempObj.forEach((obj: object) => {
            followerNumber++;
        });
        return res.json({
            followingNumber,
            followerNumber,
            result: true,
        });
    } catch (error) {
        return res.json({
            msg: error,
            result: false,
        });
    }
}
export async function followListGet(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    let { userid } = req.query;
    try {
        let followingList: User[] = [];
        let followerList: User[] = [];
        let tempUser: User;
        let tempObj = await Follow.findAll({
            where: { followerId: userid },
        });
        for (const obj of tempObj) {
            tempUser = await user.findOne({ where: { userid: obj.userid } });
            followingList.push(tempUser);
        }
        tempObj = await Follow.findAll({
            where: { userid: userid },
        });
        for (const obj of tempObj) {
            tempUser = await user.findOne({
                where: { userid: obj.followerId },
            });
            followerList.push(tempUser);
        }
        return res.json({
            followingList,
            followerList,
            result: true,
        });
    } catch (error) {
        return res.json({
            msg: error,
            result: false,
        });
    }
}

export async function getAlarmList(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    let { userid } = req.query;
    try {
        let checkedList = await Alarm.findAll({
            where: { userid: userid },
        });
        let uncheckedList = [...checkedList];
        for (const element of checkedList) {
            await Alarm.update(
                { checked: true },
                { where: { index: element.index } }
            );
        }
        return res.json({
            list: uncheckedList,
            result: true,
        });
    } catch (error) {
        return res.json({
            msg: error,
            result: false,
        });
    }
}

export async function deleteAlarm(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    const alarmIndex = parseInt(req.params.index);
    const userid = req.session.userid;
    if (!userid) {
        return res.status(401).json({ msg: 'Please login first', result: false });
    }
    try {
        await Alarm.destroy({ where: { index: alarmIndex, userid: userid } });
        return res.json({ msg: 'alarm deleted', result: true });
    } catch (error) {
        return res.json({ msg: error, result: false });
    }
}

export async function newAlarmNumGet(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    let { userid } = req.query;
    try {
        let tempObj = await Alarm.findAll({
            where: { userid: userid, checked: false },
        });
        let newAlarmNumber: number = 0;
        tempObj.forEach((obj: any) => {
            newAlarmNumber++;
        });
        return res.json({
            newAlarmNumber,
            result: true,
        });
    } catch (error) {
        return res.json({
            msg: error,
            result: false,
        });
    }
}
