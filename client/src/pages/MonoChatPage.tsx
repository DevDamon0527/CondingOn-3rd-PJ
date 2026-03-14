import Footer from '../components/Footer';
import MonoChatHeader from '../components/monochatpage/MonoChatHeader';
import MonoChatList from '../components/monochatpage/MonoChatList';
import Search from '../components/postspage/Search';
import '../styles/MonoChatPage.scss';
import '../styles/Font.scss';

import { useState } from 'react';

function MonoChatPage() {
    let [selectedLanguage, setSelectedLanguage] = useState('KR');

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);
    };

    return (
        <>
            <MonoChatHeader />
            <div className="monochatpage-container">
                <div className="monochatpage">
                    <Search />
                    <div className="change-language-container">
                        <div
                            className="change-language"
                            onClick={() => handleLanguageChange('KR')}
                        >
                            <div className="language-flag koreanflag"></div>
                            <div className="language-text">한국어</div>
                        </div>
                        <div
                            className="change-language"
                            onClick={() => handleLanguageChange('EN')}
                        >
                            <div className="language-flag englishflag"></div>
                            <div className="language-text">영어</div>
                        </div>

                        <div
                            className="change-language"
                            onClick={() => handleLanguageChange('JP')}
                        >
                            <div className="language-flag japaneseflag"></div>
                            <div className="language-text">일본어</div>
                        </div>
                        <div
                            className="change-language"
                            onClick={() => handleLanguageChange('CH')}
                        >
                            <div className="language-flag chineseflag"></div>
                            <div className="language-text">중국어</div>
                        </div>
                        <div
                            className="change-language"
                            onClick={() => handleLanguageChange('FR')}
                        >
                            <div className="language-flag frenchflag"></div>
                            <div className="language-text">프랑스어</div>
                        </div>
                        <div
                            className="change-language"
                            onClick={() => handleLanguageChange('GM')}
                        >
                            <div className="language-flag germanflag "></div>
                            <div className="language-text">독일어</div>
                        </div>
                    </div>
                    <div className="chatroom-container">
                        <MonoChatList selectedLanguage={selectedLanguage} />
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default MonoChatPage;
