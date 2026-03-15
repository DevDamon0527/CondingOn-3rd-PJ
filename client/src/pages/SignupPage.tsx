import axios from 'axios';
import { useRef } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/conditions.scss';
import useErrorHandler from '../utils/useErrorHandler';
function SignupPage() {
    const { errorHandler } = useErrorHandler();
    const navigate = useNavigate();
    const [isUnique, setIsUnique] = useState<boolean>(false);
    const [gender, setGender] = useState<string>('m');
    const [existErrorMsg, setExistErrorMsg] = useState<string>('');
    const [passwordsNotSameMsg, setPasswordsNotSameMsg] = useState('');
    const [signupErrorMsg, setSignupErrorMsg] = useState<string>('');
    const [displayToggle, setDisplayToggle] = useState<boolean>(true);
    const [learningLang2Toggle, setLearningLang2Toggle] =
        useState<boolean>(false);
    const [learningLang3Toggle, setLearningLang3Toggle] =
        useState<boolean>(false);
    const idRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const nationRef = useRef<HTMLSelectElement>(null);
    const firLangRef = useRef<HTMLSelectElement>(null);
    const learningLang1Ref = useRef<HTMLSelectElement>(null);
    const learningLang2Ref = useRef<HTMLSelectElement>(null);
    const learningLang3Ref = useRef<HTMLSelectElement>(null);

    const changeGender = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGender(e.target.value);
    };

    const goNext = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!isUnique) {
            return setPasswordsNotSameMsg('아이디 중복 확인을 해주세요.');
        }
        if (
            passwordRef.current?.value === undefined ||
            passwordRef.current?.value.length < 6
        ) {
            return setPasswordsNotSameMsg('비밀번호는 6자 이상이어야 합니다.');
        }
        if (
            !(passwordRef.current?.value === confirmPasswordRef.current?.value)
        ) {
            return setPasswordsNotSameMsg(
                '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
            );
        }
        setPasswordsNotSameMsg('');
        setDisplayToggle(false);
    };

    const goBack = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setDisplayToggle(true);
    };

    const submitForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const learningLangs: Array<string | null | undefined> = [];
        if (
            learningLang1Ref.current?.value.trim() !== '' &&
            learningLang1Ref.current?.value.trim()
        ) {
            learningLangs.push(learningLang1Ref.current?.value.trim());
        }
        if (
            learningLang2Ref.current?.value.trim() !== '' &&
            learningLang2Ref.current?.value.trim()
        ) {
            learningLangs.push(learningLang2Ref.current?.value.trim());
        }
        if (
            learningLang3Ref.current?.value.trim() !== '' &&
            learningLang3Ref.current?.value.trim()
        ) {
            learningLangs.push(learningLang3Ref.current?.value.trim());
        }
        try {
            const res = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVERURL}/signup`,
                data: {
                    userid: idRef.current?.value,
                    password: passwordRef.current?.value,
                    confirmPassword: confirmPasswordRef.current?.value,
                    name: nameRef.current?.value,
                    gender: gender,
                    isUnique: isUnique,
                    nation: nationRef.current?.value,
                    firLang: firLangRef.current?.value,
                    learningLang: learningLangs,
                },
                withCredentials: true,
            });
            setSignupErrorMsg(res.data.msg);
            if (!res.data.isError) {
                navigate('/');
            }
        } catch (err: any) {
            errorHandler(err.response.status);
        }
    };

    const existAlready = async (e: React.FocusEvent<HTMLInputElement>) => {
        e.preventDefault();
        try {
            const res = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVERURL}/existAlready`,
                data: {
                    userid: idRef.current?.value,
                },
                withCredentials: true,
            });
            setIsUnique(res.data.isUnique);
            setExistErrorMsg(res.data.msg);
        } catch (err: any) {
            errorHandler(err.response.status);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* 1단계: 계정 정보 */}
                <fieldset className={displayToggle ? 'dblock' : 'dnone'}>
                    <div className="auth-logo">
                        <img
                            className="loginlogo"
                            src="/images/loginPageLogo.png"
                            alt="logo"
                        />
                    </div>
                    <p className="auth-section-title">계정 정보 입력</p>
                    <div className="auth-form">
                        <div className="auth-field">
                            <label className="auth-label">아이디</label>
                            <input
                                className="auth-input"
                                onBlur={(
                                    e: React.FocusEvent<HTMLInputElement>
                                ) => existAlready(e)}
                                type="text"
                                name="id"
                                placeholder="아이디 (4자 이상)"
                                ref={idRef}
                            />
                            {existErrorMsg.length > 0 && (
                                <div
                                    className={
                                        isUnique ? 'auth-success' : 'auth-error'
                                    }
                                >
                                    {existErrorMsg}
                                </div>
                            )}
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">비밀번호</label>
                            <input
                                className="auth-input"
                                type="password"
                                name="password"
                                placeholder="비밀번호 (6자 이상)"
                                ref={passwordRef}
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">비밀번호 확인</label>
                            <input
                                className="auth-input"
                                type="password"
                                name="confirmpassword"
                                placeholder="비밀번호를 다시 입력하세요"
                                ref={confirmPasswordRef}
                            />
                            {passwordsNotSameMsg.length > 0 && (
                                <div className="auth-error">
                                    {passwordsNotSameMsg}
                                </div>
                            )}
                        </div>
                        <button className="auth-btn" onClick={goNext}>
                            다음
                        </button>
                    </div>
                    <p className="auth-link-text">
                        이미 계정이 있으신가요? <a href="/login">로그인</a>
                    </p>
                </fieldset>

                {/* 2단계: 추가 정보 */}
                <fieldset className={!displayToggle ? 'dblock' : 'dnone'}>
                    <div className="auth-card-header">
                        <button className="auth-back-btn" onClick={goBack}>
                            ‹
                        </button>
                        <div className="auth-step-logo">
                            <img
                                src="/images/loginPageLogo.png"
                                alt="logo"
                            />
                        </div>
                    </div>
                    <p className="auth-section-title">추가 정보 입력</p>
                    <div className="auth-form">
                        <div className="auth-field">
                            <label className="auth-label">닉네임</label>
                            <input
                                className="auth-input"
                                type="text"
                                name="name"
                                placeholder="닉네임을 입력하세요"
                                ref={nameRef}
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">성별</label>
                            <div className="auth-radio-group">
                                <div className="auth-radio-option">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="m"
                                        id="male-btn"
                                        onChange={(e) => changeGender(e)}
                                        readOnly
                                        defaultChecked
                                    />
                                    <label htmlFor="male-btn">남성</label>
                                </div>
                                <div className="auth-radio-option">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="f"
                                        id="female-btn"
                                        onChange={(e) => changeGender(e)}
                                        readOnly
                                    />
                                    <label htmlFor="female-btn">여성</label>
                                </div>
                            </div>
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">국적</label>
                            <select
                                className="auth-select"
                                name="nation"
                                defaultValue=""
                                ref={nationRef}
                            >
                                <option value="">선택하세요...</option>
                                <option value="China">중국</option>
                                <option value="America">미국</option>
                                <option value="France">프랑스</option>
                                <option value="Germany">독일</option>
                                <option value="Japan">일본</option>
                                <option value="Korea">한국</option>
                            </select>
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">모국어</label>
                            <select
                                className="auth-select"
                                name="firlang"
                                defaultValue=""
                                ref={firLangRef}
                            >
                                <option value="">선택하세요...</option>
                                <option value="Chinese">중국어</option>
                                <option value="English">영어</option>
                                <option value="French">프랑스어</option>
                                <option value="German">독일어</option>
                                <option value="Japanese">일본어</option>
                                <option value="Korean">한국어</option>
                            </select>
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">학습 언어</label>
                            <div className="lang-select-row">
                                <select
                                    className="auth-select"
                                    name="learninglang1"
                                    defaultValue=""
                                    ref={learningLang1Ref}
                                >
                                    <option value="">선택하세요...</option>
                                    <option value="Chinese">중국어</option>
                                    <option value="English">영어</option>
                                    <option value="French">프랑스어</option>
                                    <option value="German">독일어</option>
                                    <option value="Japanese">일본어</option>
                                    <option value="Korean">한국어</option>
                                </select>
                                {!learningLang2Toggle && (
                                    <button
                                        className="lang-btn lang-add"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setLearningLang2Toggle(true);
                                        }}
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                            {learningLang2Toggle && (
                                <div className="lang-select-row">
                                    <select
                                        className="auth-select"
                                        name="learninglang2"
                                        defaultValue=""
                                        ref={learningLang2Ref}
                                    >
                                        <option value="">선택하세요...</option>
                                        <option value="Chinese">중국어</option>
                                        <option value="English">영어</option>
                                        <option value="French">프랑스어</option>
                                        <option value="German">독일어</option>
                                        <option value="Japanese">일본어</option>
                                        <option value="Korean">한국어</option>
                                    </select>
                                    {!learningLang3Toggle && (
                                        <button
                                            className="lang-btn lang-add"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setLearningLang3Toggle(true);
                                            }}
                                        >
                                            +
                                        </button>
                                    )}
                                    <button
                                        className="lang-btn lang-remove"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setLearningLang2Toggle(false);
                                            setLearningLang3Toggle(false);
                                        }}
                                    >
                                        −
                                    </button>
                                </div>
                            )}
                            {learningLang3Toggle && (
                                <div className="lang-select-row">
                                    <select
                                        className="auth-select"
                                        name="learninglang3"
                                        defaultValue=""
                                        ref={learningLang3Ref}
                                    >
                                        <option value="">선택하세요...</option>
                                        <option value="Chinese">중국어</option>
                                        <option value="English">영어</option>
                                        <option value="French">프랑스어</option>
                                        <option value="German">독일어</option>
                                        <option value="Japanese">일본어</option>
                                        <option value="Korean">한국어</option>
                                    </select>
                                    <button
                                        className="lang-btn lang-remove"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setLearningLang3Toggle(false);
                                        }}
                                    >
                                        −
                                    </button>
                                </div>
                            )}
                        </div>
                        <button className="auth-btn" onClick={submitForm}>
                            회원가입
                        </button>
                        {signupErrorMsg.length > 0 && (
                            <div className="auth-error">{signupErrorMsg}</div>
                        )}
                    </div>
                </fieldset>
            </div>
        </div>
    );
}

export default SignupPage;
