import React from 'react';
import './Report.css';
import warning from '../../images/warning.png';
import congratulation from '../../images/firework.png';
import good from '../../images/good.png';
import bad from '../../images/bad.png';

export default function Report() {
  return (
    <div className="report-page">
      <div className="report-container">

        {/* 알림 영역 */}
        <div className="report-alert-horizontal">
          <img src={congratulation} alt="경고" className="alert-icon" />
          <div className="alert-text">
            <h2>인지 기능이 <span className="green">건강한 상태</span>입니다</h2>
            <p className="alert-desc">방심은 금물! 지금처럼 꾸준히 관리해주세요</p>
          </div>
        </div>

        {/* 본문: 점수 + 피드백 */}
        <div className="report-main">
          <div className="score-box">
            <p className="score-label">마인디가 예상하는 치매 정도</p>
            <div className="score-info-wrapper">
              <div className="score-circle">86점</div>
              <ul className="score-range">
                <li>80점 이상 : 정상</li>
                <li>51점 ~ 79점 : 인지 저하</li>
                <li>50점 이하 : 치매 의심</li>
              </ul>
            </div>
          </div>

          <div className="feedback-boxes">
            <div className="feedback good">
              <img src={good} alt="good" />
              <div>
                <strong className='good-text'>잘하고 있어요!</strong>
                <p>문맥 파악, 문장 구성</p>
              </div>
            </div>
            <div className="feedback bad">
              <img src={bad} alt="bad" />
              <div>
                <strong className="bad-text">개선이 필요해요</strong>
                <p>자연스럽게 말하기</p>
              </div>
            </div>
          </div>
        </div>

        <button className="start-care-btn">치매 케어 시작하기</button>
      </div>
    </div>
  );
}
