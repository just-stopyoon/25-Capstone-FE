import React, { useState } from "react";
import "./Account.css";
import mindy from "../../images/mindy.png";
import EditModal from "./Account/EditModal"; // 모달 컴포넌트 import

export default function Account() {
  const [showModal, setShowModal] = useState(false); // 모달 상태

  return (
    <div className="account-page">
      {/* 모달창 */}
      {showModal && <EditModal onClose={() => setShowModal(false)} />}

      <div className="account-wrapper">
        {/* 상단 카드 */}
        <div className="account-card">
          <div className="account-left">
            <img src={mindy} alt="프로필 캐릭터" className="profile-image" />
            <div className="account-header">
              <h2 className="account-title">
                <span className="highlight-name">정지윤</span>님 안녕하세요.
                <span className="plus-badge">PLUS+</span>
              </h2>
              <div className="account-info">
                <span>연령 <strong>만 22세</strong></span>
                <span>최종 학력 <strong>고등학교</strong></span>
                <span>보호자 연결 <strong>연결 안 됨</strong></span>
              </div>
            </div>
          </div>
          <div className="account-actions">
            <a href="#" className="action-link">구독 관리 →</a>
            <a
              href="#"
              className="action-link"
              onClick={(e) => {
                e.preventDefault();
                setShowModal(true);
              }}
            >
              회원정보 수정 →
            </a>
          </div>
        </div>

        {/* 진단 결과 + 관리 카드 */}
        <div className="account-section-grid">
          {/* 치매 진단 결과 카드 */}
          <div className="result-card">
            <div className="result-header">
              <h3>치매 진단 결과</h3>
              <span className="date-label">마지막 진단일 : 2025-06-24 (34일 전)</span>
            </div>
            <div className="result-body">
              <div className="score-and-status">
                <div className="score-circle">64점</div>
                <div className="status-box">
                  <p className="status-bad">경미한 인지 저하</p>
                  <div className="result-columns">
                    <div className="result-col">
                      <p className="status-good">잘하고 있어요</p>
                      <p>문맥 파악, 문장 구성</p>
                    </div>
                    <div className="result-col">
                      <p className="status-improve">개선이 필요해요</p>
                      <p>자연스럽게 말하기</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 치매 관리 카드 */}
          <div className="care-card">
            <div className="care-card-header">
              <h3>치매 관리</h3>
            </div>
            <div className="care-card-body">
              <p className="care-progress">
                <strong className="highlight">32일째</strong> 진행 중
              </p>
              <div className="button-wrapper">
                <button className="track-button">대화 내용 추적 결과 보기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
