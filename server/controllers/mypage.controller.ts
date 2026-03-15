import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { db } from '../model';
import { existingLangInterface } from '../types/types';
import { userDataInterface } from '../types/types';
const User = db.User;
const Lang = db.Lang;
const Post = db.Post;
const Comment = db.Comment;
const PostLike = db.PostLike;
const PostImage = db.PostImages;
const LangPost = db.LangPost;
const LangComment = db.LangComment;
const LangPostLike = db.LangPostLike;
const Chat = db.Chat;

// mypage에 들어가서 page가 render되면 useEffect와 axios로 정보를 가져오는 함수
export const getmyPage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userid = req.session.userid;
    let userDataObj: userDataInterface;
    let learningLangObjArr: Array<existingLangInterface> = [];

    if (!userid || userid == '' || userid === null) {
        return res.status(401).json({
            msg: '로그인이 필요합니다.',
            isError: true,
        });
    }

    try {
        userDataObj = await User.findOne({
            where: { userid: userid },
            attributes: [
                'userid',
                'name',
                'gender',
                'nation',
                'introduction',
                'firLang',
                'profileImgPath',
            ],
        });
    } catch (err) {
        return next(err);
    }

    if (!userDataObj) {
        return res
            .status(500)
            .json({ msg: '오류가 발생했습니다.', isError: true });
    }
    try {
        learningLangObjArr = await Lang.findAll({
            where: { userid: userid },
            attributes: ['index', 'learningLang'],
        });
    } catch (err) {
        next(err);
    }

    if (!learningLangObjArr) {
        return res
            .status(500)
            .json({ msg: '오류가 발생했습니다.', isError: true });
    }

    let learningLang: Array<string> = [];

    for (const existingLangsObj of learningLangObjArr) {
        learningLang.push(existingLangsObj.learningLang);
    }

    let postCulDatas;
    let postLangDatas;

    try {
        postCulDatas = await Post.findAll({
            where: { userid: userid },
            include: [
                {
                    model: User,
                    attributes: [
                        'name',
                        'gender',
                        'nation',
                        'profileImgPath',
                        'firLang',
                    ],
                    include: [
                        {
                            model: Lang,
                        },
                    ],
                },
                {
                    model: Comment,
                },
                {
                    model: PostLike,
                },
                {
                    model: PostImage,
                },
            ],
        });
        postLangDatas = await LangPost.findAll({
            where: { userid: userid },
            include: [
                {
                    model: User,
                    attributes: ['name', 'gender', 'nation', 'profileImgPath'],
                },
                {
                    model: LangComment,
                },
                {
                    model: LangPostLike,
                },
            ],
        });
    } catch (err) {
        return next(err);
    }

    res.json({
        userDataObj: userDataObj,
        learningLang: learningLang,
        postCulDatas: postCulDatas,
        postLangDatas: postLangDatas,
    });
};

// userPassword를 변경하는 버튼을 눌렀을 때 실행되는 함수
export const changeUserPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userid = req.session.userid;

    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: '로그인이 필요합니다.',
            isError: true,
        });
    }

    let userPassword;
    try {
        userPassword = await User.findOne({
            where: { userid: userid },
            attributes: ['password'],
        });
    } catch (err) {
        return next(err);
    }

    const result = bcrypt.compareSync(currentPassword, userPassword.password);
    if (!result) {
        return res.json({
            msg: '현재 비밀번호가 올바르지 않습니다.',
            isError: true,
        });
    }

    if (newPassword.trim().length < 6 || !newPassword) {
        return res.json({
            msg: '비밀번호는 6자 이상이어야 합니다.',
            isError: true,
        });
    }

    if (!(newPassword === confirmPassword)) {
        return res.json({
            msg: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
            isError: true,
        });
    }

    let isSame;
    try {
        isSame = bcrypt.compareSync(newPassword, userPassword.password);
    } catch (err) {
        return next(err);
    }

    if (isSame) {
        return res.json({
            msg: '현재 비밀번호와 새 비밀번호가 동일합니다.',
            isError: true,
        });
    }
    let hashedNewPassword;
    try {
        hashedNewPassword = bcrypt.hashSync(newPassword, 12);
    } catch (err) {
        return next(err);
    }

    try {
        await User.update(
            {
                password: hashedNewPassword,
            },
            {
                where: { userid: userid },
            }
        );
        return res.json({
            msg: '비밀번호가 변경되었습니다.',
            isError: false,
        });
    } catch (err) {
        return res.json({
            msg: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            isError: true,
        });
    }
};

