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
                        <div className="modifyImg">
                            <img src="/images/ModifyLogo.png" alt="" />
                        </div>
                        <div
                            className="modify-title"
                            onClick={() => {
                                {
                                    isEdited
                                        ? submitIntroduction()
                                        : editIntroduction();
                                }
                            }}
                        >
                            {isEdited ? '수정 완료' : '수정'}
                        </div>
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
                        <div className="modifyImg">
                            <img src="/images/ModifyLogo.png" alt="" />
                        </div>

                        <Link to={'/mypage/edit/language'}>
                            <div className="modify-title">수정</div>
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
            <div className="location-C">
                <div className="location-C-Header">
                    <div className="header-title">거주 지역</div>
                    <div className="modify-C">
                        <div className="modifyImg">
                            <img src="/images/ModifyLogo.png" alt="" />
                        </div>
                        <div className="modify-title">수정</div>
                    </div>
                </div>
                {/* Map */}
                <div className="map-Container">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d202405.34241565314!2d126.97413929999999!3d37.5648761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca2012d5c39cf%3A0x7e11eca1405bf29b!2z7ISc7Jq47Yq567OE7Iuc!5e0!3m2!1sko!2skr!4v1705836598468!5m2!1sko!2skr"
                        loading="lazy"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
}

export default MypageProfile;
