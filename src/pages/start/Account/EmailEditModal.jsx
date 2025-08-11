import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditModal.css';

export default function EmailEditModal({ onClose, onUserUpdate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  // 인증 토큰 가져오기
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 현재 사용자 정보 가져오기
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/user/me', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }
        throw new Error('사용자 정보를 불러오는데 실패했습니다.');
      }

      const userData = await response.json();
      
      // 폼에 현재 사용자 정보 설정
      setEmail(userData.email || '');
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      setError('사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const isFormValid =
    email.trim() &&
    email.includes('@') &&
    email.includes('.');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert('모든 항목을 올바르게 입력해주세요.');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        email: email.trim(),
      };

      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }
        throw new Error('정보 수정에 실패했습니다.');
      }

      const updatedUser = await response.json();
      
      // 부모 컴포넌트에 업데이트된 사용자 정보 전달
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      alert('정보가 성공적으로 수정되었습니다!');
      onClose(); // 모달 닫기
    } catch (error) {
      console.error('정보 수정 오류:', error);
      alert('정보 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUpdating(false);
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="modal-box">
          <p>사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <div className="modal-backdrop">
        <div className="modal-box">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>×</button>
        <form className="edit-form" onSubmit={handleSubmit}>
          {/* 이메일 */}
          <div className="signup-row">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요"
            />
          </div>

          {/* 수정 버튼 */}
          <div className="signup-button-row">
            <button 
              type="submit" 
              className="signup-btn" 
              disabled={!isFormValid || updating}
            >
              {updating ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
