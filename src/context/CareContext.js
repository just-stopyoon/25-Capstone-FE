import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CareContext = createContext(null);

const API_URL = 'http://127.0.0.1:8000';

export const CareProvider = ({ children }) => {
  const [weeklyRecords, setWeeklyRecords] = useState(new Array(7).fill(false));
  const [weeklyStatus, setWeeklyStatus] = useState(null);
  const { isLoggedIn } = useAuth();

  const fetchWeeklyRecords = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!isLoggedIn || !token) {
        setWeeklyRecords(new Array(7).fill(false));
        setWeeklyStatus(null);
        return;
    };

    try {
      // 새로운 주간 현황 API 사용
      const response = await fetch(`${API_URL}/api/care/weekly-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("주간 현황 데이터:", data); 

        // 기존 weeklyRecords 형식으로 변환 (하위 호환성)
        const newRecords = new Array(7).fill(false);
        if (data.daily_status) {
          data.daily_status.forEach((day, index) => {
            newRecords[index] = day.has_conversation;
          });
        }
        
        setWeeklyRecords(newRecords);
        setWeeklyStatus(data);
      } else {
        console.error("주간 현황 가져오기 실패:", response.statusText);
        // 기존 API로 폴백
        const fallbackResponse = await fetch(`${API_URL}/api/care/logs/week`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (fallbackResponse.ok) {
          const logs = await fallbackResponse.json();
          console.log("기존 주간 기록 데이터:", logs); 

          const newRecords = new Array(7).fill(false);
          logs.forEach(log => {
            const dateParts = log.conversation_date.split('-').map(Number);
            const completionDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
            
            const dayOfWeek = completionDate.getUTCDay(); 
            const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
            if (index >= 0 && index < 7) {
              newRecords[index] = true;
            }
          });
          setWeeklyRecords(newRecords);
        }
      }
    } catch (error) {
      console.error("주간 기록을 가져오는 중 오류 발생:", error);
    }
  }, [isLoggedIn]);

  const markTodayAsCompleted = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/care/log`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({}) 
      });

      if (response.ok) {
        console.log("오늘 기록 저장 성공");
        await fetchWeeklyRecords();
      } else {
        console.error("오늘 기록 저장 실패:", response.statusText);
      }
    } catch (error) {
      console.error("오늘 기록 저장 중 오류 발생:", error);
    }
  }, [fetchWeeklyRecords]);

  useEffect(() => {
	if (isLoggedIn) {
    	fetchWeeklyRecords();
	}
  }, [isLoggedIn, fetchWeeklyRecords]);

  const value = { 
    weeklyRecords, 
    weeklyStatus,
    markTodayAsCompleted, 
    fetchWeeklyRecords 
  };

  return <CareContext.Provider value={value}>{children}</CareContext.Provider>;
};

export const useCare = () => useContext(CareContext);
