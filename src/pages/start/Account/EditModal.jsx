import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditModal.css';

export default function EditModal({ onClose, onUserUpdate }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birth, setBirth] = useState({ year: '', month: '', day: '' });
  const [education, setEducation] = useState('');
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
      setName(userData.name || '');
      setGender(userData.gender || '');
      setBirth({
        year: userData.birth_year ? userData.birth_year.toString() : '',
        month: userData.birth_month ? userData.birth_month.toString().padStart(2, '0') : '',
        day: userData.birth_day ? userData.birth_day.toString().padStart(2, '0') : ''
      });
      setEducation(userData.education || '');
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

  const padToTwoDigits = (value) =>
    value.length === 1 ? '0' + value : value;

  const isValidYear = (y) => /^\d{4}$/.test(y);
  const isValidMonth = (m) => {
    const num = Number(m);
    return /^\d{1,2}$/.test(m) && num >= 1 && num <= 12;
  };
  const isValidDay = (d) => {
    const num = Number(d);
    return /^\d{1,2}$/.test(d) && num >= 1 && num <= 31;
  };

  const handleBirthBlur = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      if (field === 'month' && isValidMonth(value))
        setBirth((prev) => ({ ...prev, month: padToTwoDigits(value) }));
      if (field === 'day' && isValidDay(value))
        setBirth((prev) => ({ ...prev, day: padToTwoDigits(value) }));
    },
    [setBirth]
  );

  const isFormValid =
    name.trim() &&
    gender &&
    isValidYear(birth.year) &&
    isValidMonth(birth.month) &&
    isValidDay(birth.day) &&
    education;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert('모든 항목을 올바르게 입력해주세요.');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        name: name.trim(),
        gender: gender,
        birth_year: parseInt(birth.year),
        birth_month: parseInt(birth.month),
        birth_day: parseInt(birth.day),
        education: education
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
        <h2 className="modal-title">정보 수정</h2>
        <form className="edit-form" onSubmit={handleSubmit}>
          {/* 이름 */}
          <div className="signup-row">
            <label>이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
            />
          </div>

          {/* 성별 */}
          <div className="signup-row">
            <label>성별</label>
            <div className="gender-buttons">
              <button
                type="button"
                className={gender === '남성' ? 'selected' : ''}
                onClick={() => setGender('남성')}
              >
                남성
              </button>
              <button
                type="button"
                className={gender === '여성' ? 'selected' : ''}
                onClick={() => setGender('여성')}
              >
                여성
              </button>
            </div>
          </div>

          {/* 생년월일 */}
          <div className="signup-row">
            <label>생년월일</label>
            <div className="birth-inputs">
              <input
                type="text"
                placeholder="1930"
                maxLength="4"
                value={birth.year}
                onChange={(e) => setBirth({ ...birth, year: e.target.value })}
              />
              <span>/</span>
              <input
                type="text"
                placeholder="01"
                maxLength="2"
                value={birth.month}
                onChange={(e) => setBirth({ ...birth, month: e.target.value })}
                onBlur={handleBirthBlur('month')}
              />
              <span>/</span>
              <input
                type="text"
                placeholder="01"
                maxLength="2"
                value={birth.day}
                onChange={(e) => setBirth({ ...birth, day: e.target.value })}
                onBlur={handleBirthBlur('day')}
              />
            </div>
          </div>

          {/* 최종 학력 */}
          <div className="signup-row">
            <label>최종 학력</label>
            <select
              className="education-select"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            >
              <option value="">선택하세요</option>
              <option value="미취학">미취학</option>
              <option value="초등학교">초등학교</option>
              <option value="중학교">중학교</option>
              <option value="고등학교">고등학교</option>
              <option value="대학교">대학교</option>
            </select>
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
