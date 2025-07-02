import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Context 생성
const AuthContext = createContext(null);

// 2. Context를 제공하는 Provider 컴포넌트 생성
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 컴포넌트가 처음 렌더링될 때 로컬 스토리지에서 토큰을 확인하여 로그인 상태를 설정
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // 로그인 함수
  const login = (token) => {
    localStorage.setItem('accessToken', token);
    setIsLoggedIn(true);
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
  };

  // Context가 제공할 값들
  const value = {
    isLoggedIn,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Context를 쉽게 사용할 수 있게 해주는 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};
