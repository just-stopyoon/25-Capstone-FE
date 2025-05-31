import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import About from './pages/About';
import Diagnosis from './pages/Diagnosis';
import ConversationPage from './pages/conversation/ConversationPage';
import Care from './pages/Care';
import Support from './pages/Support';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

export default function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/diagnosis" element={<Diagnosis />} />
            <Route path="/conversation/:id" element={<ConversationPage />} />
            <Route path="/care" element={<Care />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/done" element={<div>모든 질문이 완료되었습니다 🎉</div>} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}
