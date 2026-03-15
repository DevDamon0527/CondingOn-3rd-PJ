import '../../styles/CulturePost.scss';
import '../../styles/Font.scss';
import { User } from '../../types/types';

import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { useState } from 'react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { cookieConfig } from '../../utils/cookieConfig';
import { getTimeObj } from '../../utils/getCurrentData';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useEffect } from 'react';

import 'swiper/scss';
import 'swiper/scss/pagination';
import 'swiper/scss/navigation';

import '../../styles/Swiper.scss';

function CulturePost(props: any) {
    const navigate = useNavigate();
    const [cookies, setCookies, removeCookies] = useCookies(['id', 'content']);
    const idCookie = cookies['id'];
    const [userData, setUserData] = useState<User>();
    const [learningLang, setLearningLang] = useState();
    const deletemodal = useRef<any>();
    const culdeletemodal = deletemodal.current;
    const { id, likeCount, isLiked, getCulturePosts, userid } = props;

    const [didLike, setDidLike] = useState(isLiked);
    const contentInDiv = useRef<any>();
    const [likeCountState, setLikeCountState] = useState(likeCount);

    const modalShow = () => {
        culdeletemodal?.classList.remove('opacity');
        setTimeout(() => {
            culdeletemodal?.classList.add('opacity');
        }, 5000);
    };
    const deletePost = async () => {
        let res;
        try {
            res = await axios({
                method: 'delete',
                url: `${process.env.REACT_APP_SERVERURL}/cul/posts/${props.id}`,
                data: {
                    userid: props.userid,
                },
                withCredentials: true,
            });
            if (res.data.isError === false) {
                getCulturePosts();
            }
        } catch (error) {
            console.error('error', error);
        }
    };

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
                data: {
                    userid: idCookie,
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
    }, [props.id, userid]);

    //문화 좋아요 버튼 토글
    const culToggleLike = async () => {
        try {
            const res = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVERURL}/cul/posts/${id}`,
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

    const hasImages =
        props.images?.PostImages && props.images?.PostImages.length > 0;

    return (
        <div className="cul-post-container">
            <div className="cul-post">
                <div className="cul-profile-container">
                    <div className="cul-image-container">
                        <img
                            className="cul-profile-image"
                            src={`${process.env.REACT_APP_SERVERURL}${props.profileImgPath}`}
                            alt=""
                            onClick={() => {
                                window.location.href = `/searchUser/${props.userid}`;
                            }}
                        ></img>
                        <img
                            className="cul-flag-image"
                            src={`/images/flag/${
                                idCookie == id ? userData?.nation : props.nation
                            }.png`}
                        ></img>
                    </div>

                    <div className="cul-info-container">
                        <div className="cul-info">
                            <div
                                className={`cul-gender' ${
                                    props.gender === 'f'
                                        ? 'cul-female'
                                        : 'cul-male'
                                }`}
                            ></div>
                            <Link
                                className="cul-name"
                                to={`/searchUser/${props.userid}`}
                            >
                                {props.name}
                            </Link>
                        </div>
                        <div className="cul-location">{props.nation}</div>

                        <div className="cul-language-container">
                            <div className="cul-native-language">
                                {shortName(props.firLang)}
                            </div>
                            <div className="cul-arrow"></div>
                            <div className="cul-learning-language">
                                {' '}
                                {learningLang &&
                                    learningLang[0] &&
                                    shortName(learningLang[0])}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cul-more-container">
                    <div className="cul-time">
                        {' '}
                        {getTimeObj(props.createdAt).year}년{' '}
                        {getTimeObj(props.createdAt).month}월{' '}
                        {getTimeObj(props.createdAt).date}일{' '}
                        {getTimeObj(props.createdAt).hour}시{' '}
                        {getTimeObj(props.createdAt).minute}분
                    </div>{' '}
                    {idCookie === props.userid ? (
                        <div>
                            <div
                                className="cul-more"
                                onClick={() => {
                                    modalShow();
                                }}
                            ></div>
                            <div
                                className="modal-container opacity"
                                ref={deletemodal}
                            >
                                <div className="edit-text">
                                    <span>수정하기</span>
                                </div>
                                <div className="modal-line"></div>
                                <div
                                    className="delete-text"
                                    onClick={() => {
                                        deletePost();
                                    }}
                                >
                                    <span>삭제하기</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="correction"
                            onClick={() => {
                                setCookies(
                                    'content',
                                    props.content,
                                    cookieConfig
                                );
                                navigate(
                                    `/c-postdetail/${props.id}/correcting`
                                );
                            }}
                        ></div>
                    )}
                </div>

                {hasImages && (
                    <div className="cul-content-images">
                        <Swiper
                            modules={[Navigation, Pagination]}
                            cssMode={true}
                            navigation={true}
                            pagination={true}
                            spaceBetween={10}
                            slidesPerView={1}
                        >
                            {props.images.PostImages?.map(
                                (image: string, index: number) => (
                                    <SwiperSlide key={index}>
                                        <img
                                            src={`${process.env.REACT_APP_SERVERURL}${props.images.PostImages[index].path}`}
                                            alt={image}
                                            className="eachImage"
                                        />
                                    </SwiperSlide>
                                )
                            )}
                        </Swiper>
                    </div>
                )}

                <div
                    className="cul-content-text"
                    onClick={() => navigate(`/c-postdetail/${props.id}`)}
                    ref={contentInDiv}
                >
                    {props.content}
                </div>

                <div className="cul-reaction-container">
                    <div className="cul-likes-container">
                        <div
                            className={`cul-likes' ${
                                didLike ? 'liked' : 'unliked'
                            }`}
                            onClick={culToggleLike}
                        ></div>
                        <div className="cul-likes-count">{likeCountState}</div>
                    </div>
                    <div
                        className="cul-comments-container"
                        onClick={() => navigate(`/c-postdetail/${props.id}`)}
                    >
                        <div className="cul-comments"></div>
                        <div className="cul-comments-count">
                            {props.commentcount}
                        </div>
                    </div>
                    <div className="cul-bookmark-container"></div>
                </div>
            </div>
            <div className="cul-line"></div>
        </div>
    );
}

export default CulturePost;
