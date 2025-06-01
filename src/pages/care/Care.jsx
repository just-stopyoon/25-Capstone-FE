import React from 'react';
import './Care.css';
import { Link } from 'react-router-dom';
import checkOn from '../../images/check-on.png';
import checkOff from '../../images/check-off.png';

export default function Care() {
  return (
    <div className="care-page">
      <section className="care-header">
        <h2>대화와 함께하는 치매 치료</h2>
        <p>
          MinDI의 음성 대화 봇, 민디와 함께 대화를 통해 하루를 회고합니다.<br />
          내일 다시, 대화를 통해 민디와 함께 오늘을 회상합니다.
        </p>
      </section>

      <section className="record-status">
        <h3>일일 기록 현황</h3>
        <p>기록은 매주 월요일에 시작됩니다</p>
        <div className="week-checklist">
          {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
            <div className="day-check" key={day}>
              <img
                src={idx < 3 ? checkOn : checkOff}
                alt="체크"
              />
              <span>{day}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="prepare">
        <h2>아직 오늘 일상이 기록되지 않았어요!</h2>
      </div>

      <Link to="/elaborate/1" className="start-elaborate-btn">기록 시작하기</Link>
    </div>
  );
}
