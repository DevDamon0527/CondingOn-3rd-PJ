import { cookieConfig } from '../utils/cookieConfig';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { useRef } from 'react';
import { useState } from 'react';
import '../styles/conditions.scss';
import { useNavigate } from 'react-router-dom';
import useErrorHandler from '../utils/useErrorHandler';

function LoginPage() {
    const [errormsg, setErrorMsg] = useState();
    const idRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [cookies, setCookies] = useCookies(['id']);
    const { errorHandler } = useErrorHandler();

    const login = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        try {
            const res = await axios({
                url: `${process.env.REACT_APP_SERVERURL}/login`,
                method: 'post',
                data: {
                    userid: idRef.current?.value,
                    password: passwordRef.current?.value,
                },
                withCredentials: true,
            });

            const { msg, isLoggedin, userid } = res.data;

            setErrorMsg(msg);
            if (isLoggedin) {
                setCookies('id', JSON.stringify(userid), cookieConfig);
                navigate('/');
            }
        } catch (err: any) {
            errorHandler(err.response.status);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <img
                        className="loginlogo"
                        src="/images/loginPageLogo.png"
                        alt="logo-img"
                    />
                </div>
                <form className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label">아이디</label>
                        <input
                            className="auth-input"
                            type="text"
                            placeholder="아이디를 입력하세요"
                            defaultValue="test"
                            ref={idRef}
                        />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">비밀번호</label>
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            defaultValue="111111"
                            ref={passwordRef}
                        />
                    </div>
                    {!(
                        errormsg === '' ||
                        errormsg === undefined ||
                        errormsg === null
                    ) && <p className="auth-error">{errormsg}</p>}
                    <button
                        className="auth-btn"
                        onClick={(e: React.MouseEvent<HTMLElement>) => login(e)}
                    >
                        로그인
                    </button>
                </form>
                <p className="auth-link-text">
                    계정이 없으신가요? <a href="/signup">회원가입</a>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
