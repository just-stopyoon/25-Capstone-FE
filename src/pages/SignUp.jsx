import React, { useState } from 'react';
import './SignUp.css';

export default function SignUp() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [education, setEducation] = useState('');
  const [birth, setBirth] = useState({ year: '', month: '', day: '' });

  const isFormValid =
    name.trim() &&
    phone.trim() &&
    password.trim() &&
    gender &&
    birth.year.length === 4 &&
    birth.month.length === 2 &&
    birth.day.length === 2 &&
    education;

  return (
    <div className="signup-page">
      <h2 className="signup-title">회원 가입</h2>
      <form className="signup-form">
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

        {/* 전화번호 */}
        <div className="signup-row">
          <label>전화번호</label>
          <div className="phone-inputs">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="예) 01012345678"
            />
          </div>
        </div>
        <div className="phone-inputs">
          <p>로그인 시 아이디로 사용됩니다</p>
        </div>

        {/* 비밀번호 */}
        <div className="signup-row">
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요"
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
            />
            <span>/</span>
            <input
              type="text"
              placeholder="01"
              maxLength="2"
              value={birth.day}
              onChange={(e) => setBirth({ ...birth, day: e.target.value })}
            />
          </div>
        </div>

        {/* 최종 학력 (드롭다운) */}
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

        {/* 버튼 */}
        <div className="signup-button-row">
          <button type="submit" className="signup-btn" disabled={!isFormValid}>
            가입하기
          </button>
        </div>
      </form>
    </div>
  );
}
