import { Link, useNavigate } from 'react-router-dom';
import '../../styles/MypageEditLanguage.scss';
import axios from 'axios';
import { useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import ConfirmModal from '../Modals/ConfirmModal';

const LANG_OPTIONS = [
    { value: 'Chinese', label: '중국어' },
    { value: 'English', label: '영어' },
    { value: 'French', label: '프랑스어' },
    { value: 'German', label: '독일어' },
    { value: 'Japanese', label: '일본어' },
    { value: 'Korean', label: '한국어' },
];

function MypageEditLanguage() {
    const [cookies] = useCookies(['id']);
    const idCookie = cookies['id'];

    const navigate = useNavigate();
    const [displaySelectBoxDiv2, setDisplaySelectBoxDiv2] = useState<boolean>(false);
    const [displaySelectBoxDiv3, setDisplaySelectBoxDiv3] = useState<boolean>(false);

    const [showConfirmModal, setShowConfirmModal] = useState<any>({ show: false });
    const [editlangErrorMsg, setEditlangErrorMsg] = useState<string>('');

    const chooseLangRef = useRef<HTMLSelectElement>(null);
    const chooseLangRef2 = useRef<HTMLSelectElement>(null);
    const chooseLangRef3 = useRef<HTMLSelectElement>(null);

    const submitEditLangForm = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const learningLangs: Array<string | undefined> = [];

        const firstLangValue = chooseLangRef.current?.value.trim();
        if (!firstLangValue) {
            setEditlangErrorMsg('학습 언어를 한 가지 이상 선택해주세요.');
            return;
        }
        learningLangs.push(firstLangValue);

        if (displaySelectBoxDiv2) {
            const secondLangValue = chooseLangRef2.current?.value.trim();
            if (!secondLangValue) {
                setEditlangErrorMsg('두 번째 언어를 선택하거나 행을 삭제해주세요.');
                return;
            }
            if (secondLangValue === firstLangValue) {
                setEditlangErrorMsg('이미 선택된 언어입니다.');
                return;
            }
            learningLangs.push(secondLangValue);
        }
        if (displaySelectBoxDiv3) {
            const thirdLangValue = chooseLangRef3.current?.value.trim();
            if (!thirdLangValue) {
                setEditlangErrorMsg('세 번째 언어를 선택하거나 행을 삭제해주세요.');
                return;
            }
            if (thirdLangValue === firstLangValue || thirdLangValue === learningLangs[1]) {
                setEditlangErrorMsg('이미 선택된 언어입니다.');
                return;
            }
            learningLangs.push(thirdLangValue);
        }
        setEditlangErrorMsg('');
        try {
            const res = await axios({
                method: 'patch',
                url: `${process.env.REACT_APP_SERVERURL}/mypage/changeuserlang`,
                data: {
                    userid: idCookie,
                    learningLangs: learningLangs,
                },
                withCredentials: true,
            });
            if (res.data.isError === false) {
                handleConfirmModal();
            } else if (res.data.isError === true) {
                setEditlangErrorMsg(res.data.msg);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleConfirmModal = () => {
        setShowConfirmModal({ show: true });
    };

    return (
        <>
            <ConfirmModal
                show={showConfirmModal.show}
                setShow={setShowConfirmModal}
                navigate={navigate}
            />
            <div className="myPageOption-C-Header">
                <Link to="/mypage/option">
                    <div>
                        <img src="/images/BackPoint.png" alt="" />
                    </div>
                </Link>
                <div className="settingBack">학습 언어 변경</div>
            </div>
            <div className="myPageOption-container multer2">
                <div className="editLanguage-Container">
                    <div className="editContainer-title">학습 언어 변경</div>
                    <div className="editContainer-smalltitle">
                        변경할 학습 언어를 선택해주세요
                    </div>
                    <form className="editLanguage-Form">
                        <label>학습 언어</label>

                        {/* 첫 번째 언어 */}
                        <div className="lang-select-row">
                            <select name="chooseSelect" ref={chooseLangRef}>
                                <option value="">선택하세요...</option>
                                {LANG_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            {!displaySelectBoxDiv2 && (
                                <button
                                    type="button"
                                    className="lang-add-btn"
                                    onClick={() => setDisplaySelectBoxDiv2(true)}
                                >
                                    + 추가
                                </button>
                            )}
                        </div>

                        {/* 두 번째 언어 */}
                        {displaySelectBoxDiv2 && (
                            <div className="lang-select-row">
                                <select name="chooseSelect" ref={chooseLangRef2}>
                                    <option value="">선택하세요...</option>
                                    {LANG_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {!displaySelectBoxDiv3 && (
                                    <button
                                        type="button"
                                        className="lang-add-btn"
                                        onClick={() => setDisplaySelectBoxDiv3(true)}
                                    >
                                        + 추가
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="lang-remove-btn"
                                    onClick={() => {
                                        setDisplaySelectBoxDiv2(false);
                                        setDisplaySelectBoxDiv3(false);
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                        )}

                        {/* 세 번째 언어 */}
                        {displaySelectBoxDiv3 && (
                            <div className="lang-select-row">
                                <select name="chooseSelect" ref={chooseLangRef3}>
                                    <option value="">선택하세요...</option>
                                    {LANG_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="lang-remove-btn"
                                    onClick={() => setDisplaySelectBoxDiv3(false)}
                                >
                                    삭제
                                </button>
                            </div>
                        )}

                        {editlangErrorMsg && (
                            <div className="edit-error-msg">{editlangErrorMsg}</div>
                        )}
                    </form>
                    <button className="edit-ConfirmBtn" onClick={submitEditLangForm}>
                        변경 완료
                    </button>
                </div>
            </div>
        </>
    );
}

export default MypageEditLanguage;
