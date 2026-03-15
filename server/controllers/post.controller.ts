import { Request, Response, NextFunction } from 'express';
import { db } from '../model';
const User = db.User;
const Post = db.Post;
const PostLikes = db.PostLike;
const Comment = db.Comment;
const postImages = db.PostImages;
const Alarm = db.Alarm;
const Follow = db.Follow;

import { postsInterface } from '../types/types';
// 전체 포스트 get요청
export const getPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let allPosts: Array<postsInterface> = [];

    let myUserid = req.session.userid;
    if (!myUserid) {
        myUserid = '';
    }
    try {
        allPosts = await Post.findAll({
            attributes: ['postId', 'userid', 'content', 'createdAt'],
            include: [
                {
                    model: User,
                    attributes: [
                        'name',
                        'nation',
                        'gender',
                        'firLang',
                        'profileImgPath',
                    ],
                },
                {
                    model: postImages,
                    attributes: ['path'],
                },
            ],
        });
    } catch (err) {
        return next(err);
    }
    if (!allPosts || allPosts.length < 1) {
        return res.json({ msg: `Maybe there's no post here!`, isError: true });
    }
    let PostsDatas = [];
    for (let i = 0; i < allPosts.length; i++) {
        try {
            const likeCount = await PostLikes.count({
                where: {
                    PostId: allPosts[i].postId,
                },
            });

            const commentCount = await Comment.count({
                where: {
                    PostId: allPosts[i].postId,
                },
            });

            const myLikeData = await PostLikes.findOne({
                where: {
                    PostId: allPosts[i].postId,
                    userid: myUserid,
                },
            });
            const followResult = await Follow.findOne({
                where: { userid: allPosts[i].userid, followerId: myUserid },
            });
            let isFollowing;
            if (followResult) {
                isFollowing = true;
            } else {
                isFollowing = false;
            }

            if (myLikeData) {
                PostsDatas.push([
                    allPosts[i],
                    likeCount,
                    true,
                    commentCount,
                    isFollowing,
                ]);
            } else {
                PostsDatas.push([
                    allPosts[i],
                    likeCount,
                    false,
                    commentCount,
                    isFollowing,
                ]);
            }
        } catch (err) {
            return next(err);
        }
    }
    const sortedPostDatas = PostsDatas.sort(function (a: any, b: any) {
        const aDate = new Date(a[0].dataValues.createdAt).getTime();
        const bDate = new Date(b[0].dataValues.createdAt).getTime();
        return bDate - aDate;
    });

    // map으로 render 가능하게 PostDatas[0][0] = allPosts, PostDatas[0][1] = likeCount, PostDatas[0][2] = myLikeData(boolean)
    res.json({
        PostsDatas: sortedPostDatas,
        isError: false,
    });
};

// 포스트 만들기 post 요청
export const createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { content } = req.body;
    const userid = req.session.userid;
    if (!userid || userid.length < 4) {
        return res.json({
            msg: 'Please Login First!',
            isError: true,
        });
    }
    try {
        const newPost = await Post.create({
            userid: userid,
            content: content,
        });
        const files = req.files as Express.Multer.File[];
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const path = files[i].path;
                await postImages.create({
                    postId: newPost.postId,
                    userid: req.session.userid,
                    path: `/${path}`,
                });
            }
        }
        const followers = await Follow.findAll({
            where: {
                userid: userid,
            },
        });
        for (const element of followers) {
            await setAlarm(
                element.followerId,
                userid,
                2,
                newPost.getDataValue('postId'),
                newPost.getDataValue('postType')
            );
        }
    } catch (err) {
        return next(err);
    }

    return res.json({
        msg: 'Post succeed',
        isError: false,
    });
};

// 포스트 수정 patch 요청
export const updatePost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { content } = req.body;
    const userid = req.session.userid;
    const postId = parseInt(req.params.id);
    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: 'Please Login First!',
            isError: true,
        });
    }

    let existingUserid;
    try {
        existingUserid = await Post.findOne({
            where: { postId: postId },
            attributes: ['userid'],
        });
    } catch (err) {
        return next(err);
    }

    if (!existingUserid || userid !== existingUserid.userid) {
        return res.status(500).json({
            msg: `Something Went Wrong! Please try it later!`,
            isError: true,
        });
    }

    try {
        await Post.update(
            {
                content: content,
            },
            {
                where: { postId: postId },
            }
        );
    } catch (err) {
        return next(err);
    }
    return res.json({
        msg: 'Post update succeed',
        isError: false,
    });
};

// 포스트 삭제 delete 요청
export const deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { userid } = req.body;
    const postId = parseInt(req.params.id);
    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: 'Please Login First!',
            isError: true,
        });
    }
    let existingUserid;
    try {
        existingUserid = await Post.findOne({
            where: { postId: postId },
            attributes: ['userid'],
        });
    } catch (err) {
        return next(err);
    }

    if (!existingUserid || userid !== existingUserid.userid) {
        return res.status(500).json({
            msg: `Something Went Wrong! Please try it later!`,
            isError: true,
        });
    }
    try {
        await Post.destroy({
            where: { postId: postId },
        });
    } catch (err) {
        return next(err);
    }
    return res.json({
        msg: 'Post deletion succeed',
        isError: false,
    });
};

