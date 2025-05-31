import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Conversation1.css';

export default function Conversation1() {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(1);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const questionAudioRef = useRef(null);
  const navigate = useNavigate();

  const startProcess = async () => {
    try {
      // 1️⃣ 질문 음성 재생
      await questionAudioRef.current?.play();

      // 2️⃣ 재생 완료 후 녹음 시작
      questionAudioRef.current.onended = () => {
        startRecording();
      };
    } catch (err) {
      console.warn('질문 음성 재생 실패:', err);
      startRecording(); // 실패해도 녹음은 진행
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(webmBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `answer${progress}.webm`;
        a.click();

        navigate('/conversation2');
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('녹음 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="conversation-page">
      <div className="top-bar">
        <div className="progress-count">{progress} / 20</div>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(progress / 20) * 100}%` }}></div>
        </div>
        <p className="instruction">민디의 질문에 따라 차분하게 말씀해주세요</p>
      </div>

      <div className="sentence-section">
        <h2 className="question">지금은 몇 년도인가요?</h2>
      </div>

      <div className="question-section">
        <p className="note">
          {isRecording
            ? "답변이 끝나셨다면, '그만하기' 버튼을 눌러주세요."
            : "준비가 완료되셨다면, '답변 시작'을 누른 뒤 질문을 들어주세요."}
        </p>

        {isRecording ? (
          <button className="stop-btn" onClick={stopRecording}>
            그만하기
          </button>
        ) : (
          <button className="start-btn" onClick={startProcess}>
            답변 시작
          </button>
        )}
      </div>

      {/* 질문 음성 파일 */}
        <audio ref={questionAudioRef}>
            <source src="/audio/question1.mp3" type="audio/mpeg" />
            브라우저가 오디오를 지원하지 않습니다.
          </audio>
    </div>
  );
}
