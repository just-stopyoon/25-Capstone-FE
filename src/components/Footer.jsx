import React from 'react';
import './Footer.css';
import '../index.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-left">
                <div className="footer-links">
                    <a href="#">개인정보처리방침</a>
                    <a href="#">서비스 이용 약관</a>
                </div>

                <div className="footer-info">
                    <h4>INFO.</h4>
                    <p>2025학년도 1학기 캡스톤 디자인 2분반 2조</p>
                    <p>세종대학교 정지윤 김휘선 양민서</p>
                </div>
            </div>

            <div className="footer-copy">
                © 2025 MinDI. All rights reserved.
            </div>
        </footer>
    );
}