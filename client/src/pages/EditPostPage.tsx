import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import useErrorHandler from '../utils/useErrorHandler';

import '../styles/NewPostHeader.scss';
import '../styles/NewPostPage.scss';
import '../styles/NewPostButton.scss';
import '../styles/NewPostWritePost.scss';
import '../styles/Font.scss';

function EditPostPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [cookies] = useCookies(['id']);
    const idCookie = cookies['id'];
    const { errorHandler } = useErrorHandler();

    // URL prefix로 타입 결정: /c-postedit → 'cul', /l-postedit → 'lang'
    const postType = location.pathname.startsWith('/c-postedit') ? 'cul' : 'lang';

    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<any>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios({
                    method: 'get',
                    url: `${process.env.REACT_APP_SERVERURL}/${postType}/posts/${id}`,
                    params: { userid: idCookie },
                    withCredentials: true,
                });
                const postData = res.data.posts;

                // 본인 게시글이 아니면 뒤로 이동
                if (postData.userid !== idCookie) {
                    navigate(-1);
                    return;
                }

                setContent(postData.content || '');
            } catch (error: any) {
                errorHandler(error.response?.status);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleResizeHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + 'px';
        }
    };

    const submitEdit = async () => {
        if (!content.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await axios({
                method: 'patch',
                url: `${process.env.REACT_APP_SERVERURL}/${postType}/posts/${id}`,
                data: { content },
                withCredentials: true,
            });
            if (res.data.isError === false) {
                const detailPath =
                    postType === 'cul'
                        ? `/c-postdetail/${id}`
                        : `/l-postdetail/${id}`;
                navigate(detailPath);
            }
        } catch (error: any) {
            errorHandler(error.response?.status);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return null;

    return (
        <>
            <div className="newpost-header-container">
                <div
                    className="back-arrow"
                    onClick={() => navigate(-1)}
                ></div>
                <div className="newpost-header-text">게시글 수정</div>
            </div>
            <div className="newpostpage-container">
                <div className="newpostpage">
                    <div className="writepost-container">
                        <div className="writepost-title">포스트 내용</div>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            rows={5}
                            onChange={(e) => {
                                setContent(e.target.value);
                                handleResizeHeight();
                            }}
                        />
                    </div>
                </div>
                <div className="newpost-button-container">
                    <button onClick={submitEdit} disabled={isSubmitting}>
                        {isSubmitting ? '저장 중...' : '수정 완료'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default EditPostPage;
