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
        <div className="logincontainer signup-or-login">
            <div className="loginlogoImg-div">
                <img
                    className="loginlogo"
                    src="/images/loginPageLogo.png"
                    alt="logo-img"
                />
            </div>
            <form>
                <input type="text" placeholder="아이디" ref={idRef} /> <br />
                <input
                    type="password"
                    placeholder="비밀번호"
                    ref={passwordRef}
                />{' '}
                <br />
                <img
                    src="/images/signinBtn.png"
                    alt="login-btn"
                    onClick={(e: React.MouseEvent<HTMLElement>) => login(e)}
                />
            </form>
            <p className="signupMessage">
                계정이 없으신가요? <a href="/signup">회원가입</a>
            </p>
            {!(
                errormsg === '' ||
                errormsg === undefined ||
                errormsg === null
            ) && <p className="getred">{errormsg}</p>}
        </div>
    );
}

export default LoginPage;
