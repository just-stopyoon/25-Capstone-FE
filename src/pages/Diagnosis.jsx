import React, { useRef, useState } from 'react';
import './Diagnosis.css';
import { Link } from 'react-router-dom';
import { FaVolumeUp, FaMicrophone } from 'react-icons/fa';

export default function Diagnosis() {
  const audioRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);

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
      <Link to="/conversation/1" className="start-btn">검사 시작하기</Link>
    </div>
  );
}