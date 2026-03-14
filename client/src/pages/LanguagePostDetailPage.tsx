import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

import LanguageComment from '../components/postdetailpage/LanguageComment';
import PostDetailHeader from '../components/postdetailpage/PostDetailHeader';
import SendComment from '../components/postdetailpage/SendComment';
import LanguagePost from '../components/postspage/LanguagePost';
import '../styles/PostDetailPage.scss';
import { useCookies } from 'react-cookie';
import { useParams } from 'react-router-dom';
import { User } from '../types/types';
import useErrorHandler from '../utils/useErrorHandler';
import LanguageRevisedComment from '../components/postdetailpage/LanguageRevisedComment';

interface CommentItem {
    index: number;
    content: string;
    userid: string;
    createdAt: string;
    User: User;
    profileImgPath: string;
    isrevised: boolean;
}

function LanguagePostDetailPage() {
    const { id } = useParams();
    const { errorHandler } = useErrorHandler();
    const [languagePost, setLanguagePost] = useState<any>([]);
    const [likeCount, setLikeCount] = useState<number>(0);
    const [isLiked, setIsLiked] = useState<boolean>(false);

    const [cookies, setCookies, removeCookies] = useCookies(['id']);
    const idCookie = cookies['id'];

    const getSingleLanguagePost = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/lang/posts/${id}`,
                params: {
                    userid: idCookie,
                },
                withCredentials: true,
            });
            setLanguagePost(res.data.posts);
            setLikeCount(res.data.likeCount);
            setIsLiked(res.data.didLike);
        } catch (error: any) {
            errorHandler(error.response.status);
            console.log('error', error);
        }
    };

    const [comments, setComments] = useState<CommentItem[]>([]);

    const addComment = async (content: string) => {
        try {
            const res = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVERURL}/lang/comments/createcomment/${id}`,
                data: {
                    postUserId: languagePost.userid,
                    content: content,
                    //일단 isrevised는 디폴트로 false해둘게요.
                    isrevised: false,
                    postType: languagePost.postType,
                },
                withCredentials: true,
            });
            getComments();
        } catch (error: any) {
            errorHandler(error.response.status);
            console.log('error', error);
        }
    };
    const getComments = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/lang/comments/${id}`,
                withCredentials: true,
            });
            setComments(res.data.Comments);
        } catch (error: any) {
            errorHandler(error.response.status);
            console.log('error', error);
        }
    };

    useEffect(() => {
        getComments();
        getSingleLanguagePost();
    }, []);

    return (
        <>
            <PostDetailHeader />
            <div className="postdetailpage-container">
                <div className="postdetailpage">
                    <div className="languagepost-detail-container">
                        <LanguagePost
                            key={languagePost.postId}
                            type={languagePost.postType}
                            content={languagePost.content}
                            createdAt={languagePost.createdAt}
                            userid={languagePost.userid}
                            profileImgPath={languagePost?.User?.profileImgPath}
                            id={languagePost.postId}
                            nation={languagePost.User?.nation}
                            name={languagePost.User?.name}
                            commentcount={languagePost.commentcount}
                            gender={languagePost.User?.gender}
                            likeCount={likeCount}
                            isLiked={isLiked}
                            getLanguagePosts={getSingleLanguagePost}
                        />
                        <div className="languagecomment-container">
                            {comments?.map((comment, index) => {
                                if (!comment.isrevised) {
                                    return (
                                        <LanguageComment
                                            key={index}
                                            index={comment.index}
                                            type={languagePost.postType}
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
                                        <LanguageRevisedComment
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
                        postUserId={languagePost.userid}
                    />
                </div>
            </div>
        </>
    );
}

export default LanguagePostDetailPage;
