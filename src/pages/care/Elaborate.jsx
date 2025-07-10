import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCare } from '../../context/CareContext';
import mindy from '../../images/mindy.png';
import './Elaborate.css'; // 동일한 스타일 재사용

const Elaborate = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [isMindySpeaking, setIsMindySpeaking] = useState(false);
	const [statusText, setStatusText] = useState("민디가 인사를 건낼 떄 까지 잠시 기다려주시요.");
	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const audioPlayerRef = useRef(null);
	const navigate = useNavigate();
	const { markTodayAsCompleted } = useCare();

	const onAudioEnded = useCallback(() => {
		setIsMindySpeaking(false);
		setStatusText("이제 말씀해주시요. 답변이 끝나면 '말 끝내기'를 눌러주세요.");
	}, []);

	const stopRecordingAndSend = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const playAudioFromUrl = useCallback(async (url) => {
    if (!audioPlayerRef.current) return;

    audioPlayerRef.current.pause();
    audioPlayerRef.current.src = "";

    audioPlayerRef.current.src = url;
    try {
      await audioPlayerRef.current.play();
      setIsMindySpeaking(true);
      setStatusText("민디가 말하고 있어요...");
    } catch (err) {
      console.error("오디오 재생 오류: ", err);
      if (err.name === 'NotAllowedError') {
        setStatusText("소리를 들으려면 화면을 한 번 클릭해주시요.");
        window.addEventListener('click', () => audioPlayerRef.current.play(), { once: true });
      }
    }
  }, []);

  const playInitialGreeting = useCallback(async () => {
    setIsMindySpeaking(true);
    setStatusText("민디가 말하고 있어요...");
    try {
      const response = await fetch('http://127.0.0.1:8000/api/care/greeting', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('초기 인사말 생성 실패');
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      await playAudioFromUrl(audioUrl);
    } catch (err) {
      console.error("초기 음성 재생 오류: ", err);
      setStatusText("오류가 발생했어요. 새로고침 해주세요.");
      setIsMindySpeaking(false);
    }
  }, [playAudioFromUrl]);

  useEffect(() => {
    playInitialGreeting();
  }, [playInitialGreeting]);

  const handleRecordingStop = useCallback(async () => {
    setIsRecording(false);
    setStatusText("음성을 분석하고 있어요. 잠시만 기다려주시요...");

    // 실제로는 음성 인식 API를 통해 텍스트를 얻어야 함
    // 여기서는 예시로 prompt 창을 띄워 텍스트를 입력받음
    // const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];
    let userText = window.prompt("방금 말씀하신 내용을 텍스트로 입력해 주세요 (음성 인식 대체)");
    if (!userText) {
      setStatusText("입력이 없어 대화를 종료합니다.");
      return;
    }
    try {
      // 백엔드에 사용자의 텍스트를 전달하여 AI 답변을 받아옴
      const response = await fetch('http://127.0.0.1:8000/api/care/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
      });

      if (!response.ok) throw new Error("TTS 서버 응답 오류");

      const aiAudioBlob = await response.blob();
      const aiAudioUrl = URL.createObjectURL(aiAudioBlob);
      await playAudioFromUrl(aiAudioUrl);

      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = aiAudioUrl;
        audioPlayerRef.current.play();
        setIsMindySpeaking(true);
        setStatusText("민디가 말하고 있어요...");
      }
    } catch (err) {
      console.error("대화 처리 오류: ", err);
      setStatusText("오류가 발생했어요. 다시 시도해주시요.");
      setIsMindySpeaking(false);
    }
  }, [playAudioFromUrl]);

  const startRecording = useCallback(async() => {
    if (isMindySpeaking) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = handleRecordingStop;
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setStatusText("듣고 있어요. 편하게 말씀해주세요...");
    } catch (err) {
      alert('마이크 접근을 허용해주세요!');
    }
  }, [isMindySpeaking, handleRecordingStop]);

	const handleEndConversation = useCallback(async () => {
		await markTodayAsCompleted();
		alert("오늘의 대화가 기록되었습니다.");
		navigate('/care');
	}, [markTodayAsCompleted, navigate]);

	return (
    <div className="elaborate-page">
      <section className="elaborate-header">
        <h2>오늘 하루는 어땠나요?</h2>
        <p>{statusText}</p>
      </section>

      <section>
        <img 
          src={mindy} 
          alt="마인디" 
          className={`mindy-image ${isMindySpeaking ? 'speaking' : ''}`}
        />
      </section>

      <div className='chat-controls'>
        {isRecording ? (
          <button onClick={stopRecordingAndSend} className='stop-btn'>말 끝내기</button>
        ) : (
          <button onClick={startRecording} className='start-btn' disabled={isMindySpeaking}>
            {isMindySpeaking ? '민디가 말하는 중' : '마이크 누르고 말하기'}
          </button>
        )}
      </div>

      <button onClick={handleEndConversation} className='end-chat-btn'>대화 종료하기</button>

      <audio ref={audioPlayerRef} onEnded={onAudioEnded} preload='auto' />
    </div>
  );
};

export default Elaborate;