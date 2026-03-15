import { db } from '../model';
import { Op } from 'sequelize';
const sequelize = require('sequelize');
const CurrentNOPIM = db.CurrentNOPIM;
const Room = db.Room;
const Chat = db.Chat;
const ChatCount = db.ChatCount;

export const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9);
};

export async function createMonoRoomDb(
    roomName: string,
    userid: string,
    useridTo: string,
    restrictedLang: string,
    roomNumArr: Array<String>
) {
    const genaratedUniqueId = generateUniqueId();
    try {
        const result = await Room.create({
            roomNum: genaratedUniqueId,
            roomName: roomName,
            userid: userid,
            useridTo: useridTo,
            restrictedLang: restrictedLang,
        });

        await CurrentNOPIM.create({
            roomNum: genaratedUniqueId,
            numberOfPeople: 0,
        });

        roomNumArr.push(result.roomNum);
    } catch (err) {
        console.log(err);
    }
}

export function updatePeopleInMonoRoom(roomClients: number, room: string) {
    CurrentNOPIM.update(
        {
            numberOfPeople: roomClients,
        },
        {
            where: { roomNum: room },
        }
    );
}

export async function createPersonalRoomDb(
    roomName: string,
    userid: string,
    useridTo: string,
    roomNumArr: Array<String>
) {
    let result;
    const genaratedUniqueId = generateUniqueId();
    try {
        const validCheck = await Room.findOne({
            where: {
                userid: userid,
                useridTo: useridTo,
            },
        });

        const validCheck2 = await Room.findOne({
            where: {
                userid: useridTo,
                useridTo: userid,
            },
        });

        if (validCheck) {
            return roomNumArr.push(validCheck.dataValues.roomNum);
        }
        if (validCheck2) {
            return roomNumArr.push(validCheck2.dataValues.roomNum);
        }

        result = await Room.create({
            roomNum: genaratedUniqueId,
            roomName: roomName,
            userid: userid,
            useridTo: useridTo,
            restrictedLang: null,
        });

        roomNumArr.push(result.dataValues.roomNum);
    } catch (err) {
        console.log(err);
    }

    return;
}

export async function createChatDb(
    roomNum: string,
    userid: string,
    content: string,
    isrevised: boolean = false,
    toWhom: string | null = null
) {
    let result;
    try {
        result = await Chat.create({
            roomNum: roomNum,
            userid: userid,
            content: content,
            isrevised: isrevised,
            toWhom: toWhom,
        });
        const peopleInChatRoom = await Chat.findAll({
            attributes: [[sequelize.literal('DISTINCT userid'), 'userid']],
            where: {
                roomNum: roomNum,
                [Op.not]: [{ userid: userid }],
            },
        });
        for (const personInChatRoom of peopleInChatRoom) {
            ChatCount.create({
                roomNum: roomNum,
                chatIndex: result.dataValues.chatIndex,
                userid: userid,
                useridTo: personInChatRoom.dataValues.userid,
            });
        }
    } catch (err) {
        console.log(err);
    }
}
