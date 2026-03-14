import CulturePost from '../components/postspage/CulturePost';
import LanguagePost from '../components/postspage/LanguagePost';
import '../styles/PostCategory.scss';
import '../styles/PostSearch.scss';
import '../styles/Font.scss';
import Header from '../components/postspage/PostsHeader';
import '../styles/PostsPage.scss';
import Footer from '../components/Footer';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import useErrorHandler from '../utils/useErrorHandler';
function PostsPage() {
    const { errorHandler } = useErrorHandler();
    const [cookies, setCookies, removeCookies] = useCookies(['id']);
    const idCookie = cookies['id'];
    const [showLanguagePosts, setShowLanguagePosts] = useState(true);
    const [showCulturePosts, setShowCulturePosts] = useState(false);
    const [newAlarmNum, setNewAlarmNum] = useState<Number>(0);
    const [culturePosts, setCulturePosts] = useState([]);
    const [languagePosts, setLanguagePosts] = useState([]);
    const [searchCulturePosts, setSearchCulturePosts] = useState([]);
    const [searchLanguagePosts, setSearchLanguagePosts] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    const [likeCount, setLikeCount] = useState<number>(0);

    const handleLanguageClick = () => {
        setShowLanguagePosts(!showLanguagePosts);
        setShowCulturePosts(false);
        setShowSearchResults(false);
    };

    const handleCultureClick = async () => {
        setShowLanguagePosts(false);
        setShowCulturePosts(!showCulturePosts);
        setShowSearchResults(false);
    };

    const getSearchResults = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/posts/results`,
                params: {
                    searchQuery: searchQuery,
                    userid: idCookie,
                },
                withCredentials: true,
            });
            setSearchCulturePosts(res.data.SearchPosts.c);
            setSearchLanguagePosts(res.data.SearchPosts.l);

            //검색결과가 있을 때만 검색 결과를 보여주도록
            setShowSearchResults(true);
        } catch (error) {
            console.log('error', error);
        }
    };

    const getCulturePosts = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/cul/posts`,
                params: {
                    userid: idCookie,
                },
                withCredentials: true,
            });
            setCulturePosts(res.data.PostsDatas);
        } catch (error: any) {
            if (error.response?.status) {
                errorHandler(error.response?.status);
            }
            console.log('error', error);
        }
    };

    const getLanguagePosts = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/lang/posts`,
                params: {
                    userid: idCookie,
                },
                withCredentials: true,
            });
            setLanguagePosts(res.data.PostsDatas);
        } catch (error: any) {
            if (error.response?.status) {
                errorHandler(error.response?.status);
            }
            console.log('error', error);
        }
    };

    const newAlarmNumGet = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVERURL}/newAlarmNumGet`,
                params: {
                    userid: idCookie,
                },
                withCredentials: true,
            });
            setNewAlarmNum(res.data.newAlarmNumber);
        } catch (error: any) {
            errorHandler(error.response?.status);
            console.log('error:', error);
        }
    };
    useEffect(() => {
        newAlarmNumGet();
        getLanguagePosts();
    }, []);

    return (
        <>
            <Header newAlarmNum={newAlarmNum} />
            <div className="postspage-container">
                <div className="postspage">
                    <div className="search-container">
                        <div className="searchbar">
                            <input
                                className="searchbar-input"
                                type="text"
                                placeholder="검색어를 입력하세요..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                }}
                            />
                        </div>
                        <button
                            className="search-button"
                            onClick={() => {
                                getSearchResults();
                            }}
                        >
                            검색
                        </button>
                    </div>
                    <div className="category-component">
                        <div
                            className={`btn_lang ${
                                showLanguagePosts
                                    ? 'active category-component-changed'
                                    : ''
                            }`}
                            onClick={handleLanguageClick}
                        >
                            언어
                        </div>
                        <br />
                        <div
                            className={`btn_culture ${
                                showCulturePosts
                                    ? 'active category-component-changed'
                                    : ''
                            }`}
                            onClick={() => {
                                handleCultureClick();
                                getCulturePosts();
                            }}
                        >
                            문화
                        </div>
                        <br />
                    </div>

                    {showLanguagePosts && !showSearchResults && (
                        <div className="language-posts-container">
                            {languagePosts?.length > 0 ? (
                                languagePosts
                                    .slice(0)
                                    .map((languagePostData: any) => (
                                        <LanguagePost
                                            key={languagePostData[0].postId}
                                            userid={languagePostData[0].userid}
                                            name={languagePostData[0].User.name}
                                            id={languagePostData[0].postId}
                                            nation={
                                                languagePostData[0].User.nation
                                            }
                                            gender={
                                                languagePostData[0].User.gender
                                            }
                                            firLang={
                                                languagePostData[0].User.firLang
                                            }
                                            profileImgPath={
                                                languagePostData[0].User
                                                    .profileImgPath
                                            }
                                            createdAt={
                                                languagePostData[0].createdAt
                                            }
                                            content={
                                                languagePostData[0].content
                                            }
                                            likeCount={languagePostData[1]}
                                            isLiked={languagePostData[2]}
                                            commentcount={languagePostData[3]}
                                            setLikeCount={setLikeCount}
                                            getLanguagePosts={getLanguagePosts}
                                        />
                                    ))
                            ) : (
                                <p>언어 게시물이 없습니다.</p>
                            )}
                        </div>
                    )}

                    {showCulturePosts && !showSearchResults && (
                        <div className="culture-posts-container">
                            {culturePosts?.length > 0 ? (
                                culturePosts
                                    .slice(0)
                                    .map((culturePostData: any) => (
                                        <CulturePost
                                            key={culturePostData[0].postId}
                                            id={culturePostData[0].postId}
                                            userid={culturePostData[0].userid}
                                            name={culturePostData[0].User.name}
                                            gender={
                                                culturePostData[0].User.gender
                                            }
                                            nation={
                                                culturePostData[0].User.nation
                                            }
                                            firLang={
                                                culturePostData[0].User.firLang
                                            }
                                            profileImgPath={
                                                culturePostData[0].User
                                                    .profileImgPath
                                            }
                                            learningLang={
                                                culturePostData[0].User.firLang
                                            }
                                            createdAt={
                                                culturePostData[0].createdAt
                                            }
                                            content={culturePostData[0].content}
                                            images={culturePostData[0]}
                                            likeCount={culturePostData[1]}
                                            isLiked={culturePostData[2]}
                                            commentcount={culturePostData[3]}
                                            setLikeCount={setLikeCount}
                                            getCulturePosts={getCulturePosts}
                                        />
                                    ))
                            ) : (
                                <p>문화 게시물이 없습니다.</p>
                            )}
                        </div>
                    )}

                    {showSearchResults && (
                        <div className="search-results-container">
                            {showLanguagePosts && (
                                <div className="language-posts-container">
                                    {searchLanguagePosts.length > 0 ? (
                                        searchLanguagePosts
                                            .slice(0)
                                            .reverse()
                                            .map((languagePostData: any) => (
                                                <LanguagePost
                                                    key={
                                                        languagePostData.postId
                                                    }
                                                    userid={
                                                        languagePostData.userid
                                                    }
                                                    name={
                                                        languagePostData.User
                                                            .name
                                                    }
                                                    id={languagePostData.postId}
                                                    nation={
                                                        languagePostData.User
                                                            .nation
                                                    }
                                                    gender={
                                                        languagePostData.User
                                                            .gender
                                                    }
                                                    firLang={
                                                        languagePostData.User
                                                            .firLang
                                                    }
                                                    profileImgPath={
                                                        languagePostData.User
                                                            .profileImgPath
                                                    }
                                                    createdAt={
                                                        languagePostData.createdAt
                                                    }
                                                    content={
                                                        languagePostData.content
                                                    }
                                                    likeCount={
                                                        languagePostData[1]
                                                    }
                                                    isLiked={
                                                        languagePostData[2]
                                                    }
                                                    commentcount={
                                                        languagePostData[3]
                                                    }
                                                />
                                            ))
                                    ) : (
                                        <p>검색된 언어 게시물이 없습니다.</p>
                                    )}
                                </div>
                            )}

                            {showCulturePosts && (
                                <div className="culture-posts-container">
                                    {searchCulturePosts.length > 0 ? (
                                        searchCulturePosts
                                            .slice(0)
                                            .reverse()
                                            .map((culturePostData: any) => (
                                                <CulturePost
                                                    key={culturePostData.postId}
                                                    id={culturePostData.postId}
                                                    userid={
                                                        culturePostData.userid
                                                    }
                                                    name={
                                                        culturePostData.User
                                                            .name
                                                    }
                                                    nation={
                                                        culturePostData.User
                                                            .nation
                                                    }
                                                    firLang={
                                                        culturePostData.User
                                                            .firLang
                                                    }
                                                    learningLang={
                                                        culturePostData.User
                                                            .firLang
                                                    }
                                                    gender={
                                                        culturePostData.User
                                                            .gender
                                                    }
                                                    profileImgPath={
                                                        culturePostData.User
                                                            .profileImgPath
                                                    }
                                                    createdAt={
                                                        culturePostData.createdAt
                                                    }
                                                    content={
                                                        culturePostData.content
                                                    }
                                                    images={culturePostData}
                                                    likeCount={
                                                        culturePostData[1]
                                                    }
                                                    isLiked={culturePostData[2]}
                                                    commentcount={
                                                        culturePostData[3]
                                                    }
                                                />
                                            ))
                                    ) : (
                                        <p>검색된 문화 게시물이 없습니다.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
}

export default PostsPage;
