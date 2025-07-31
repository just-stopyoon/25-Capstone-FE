import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCare } from '../../context/CareContext';
import { useAuth } from '../../context/AuthContext';
import mindy from '../../images/mindy.png';
import './Elaborate.css'; // 동일한 스타일 재사용

const Elaborate = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [isMindySpeaking, setIsMindySpeaking] = useState(false);
	const [statusText, setStatusText] = useState("민디가 인사를 건낼 떄 까지 잠시 기다려주시요.");
	const [conversationId, setConversationId] = useState(null);
	const [messages, setMessages] = useState([
		{ role: "system", content: "당신은 노인과 따뜻한 일상 대화를 나누는 역할을 합니다." }
	]);

	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const audioPlayerRef = useRef(null);
	const navigate = useNavigate();
	const { markTodayAsCompleted } = useCare();
	const { isLoggedIn } = useAuth();

	// 인증 토큰 가져오기
	const getAuthHeaders = () => {
		const token = localStorage.getItem('accessToken');
		return {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		};
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
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }
        throw new Error('초기 인사말 생성 실패');
      }
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      await playAudioFromUrl(audioUrl);
    } catch (err) {
      console.error("초기 음성 재생 오류: ", err);
      setStatusText("오류가 발생했어요. 새로고침 해주세요.");
      setIsMindySpeaking(false);
    }
  }, [playAudioFromUrl, navigate]);

	useEffect(() => {
    playInitialGreeting();

		const fetchConversationId = async () => {
			try {
				const response = await fetch('http://127.0.0.1:8000/api/care/conversation/start', {
					method: 'POST',
					headers: getAuthHeaders(),
				});
				if (!response.ok) {
					if (response.status === 401) {
						alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
						navigate('/login');
						return;
					}
					throw new Error('대화 세션 시작 실패');
				}
				const data = await response.json();
				setConversationId(data.conversation_id);
			} catch (err) {
				console.error('대화 세션 시작 오류:', err);
				setStatusText('대화 세션을 시작할 수 없습니다. 새로고침 해주세요.');
			}
		};
		fetchConversationId();
	}, [playInitialGreeting, navigate]);

	const onAudioEnded = useCallback(() => {
		setIsMindySpeaking(false);
		setStatusText("이제 말씀해주시요. 답변이 끝나면 '말 끝내기'를 눌러주세요.");
	}, []);

	const stopRecordingAndSend = () => {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
			mediaRecorderRef.current.stop();
		}
	};

  const handleRecordingStop = useCallback(async () => {
    setIsRecording(false);
    setStatusText("답변을 분석하고 있어요. 잠시만 기다려주세요...");

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    // 1. STT + AI 답변 요청 (messages, conversation_id 포함)
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('messages', JSON.stringify(messages));
    formData.append('conversation_id', conversationId);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://127.0.0.1:8000/api/care/audio-to-answer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }
        throw new Error('오디오 업로드 실패');
      }

      // AI 답변 음성(mp3) 재생
      const aiAudioBlob = await response.blob();
      const aiAudioUrl = URL.createObjectURL(aiAudioBlob);
      await playAudioFromUrl(aiAudioUrl);

      // 2. 대화 내용을 별도 API로 조회하여 메시지 업데이트
      try {
        const textResponse = await fetch(`http://127.0.0.1:8000/api/care/conversation/${conversationId}/latest`, {
          headers: getAuthHeaders(),
        });
        if (textResponse.ok) {
          const conversationData = await textResponse.json();
          setMessages(prev => [...prev, 
            { role: "user", content: conversationData.user_question },
            { role: "assistant", content: conversationData.ai_reply }
          ]);
        }
      } catch (textErr) {
        console.error("대화 내용 조회 오류:", textErr);
        // 텍스트 조회 실패해도 음성 재생은 계속 진행
      }

      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = aiAudioUrl;
        audioPlayerRef.current.play();
        setIsMindySpeaking(true);
        setStatusText("민디가 말하고 있어요...");
      }
    } catch (err) {
      console.error("대화 처리 오류: ", err);
      setStatusText("오류가 발생했어요. 다시 시도해주세요.");
      setIsMindySpeaking(false);
    }
  }, [playAudioFromUrl, messages, conversationId, navigate]);

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
		if (!conversationId) {
			alert('대화 세션 ID가 없습니다.');
			return;
		}
		try {
			// 1. 대화 세션 종료
			const endResponse = await fetch(`http://127.0.0.1:8000/api/care/conversation/end/${conversationId}`, {
				method: 'POST',
				headers: getAuthHeaders(),
			});
			if (!endResponse.ok) {
				if (endResponse.status === 401) {
					alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
					navigate('/login');
					return;
				}
				throw new Error('대화 세션 종료 실패');
			}
			const summary = await endResponse.json();
			
			// 2. 전체 대화 내용 조회
			try {
				const allTextsResponse = await fetch(`http://127.0.0.1:8000/api/care/conversation/${conversationId}/all`, {
					headers: getAuthHeaders(),
				});
				if (allTextsResponse.ok) {
					const allConversations = await allTextsResponse.json();
					console.log('전체 대화 내용:', allConversations);
				}
			} catch (textErr) {
				console.error("전체 대화 내용 조회 오류:", textErr);
			}
			
			console.log('대화 세션 요약:', summary);
			alert("오늘의 대화가 기록되었습니다.\n\n요약 정보:\n" + JSON.stringify(summary, null, 2));
			navigate('/care');
		} catch (err) {
			alert('대화 세션 종료 중 오류가 발생했습니다.');
		}
	}, [conversationId, navigate]);

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