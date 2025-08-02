import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Loading.css';

export default function Loading() {
  const navigate = useNavigate();
  const [loadingText] = useState('마인디가 결과를 분석하고 있어요!');
  const [dots, setDots] = useState('');

  // 로딩 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // 진단 결과 확인
  useEffect(() => {
    // 최종 진단 제출
    const submitFinalDiagnosis = async () => {
      try {
        const sessionId = localStorage.getItem('diagnosis_session_id');
        
        const formData = new FormData();
        formData.append('session_id', sessionId);
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://127.0.0.1:8000/api/diagnosis/submit-diagnosis', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 401) {
              alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
              navigate('/login');
              return;
          }
          throw new Error('진단 제출에 실패했습니다.');
        }

        const result = await response.json();
        console.log('진단 제출 성공:', result);
        
        // 세션 ID 제거
        localStorage.removeItem('diagnosis_session_id');
        
        // 로딩 페이지로 이동
        navigate('/report');
      } catch (error) {
        console.error('진단 제출 오류:', error);
        alert('진단 제출에 실패했습니다. 다시 시도해주세요.');
        navigate('/diagnosis');
      }
    };

    submitFinalDiagnosis();
  }, [navigate]);

  return (
    <div className="loading-page">
      <h1 className="loading-title">잠시만 기다려주세요</h1>
      <p className="loading-sub">{loadingText}{dots}</p>
      <div className="spinner"></div>
    </div>
  );
}