import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

import Home from './pages/start/Home';
import About from './pages/start/About';
import Support from './pages/start/Support';
import Login from './pages/start/Login';
import SignUp from './pages/start/SignUp';

import Diagnosis from './pages/diagnosis/Diagnosis';
import ConversationPage from './pages/diagnosis/conversation/ConversationPage';
import Loading from './pages/diagnosis/Loading';
import Report from './pages/diagnosis/Report';

import Care from './pages/care/Care';
import Elaborate from './pages/care/Elaborate';

export default function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            <Route path="/diagnosis" element={<Diagnosis />} />
            <Route path="/conversation/:id" element={<ConversationPage />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/report" element={<Report />} />
            
            <Route path="/care" element={<Care />} />
            <Route path="/elaborate/:id" element={<Elaborate />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}
