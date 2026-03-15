import { Request, Response, NextFunction } from 'express';
import { db } from '../model';
import { Op } from 'sequelize';
const sequelize = require('sequelize');
const User = db.User;
const Room = db.Room;
const Chat = db.Chat;
const ChatCount = db.ChatCount;
const CurrentNOPIM = db.CurrentNOPIM;

// room 보여주는 홈페이지에서 1:1 채팅방 목록 보여주는 함수
export const getPersonalRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userid = req.session.userid;
    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: 'Please Login First!',
            isError: true,
        });
    }

    let results: any;
    let sortedResults: any;
    try {
        results = await Room.findAll({
            where: {
                [Op.or]: [{ userid: userid }, { useridTo: userid }],
                [Op.not]: [{ useridTo: 'monoChat' }],
            },
            include: [
                {
                    model: Chat,
                    order: [['createdAt', 'DESC']],
                    limit: 1,
                },
                {
                    model: ChatCount,
                    where: { useridTo: userid },
                    limit: 300,
                },
            ],
        });
        for (const result of results) {
            const existingUserid = await User.findOne({
                where: { userid: result.dataValues.userid },
                attributes: ['name', 'nation', 'profileImgPath'],
            });

            const existingUseridTo = await User.findOne({
                where: { userid: result.dataValues.useridTo },
                attributes: ['name', 'nation', 'profileImgPath'],
            });

            const myUserNameData = await User.findOne({
                where: { userid: userid },
                attributes: ['name', 'nation', 'profileImgPath'],
            });
            const myUserName = myUserNameData.dataValues.name;

            const existingArr = [
                existingUserid.dataValues,
                existingUseridTo.dataValues,
            ];

            const final = existingArr.filter((elem) => {
                return elem.name !== myUserName;
            });
            result.dataValues.realRoomName = final;
        }
        sortedResults = results.sort(function (a: any, b: any) {
            const aChat = a.dataValues.Chats?.[a.dataValues.Chats.length - 1];
            const bChat = b.dataValues.Chats?.[b.dataValues.Chats.length - 1];
            if (!bChat && !aChat) return 0;
            if (!bChat) return 1;
            if (!aChat) return -1;
            return new Date(bChat.createdAt).getTime() - new Date(aChat.createdAt).getTime();
        });
    } catch (err) {
        return next(err);
    }

    // personalRooms.realRoomName이 1:1 채팅에서 상대방의 이름
    res.json({
        personalRooms: sortedResults,
        isError: false,
    });
};

// room 보여주는 홈페이지에서 모노 채팅방 목록 보여주는 함수
export const getMonoRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userid = req.session.userid;
    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: 'Please Login First!',
            isError: true,
        });
    }

    let results;
    try {
        results = await Room.findAll({
            where: {
                useridTo: 'monoChat',
            },
            attributes: [
                'roomNum',
                'roomName',
                'userid',
                'restrictedLang',
                'createdAt',
            ],
            include: [
                {
                    model: Chat,
                    order: [['createdAt', 'DESC']],
                    limit: 1,
                },
                {
                    model: ChatCount,
                    limit: 1,
                    where: { useridTo: userid },
                },
                {
                    model: CurrentNOPIM,
                },
            ],
        });
        for (const result of results) {
            let numberOfPeople = await Chat.count({
                distinct: true,
                col: 'userid',
                where: { roomNum: result.dataValues.roomNum },
            });
            if (numberOfPeople === 0) {
                numberOfPeople = 1;
            }
            result.dataValues.numberOfPeople = numberOfPeople;

            let userInfo = await User.findOne({
                where: { userid: result.dataValues.userid },
                attributes: ['name', 'nation', 'profileImgPath'],
            });
            result.dataValues.userInfo = userInfo;
        }
    } catch (err) {
        return next(err);
    }
    res.json({
        monoRooms: results,
        isError: false,
    });
};

export const getChatLog = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const roomNum = req.params.id;
    const userid = req.session.userid;

    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: 'Please Login First!',
            isError: true,
        });
    }

    try {
        const roomInfo = await Room.findOne({
            where: { roomNum: roomNum },
        });

        if (!roomInfo) {
            return res
                .status(404)
                .json({ msg: `There's no Chat Room`, isError: true });
        }

        if (roomInfo.dataValues.useridTo !== 'monoChat') {
            const existingUserid1 = roomInfo.dataValues.userid;
            const existingUserid2 = roomInfo.dataValues.useridTo;
            const existingUseridArr = [existingUserid1, existingUserid2];

            const sortedExistingUseridArr = existingUseridArr.filter((elem) => {
                return elem !== userid;
            });

            const usernameTo = await User.findOne({
                where: { userid: sortedExistingUseridArr },
                attributes: ['name'],
            });

            roomInfo.dataValues.roomName = usernameTo.dataValues.name;
        }

        const chatNumber = await Chat.count({
            col: 'userid',
            distinct: true,
            where: { roomNum: roomNum },
        });

        if (
            roomInfo.dataValues.useridTo !== 'monoChat' &&
            !(
                roomInfo.dataValues.userid === userid ||
                roomInfo.dataValues.useridTo === userid
            )
        ) {
            return res.status(403).json({
                msg: `Not authenticated User entranced!`,
                isError: true,
            });
        }

        ChatCount.destroy({
            where: { roomNum: roomNum, useridTo: userid },
        });

        const isFirst = await Chat.findOne({
            where: { roomNum: roomNum, userid: userid, isFirst: true },
        });
        if (!isFirst) {
            const username = await User.findOne({
                where: { userid: userid },
                attributes: ['name'],
            });

            const usernameTo = await User.findOne({
                where: { userid: roomInfo.dataValues.useridTo },
                attributes: ['name'],
            });

            await Chat.create({
                roomNum: roomNum,
                userid: userid,
                content: `${username.dataValues.name}님이 입장하셨습니다.`,
                isFirst: true,
            });

            if (roomInfo.dataValues.useridTo !== 'monoChat') {
                await Chat.create({
                    roomNum: roomNum,
                    userid: roomInfo.dataValues.useridTo,
                    content: `${usernameTo.dataValues.name}님이 입장하셨습니다.`,
                    isFirst: true,
                });
            }
        }

        const results = await Chat.findAll({
            where: { roomNum: roomNum },
            include: [
                {
                    model: User,
                    attributes: ['profileImgPath', 'name', 'nation'],
                },
            ],
        });
        for (const result of results) {
            const chatCounting = await ChatCount.count({
                attributes: [
                    [
                        sequelize.fn(
                            'COUNT',
                            sequelize.literal('DISTINCT useridTo')
                        ),
                        'userCount',
                    ],
                ],
                where: {
                    roomNum: roomNum,
                    chatIndex: result.dataValues.chatIndex,
                },
            });
            result.dataValues.chatCounting = chatCounting;
        }

        res.json({
            chatLog: results,
            roomInfo: roomInfo,
            chatNumber: chatNumber,
        });
    } catch (err) {
        return next(err);
    }
};
