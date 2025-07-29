// src/pages/ConversationPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questions } from './questions';
import { useAuth } from '../../../context/AuthContext';
import './Conversation.css';

export default function ConversationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const currentQuestionId = parseInt(id, 10);
  const totalQuestions = questions.length;

  const question = questions[currentQuestionId - 1];

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const questionAudioRef = useRef(null);

  // 인증 토큰 가져오기
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

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
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = handleStopRecording;

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('마이크 접근을 허용해주시요!');
      console.error("마이크 시작 오류:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!isLoggedIn) return;

    setIsUploading(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    const formData = new FormData();
    formData.append('file', audioBlob, `q${id}_answer.webm`);
    formData.append('question_id', id);

    try {
      const sessionId = localStorage.getItem('diagnosis_session_id');
      
      if (!sessionId) {
        alert('진단 세션이 없습니다. 다시 시작해주세요.');
        navigate('/diagnosis');
        return;
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://127.0.0.1:8000/api/diagnosis/audio-to-diagnosis', {
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
        throw new Error('서버에서 오류가 발생했습니다.');
      }

      const result = await response.json();
      console.log('음성 파일 업로드 성공:', result);

      if (currentQuestionId < totalQuestions) {
        navigate(`/conversation/${currentQuestionId + 1}`);
      } else {
        // 모든 질문 완료 - 최종 진단 제출
        navigate('/loading');
      }
    } catch (err) {
      console.error('녹음 파일 업로드 실패:', err);
      alert('녹음 파일 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  // 로그인하지 않은 경우 로딩 표시
  if (!isLoggedIn) {
    return <div>로그인 중...</div>;
  }

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
          <button className="stop-btn" onClick={stopRecording} disabled={isUploading}>
            {isUploading ? '처리 중...' : '그만하기'}
          </button>
        ) : (
          <button className="start-btn" onClick={startRecording} disabled={isUploading}>
            {isUploading ? '처리 중...' : '답변 시작'}
          </button>
        )}
      </div>

      <audio ref={questionAudioRef} src={`/audio/question${id}.mp3`} preload="auto" />
    </div>
  );
}
