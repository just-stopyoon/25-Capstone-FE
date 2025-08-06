import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// 1. Context 생성
const AuthContext = createContext(null);

// 2. Context를 제공하는 Provider 컴포넌트 생성
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 토큰 만료 시간 체크
  const isTokenExpired = useCallback((token) => {
    try {
      if (!token || typeof token !== 'string') {
        console.log('Token validation: Invalid token format');
        return true;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Token validation: Invalid JWT structure');
        return true;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      
      if (isExpired) {
        console.log('Token validation: Token expired');
      }
      
      return isExpired;
    } catch (error) {
      console.error('Token parsing error:', error);
      return true;
    }
  }, []);

  // 토큰 만료까지 남은 시간 계산 (초 단위)
  const getTokenExpiryTime = useCallback((token) => {
    try {
      if (!token || typeof token !== 'string') {
        return 0;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        return 0;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      return Math.max(0, payload.exp - currentTime);
    } catch (error) {
      console.error('Token expiry calculation error:', error);
      return 0;
    }
  }, []);

  // 로그아웃 함수 (useCallback으로 메모이제이션)
  const logout = useCallback(() => {
    console.log('Auth: Logging out user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  // 토큰 갱신 함수
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('Auth: No refresh token available');
        return { success: false, shouldLogout: true };
      }

      console.log('Auth: Refreshing access token...');
      setIsRefreshing(true);

      const response = await fetch('http://127.0.0.1:8000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        console.log('Auth: Token refresh failed');
        return { success: false, shouldLogout: true };
      }

      const data = await response.json();
      
      if (data.access_token) {
        console.log('Auth: Token refresh successful');
        localStorage.setItem('accessToken', data.access_token);
        
        // 새로운 refresh token이 제공된 경우 저장
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }
        
        return { success: true, shouldLogout: false };
      } else {
        console.log('Auth: No access token in refresh response');
        return { success: false, shouldLogout: true };
      }
    } catch (error) {
      console.error('Auth: Token refresh error:', error);
      return { success: false, shouldLogout: true };
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 토큰 유효성 검증 함수 (갱신 로직 포함)
  const validateToken = useCallback(async (token) => {
    console.log('Auth: Validating token...');
    try {
      // 토큰 만료 체크
      if (isTokenExpired(token)) {
        console.log('Auth: Token is expired, attempting refresh');
        
        // 토큰 갱신 시도
        const { success, shouldLogout } = await refreshAccessToken();
        
        if (success) {
          // 갱신 성공 시 새로운 토큰으로 재검증
          const newToken = localStorage.getItem('accessToken');
          if (newToken) {
            return await validateToken(newToken);
          }
        }
        
        if (shouldLogout) {
          console.log('Auth: Token refresh failed, logging out');
          logout();
        }
        
        return { isValid: false, user: null };
      }

      const apiUrl = 'http://127.0.0.1:8000/api/user/validate';
      console.log('Auth: Making API request to:', apiUrl);

      // 백엔드 API 호출하여 토큰 유효성 검증
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Auth: Token validation response status:', response.status);
      console.log('Auth: Response headers:', Object.fromEntries(response.headers.entries()));
      
      // 응답이 성공적이지 않으면 처리
      if (!response.ok) {
        // 401, 403 등의 인증 오류인 경우 토큰 갱신 시도
        if (response.status === 401 || response.status === 403) {
          console.log('Auth: Token validation failed - unauthorized, attempting refresh');
          
          const { success, shouldLogout } = await refreshAccessToken();
          
          if (success) {
            // 갱신 성공 시 새로운 토큰으로 재검증
            const newToken = localStorage.getItem('accessToken');
            if (newToken) {
              return await validateToken(newToken);
            }
          }
          
          if (shouldLogout) {
            console.log('Auth: Token refresh failed, logging out');
            logout();
          }
          
          return { isValid: false, user: null };
        }
        
        // 기타 서버 오류 - 네트워크 오류 시에는 기존 토큰을 유지
        console.error('Server error during token validation:', response.status);
        console.log('Auth: Server error, keeping existing token');
        return { isValid: true, user: null }; // 서버 오류 시에도 토큰 유지
      }

      // 응답이 성공적인 경우 JSON 파싱 시도
      try {
        const contentType = response.headers.get('content-type');
        console.log('Auth: Response content-type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Auth: Response is not JSON:', contentType);
          // 응답 내용을 로그로 출력하여 디버깅
          const responseText = await response.text();
          console.log('Auth: Response body:', responseText.substring(0, 200) + '...');
          console.log('Auth: Non-JSON response, keeping existing token');
          return { isValid: true, user: null };
        }

        const userData = await response.json();
        console.log('Auth: Token validation successful, user data:', userData);
        return { isValid: true, user: userData };
      } catch (jsonError) {
        console.error('Auth: JSON parsing error:', jsonError);
        // 응답 내용을 로그로 출력하여 디버깅
        try {
          const responseText = await response.text();
          console.log('Auth: Response body that failed to parse:', responseText.substring(0, 200) + '...');
        } catch (textError) {
          console.error('Auth: Could not read response as text:', textError);
        }
        console.log('Auth: JSON parsing failed, keeping existing token');
        return { isValid: true, user: null };
      }
    } catch (error) {
      console.error('Token validation error:', error);
      console.log('Auth: Network error, keeping existing token');
      // 네트워크 오류 시에도 기존 토큰을 유지 (서버 연결 문제일 수 있음)
      return { isValid: true, user: null };
    }
  }, [isTokenExpired, refreshAccessToken, logout]);

  // 컴포넌트가 처음 렌더링될 때 로컬 스토리지에서 토큰을 확인하여 로그인 상태를 설정
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Auth: Initializing authentication...');
      try {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          console.log('Auth: Found token in localStorage');
          // 토큰 유효성 검증
          const { isValid, user: userData } = await validateToken(token);
          
          if (isValid) {
            console.log('Auth: Token is valid, setting logged in state');
            setIsLoggedIn(true);
            if (userData) {
              setUser(userData);
            }
          } else {
            console.log('Auth: Token is invalid, logging out');
            // 유효하지 않은 토큰 제거
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
            setUser(null);
          }
        } else {
          console.log('Auth: No token found in localStorage');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // 초기화 중 오류 발생 시에도 기존 토큰 유지
        const token = localStorage.getItem('accessToken');
        if (token && !isTokenExpired(token)) {
          console.log('Auth: Error during initialization, but token seems valid');
          setIsLoggedIn(true);
        } else {
          console.log('Auth: Error during initialization, logging out');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsLoggedIn(false);
          setUser(null);
        }
      } finally {
        console.log('Auth: Initialization complete');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [validateToken, isTokenExpired]);

  // 토큰 만료 전 자동 갱신 설정
  useEffect(() => {
    if (!isLoggedIn) return;

    const setupAutoRefresh = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const expiryTime = getTokenExpiryTime(token);
      
      // 토큰이 5분 이내에 만료되는 경우 갱신
      if (expiryTime > 0 && expiryTime <= 300) { // 5분 = 300초
        console.log('Auth: Token expires soon, refreshing immediately');
        refreshAccessToken();
        return;
      }

      // 토큰 만료 5분 전에 갱신하도록 타이머 설정
      if (expiryTime > 300) {
        const refreshTime = (expiryTime - 300) * 1000; // 5분 전에 갱신
        console.log(`Auth: Setting auto-refresh timer for ${Math.floor(refreshTime / 1000)} seconds`);
        
        const timer = setTimeout(async () => {
          console.log('Auth: Auto-refreshing token');
          const { success, shouldLogout } = await refreshAccessToken();
          
          if (!success && shouldLogout) {
            console.log('Auth: Auto-refresh failed, logging out');
            logout();
          } else if (success) {
            // 갱신 성공 시 새로운 타이머 설정
            setupAutoRefresh();
          }
        }, refreshTime);

        return () => clearTimeout(timer);
      }
    };

    const cleanup = setupAutoRefresh();
    return cleanup;
  }, [isLoggedIn, getTokenExpiryTime, refreshAccessToken, logout]);

  // 주기적으로 토큰 유효성 체크 (10분마다로 변경)
  useEffect(() => {
    if (!isLoggedIn) return;

    console.log('Auth: Setting up periodic token validation');
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          console.log('Auth: Periodic token validation...');
          const { isValid } = await validateToken(token);
          if (!isValid) {
            console.log('Auth: Periodic validation failed, logging out');
            logout();
          }
        }
      } catch (error) {
        console.error('Token refresh check error:', error);
        // 주기적 체크 중 오류 발생 시에는 로그아웃하지 않음
        // 네트워크 문제일 수 있으므로 기존 상태 유지
      }
    }, 10 * 60 * 1000); // 10분

    return () => clearInterval(interval);
  }, [isLoggedIn, validateToken, logout]);

  // 로그인 함수
  const login = useCallback(async (accessToken, refreshToken, userData) => {
    try {
      if (!accessToken) {
        throw new Error('Access token is required for login');
      }
      
      console.log('Auth: Logging in user');
      localStorage.setItem('accessToken', accessToken);
      
      // refresh token이 제공된 경우 저장
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setIsLoggedIn(true);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // 토큰 갱신 함수 (외부에서 호출 가능)
  const refreshToken = useCallback(async () => {
    try {
      const { success, shouldLogout } = await refreshAccessToken();
      
      if (success) {
        // 갱신 성공 시 사용자 정보도 업데이트
        const token = localStorage.getItem('accessToken');
        if (token) {
          const { isValid, user: userData } = await validateToken(token);
          if (isValid && userData) {
            setUser(userData);
          }
        }
        return true;
      } else if (shouldLogout) {
        logout();
        return false;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      // 갱신 중 오류 발생 시에도 기존 상태 유지
      return true;
    }
  }, [refreshAccessToken, validateToken, logout]);

  // Context가 제공할 값들
  const value = {
    isLoggedIn,
    user,
    isLoading,
    isRefreshing,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Context를 쉽게 사용할 수 있게 해주는 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