// user learning Language를 수정했을 때 실행되는 함수
export const changeUserLang = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { learningLangs } = req.body;
    const userid = req.session.userid;

    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: '로그인이 필요합니다.',
            isError: true,
        });
    }
    if (
        learningLangs &&
        learningLangs.length > 0 &&
        learningLangs[0].trim().length > 0
    ) {
        try {
            await Lang.destroy({
                where: { userid: userid },
            });
            for (const lang of learningLangs) {
                await Lang.create({
                    userid: userid,
                    learningLang: lang,
                });
            }
        } catch (err) {
            next(err);
        }
        res.json({
            msg: '학습 언어가 변경되었습니다.',
            isError: false,
        });
    } else {
        res.json({
            msg: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            isError: true,
        });
    }
};

// user name을 수정했을 때 실행되는 함수
export const changeUserName = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name } = req.body;
    const userid = req.session.userid;

    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: '로그인이 필요합니다.',
            isError: true,
        });
    }

    try {
        await User.update({ name: name }, { where: { userid: userid } });
        res.json({ msg: 'name change completed.', isError: false });
    } catch (err) {
        res.json({
            msg: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            isError: true,
        });
    }
};

// 회원 탈퇴 시 실행되는 함수
export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userid = req.session.userid;

    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: '로그인이 필요합니다.',
            isError: true,
        });
    }

    try {
        await User.destroy({
            where: { userid: userid },
        });

        req.session.userid = '';

        res.json({
            msg: 'Deletion completed',
            isError: false,
        });
    } catch (err) {
        res.json({
            msg: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            isError: true,
        });
    }
};

export const editIntroduction = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { content } = req.body;
    const userid = req.session.userid;

    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: '로그인이 필요합니다.',
            isError: true,
        });
    }
    try {
        await User.update(
            { introduction: content },
            { where: { userid: userid }, returning: true, plain: true }
        );

        res.json({ msg: 'introduction change completed.', isError: false });
    } catch (err) {
        res.json({
            msg: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            isError: true,
        });
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.session.userid && req.session.userid.length > 3) {
        req.session.userid = '';
        res.json({ msg: 'logout completed', idError: false });
    } else {
        res.json({ msg: 'Already being logoutted', idError: true });
    }
};

export const multerMypage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userid = req.session.userid;
    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: '로그인이 필요합니다.',
            isError: true,
        });
    }
    try {
        await User.update(
            {
                profileImgPath: req.file?.path,
            },
            { where: { userid: req.session.userid } }
        );
    } catch (err) {
        return next(err);
    }

    res.json({ path: req.file?.path });
};

export const getRevisedLists = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userid = req.session.userid;
    const culs: string[] = [];
    const langs: string[] = [];
    const chats: string[] = [];
    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: '로그인이 필요합니다.',
            isError: true,
        });
    }
    try {
        const culPosts = await Post.findAll({
            where: { userid: userid },
            attributes: ['postId'],
            include: [
                {
                    model: Comment,
                    attributes: ['content', 'isrevised'],
                },
            ],
        });
        let i = -1;
        let j, k;
        while (culPosts[++i]) {
            if (culPosts[i].Comments) {
                j = -1;
                while (culPosts[i].Comments[++j]) {
                    if (culPosts[i].Comments[j].isrevised) {
                        const comments =
                            culPosts[i].Comments[j].content.split('&&&&');
                        k = -1;
                        while (comments[++k]) {
                            if (comments[k].includes('/./')) {
                                culs.push(comments[k]);
                            }
                        }
                    }
                }
            }
        }

        const langPosts = await LangPost.findAll({
            where: { userid: userid },
            attributes: ['postId'],
            include: [
                {
                    model: LangComment,
                    attributes: ['content', 'isrevised'],
                },
            ],
        });
        i = -1;
        while (langPosts[++i]) {
            if (langPosts[i].LangComments) {
                j = -1;
                while (langPosts[i].LangComments[++j]) {
                    if (langPosts[i].LangComments[j].isrevised) {
                        const comments =
                            langPosts[i].LangComments[j].content.split('&&&&');
                        k = -1;
                        while (comments[++k]) {
                            if (comments[k].includes('/./')) {
                                langs.push(comments[k]);
                            }
                        }
                    }
                }
            }
        }
        const revisedChats = await Chat.findAll({
            where: { isrevised: true, toWhom: userid },
        });
        i = -1;
        while (revisedChats[++i]) {
            if (revisedChats[i].content) {
                const nameAndContent = revisedChats[i].content.split('@@.,.@@');
                const lines = nameAndContent[1].split('&&&&');
                j = -1;
                while (lines[++j]) {
                    if (lines[j].includes('/./')) {
                        chats.push(lines[j]);
                    }
                }
            }
        }
        res.json({
            langRes: langs,
            culRes: culs,
            chatRes: chats,
            isError: false,
        });
    } catch (err) {
        next(err);
    }
};
