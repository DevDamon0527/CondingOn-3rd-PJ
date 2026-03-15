declare module 'express-session' {
    interface SessionData {
        userid: string; // string으로 수정
    }
}
import 'dotenv/config';

import { Request, Response } from 'express';
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const http = require('http');

import { Server, Socket } from 'socket.io';

import { authRouter } from './routes/auth.routes';
import { myPageRouter } from './routes/mypage.routes';
import { followRouter } from './routes/follow.routes';
import { postsRouter } from './routes/post.routes';
import { langPostsRouter } from './routes/langPost.routes';
import { userSearchRouter } from './routes/userSearch.routes';
import { chatRouter } from './routes/chat.routes';
import { postSearchRouter } from './routes/postSearch.routes';
import { db } from './model';
const handleErrors = require('./middlewares/errorHandler.middleware');
const notFoundHandler = require('./middlewares/notFound.middleware');
import { getSessionConfig } from './config/session.config';
import {
    createMonoRoomDb,
    updatePeopleInMonoRoom,
    createChatDb,
    createPersonalRoomDb,
} from './utils/createChatsAndRoomsDb';
const path = require('path');
const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: process.env.CLIENTURL,
        methods: '*',
    },
});

const Room = db.Room;

app.use('/public', express.static(__dirname + '/public'));
app.use(session(getSessionConfig()));
app.use(express.static(path.join(__dirname, '/../client/build')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: [process.env.CLIENTURL, `http://${process.env.SERVERIPNO}`],
        methods: ['GET', 'POST', 'PATCH', 'DELETE'], // 'patch' 대신 'PATCH' 사용
    })
);

const connectedClients: Record<string, Socket> = {};

app.use(authRouter);
app.use(myPageRouter);
app.use(followRouter);
app.use(postsRouter);
app.use(langPostsRouter);
app.use(userSearchRouter);
app.use(chatRouter);
app.use(postSearchRouter);

// 사용자의 채팅방 정보를 저장하는 변수
const userChatRooms: Record<string, string[]> = {};
const chatRooms: Record<
    string,
    { id: string; name: string; inviteCode: string }
> = {}; // chatRooms 변수 선언

// 사용자의 채팅방 정보를 저장하는 함수 (데이터베이스)
const saveUserChatRoom = (userId: string, roomId: string) => {
    if (!userChatRooms[userId]) {
        userChatRooms[userId] = [];
    }

    userChatRooms[userId].push(roomId);
};

// 사용자의 채팅방 정보를 제거하는 함수 (데이터베이스)
const removeUserChatRoom = (userId: string, roomId: string) => {
    if (userChatRooms[userId]) {
        userChatRooms[userId] = userChatRooms[userId].filter(
            (r) => r !== roomId
        );
    }
};

app.get('/fetch/language/:roomId', async (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    const room = await Room.findOne({ where: { roomNum: roomId } });

    if (room) {
        res.json({ language: room.restrictedLang || '' });
    } else {
        res.status(404).json({ error: 'Room not founded' });
    }
});

