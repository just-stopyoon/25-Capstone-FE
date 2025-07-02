import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../context/AuthContext';

import loginImg from '../../images/loginImg.png';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append('username', phone);
    formData.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        login(data.access_token);
        alert('로그인 되었습니다.');
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`로그인 실패: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('로그인 중 오류 발생: ', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-text">
          <p className="text-top">기억을 지키는 일,</p>
          <p className="text-highlight">
            이제는 <span className="mindi">MinDI</span>와 함께하세요
          </p>
        </div>
        <img 
          src={loginImg} 
          alt="로그인 일러스트" 
          className="login-illustration" 
        />
      </div>

      <div className="login-right">
        <form className="login-box" onSubmit={handleLogin}>
          <h2 className="login-title">로그인</h2>
          <div className="login-inputs">
            <input 
              type="text" 
              placeholder="아이디 (전화번호 10자리)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="비밀번호" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="login-btn">로그인</button>
          <div className="login-links">
            <Link to="/find-password">비밀번호 찾기</Link>
            <span>|</span>
            <Link to="/signup">회원가입</Link>
          </div>
        </form>
      </div>
    </div>
  );
}