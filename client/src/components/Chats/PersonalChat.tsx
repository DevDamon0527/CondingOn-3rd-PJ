import '../../styles/PersonalChat.scss';
import Footer from '../Footer';
import PersonalChatList from './PersonalChatList';

// Message 부분
function PersonalChat() {
    return (
        <>
            {/* 설정 헤드 부분 */}
            <div className="chatList-C-Header">
                <span className="chatlist-header-title">메시지</span>
            </div>
            <div className="chatList-container">
                <div className="chatList-Content">
                    <PersonalChatList />
                </div>
            </div>
            <Footer />
        </>
    );
}

export default PersonalChat;
