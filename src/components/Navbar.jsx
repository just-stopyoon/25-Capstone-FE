import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../images/logo.png';

export default function Navbar() {
    return (
    <nav className="navbar">
        <div className="navbar-logo">
        <Link to="/" className="logo-link">
            <img src={logo} alt="logo" className="logo-icon" />
            <span className="logo-text">MINDI</span>
        </Link>
        </div>
            <ul className="navbar-menu">
                <li><Link to="/about">서비스 소개</Link></li>
                <li><Link to="/diagnosis">치매 진단</Link></li>
                <li><Link to="/care">치매 케어</Link></li>
                <li><Link to="/support">고객 지원</Link></li>
            </ul>
        <div className="navbar-login">
            <Link to="/login" className="login-button">로그인</Link>
        </div>
    </nav>
    );
};

