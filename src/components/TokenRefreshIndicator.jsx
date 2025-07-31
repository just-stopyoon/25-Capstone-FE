import React from 'react';

const TokenRefreshIndicator = ({ isRefreshing }) => {
  if (!isRefreshing) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      <span className="text-sm font-medium">토큰 갱신 중...</span>
    </div>
  );
};

export default TokenRefreshIndicator; 