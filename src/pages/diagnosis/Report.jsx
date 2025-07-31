import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Report.css';
import warning from '../../images/warning.png';
import congratulation from '../../images/firework.png';
import good from '../../images/good.png';
import bad from '../../images/bad.png';

export default function Report() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkLoginStatus = useCallback(() => {
		const token = localStorage.getItem('accessToken');
		return isLoggedIn || !!token;
	}, [isLoggedIn]);

  useEffect(() => {
    // 로그인 상태 확인
    if (!checkLoginStatus()) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // localStorage에서 진단 결과 가져오기
    const resultData = localStorage.getItem('diagnosis_result');
    if (resultData) {
      try {
        const result = JSON.parse(resultData);
        setDiagnosisResult(result);
      } catch (error) {
        console.error('진단 결과 파싱 오류:', error);
        alert('진단 결과를 불러올 수 없습니다.');
        navigate('/diagnosis');
      }
    } else {
      // 결과가 없으면 진단 페이지로 이동
      alert('진단 결과가 없습니다. 다시 진단을 진행해주세요.');
      navigate('/diagnosis');
    }
    setLoading(false);
  }, [navigate, isLoggedIn, checkLoginStatus]);

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

  // 로그인하지 않은 경우 로딩 표시
  if (!isLoggedIn) {
    return <div>로그인 중...</div>;
  }

  if (loading) {
    return (
      <div className="report-page">
        <div className="report-container">
          <p>결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
          <img src={congratulation} alt="경고" className="alert-icon" />
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
              <div className="score-circle">{diagnosisResult.total_score}점</div>
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

        <button className="start-care-btn" onClick={() => navigate('/diagnosis')}>치매 케어 시작하기</button>
      </div>
    </div>
  );
}