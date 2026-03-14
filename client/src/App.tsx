import React from 'react';
import './styles/App.scss';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';

import PostsPage from './pages/PostsPage';
import SignupPage from './pages/SignupPage';
import NewPostPage from './pages/NewPostPage';
import MainPage from './pages/MainPage';
import ChatRoomPage from './pages/NewPage'; // ChatRoomPage 추가
import Mypage from './pages/Mypage';
import LoginPage from './pages/LoginPage';
import MypageOption from './components/Mypage/MypageOption';
import MypageEditPassword from './components/Mypage/MypageEditPassword';
import CulturePostDetailPage from './pages/CulturePostDetailPage';
import LanguagePostDetailPage from './pages/LanguagePostDetailPage';
import AlertPage from './pages/AlertPage';
import MypageEditLanguage from './components/Mypage/MypageEditLanguage';
import 'bootstrap/dist/css/bootstrap.min.css';
import MulterMypage from './pages/MulterMypage';
import SearchUser from './pages/SearchUser';
import MonoChatPage from './pages/MonoChatPage';
import PersonalChat from './components/Chats/PersonalChat';
import ErrorLogPage from './pages/ErrorLogPage';
import ChatCorrectingPage from './pages/ChatCorrectingPage';

import CultureCorrectingPage from './pages/CultureCorrectingPage';
import LanguageCorrectingPage from './pages/LanguageCorrectingPage';

import Error403 from './pages/errorPages/Error403';
import Error404 from './pages/errorPages/Error404';
import Error500 from './pages/errorPages/Error500';

export const generateUniqueId = () => {
    return uuidv4();
};

function App() {
    const [cookies, setCookies, removeCookies] = useCookies(['id']);

    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/401" element={<Error403 />}></Route>
                    <Route path="/404" element={<Error404 />}></Route>
                    <Route path="/500" element={<Error500 />}></Route>
                    <Route path="/multermypage" element={<MulterMypage />} />
                    <Route path="/newpost" element={<NewPostPage />} />
                    <Route path="/posts" element={<PostsPage />} />
                    {cookies['id'] && cookies['id'].length > 3 ? (
                        <Route path="/" element={<Navigate to="/posts" replace />} />
                    ) : (
                        <Route path="/" element={<LoginPage />} />
                    )}
                    <Route path="/posts" element={<PostsPage />}></Route>
                    <Route
                        path="/searchuser/:userid"
                        element={<SearchUser />}
                    ></Route>

                    <Route
                        path="/c-postdetail/:id"
                        element={<CulturePostDetailPage />}
                    ></Route>
                    <Route
                        path="/l-postdetail/:id"
                        element={<LanguagePostDetailPage />}
                    ></Route>
                    <Route path="/alert" element={<AlertPage />}></Route>

                    <Route path="/mainpage" element={<MainPage />} />
                    <Route path="/chat/:roomId" element={<ChatRoomPage />}>
                        {' '}
                    </Route>
                    <Route path="/message" element={<PersonalChat />} />
                    <Route path="/newpage" element={<ChatRoomPage />} />
                    <Route path="/mypage" element={<Mypage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/mypage/option" element={<MypageOption />} />
                    <Route
                        path="/mypage/edit/password"
                        element={<MypageEditPassword />}
                    />
                    <Route
                        path="/mypage/edit/Language"
                        element={<MypageEditLanguage />}
                    />

                    <Route path="/monochat" element={<MonoChatPage />} />
                    <Route
                        path="/l-postdetail/:id/correcting"
                        element={<LanguageCorrectingPage />}
                    />
                    <Route
                        path="/c-postdetail/:id/correcting"
                        element={<CultureCorrectingPage />}
                    />
                    <Route
                        path="/chat/:roomNum/:toWhomName/:toWhomId/correcting"
                        element={<ChatCorrectingPage />}
                    />

                    <Route path="/monochat" element={<MonoChatPage />} />

                    <Route path="/errorlog" element={<ErrorLogPage />} />
                    <Route path="*" element={<Error404 />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
