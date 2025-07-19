import React, { useState, useCallback } from 'react';
import './EditModal.css';

export default function EditModal({ onClose }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birth, setBirth] = useState({ year: '', month: '', day: '' });
  const [education, setEducation] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert('모든 항목을 올바르게 입력해주세요.');
      return;
    }

    // 서버 전송 로직 추가 가능
    alert('정보가 성공적으로 수정되었습니다!');
    onClose(); // 모달 닫기
  };

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
            <button type="submit" className="signup-btn" disabled={!isFormValid}>
              수정하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
