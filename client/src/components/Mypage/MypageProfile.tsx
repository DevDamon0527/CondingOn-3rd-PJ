import axios from 'axios';
import { useRef, useState } from 'react';
import '../../styles/MypageProfile.scss';
import { Link } from 'react-router-dom';

function MypageProfile(props: any) {
    const { userData, learningLang } = props;
    const intro = useRef<HTMLTextAreaElement>(null);
    const [isEdited, setIsEdited] = useState(false);
    const editIntroduction = () => {
        setIsEdited(true);
        intro.current?.toggleAttribute('readOnly');
        intro.current?.focus();
    };
    const submitIntroduction = async () => {
        setIsEdited(false);
        intro.current?.toggleAttribute('readOnly');
        try {
            await axios({
                method: 'patch',
                url: `${process.env.REACT_APP_SERVERURL}/mypage/editIntroduction`,
                data: {
                    userid: userData.userid,
                    content: intro.current?.value,
                },
                withCredentials: true,
            });
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="mypageProfile-C">
            <div className="introduce-C">
                <div className="introduce-C-Header">
                    <div className="header-title">자기 소개</div>
                    <div className="modify-C">
                        <button
                            className="modify-btn"
                            onClick={() => {
                                isEdited
                                    ? submitIntroduction()
                                    : editIntroduction();
                            }}
                        >
                            {isEdited ? '수정 완료' : '수정'}
                        </button>
                    </div>
                </div>
                <div className="textarea-C">
                    <textarea
                        className="introduce-textarea"
                        readOnly
                        ref={intro}
                        placeholder="자기소개를 입력하세요"
                        defaultValue={userData.introduction || ''}
                    ></textarea>
                </div>
            </div>
            <div className="nativLang-C">
                <div className="nativLang-C-Header">
                    <div className="header-title">모국어</div>
                </div>
                <div className="native-result-c">
                    <div className="nativeResultDiv">{userData.firLang}</div>
                </div>
            </div>
            <div className="learnLang-C">
                <div className="learnLang-C-Header">
                    <div className="header-title">학습 언어</div>

                    <div className="modify-C">
                        <Link to={'/mypage/edit/language'}>
                            <span className="modify-btn">수정</span>
                        </Link>
                    </div>
                </div>
                <div className="learn-result-c">
                    {learningLang.map((element: any, key: any) => (
                        <div className="learnResultDiv" key={key}>
                            {element}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MypageProfile;
