import { useState } from 'react';
import '../styles/Footer.scss';
import { Link, useLocation } from 'react-router-dom';

function Footer() {
    const navMessage = '/images/Chats.png';
    const navMessageColor = '/images/ChatsColor.png';
    const navPosts = '/images/GlobeSimple.png';
    const navPostsColor = '/images/GlobeSimpleColor.png';
    const navusersfour = '/images/UsersFour.png';
    const navusersfourColor = '/images/UsersFourColor.png';
    const navFavorites = '/images/Bookmarks.png';
    const navFavoritesColor = '/images/BookmarksColor.png';
    const navMypage = '/images/User.png';
    const navMypageColor = '/images/UserColor.png';

    const [hoveredDiv, setHoverdDiv] = useState('');
    const location = useLocation();

    const getActiveTab = () => {
        const path = location.pathname;
        if (path.startsWith('/message') || path.startsWith('/chat')) return 'footerMessage';
        if (path.startsWith('/posts') || path.startsWith('/c-postdetail') || path.startsWith('/l-postdetail') || path.startsWith('/newpost')) return 'posts';
        if (path.startsWith('/monochat')) return 'usersfour';
        if (path.startsWith('/errorlog')) return 'favorites';
        if (path.startsWith('/mypage') || path.startsWith('/searchuser')) return 'mypage';
        return '';
    };

    const clickedDiv = getActiveTab();

    const onMouseOver = (divName: string) => {
        setHoverdDiv(divName);
    };

    const onMouseLeave = () => {
        setHoverdDiv('');
    };

    return (
        <footer className="footer">
            <Link to={'/message'}>
                <div
                    className={`footer-div footerMessage ${
                        hoveredDiv === 'footerMessage' && 'hovered'
                        // 클래스가 footerMessage 이면 hovered, text-change 클래스를 가진다.
                    } ${clickedDiv === 'footerMessage' && 'text-change'}`}
                    onMouseOver={() => onMouseOver('footerMessage')}
                    onMouseLeave={() => onMouseLeave()}
                    onClick={() => {}}
                >
                    <img
                        className="footer-div-message-img"
                        src={
                            hoveredDiv === 'footerMessage' ||
                            clickedDiv === 'footerMessage'
                                ? navMessageColor
                                : navMessage
                        }
                        alt=""
                    />
                    <div className="text">메시지</div>
                </div>
            </Link>
            <Link to={'/posts'}>
                <div
                    className={`footer-div posts ${
                        hoveredDiv === 'posts' && 'hovered'
                    }
          ${clickedDiv === 'posts' && 'text-change'}`}
                    onMouseOver={() => onMouseOver('posts')}
                    onMouseLeave={() => onMouseLeave()}
                    onClick={() => {}}
                >
                    <img
                        src={
                            hoveredDiv === 'posts' || clickedDiv === 'posts'
                                ? navPostsColor
                                : navPosts
                        }
                        alt=""
                    />
                    <div className="text">게시물</div>
                </div>
            </Link>
            <Link to={'/monochat'}>
                <div
                    className={`footer-div usersfour ${
                        hoveredDiv === 'usersfour' && 'hovered'
                    } ${clickedDiv === 'usersfour' && 'text-change'}`}
                    onMouseOver={() => onMouseOver('usersfour')}
                    onMouseLeave={() => onMouseLeave()}
                    onClick={() => {}}
                >
                    <img
                        src={
                            hoveredDiv === 'usersfour' ||
                            clickedDiv === 'usersfour'
                                ? navusersfourColor
                                : navusersfour
                        }
                        alt=""
                    />
                    <div className="text">단체채팅</div>
                </div>
            </Link>
            <Link to={'/errorlog'}>
                <div
                    className={`footer-div favorites ${
                        hoveredDiv === 'favorites' && 'hovered'
                    } ${clickedDiv === 'favorites' && 'text-change'}`}
                    onMouseOver={() => onMouseOver('favorites')}
                    onMouseLeave={() => onMouseLeave()}
                    onClick={() => {}}
                >
                    <img
                        src={
                            hoveredDiv === 'favorites' ||
                            clickedDiv === 'favorites'
                                ? navFavoritesColor
                                : navFavorites
                        }
                        alt=""
                    />
                    <div className="text">오류로그</div>
                </div>
            </Link>
            <Link to={'/mypage'}>
                <div
                    className={`footer-div mypage ${
                        hoveredDiv === 'mypage' && 'hovered'
                    } ${clickedDiv === 'mypage' && 'text-change'}`}
                    onMouseOver={() => onMouseOver('mypage')}
                    onMouseLeave={() => onMouseLeave()}
                    onClick={() => {}}
                >
                    <img
                        src={
                            hoveredDiv === 'mypage' || clickedDiv === 'mypage'
                                ? navMypageColor
                                : navMypage
                        }
                        alt=""
                    />
                    <div className="text">마이페이지</div>
                </div>
            </Link>
        </footer>
    );
}

export default Footer;
