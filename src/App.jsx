import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import TokenRefreshIndicator from './components/TokenRefreshIndicator';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CareProvider } from './context/CareContext';

import Home from './pages/start/Home';
import About from './pages/start/About';
import Login from './pages/start/Login';
import SignUp from './pages/start/SignUp';

import Account from './pages/start/Account';
import Subscribe from './pages/start/Account/Subscribe';

import Diagnosis from './pages/diagnosis/Diagnosis';
import ConversationPage from './pages/diagnosis/conversation/ConversationPage';
import Loading from './pages/diagnosis/Loading';
import Report from './pages/diagnosis/Report';

import Care from './pages/care/Care';
import Elaborate from './pages/care/Elaborate';
import Care1 from './pages/care/Care1';

// 토큰 갱신 인디케이터를 표시하는 컴포넌트
const AppContent = () => {
  const { isRefreshing } = useAuth();
  
  return (
    <>
      <TokenRefreshIndicator isRefreshing={isRefreshing} />
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* 보호된 라우트 */}
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            <Route path="/subscribe" element={
              <ProtectedRoute>
                <Subscribe />
              </ProtectedRoute>
            } />

            <Route path="/diagnosis" element={
              <ProtectedRoute>
                <Diagnosis />
              </ProtectedRoute>
            } />
            <Route path="/conversation/:id" element={
              <ProtectedRoute>
                <ConversationPage />
              </ProtectedRoute>
            } />
            <Route path="/loading" element={
              <ProtectedRoute>
                <Loading />
              </ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            } />
            <Route path="/report/:diagnosisId" element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            } />
            
            <Route path="/care" element={
              <ProtectedRoute>
                <Care />
              </ProtectedRoute>
            } />
            <Route path="/elaborate" element={
              <ProtectedRoute>
                <Elaborate />
              </ProtectedRoute>
            } />
            <Route path="/care1" element={
              <ProtectedRoute>
                <Care1 />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </Router>
    </>
  );
};

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CareProvider>
          <AppContent />
        </CareProvider>
      </AuthProvider>
    </div>
  );
}
