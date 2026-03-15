import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { db } from '../model';
const User = db.User;
const Lang = db.Lang;

export async function login(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    // isLoggedin이 true일 경우 userid 값을 쿠키에 넣어줌. 이걸로 프론트 단에서 로그인 기능 구현
    const { userid, password } = req.body;
    if (!userid || userid.trim().length === 0) {
        return res.json({
            msg: '아이디를 입력해주세요.',
            isLoggedin: false,
            userid: null,
        });
    }

    if (!password || password.trim().length === 0) {
        return res.json({
            msg: '비밀번호를 입력해주세요.',
            isLoggedin: false,
            userid: null,
        });
    }
    let existingUser;
    try {
        existingUser = await User.findOne({ where: { userid: userid } });
    } catch (err) {
        return res.status(500).json({
            msg: '오류가 발생했습니다.',
            isLoggedin: false,
            userid: null,
        });
    }
    if (!existingUser) {
        return res.json({
            msg: '아이디 또는 비밀번호가 올바르지 않습니다.',
            isLoggedin: false,
            userid: null,
        });
    }

    if (!bcrypt.compareSync(password, existingUser.password)) {
        return res.json({
            msg: '아이디 또는 비밀번호가 올바르지 않습니다.',
            isLoggedin: false,
            userid: null,
        });
    }

    req.session.userid = userid;
    res.json({ msg: null, isLoggedin: true, userid: userid });
}

export async function signup(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    const {
        userid,
        password,
        confirmPassword,
        name,
        gender,
        isUnique,
        nation,
        firLang,
        learningLang,
    } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({
            where: { userid: req.body.userid },
        });
    } catch (err) {
        return next(err);
    }

    if (!isUnique || JSON.parse(isUnique) == false || existingUser) {
        return res.json({
            msg: '아이디 중복 확인을 해주세요.',
            isError: true,
        });
    }

    if (!userid || userid.trim().length <= 3) {
        return res.json({
            msg: '아이디는 4자 이상이어야 합니다.',
            isError: true,
        });
    }

    if (!password || password.trim().length <= 5) {
        return res.json({
            msg: '비밀번호는 6자 이상이어야 합니다.',
            isError: true,
        });
    }

    if (!(password === confirmPassword)) {
        return res.json({
            msg: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
            isError: true,
        });
    }

    if (!name || name.trim().length < 2) {
        return res.json({
            msg: '닉네임은 2자 이상이어야 합니다.',
            isError: true,
        });
    }

    if (!(gender === 'm' || gender === 'f')) {
        return res.json({
            msg: '성별을 선택해주세요.',
            isError: true,
        });
    }
    if (!nation || nation.trim().length < 2) {
        return res.json({
            msg: '국적을 선택해주세요.',
            isError: true,
        });
    }

    if (!firLang || firLang.trim().length < 2) {
        return res.json({
            msg: '모국어를 선택해주세요.',
            isError: true,
        });
    }

    if (!learningLang || learningLang.length < 1) {
        return res.json({
            msg: '학습 언어를 1개 이상 선택해주세요.',
            isError: true,
        });
    }

    const hashPW: string = bcrypt.hashSync(password, 12);

    try {
        const result = await User.create({
            userid: userid,
            name: name,
            password: hashPW,
            gender: gender,
            nation: nation,
            firLang: firLang,
        });
        for (const lang of learningLang) {
            await Lang.create({
                userid: userid,
                learningLang: lang,
            });
        }
    } catch (err) {
        return next(err);
    }
    return res.json({ msg: null, isError: false });
}

export async function existAlready(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { userid } = req.body;
    if (userid.trim().length < 4) {
        return res.json({
            msg: '아이디는 4자 이상이어야 합니다.',
            isUnique: false,
        });
    }
    let existingUser;
    try {
        existingUser = await User.findOne({
            where: { userid: userid },
        });
    } catch (err) {
        return next(err);
    }
    if (existingUser) {
        res.json({ msg: '이미 사용 중인 아이디입니다.', isUnique: false });
    } else {
        res.json({ msg: '사용 가능한 아이디입니다.', isUnique: true });
    }
}
