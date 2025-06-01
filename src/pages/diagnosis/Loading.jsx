import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Loading.css';

export default function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/report');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-page">
      <h1 className="loading-title">잠시만 기다려주세요</h1>
      <p className="loading-sub">마인디가 결과를 분석하고 있어요!</p>
      <div className="spinner"></div>
    </div>
  );
}