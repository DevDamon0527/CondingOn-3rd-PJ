import '../../styles/LanguagePost.scss';
import '../../styles/Font.scss';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { User } from '../../types/types';
import { Link } from 'react-router-dom';
import { cookieConfig } from '../../utils/cookieConfig';
import { getTimeObj } from '../../utils/getCurrentData';
import { getImageUrl } from '../../utils/getImageUrl';

function LanguagePost(props: any) {
    const navigate = useNavigate();

    const { id, likeCount, isLiked, getLanguagePosts } = props;
    const [cookies, setCookies] = useCookies(['id', 'content']);
    const idCookie = cookies['id'];
    const [userData, setUserData] = useState<User>();
    const [learningLang, setLearningLang] = useState();
    const [didLike, setDidLike] = useState(Boolean(isLiked));
    const [likeCountState, setLikeCountState] = useState(Number(likeCount) || 0);
    const contentInDiv = useRef<any>();

    const shortName = (nation: string): string | undefined => {
        if (nation === 'China' || nation === 'Chinese') {
            return 'CN';
        } else if (nation === 'America' || nation === 'English') {
            return 'EN';
        } else if (nation === 'France' || nation === 'French') {
            return 'FR';
        } else if (nation === 'Germany' || nation === 'German') {
            return 'GM';
        } else if (nation === 'Japan' || nation === 'Japanese') {
            return 'JP';
        } else {
            return 'KR';
        }
    };
    const getMyPage = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/userinfo/${props.userid}`,
                params: {
                    userid: props.name,
                },
                withCredentials: true,
            });
            setUserData(res.data.userDataObj);
            setLearningLang(res.data.learningLang);
        } catch (error) {
            console.log('error', error);
        }
    };
    useEffect(() => {
        getMyPage();
        setTimeout(() => {
            contentInDiv.current.innerHTML = props.content?.replace(
                /\n/g,
                '<br />'
            );
        }, 0);
    }, [props.id]);

    const deletemodal = useRef<any>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!isModalOpen) return;
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                deletemodal.current &&
                !deletemodal.current.contains(e.target as Node)
            ) {
                setIsModalOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isModalOpen]);

    const deletePost = async () => {
        let res;
        try {
            res = await axios({
                method: 'delete',
                url: `${process.env.REACT_APP_SERVERURL}/lang/posts/${props.id}`,
                data: {
                    userid: props.userid,
                },
                withCredentials: true,
            });
            if (res.data.isError === false) {
                getLanguagePosts();
            }
        } catch (error) {
            console.error('error', error);
        }
    };
    //언어 좋아요 버튼 토글
    const langToggleLike = async () => {
        if (idCookie === props.userid) return;
        try {
            await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVERURL}/lang/posts/${id}`,
                data: {
                    userid: idCookie,
                },
                withCredentials: true,
            });

            if (didLike) {
                setLikeCountState(likeCountState - 1);
            } else {
                setLikeCountState(likeCountState + 1);
            }
            setDidLike(!didLike);
        } catch (error) {
            console.log('error', error);
        }
    };

    return (
        <div className="lang-post-container">
            <div className="lang-post">
                <div className="lang-profile-container">
                    <div className="lang-image-container">
                        <img
                            className="lang-profile-image"
                            src={getImageUrl(props.profileImgPath)}
                            alt=""
                            onClick={() => {
                                window.location.href = `/searchUser/${props.userid}`;
                            }}
                        ></img>

                        <img
                            className="lang-flag-image"
                            src={`/images/flag/${
                                idCookie == id ? userData?.nation : props.nation
                            }.png`}
                        ></img>
                    </div>

                    <div className="lang-info-container">
                        <div className="lang-info">
                            <div
                                className={`cul-gender' ${
                                    props.gender === 'f'
                                        ? 'cul-female'
                                        : 'cul-male'
                                }`}
                            ></div>
                            <Link
                                className="lang-name"
                                to={`/searchUser/${props.userid}`}
                            >
                                {props.name}
                            </Link>
                        </div>
                        <div className="lang-location">{props.nation}</div>

                        <div className="lang-language-container">
                            <div className="lang-native-language">
                                {shortName(props.firLang)}
                            </div>
                            <div className="lang-arrow"></div>
                            <div className="lang-learning-language">
                                {learningLang &&
                                    learningLang[0] &&
                                    shortName(learningLang[0])}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lang-more-container">
                    <div className="lang-time">
                        {getTimeObj(props.createdAt).year}년{' '}
                        {getTimeObj(props.createdAt).month}월{' '}
                        {getTimeObj(props.createdAt).date}일{' '}
                        {getTimeObj(props.createdAt).hour}시{' '}
                        {getTimeObj(props.createdAt).minute}분
                    </div>

                    {idCookie === props.userid ? (
                        <div style={{ position: 'relative' }}>
                            <div
                                className="lang-more"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsModalOpen((prev) => !prev);
                                }}
                            ></div>
                            <div
                                className={`modal-container${isModalOpen ? '' : ' opacity'}`}
                                ref={deletemodal}
                            >
                                <div
                                    className="edit-text"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/l-postedit/${props.id}`);
                                    }}
                                >
                                    <span>수정하기</span>
                                </div>
                                <div className="modal-line"></div>
                                <div
                                    className="delete-text"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deletePost();
                                    }}
                                >
                                    <span>삭제하기</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="correction-btn"
                            onClick={() => {
                                setCookies(
                                    'content',
                                    props.content,
                                    cookieConfig
                                );
                                navigate(
                                    `/l-postdetail/${props.id}/correcting`
                                );
                            }}
                        >
                            첨삭
                        </button>
                    )}
                </div>

                <div
                    className="lang-content-text"
                    ref={contentInDiv}
                    onClick={() => navigate(`/l-postdetail/${props.id}`)}
                >
                    {props.content}
                </div>

                <div className="lang-reaction-container">
                    <div className="lang-likes-container">
                        <div
                            className={`lang-likes ${didLike ? 'liked' : ''}`}
                            onClick={() => {
                                langToggleLike();
                            }}
                        >♥</div>
                        <div className="lang-likes-count">{likeCountState}</div>
                    </div>

                    <div
                        className="lang-comments-container"
                        onClick={() => navigate(`/l-postdetail/${props.id}`)}
                    >
                        <div className="lang-comments"></div>
                        <div className="lang-comments-count">
                            {props.commentcount}
                        </div>
                    </div>
                    <div className="lang-bookmark-container"></div>
                </div>
            </div>
            <div className="lang-line"></div>
        </div>
    );
}

export default LanguagePost;
