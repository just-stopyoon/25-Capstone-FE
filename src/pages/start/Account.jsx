import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Account.css";
import mindy from "../../images/mindy.png";
import EditModal from "./Account/EditModal";

export default function Account() {
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [latestDiagnosis, setLatestDiagnosis] = useState(null);
  const [totalConversations, setTotalConversations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // 최신 진단 결과 가져오기
  const fetchLatestDiagnosis = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/diagnosis/result', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const diagnosisData = await response.json();
        setLatestDiagnosis(diagnosisData);
      } else if (response.status === 404) {
        // 진단 결과가 없는 경우
        setLatestDiagnosis(null);
      } else if (response.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('진단 결과 조회 오류:', error);
      setLatestDiagnosis(null);
    }
  }, [navigate]);

  // 총 대화 횟수 가져오기
  const fetchTotalConversations = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/care/total-count', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setTotalConversations(data.total_conversations);
      } else if (response.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('총 대화 횟수 조회 오류:', error);
      setTotalConversations(0);
    }
  }, [navigate]);

  // 데이터 로드
  useEffect(() => {
    if (isLoading) return;

    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserInfo(),
        fetchLatestDiagnosis(),
        fetchTotalConversations()
      ]);
      setLoading(false);
    };

    loadData();
  }, [isLoading, fetchUserInfo, fetchLatestDiagnosis, fetchTotalConversations]);

  // 로딩 중일 때
  if (isLoading || loading) {
    return (
      <div className="account-page">
        <div className="account-wrapper">
          <p>정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <div className="account-page">
        <div className="account-wrapper">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  }

  // 사용자 나이 계산
  const calculateAge = (birthYear, birthMonth, birthDay) => {
    if (!birthYear) return null;
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 0부터 시작하므로 +1
    const currentDay = new Date().getDate();
    
    // 생일을 1월 1일로 가정 (정확한 생일 정보가 없으므로)
    
    let age = currentYear - birthYear;
    
    // 생일이 아직 지나지 않았으면 1살 빼기
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age -= 1;
    }
    
    return age;
  };

  // 마지막 진단일로부터 경과일 계산
  const getDaysSinceLastDiagnosis = (diagnosisDate) => {
    if (!diagnosisDate) return null;
    const lastDate = new Date(diagnosisDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 진단 결과 상태에 따른 텍스트 반환
  const getDiagnosisStatus = (riskLevel) => {
    switch (riskLevel) {
      case 'normal':
        return { text: '잘하고 있어요', className: 'status-normal' };
      case 'mild':
        return { text: '개선이 필요해요', className: 'status-bad' };
      case 'severe':
        return { text: '치매가 의심되요', className: 'status-bad' };
      default:
        return { text: '확인 불가', className: 'status-none' };
    }
  };

  const getLanguageScore = (languageScore) => {
    if (languageScore > 0.5) {
      return { text: '잘하고 있어요', className: 'status-good' };
    } else {
      return { text: '개선이 필요해요', className: 'status-improve' };
    }
  };

  const getAcousticScore = (acousticScore) => {
    if (acousticScore > 0.5) {
      return { text: '잘하고 있어요', className: 'status-good' };
    } else {
      return { text: '개선이 필요해요', className: 'status-improve' };
    }
  };

  const getSubscriptionType = (subscriptionType) => {
    if (subscriptionType === 'standard') {
      return 'STANDARD'
    } else if (subscriptionType === 'plus') {
      return 'PLUS+'
    } else if (subscriptionType === 'premium') {
      return 'PREMIUM'
    }
  };

  return (
    <div className="account-page">
      {showModal && <EditModal onClose={() => setShowModal(false)} />}

      <div className="account-wrapper">
        <div className="account-card">
          <div className="account-left">
            <img src={mindy} alt="프로필 캐릭터" className="profile-image" />
            <div className="account-header">
              <h2 className="account-title">
                <span className="highlight-name">{userInfo?.name || '사용자'}</span>님 안녕하세요.
                <span className="plus-badge">{getSubscriptionType(userInfo?.subscription_type)}</span>
              </h2>
              <div className="account-info">
                <span>연령 <strong>만 {calculateAge(userInfo?.birth_year, userInfo?.birth_month, userInfo?.birth_day) || '--'}세</strong></span>
                <span>최종 학력 <strong>{userInfo?.education || '--'}</strong></span>
                <span>보호자 연결 <strong>연결 안 됨</strong></span>
              </div>
            </div>
          </div>

          <div className="account-actions">
            <button
              className="action-link"
              onClick={() => navigate("/subscribe")}
            >
              구독 관리 →
            </button>

            <button
              className="action-link"
              onClick={() => setShowModal(true)}
            >
              회원정보 수정 →
            </button>
          </div>
        </div>

        <div className="account-section-grid">
          <div className="result-card">
            <div className="result-header">
              <h3>치매 진단 결과</h3>
              {latestDiagnosis ? (
                <span className="date-label">
                  마지막 진단일 : {new Date(latestDiagnosis.created_at).toLocaleDateString()} ({getDaysSinceLastDiagnosis(latestDiagnosis.created_at)}일 전)
                </span>
              ) : (
                <span className="date-label">진단 기록이 없습니다</span>
              )}
            </div>
            <div className="result-body">
              {latestDiagnosis ? (
                <div className="score-and-status">
                  <div className="score-circle">{latestDiagnosis.total_score.toFixed(0)}점</div>
                  <div className="status-box">
                    <p className={getDiagnosisStatus(latestDiagnosis.risk_level).className}>{getDiagnosisStatus(latestDiagnosis.risk_level).text}</p>
                    <div className="result-columns">
                      <div className="result-col">
                        <p className={getLanguageScore(latestDiagnosis.language_score).className}>{getLanguageScore(latestDiagnosis.language_score).text}</p>
                        <p>문맥 파악, 문장 구성</p>
                      </div>
                      <div className="result-col">
                        <p className={getAcousticScore(latestDiagnosis.acoustic_score).className}>{getAcousticScore(latestDiagnosis.acoustic_score).text}</p>
                        <p>자연스럽게 말하기</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-diagnosis">
                  <p>아직 진단을 받지 않으셨습니다.</p>
                  <button onClick={() => navigate('/diagnosis')} className="start-diagnosis-btn">
                    진단 시작하기
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="account-care-card">
            <div className="account-care-card-header">
              <h3>치매 관리</h3>
            </div>
            <div className="account-care-progress">
              {totalConversations !== null ? (
                <>
                  대화를 <span className="highlight">{totalConversations}번</span> 진행했어요!
                </>
              ) : (
                <>
                  <span className="highlight">대화를 --번</span> 진행했어요!
                </>
              )}
            </div>
            <div className="account-care-card-body">
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
