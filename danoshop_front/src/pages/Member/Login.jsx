import React, { useRef, useState, useEffect } from "react";
import * as style from "./LoginStyle";
import TopBanner from "../../components/TopBanner/TopBanner";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { Link, useNavigate } from "react-router-dom";
import { axiosPost } from "../../../utils/dataFetch";
import useAuthStore from "../../../store/authStore";
import axios from "axios";

function Login() {
  window.scroll({ top: 0, behavior: "auto" });
  const navigate = useNavigate();

  const midRef = useRef(null);
  const pwdRef = useRef(null);
  const [formData, setFormData] = useState({ mid: '', pwd: '' });
  const [errors, setErrors] = useState({ mid: '', pwd: '', cpwd: '', chmid: '' });
  const login = useAuthStore((s) => s.login);
  //const kakaoLogin = useAuthStore((s) => s.kakaoLogin);
  //const isProcessed = useRef(false); // 👈 중복 요청 방지용 flag

  const clientId = import.meta.env.VITE_KAKAO_LOGIN_CLIENT_ID;
  const redirectUrl = import.meta.env.VITE_KAKAO_LOGIN_REDIRECT_URL;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code`;

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ mid: '', pwd: '' });
  };

  const handleLoginSubmit = async (e) => {
    // e.preventDefault();
    if (midRef.current.value === '') {
      setErrors((p) => ({ ...p, mid: "아이디를 입력해주세요" }));
      midRef.current.focus();
      return;
    }
    if (pwdRef.current.value === '') {
      setErrors((p) => ({ ...p, pwd: "비밀번호를 입력해주세요" }));
      pwdRef.current.focus();
      return;
    }

    if (formData.mid.trim() && formData.pwd.trim()) {
      //로그인 요청시 withCredentials : true 보내줘야됨(192.168.7.112 port가 다를시)
      const result = await axiosPost('/member/login', formData);

      if (result.isLogin) {
        // 1. 서버가 진짜로 어떤 유저 정보를 주었는지 콘솔로 확인하기
        console.log("서버가 보내준 유저 정보:", result.userInfo);
        console.log("서버가 보내준 토큰:", result.accessToken);
        //로그인 인증 관리 => 전역 객체 리덕스에 등록
        login({ userData: result.userInfo, accessToken: result.accessToken });
        localStorage.setItem('loginType', 'normal');
        alert('로그인에 성공하셨습니다.');
        navigate('/');
      } else if (!result.isComparePwd) {
        setErrors((p) => ({ ...p, cpwd: "비밀번호가 틀립니다. 확인 후 다시 입력해주세요" }));
        return;
      } else {
        setErrors((p) => ({ ...p, chmid: "존재하지 않는 계정입니다." }));
        return;
      }
    }
  }

  // Enter 키 입력을 감지하는 함수
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLoginSubmit(); // Enter 키가 눌렸을 때 로그인 함수 실행
    }
  };

  return (
    <>
      <TopBanner />
      <Header isAboutHeader={true} />
      <style.Login>
        <div className="section_path">
          <ol>
            <li>
              <Link to="/">홈</Link>
            </li>
            <li>
              <strong>로그인</strong>
            </li>
          </ol>
        </div>
        <div className="title_area">
          <h2>로그인</h2>
        </div>
        <div className="login_form">
          <div className="login">
            <input type="text" name="mid" value={formData.mid} ref={midRef}
              onChange={handleFormChange} onKeyDown={handleKeyDown} placeholder="아이디" />
            <input type="password" name="pwd" value={formData.pwd} ref={pwdRef}
              onChange={handleFormChange} onKeyDown={handleKeyDown} placeholder="비밀번호" />
            {errors.mid && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.mid}</span>}
            {errors.pwd && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.pwd}</span>}
            {errors.cpwd && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.cpwd}</span>}
            {errors.chmid && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.chmid}</span>}
          </div>
        </div>
        <div className="security">
          <div className="login_security">
            <span>
              <input type="checkbox" /> &nbsp;
            </span>
            <label>보안접속</label>
          </div>
        </div>
        <div className="login_btn">
          <button onClick={handleLoginSubmit}>로그인</button>
        </div>
        <div className="wrap_find">
          <div>
            <Link to="#">아이디 찾기</Link>
          </div>
          <div>
            <Link to="#">비밀번호 찾기</Link>
          </div>
        </div>
        <div className="login__util">
          <div>아직 회원이 아니신가요?</div>
          <div>
            지금 회원가입을 하시면<br></br>다양하고 특별한 혜택이 준비되어
            있습니다.
          </div>
          <div>
            <button onClick={() => navigate('/signup')}>회원가입</button>
          </div>
        </div>
        <div className="login_sns">
          <div className="sns">SNS 로그인</div>
          <div className="wrap_sns_log">

            <button className="btnKakao" onClick={handleKakaoLogin}>카카오 로그인</button>
            <button className="btnNaver">네이버 로그인</button>
            <button className="btnApple">Apple로 로그인</button>
          </div>
        </div>
      </style.Login>
      <Footer />
    </>
  );
};


export default Login;
