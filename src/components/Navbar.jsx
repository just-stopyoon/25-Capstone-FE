import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../images/logo.png';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
	const { isLoggedIn, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		alert('로그아웃 되었습니다.');
		navigate('/');
	};

    return (
    <nav className="navbar">
        <div className="navbar-logo">
        <Link to="/" className="logo-link">
            <img src={logo} alt="logo" className="logo-icon" />
            <span className="logo-text">MINDI</span>
        </Link>
        </div>
            <ul className="navbar-menu">
                <li><Link to="/diagnosis">치매 진단</Link></li>
                <li><Link to="/care">치매 케어</Link></li>
                <li>
                    <a 
                        href="https://www.safekorea.go.kr/idsiSFK/neo/sfk/cs/ppn/tel/healthUserList.html?menuSeq=149" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        보건소 찾기
                    </a>
                </li>
                <li><Link to="/account">계정 관리</Link></li>
            </ul>
        <div className="navbar-login">
			{
				isLoggedIn ? (
					<button onClick={handleLogout} className='logout-button'>로그아웃</button>
				) : (
					<Link to="/login" className="login-button">로그인</Link>
				)
			}
        </div>
    </nav>
    );
};