const chatRoomLanguages: Record<string, string> = {};
io.on('connection', (socket: Socket) => {
    socket.on('joinRoom', (room) => {
        socket.join(room);
        const roomClients = io.sockets.adapter.rooms.get(room);
        let numberOfClients: number;

        if (!roomClients) {
            numberOfClients = 0;
        } else {
            numberOfClients = roomClients.size;
        }
        updatePeopleInMonoRoom(numberOfClients, room);

        io.emit('needReload', 'reload');
    });

    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        const roomClients = io.sockets.adapter.rooms.get(room);
        let numberOfClients;
        if (!roomClients) {
            numberOfClients = 0;
        } else {
            numberOfClients = roomClients.size;
        }
        updatePeopleInMonoRoom(numberOfClients, room);
        io.emit('needReload', 'reload');

        removeUserChatRoom(socket.id, room); // 사용자의 채팅방 정보에서 제거
        console.log(`User ${socket.id} left room ${room}`);
        socket.on('languageChanged', ({ roomId, selectedLanguage }) => {
            // 1. 채팅방 별로 언어 설정 정보 저장
            chatRoomLanguages[roomId] = selectedLanguage;

            // 2. 해당 채팅방에 속한 모든 유저에게 언어 설정 전파
            io.to(roomId).emit('languageChanged', {
                roomId,
                selectedLanguage,
            });
        });
    });

    connectedClients[socket.id] = socket;

    // 여기서 사용자의 ID를 전달합니다.
    socket.emit('userId', socket.id);

    socket.on('chat message', (msg) => {
        if (msg.room) {
            const serverMessage = `Server: ${msg.text}`;
            const isSentByMe = msg.isSentByMe || false;
            // userId 추가
            socket.broadcast.to(msg.room).emit('chat message', {
                ...msg,
                text: serverMessage,
                isSentByMe,
                userId: msg.userId, // 클라이언트에서 전달받은 userId 사용
            });
            if (msg.isrevised) {
                createChatDb(
                    msg.room,
                    msg.userId,
                    msg.text,
                    msg.isrevised,
                    msg.toWhom
                );
            } else {
                createChatDb(msg.room, msg.userId, msg.text, msg.isrevised);
            }
            io.emit('needReload', 'reload');
        }
    });

    socket.on('disconnect', () => {
        delete connectedClients[socket.id];
    });

    socket.on(
        'createRoom',
        ({ roomName, userid, useridTo, restrictedLang }) => {
            const roomNumArr: Array<string> = [];
            (useridTo === 'monoChat'
                ? createMonoRoomDb(
                      roomName,
                      userid,
                      useridTo,
                      restrictedLang,
                      roomNumArr
                  )
                : createPersonalRoomDb(roomName, userid, useridTo, roomNumArr)
            ).then(() => {
                const inviteCode = generateInviteCode();
                chatRooms[roomNumArr[roomNumArr.length - 1]] = {
                    id: roomNumArr[roomNumArr.length - 1],
                    name: roomName,
                    inviteCode,
                };

                socket.emit('roomCreated', {
                    roomNum: roomNumArr[roomNumArr.length - 1],
                    roomName,
                    roomNumArr,
                });
                // userId 추가
                io.to(roomNumArr[roomNumArr.length - 1]).emit('roomCreated', {
                    roomNum: roomNumArr[roomNumArr.length - 1],
                    roomName,
                    roomNumArr,
                    userId: socket.id,
                });

                saveUserChatRoom(socket.id, roomNumArr[roomNumArr.length - 1]); // 사용자의 채팅방 정보 저장

                console.log(
                    `User ${socket.id} created and joined room ${
                        roomNumArr[roomNumArr.length - 1]
                    }`
                );
            });
        }
    );

    socket.on('joinRoomByInviteCode', (inviteCode) => {
        const room = findRoomByInviteCode(inviteCode);

        if (room) {
            socket.join(room.id);
            socket.emit('joinedRoom', room.id);
        } else {
            socket.emit('invalidInviteCode');
        }
    });
});

const generateInviteCode = () => {
    return Math.random().toString(36).substr(2, 8);
};

const findRoomByInviteCode = (inviteCode: string) => {
    return Object.values(chatRooms).find(
        (room) => room.inviteCode === inviteCode
    );
};

app.get('/api/chatRooms', (req: Request, res: Response) => {
    res.json(Object.values(chatRooms));
});

app.get('/api/chatRooms/:roomId', (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    const room = chatRooms[roomId];

    if (room) {
        res.json(room);
    } else {
        res.status(404).json({ error: 'Room not found' });
    }
});

// 에러처리 핸들러, 요청, 응답의 제일 아래가야함.
app.use(handleErrors);
app.use(notFoundHandler);

db.sequelize
    .sync({ force: false })
    .then(() => {
        server.listen(process.env.SERVERPORT, () => {
            console.log(`Server is running on ${process.env.SERVERURL}`);
        });
    })
    .catch((err: Error) => {
        console.log(err);
    });

// nodemon 재시작 시 포트를 정상 반납하고 종료
process.on('SIGTERM', () => {
    server.close(() => {
        process.exit(0);
    });
});
