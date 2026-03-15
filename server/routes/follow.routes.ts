const express = require('express');
import * as controller from '../controllers/follow.controller';
export const followRouter = express();

followRouter.post('/followexec', controller.follow);
followRouter.post('/unfollowexec', controller.unfollow);
followRouter.get('/followNumGet', controller.followNumGet);
followRouter.get('/followListGet', controller.followListGet);
followRouter.get('/getAlarmList', controller.getAlarmList);
followRouter.get('/newAlarmNumGet', controller.newAlarmNumGet);
followRouter.delete('/alarm/:index', controller.deleteAlarm);
