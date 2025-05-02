import React, { useRef, useState } from 'react';
import './Diagnosis.css';
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
      };

      recorder.start();
      setMediaRecorder(recorder);

      setTimeout(() => {
        recorder.stop();
      }, 3000); // 3초 후 자동 녹음 종료
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
          <p>오디오 테스트를 진행해주세요</p>
          <div className="icon-circle">
            <FaVolumeUp size={36} color="#7C88FF" />
          </div>
          <audio ref={audioRef} src="/audio/sample.mp3" />
        </div>

        {/* 마이크 테스트 */}
        <div className="test-card" onClick={handleMicTest}>
          <p>마이크 테스트를 진행해주세요</p>
          <div className="icon-circle">
            <FaMicrophone size={36} color="#7C88FF" />
          </div>
          {audioURL && (
            <audio controls src={audioURL} style={{ marginTop: '10px' }} />
          )}
        </div>
      </section>

      <button className="start-btn">검사 시작하기</button>
    </div>
  );
}