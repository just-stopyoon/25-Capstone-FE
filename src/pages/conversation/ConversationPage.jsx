// src/pages/ConversationPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questions } from './questions';
import './Conversation.css';

export default function ConversationPage() {
  const { id } = useParams();
  const questionIndex = parseInt(id, 10) - 1;
  const question = questions[questionIndex];
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const questionAudioRef = useRef(null);
  const navigate = useNavigate();

  // ✅ 페이지마다 질문 오디오 재생을 위한 클릭 이벤트 등록
  useEffect(() => {
    const playQuestionAudio = async () => {
      try {
        if (questionAudioRef.current) {
          await questionAudioRef.current.play();
        }
      } catch (err) {
        console.warn('음성 재생 실패:', err);
      }
      window.removeEventListener('click', playQuestionAudio);
    };

    window.addEventListener('click', playQuestionAudio);
    return () => window.removeEventListener('click', playQuestionAudio);
  }, [id]); // 질문 번호(id)가 바뀔 때마다 등록

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunksRef.current = [];

    const recorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `answer${id}.webm`;
      a.click();

      if (questionIndex < questions.length - 1) {
        navigate(`/conversation/${questionIndex + 2}`);
      } else {
        navigate('/loading');
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="conversation-page">
      <div className="top-bar">
        <div className="progress-count">{id} / {questions.length}</div>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(id / questions.length) * 100}%` }}></div>
        </div>
        <p className="instruction">민디의 질문에 따라 차분하게 말씀해주세요</p>
      </div>

      <div className="sentence-section">
        <div className="question-box">
          <h2 className="question">{question}</h2>
        </div>
      </div>

      <div className="question-section">
        <p className="note">
          {isRecording
            ? "답변이 끝나셨다면, '그만하기' 버튼을 눌러주세요."
            : "준비가 완료되셨다면, '답변 시작'을 누른 뒤 말씀해주세요."}
        </p>

        {isRecording ? (
          <button className="stop-btn" onClick={stopRecording}>그만하기</button>
        ) : (
          <button className="start-btn" onClick={startRecording}>답변 시작</button>
        )}
      </div>

      <audio ref={questionAudioRef} src={`/audio/question${id}.mp3`} preload="auto" />
    </div>
  );
}
