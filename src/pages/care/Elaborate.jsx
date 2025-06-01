import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { talks } from './talks'; // 대화 내용 배열
import '../diagnosis/conversation/Conversation.css'; // 동일한 스타일 재사용

export default function TalkPage() {
  const { id } = useParams();
  const talkIndex = parseInt(id, 10) - 1;
  const talk = talks[talkIndex];

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

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
      a.download = `talk${id}.webm`;
      a.click();

      if (talkIndex < talks.length - 1) {
        navigate(`/talk/${talkIndex + 2}`);
      } else {
        navigate('/complete'); // 마지막 페이지 이후
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
        <div className="progress-count">{id} / {talks.length}</div>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(id / talks.length) * 100}%` }}></div>
        </div>
        <p className="instruction">민디와 함께 하루를 회고해봅시다</p>
      </div>

      <div className="sentence-section">
        <div className="question-box">
          <h2 className="question">{talk.title}</h2>
          <p className="content">{talk.content}</p>
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
    </div>
  );
}