// 포스트 자세히보기 get 요청
export const getSinglePost = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const postId = parseInt(req.params.id);
    let singlePost;
    let likeCount;
    let didLike = false;

    let myUserid = req.session.userid;

    if (!myUserid) {
        myUserid = '';
    }

    try {
        singlePost = await Post.findOne({
            where: { postId: postId },
            include: [
                {
                    model: User,
                    attributes: ['name', 'gender', 'nation', 'profileImgPath'],
                },
                {
                    model: postImages,
                    attributes: ['path'],
                },
            ],
        });

        likeCount = await PostLikes.count({
            where: {
                PostId: postId,
            },
        });

        const myLikeData = await PostLikes.findOne({
            where: {
                PostId: postId,
                userid: myUserid,
            },
        });
        if (myLikeData) {
            didLike = true;
        }
    } catch (err) {
        return next(err);
    }

    if (!singlePost) {
        return res.status(404).json({
            msg: `Something Went Wrong! Please try it later!`,
            isError: true,
        });
    }
    return res.json({
        posts: singlePost,
        likeCount: likeCount,
        didLike: didLike,
        isError: false,
    });
};

// 게시글 좋아요 기능 post
export const togglePostLike = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userid = req.session.userid;

    if (!userid || userid.length < 4) {
        return res.json({ msg: 'please login first', isError: true });
    }
    const postId = parseInt(req.params.id);
    let pushLike;
    try {
        pushLike = await PostLikes.findOne({
            where: { postId: postId, userid: userid },
        });
    } catch (err) {
        return next(err);
    }

    if (!pushLike) {
        try {
            await PostLikes.create({
                postId: postId,
                userid: userid,
            });
        } catch (err) {
            return next(err);
        }
        return res.json({ msg: 'Like pushed', isError: false });
    }
    try {
        await PostLikes.destroy({
            where: { postId: postId, userid: userid },
        });
    } catch (err) {
        return next(err);
    }

    return res.json({ msg: 'Like deleted', isError: false });
};

const setAlarm = async (
    userid: String,
    otherUserId: String,
    alarmType: Number,
    option1: string | number,
    option2: string | number
) => {
    try {
        await Alarm.create({
            userid: userid,
            otherUserId: otherUserId,
            alarmType: alarmType,
            checked: false,
            option1: option1,
            option2: option2,
        });
    } catch (error) {
        console.log(error);
        return error;
    }
};

// 댓글 작성 기능
export const createComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { content, isrevised, postUserId, postType } = req.body;
    let userid = req.session.userid;
    const postId = parseInt(req.params.id);
    if (!userid || userid.length < 4) {
        return res.json({
            msg: `You're trying to comment without login`,
            isError: true,
        });
    }
    try {
        const createdComment = await Comment.create({
            userid: userid,
            content: content,
            postId: postId,
            isrevised: isrevised,
        });
        if (postUserId != userid)
            await setAlarm(postUserId, userid, 0, postId, postType);
        const createdCommentIndex = createdComment.getDataValue('index');
        res.json({
            msg: 'Comment created!',
            comment: {
                index: createdCommentIndex,
                content: content,
                userid: req.session.userid,
            },
            isError: false,
        });
    } catch (err) {
        return next(err);
    }
};

// 게시글의 댓글 불러오기 기능
export const getComments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const postId = parseInt(req.params.id);
    let result;
    try {
        result = await Comment.findAll({
            where: { postId: postId },
            include: [
                {
                    model: User,
                    attributes: ['name', 'nation', 'profileImgPath'],
                },
            ],
        });
    } catch (err) {
        return next(err);
    }
    if (!result || result.length < 1) {
        return res.json({
            msg: `There's no Comment here! Why don't you try some?`,
            isError: true,
        });
    }
    res.json({
        msg: 'fetching data completed',
        Comments: result,
        isError: false,
    });
};

// 댓글 업데이트 기능 commentIndex는 Comment 테이블의 index
export const updateComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const commentIndex = parseInt(req.params.commentindex);
    const { content } = req.body;
    const userid = req.session.userid;

    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: `Please login first!`,
            isError: true,
        });
    }

    let existingUserid;
    try {
        existingUserid = await Comment.findOne({
            where: { index: commentIndex },
            attributes: ['userid'],
        });
    } catch (err) {
        return next(err);
    }

    if (!existingUserid || userid !== existingUserid.userid) {
        return res.status(500).json({
            msg: `Something Went Wrong! Please try it later!`,
            isError: true,
        });
    }

    try {
        await Comment.update(
            {
                content: content,
            },
            {
                where: { index: commentIndex },
            }
        );
    } catch (err) {
        return next(err);
    }
    return res.json({
        msg: 'Comment update succeed',
        isError: false,
    });
};

// 댓글 삭제 기능. commentIndex는 댓글의 index
export const deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userid = req.session.userid;
    const commentIndex = parseInt(req.params.commentindex);
    if (!userid || userid.length < 4) {
        return res.status(401).json({
            msg: `Please login first!`,
            isError: true,
        });
    }
    let existingUserid;
    try {
        existingUserid = await Comment.findOne({
            where: { index: commentIndex },
            attributes: ['userid'],
        });
    } catch (err) {
        return next(err);
    }
    if (!existingUserid) {
        return res.status(500).json({
            msg: `Something Went Wrong! Please try it later!`,
            isError: true,
        });
    }

    if (userid !== existingUserid.dataValues.userid) {
        return res.status(500).json({
            msg: `Something Went Wrong! Please try it later!`,
            isError: true,
        });
    }
    try {
        await Comment.destroy({
            where: { index: commentIndex },
        });
    } catch (err) {
        return next(err);
    }
    return res.json({
        msg: 'comment deletion succeed',
        isError: false,
    });
};
