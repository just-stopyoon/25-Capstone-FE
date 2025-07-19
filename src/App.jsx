import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

import { AuthProvider } from './context/AuthContext';
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

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CareProvider>
          <Router>
            <Navbar />
            <main className="main-content">
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              <Route path="/account" element={<Account />} />
              <Route path="/subscribe" element={<Subscribe />} />

              <Route path="/diagnosis" element={<Diagnosis />} />
              <Route path="/conversation/:id" element={<ConversationPage />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="/report" element={<Report />} />
              
              <Route path="/care" element={<Care />} />
              <Route path="/elaborate" element={<Elaborate />} />
              <Route path="/care1" element={<Care1 />} />
              </Routes>
            </main>
            <Footer />
          </Router> 
        </CareProvider>
      </AuthProvider>
    </div>
  );
}
