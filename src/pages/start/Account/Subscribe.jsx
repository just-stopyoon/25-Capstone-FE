import React from "react";
import "./Subscribe.css";
import canIcon from "../../../images/can.png";
import cantIcon from "../../../images/cant.png";

export default function Subscribe() {
  return (
    <div className="subscribe-page">
      <h1 className="subscribe-title">정확한 진단부터 일상 관리까지, 치매 케어의 모든 것</h1>
      <p className="subscribe-subtitle">무료로 진단을 시작하고, 보호자 연동과 대화 기록으로 더 깊이 있는 관리로 확장해보세요.</p>

      <div className="plan-container">
        {/* STANDARD 요금제 */}
        <div className="plan-card">
          <h3 className="plan-type">STANDARD</h3>
          <p className="plan-price">무료</p>
          <button className="current-plan">현재 요금제</button>
          <ul className="plan-features">
            <li><img src={canIcon} alt="가능" /> 정밀한 치매 진단</li>
            <li><img src={canIcon} alt="가능" /> 데일리 회상 대화 케어</li>
            <li className="disabled"><img src={cantIcon} alt="불가능" /> 보호자 연동 치매 진단 결과 제공</li>
            <li className="disabled"><img src={cantIcon} alt="불가능" /> 과거 회상 대화 기록 저장 및 변화 관찰</li>
          </ul>
        </div>

        {/* PLUS 요금제 */}
        <div className="plan-card plus">
          <h3 className="plan-type">PLUS +</h3>
          <p className="plan-price">₩ 1,900 / 월</p>
          <button className="start-button">요금제 시작하기</button>
          <ul className="plan-features">
            <li><img src={canIcon} alt="가능" /> 정밀한 치매 진단</li>
            <li><img src={canIcon} alt="가능" /> 데일리 회상 대화 케어</li>
            <li><img src={canIcon} alt="가능" /> 보호자 연동 치매 진단 결과 제공</li>
            <li className="disabled"><img src={cantIcon} alt="불가능" /> 과거 회상 대화 기록 저장 및 변화 관찰</li>
          </ul>
        </div>

        {/* PREMIUM 요금제 */}
        <div className="plan-card premium">
          <h3 className="plan-type">PREMIUM</h3>
          <p className="plan-price">₩ 2,900 / 월</p>
          <button className="start-button">요금제 시작하기</button>
          <ul className="plan-features">
            <li><img src={canIcon} alt="가능" /> 정밀한 치매 진단</li>
            <li><img src={canIcon} alt="가능" /> 데일리 회상 대화 케어</li>
            <li><img src={canIcon} alt="가능" /> 보호자 연동 치매 진단 결과 제공</li>
            <li><img src={canIcon} alt="가능" /> 과거 회상 대화 기록 저장 및 변화 관찰</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
