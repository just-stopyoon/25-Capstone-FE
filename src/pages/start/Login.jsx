import React from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

import loginImg from '../../images/loginImg.png';

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-text">
          <p className="text-top">기억을 지키는 일,</p>
          <p className="text-highlight">이제는 <span className="mindi">MinDI</span>와 함께하세요</p>
        </div>
        <img src={loginImg} alt="로그인 일러스트" className="login-illustration" />
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2 className="login-title">로그인</h2>
          <div className="login-inputs">
            <input type="text" placeholder="아이디 (전화번호 10자리)" />
            <input type="password" placeholder="비밀번호" />
          </div>
          <button className="login-btn">로그인</button>
          <div className="login-links">
            <Link to="/find-password">비밀번호 찾기</Link>
            <span>|</span>
            <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
}