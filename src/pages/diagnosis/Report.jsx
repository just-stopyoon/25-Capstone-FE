import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Report.css';
import warning from '../../images/warning.png';
import congratulation from '../../images/firework.png';
import good from '../../images/good.png';
import bad from '../../images/bad.png';

export default function Report() {
  const navigate = useNavigate();
  const { diagnosisId } = useParams(); // URL 파라미터로 특정 진단 결과 조회 가능
  const { isLoading } = useAuth();
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 인증 토큰 가져오기
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 진단 결과를 DB에서 가져오는 함수
  const fetchDiagnosisResult = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = 'http://127.0.0.1:8000/api/diagnosis/result';
      
      // 특정 진단 ID가 있으면 해당 결과 조회, 없으면 최신 결과 조회
      if (diagnosisId) {
        url = `http://127.0.0.1:8000/api/diagnosis/result/${diagnosisId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }
        if (response.status === 404) {
          setError('진단 결과를 찾을 수 없습니다.');
          return;
        }
        throw new Error('진단 결과를 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      setDiagnosisResult(result);
      
    } catch (error) {
      console.error('진단 결과 조회 오류:', error);
      setError('진단 결과를 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [diagnosisId, navigate]);

  useEffect(() => {
    // AuthContext가 로딩 중이면 대기
    if (isLoading) {
      return;
    }

    // 진단 결과를 DB에서 가져오기
    fetchDiagnosisResult();
  }, [isLoading, fetchDiagnosisResult]);

  // AuthContext가 로딩 중이거나 컴포넌트가 로딩 중일 때
  if (isLoading || loading) {
    return (
      <div className="report-page">
        <div className="report-container">
          <p>결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <div className="report-page">
        <div className="report-container">
          <p>{error}</p>
          <button onClick={() => navigate('/diagnosis')} className="start-care-btn">
            진단 다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  // 상태에 따른 UI 요소
  const getStatusUI = (status) => {
    switch (status) {
      case 'normal':
        return {
          icon: congratulation,
          title: '건강한 상태',
          desc: '방심은 금물! 지금처럼 꾸준히 관리해주세요',
          color: 'green',
          scoreText: '정상'
        };
      case 'mild':
        return {
          icon: warning,
          title: '인지 저하 의심 상태',
          desc: '정기적인 검사와 관리가 필요합니다',
          color: 'orange',
          scoreText: '인지 저하'
        };
      case 'severe':
        return {
          icon: warning,
          title: '치매 의심 상태',
          desc: '의료진과 상담을 권장합니다',
          color: 'red',
          scoreText: '치매 의심'
        };
      default:
        return {
          icon: warning,
          title: '결과를 확인할 수 없습니다',
          desc: '다시 진단을 진행해주세요',
          color: 'gray',
          scoreText: '확인 불가'
        };
    }
  };

  if (!diagnosisResult) {
    return (
      <div className="report-page">
        <div className="report-container">
          <p>진단 결과가 없습니다.</p>
          <button onClick={() => navigate('/diagnosis')} className="start-care-btn">
            진단 다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  const statusUI = getStatusUI(diagnosisResult.risk_level);

  return (
    <div className="report-page">
      <div className="report-container">

        {/* 알림 영역 */}
        <div className="report-alert-horizontal">
          <img src={statusUI.icon} alt="경고" className="alert-icon" />
          <div className="alert-text">
            <h2>인지 기능이 <span className={statusUI.color}>{statusUI.title}</span>입니다</h2>
            <p className="alert-desc">{statusUI.desc}</p>
          </div>
        </div>

        {/* 본문: 점수 + 피드백 */}
        <div className="report-main">
          <div className="score-box">
            <p className="score-label">마인디가 예상하는 치매 정도</p>
            <div className="score-info-wrapper">
              <div className="score-circle">{diagnosisResult.total_score.toFixed(0)}점</div>
              <ul className="score-range">
                <li>{diagnosisResult.threshold + 1}점 이상 : 정상</li>
                <li>{diagnosisResult.threshold - 1}점 ~ {diagnosisResult.threshold + 1}점 : 인지 저하</li>
                <li>{diagnosisResult.threshold - 1}점 미만 : 치매 의심</li>
              </ul>
            </div>
          </div>

          <div className="feedback-boxes">
            <div className="feedback good">
              {diagnosisResult.language_score >= 3 ? (
              <img src={good} alt="good" />
              ) : (
                <img src={bad} alt="bad" />
              )}
              <div>
                <strong className='good-text'>문맥 파악, 문장 구조</strong>
              </div>
            </div>
            <div className="feedback bad">
              {diagnosisResult.acoustic_score >= 3 ? (
                <img src={good} alt="good" />
              ) : (
                <img src={bad} alt="bad" />
              )}
              <div>
                <strong className="bad-text">자연스럽게 말하기</strong>
              </div>
            </div>
          </div>
        </div>

        <button className="start-care-btn" onClick={() => navigate('/diagnosis')}>치매 케어 시작하기</button>
      </div>
    </div>
  );
}