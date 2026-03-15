import Footer from '../components/Footer';
import MonoChatHeader from '../components/monochatpage/MonoChatHeader';
import MonoChatList from '../components/monochatpage/MonoChatList';
import Search from '../components/postspage/Search';
import '../styles/MonoChatPage.scss';
import '../styles/Font.scss';

import { useState } from 'react';

function MonoChatPage() {
    let [selectedLanguage, setSelectedLanguage] = useState('ALL');

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
                            className={`change-language${selectedLanguage === 'ALL' ? ' active' : ''}`}
                            onClick={() => handleLanguageChange('ALL')}
                        >
                            <div className="language-text">전체</div>
                        </div>
                        <div
                            className={`change-language${selectedLanguage === 'KR' ? ' active' : ''}`}
                            onClick={() => handleLanguageChange('KR')}
                        >
                            <img className="language-flag" src="/images/flag/Korea.png" alt="" />
                            <div className="language-text">한국어</div>
                        </div>
                        <div
                            className={`change-language${selectedLanguage === 'EN' ? ' active' : ''}`}
                            onClick={() => handleLanguageChange('EN')}
                        >
                            <img className="language-flag" src="/images/flag/America.png" alt="" />
                            <div className="language-text">영어</div>
                        </div>
                        <div
                            className={`change-language${selectedLanguage === 'JP' ? ' active' : ''}`}
                            onClick={() => handleLanguageChange('JP')}
                        >
                            <img className="language-flag" src="/images/flag/Japan.png" alt="" />
                            <div className="language-text">일본어</div>
                        </div>
                        <div
                            className={`change-language${selectedLanguage === 'CH' ? ' active' : ''}`}
                            onClick={() => handleLanguageChange('CH')}
                        >
                            <img className="language-flag" src="/images/flag/China.png" alt="" />
                            <div className="language-text">중국어</div>
                        </div>
                        <div
                            className={`change-language${selectedLanguage === 'FR' ? ' active' : ''}`}
                            onClick={() => handleLanguageChange('FR')}
                        >
                            <img className="language-flag" src="/images/flag/France.png" alt="" />
                            <div className="language-text">프랑스어</div>
                        </div>
                        <div
                            className={`change-language${selectedLanguage === 'GM' ? ' active' : ''}`}
                            onClick={() => handleLanguageChange('GM')}
                        >
                            <img className="language-flag" src="/images/flag/Germany.png" alt="" />
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
