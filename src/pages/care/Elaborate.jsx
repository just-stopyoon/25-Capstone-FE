import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import mindy from '../../images/mindy.png';
import { talks } from './talks'; // 대화 내용 배열
import './Elaborate.css'; // 동일한 스타일 재사용

export default function TalkPage() {
  return (
    <div className="elaborate-page">
      <section className="elaborate-header">
        <h2>오늘은 무슨 일이 있었나요?</h2>
        <p>
          오늘 있었던 일을 편하게 말해보세요! <br/>
          민디가 당신의 기억을 저장할게요
        </p>
      </section>

      <section>
        <img src={mindy} alt="마인디" className="mindy-image" />
      </section>

      <Link to="/care1" className="stop-elaborate-btn">기록 시작하기</Link>
    </div>
  );
}
