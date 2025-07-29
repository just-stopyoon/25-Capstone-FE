import React, { useRef, useState } from 'react';
import './Diagnosis.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaVolumeUp, FaMicrophone } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function Diagnosis() {
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  // 인증 토큰 가져오기
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 스피커 테스트
  const handleAudioTest = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  // 마이크 테스트 시작
  const handleMicTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
  
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
  
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
  
        // ✅ 자동 재생
        const tempAudio = new Audio(url);
        tempAudio.play();
      };
  
      recorder.start();
      setMediaRecorder(recorder);
  
      setTimeout(() => {
        recorder.stop();
      }, 5000); // 5초 녹음
    } catch (err) {
      alert('마이크 접근을 허용해주세요!');
      console.error(err);
    }
  };

  // 진단 세션 시작
  const handleStartDiagnosis = async () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setIsStarting(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/diagnosis/start-diagnosis', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }
        throw new Error('진단 세션 시작에 실패했습니다.');
      }

      const result = await response.json();
      console.log('진단 세션 시작:', result);
      
      // 세션 ID를 localStorage에 저장
      localStorage.setItem('diagnosis_session_id', result.session_id);
      
      // 첫 번째 질문으로 이동
      navigate('/conversation/1');
    } catch (error) {
      console.error('진단 시작 오류:', error);
      alert('진단을 시작할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setIsStarting(false);
    }
  };

  // 로그인하지 않은 경우 로딩 표시
  if (!isLoggedIn) {
    return <div>로그인 중...</div>;
  }

  return (
    <div className="diagnosis-page">
      <section className="diagnosis-header">
        <h2>대화로 알아보는 치매 진단</h2>
        <p>
          MinDI의 음성 대화 봇, 민디와 함께 음성 분석을 통해 치매 위험도를 예측합니다.<br />
          지금 바로 대화를 시작하고, 나의 치매 위험도를 알아보세요
        </p>
      </section>

      <section className="diagnosis-test-box">
        {/* 오디오 테스트 */}
        <div className="test-card" onClick={handleAudioTest}>
          <p>오디오 테스트</p>
          <div className="icon-circle">
            <FaVolumeUp size={36} color="#7C88FF" />
          </div>
          <audio ref={audioRef} preload="auto">
            <source src="/audio/sample.mp3" type="audio/mpeg" />
            브라우저가 오디오를 지원하지 않습니다.
          </audio>
        </div>

        {/* 마이크 테스트 */}
        <div className="test-card" onClick={handleMicTest}>
          <p>마이크 테스트</p>
          <div className="icon-circle">
            <FaMicrophone size={36} color="#7C88FF" />
          </div>
          {audioURL && (
          <audio controls src={audioURL} style={{ marginTop: '10px' }} />
          )}
        </div>
      </section>
      <div className = "prepare">
        <h2>준비가 되셨다면, '검사 시작하기'를 눌러주세요</h2>
        <p>검사는 약 15분간 진행되며, 마인디가 드리는 질문에 대답해주시면 됩니다.<br/>어렵지 않으니 편안한 마음으로 임해주세요.</p>
      </div>
      <button 
        className="start-btn" 
        onClick={handleStartDiagnosis}
        disabled={isStarting}
      >
        {isStarting ? '진단 준비 중...' : '검사 시작하기'}
      </button>
    </div>
  );
}