import { useState } from 'react';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import CultureComment from '../components/postdetailpage/CultureComment';
import PostDetailHeader from '../components/postdetailpage/PostDetailHeader';
import SendComment from '../components/postdetailpage/SendComment';
import CulturePost from '../components/postspage/CulturePost';
import '../styles/PostDetailPage.scss';
import { User } from '../types/types';
import useErrorHandler from '../utils/useErrorHandler';
import CultureRevisedComment from '../components/postdetailpage/CultureRevisedComment';

interface CommentItem {
    index: number;
    content: string;
    userid: string;
    createdAt: string;
    User: User;
    profileImgPath: string;
    isrevised: boolean;
}

function CulturePostDetailPage() {
    const { id } = useParams();

    const [culturePost, setCulturePost] = useState<any>([]);
    const [likeCount, setLikeCount] = useState<number>(0);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const { errorHandler } = useErrorHandler();
    const [cookies, setCookies, removeCookies] = useCookies(['id']);
    const idCookie = cookies['id'];

    const getSingleCulturePost = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/cul/posts/${id}`,
                params: {
                    userid: idCookie,
                },
                withCredentials: true,
            });
            setCulturePost(res.data.posts);
            setLikeCount(res.data.likeCount);
            setIsLiked(res.data.didLike);
        } catch (error: any) {
            errorHandler(error.response?.status);
            console.log('error', error);
        }
    };

    const [comments, setComments] = useState<CommentItem[]>([]);

    const addComment = async (content: string) => {
        try {
            const res = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVERURL}/cul/comments/createcomment/${id}`,
                data: {
                    content: content,
                    postUserId: culturePost.userid,
                    isrevised: false,
                    postType: culturePost.postType,
                },
                withCredentials: true,
            });
            getComments();
        } catch (error: any) {
            errorHandler(error.response?.status);
            console.log('error', error);
        }
    };
    const getComments = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/cul/comments/${id}`,
                withCredentials: true,
            });
            setComments(res.data.Comments);
        } catch (error: any) {
            errorHandler(error.response?.status);
            console.log('error', error);
        }
    };
    useEffect(() => {
        getComments();
        getSingleCulturePost();
    }, []);
    useEffect(() => {}, [culturePost]);
    return (
        <>
            <PostDetailHeader />
            <div className="postdetailpage-container">
                <div className="postdetailpage">
                    <CulturePost
                        content={culturePost.content}
                        userid={culturePost.userid}
                        id={culturePost.postId}
                        profileImgPath={culturePost?.User?.profileImgPath}
                        createdAt={culturePost.createdAt}
                        name={culturePost.User?.name}
                        nation={culturePost.User?.nation}
                        images={culturePost}
                        gender={culturePost.User?.gender}
                        likeCount={likeCount}
                        isLiked={isLiked}
                        getCulturePosts={getSingleCulturePost}
                    />
                    <div className="culturecomment-container">
                        {comments?.map((comment, index) => {
                            if (!comment.isrevised) {
                                return (
                                    <CultureComment
                                        key={index}
                                        index={comment.index}
                                        type={culturePost.postType}
                                        profileImgPath={
                                            comment.User?.profileImgPath
                                        }
                                        content={comment.content}
                                        userid={comment.userid}
                                        time={comment.createdAt}
                                        name={comment.User?.name}
                                        nation={comment.User?.nation}
                                        getcomment={getComments}
                                    />
                                );
                            } else {
                                return (
                                    <CultureRevisedComment
                                        key={index}
                                        index={comment.index}
                                        profileImgPath={
                                            comment.User?.profileImgPath
                                        }
                                        content={comment.content}
                                        userid={comment.userid}
                                        time={comment.createdAt}
                                        name={comment.User?.name}
                                        nation={comment.User?.nation}
                                        getcomment={getComments}
                                    />
                                );
                            }
                        })}
                    </div>
                </div>
                <SendComment
                    onSendComment={addComment}
                    postUserId={culturePost.userid}
                />
            </div>
        </>
    );
}

export default CulturePostDetailPage;
