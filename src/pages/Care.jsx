 import React, { useRef, useState } from 'react';
import './Diagnosis.css';
import { Link } from 'react-router-dom';
import { FaVolumeUp, FaMicrophone } from 'react-icons/fa';

export default function Care() {
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
        <h2>대화와 함께하는 치매 치료</h2>
        <p>
          MinDI의 음성 대화 봇, 민디와 함께 대화를 통해 하루를 회고합니다.<br />
          내일 다시, 대화를 통해 민디와 함께 오늘을 회상합니다.
        </p>
      </section>

      
      <div className = "prepare">
        <h2>아직 오늘 일상이 기록되지 않았어요!</h2>
      </div>
      <Link to="/conversation/1" className="start-btn">대화 시작하기</Link>
    </div>
  );
}