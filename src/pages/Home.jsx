import { Link } from 'react-router-dom';
import './Home.css';

import diagnosisImg from '../images/chatbot.png';
import careImg from '../images/game.png';
import elderImg from '../images/elder.png';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function Home() {
  const questions = [
    "최근 같은 질문을 자주 반복한 적 있다",
    "약속을 잊거나 같은 이야기를 반복한 적 있다",
    "물건을 자주 잃어버린다",
    "낯선 곳에서 길을 헤맨 적이 있다"
  ];

  return (
    <div className="home">
      <section className="home-intro">
        <h2>혹시 … 이런 변화, 느껴본 적 있나요?</h2>
        <p>아래 항목 중 하나라도 해당된다면, 지금 바로 AI 진단을 받아보세요.</p>
      </section>

      <section className="home-carousel">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={50}
          slidesPerView={1}
          loop={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          speed={700} // ✅ 전환 애니메이션 속도 0.8초
          className="swiper-container"
        >
          {questions.map((text, index) => (
            <SwiperSlide key={index}>
              <div className="carousel-slide">
                <p>{text}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="home-main-content">
        <div className="left-box">
          <div className="left-text">
            <h3>
              당신을 위한, 치매 케어 AI <br />
              이제 집에서도 편하게 <span>MinDI</span>와 함께하세요
            </h3>
            <p>
              음성 기반 진단부터 인지 훈련까지<br />
              AI가 어르신의 하루를 함께 챙겨드립니다.
            </p>
            <Link to="/about" className="btn-detail">자세히 보기 →</Link>
          </div>
          <img src={elderImg} alt="어르신 일러스트" className="elder-image" />
        </div>

        <div className="right-box">
          <Link to="/diagnosis" className="card diagnosis-card">
            <div className="card-text">
              <h4>치매 진단</h4>
              <p>민디와 대화하면서<br />치매 진단하기</p>
            </div>
            <div className="card-image">
              <img src={diagnosisImg} alt="치매 진단" />
            </div>
          </Link>

          <Link to="/care" className="card care-card">
            <div className="card-text">
              <h4>치매 케어</h4>
              <p>민디와 회상대화를 통해<br />치매 치료하기</p>
            </div>
            <div className="card-image">
              <img src={careImg} alt="치매 케어" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}