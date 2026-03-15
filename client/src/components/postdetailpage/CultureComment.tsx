import '../../styles/PostDetailComment.scss';
import '../../styles/Font.scss';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { User } from '../../types/types';
import { Link } from 'react-router-dom';
import { getTimeObj } from '../../utils/getCurrentData';
import { getImageUrl } from '../../utils/getImageUrl';

function CultureComment(props: any) {
    const [cookies, setCookies, removeCookies] = useCookies(['id']);
    const { id } = props;
    const idCookie = cookies['id'];
    const [userData, setUserData] = useState<User>();
    const [profileImg, setProfileImg] = useState<string>('');
    const deleteComment = async () => {
        try {
            await axios({
                method: 'delete',
                url: `${process.env.REACT_APP_SERVERURL}/cul/comments/${props.index}`,
                withCredentials: true,
            });
            props.getcomment();
        } catch (error) {
            console.log(error);
        }
    };

    const getMyPage = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/userinfo/${props.userid}`,
                params: {
                    userid: props.userid,
                },
                withCredentials: true,
            });
            setUserData(res.data.userDataObj);
            setProfileImg(props.profileImgPath);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        getMyPage();
    }, []);
    return (
        <>
            <div className="comment-container">
                <div className="comment-image-container">
                    <img
                        className="comment-profile-pic"
                        src={getImageUrl(profileImg)}
                        alt=""
                        onClick={() => {
                            window.location.href = `/searchUser/${props.userid}`;
                        }}
                    />{' '}
                    <img
                        className="comment-flag-pic"
                        src={`/images/flag/${
                            idCookie == id ? userData?.nation : props.nation
                        }.png`}
                    ></img>
                </div>

                <div className="comment-inside-container">
                    <div className="comment-header-container">
                        <Link
                            className="comment-username"
                            to={`/searchUser/${props.userid}`}
                        >
                            {props.name}
                        </Link>
                        {props.userid == idCookie && (
                            <button
                                className="comment-delete-btn"
                                onClick={deleteComment}
                            >
                                삭제
                            </button>
                        )}
                    </div>
                    <div className="comment-content">{props.content}</div>
                    <div className="comment-footer-container">
                        <div className="comment-date">
                            {getTimeObj(props.time).year}년{' '}
                            {getTimeObj(props.time).month}월{' '}
                            {getTimeObj(props.time).day}일{' '}
                            {getTimeObj(props.time).hour}시{' '}
                            {getTimeObj(props.time).minute}분
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CultureComment;
