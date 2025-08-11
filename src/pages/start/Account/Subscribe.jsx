import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Subscribe.css";
import canIcon from "../../../images/can.png";
import cantIcon from "../../../images/cant.png";
import EmailEditModal from "./EmailEditModal";

export default function Subscribe() {
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { isLoading } = useAuth();

  // 인증 토큰 가져오기
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 사용자 정보 가져오기
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
      setUserInfo(userData);
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      setError('사용자 정보를 불러오는데 실패했습니다.');
    }
  }, [navigate]);

  // 구독 타입 변경
  const updateSubscription = async (subscriptionType) => {
    setUpdating(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/user/subscription?subscription_type=${subscriptionType}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }
        throw new Error('구독 변경에 실패했습니다.');
      }

      const updatedUser = await response.json();
      setUserInfo(updatedUser);
    } catch (error) {
      console.error('구독 변경 오류:', error);
      alert('구독 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUpdating(false);
    }
  };

  // 데이터 로드
  useEffect(() => {
    if (isLoading) return;

    const loadData = async () => {
      setLoading(true);
      await fetchUserInfo();
      setLoading(false);
    };

    loadData();
  }, [isLoading, fetchUserInfo]);

  // 로딩 중일 때
  if (isLoading || loading) {
    return (
      <div className="subscribe-page">
        <p>구독 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <div className="subscribe-page">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  // 현재 구독 타입 확인
  const currentSubscription = userInfo?.subscription_type || 'standard';

  // 구독 타입에 따른 버튼 렌더링
  const renderButton = (planType) => {
    if (currentSubscription === planType) {
      return <button className="current-plan" disabled>현재 요금제</button>;
    } else {
      return (
        <button 
          className="start-button" 
          onClick={() => {
            if (currentSubscription === 'standard') {
              updateSubscription(planType);
            } else {
              setShowModal(true);
              updateSubscription(planType);
            }
          }}
          disabled={updating}
        >
          {updating ? '변경 중...' : '요금제 시작하기'}
        </button>
      );
    }
  };

  return (
    <div className="subscribe-page">
      {showModal && <EmailEditModal onClose={() => setShowModal(false)} />}

      <h1 className="subscribe-title">정확한 진단부터 일상 관리까지, 치매 케어의 모든 것</h1>
      <p className="subscribe-subtitle">무료로 진단을 시작하고, 보호자 연동과 대화 기록으로 더 깊이 있는 관리로 확장해보세요.</p>

      <div className="plan-container">
        {/* STANDARD 요금제 */}
        <div className={`plan-card ${currentSubscription === 'standard' ? 'current' : ''}`}>
          <h3 className="plan-type">STANDARD</h3>
          <p className="plan-price">무료</p>
          {renderButton('standard')}
          <ul className="plan-features">
            <li><img src={canIcon} alt="가능" /> 정밀한 치매 진단</li>
            <li><img src={canIcon} alt="가능" /> 데일리 회상 대화 케어</li>
            <li className="disabled"><img src={cantIcon} alt="불가능" /> 보호자 연동 치매 진단 결과 제공</li>
            <li className="disabled"><img src={cantIcon} alt="불가능" /> 과거 회상 대화 기록 저장 및 변화 관찰</li>
          </ul>
        </div>

        {/* PLUS 요금제 */}
        <div className={`plan-card plus ${currentSubscription === 'plus' ? 'current' : ''}`}>
          <h3 className="plan-type">PLUS +</h3>
          <p className="plan-price">₩ 1,900 / 월</p>
          {renderButton('plus')}
          <ul className="plan-features">
            <li><img src={canIcon} alt="가능" /> 정밀한 치매 진단</li>
            <li><img src={canIcon} alt="가능" /> 데일리 회상 대화 케어</li>
            <li><img src={canIcon} alt="가능" /> 보호자 연동 치매 진단 결과 제공</li>
            <li className="disabled"><img src={cantIcon} alt="불가능" /> 과거 회상 대화 기록 저장 및 변화 관찰</li>
          </ul>
        </div>

        {/* PREMIUM 요금제 */}
        <div className={`plan-card premium ${currentSubscription === 'premium' ? 'current' : ''}`}>
          <h3 className="plan-type">PREMIUM</h3>
          <p className="plan-price">₩ 2,900 / 월</p>
          {renderButton('premium')}
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
