import React, { useState, useEffect } from "react";
import * as style from "./HeaderStyle";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../../store/authStore.js";
import { axiosPost } from '../../../utils/dataFetch.js';

function Header({ isAboutHeader }) {
  const [isHeaderFixed, setHeaderFixed] = useState(false);
  const isLogin = useAuthStore((s) => s.isLogin);
  const logout = useAuthStore((s) => s.logout);
  const userData = useAuthStore((s) => s.userData);
  const kakaoAccessToken = useAuthStore((s) => s.kakaoAccessToken);
  const isKaKaoLogin = useAuthStore((s) => s.isKaKaoLogin);
  const navigate = useNavigate();
  const location = useLocation();
  const clientId = import.meta.env.VITE_KAKAO_LOGIN_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_KAKAO_LOGOUT_REDIRECT_URL;
  const cartCount = useAuthStore((s) => s.cartCount);
  const initCartCount = useAuthStore((s) => s.initCartCount);
  const isUpdateFlag = useAuthStore((s) => s.isUpdateFlag);

  //console.log(userData);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      window.scrollY > 60 ? setHeaderFixed(true) : setHeaderFixed(false);
    });

    const fetchData = async() => {
      if(!isLogin) return;

      const result = await axiosPost('/carts/count', {"userData": userData?.mid});
      result.count ? initCartCount(parseInt(result.count)) : initCartCount(0);
    }    
    fetchData();

    return () => {
      // window.removeEventListener("scroll", () => {});
    };
  }, [isLogin, isUpdateFlag]);

  // nav 메뉴 탭 클릭시 해당 카테고리 상품으로 이동 (스크롤만 이동)
  const handleScroll = (e, sectionId) => {
    e.preventDefault();

    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 250;

      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const cate = [
    { id: "am7-section", name: "오전 7시" },
    { id: "am10-section", name: "오전 10시" },
    { id: "pm1-section", name: "오후 1시" },
    { id: "pm3-section", name: "오후 3시" },
    { id: "pm6-section", name: "오후 6시" },
    { id: "pm9-section", name: "오후 9시" },
    { id: "pm11-section", name: "오후 11시" },
    { id: "try-section", name: "TRY EAT" },
  ];

  //로그아웃 function
  const handleLogout = async () => {
    await axiosPost("/member/logout"); // ← 서버에 쿠키 삭제 요청
    logout(); // ← Zustand 상태 초기화
    alert("로그아웃 되었습니다");
    navigate("/");
  };

  //카카오 로그아웃 function
  const handleKakaoLogout = async () => {

    //console.log('handleKakaoLogout::', userInfo.accessToken);
    const res = await axiosPost('/member/kakaoLogout', { accessToken: kakaoAccessToken })
    if (res) {
      logout();
      localStorage.removeItem('loginType');
      const logoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${clientId}&logout_redirect_uri=${redirectUri}`
      window.location.href = logoutUrl;
    }
  }

  // console.log(cartCount);

  return (
    <>
      <style.HeaderWrap isFixed={isHeaderFixed} isAboutHeader={isAboutHeader}>
        <style.Header>
          <style.HeaderTop>
            <ul className="top_list">
              <li>
                {!isLogin && (<Link to="/signup">회원가입</Link>)}
              </li>
              <li>
                {!isLogin && (<Link to="/login">로그인</Link>)}
              </li>
              <li style={{ display: isLogin ? 'block' : 'none' }}>
                {isLogin && `${userData?.name}님 환영합니다!`}
              </li>
              <li style={{ display: isLogin ? 'block' : 'none' }}>
                {isLogin && (<Link to='#' onClick={isKaKaoLogin ? handleKakaoLogout : handleLogout}>로그아웃</Link>)}
              </li>
              <li>
                {isLogin ? (<Link to="/carts/order">주문조회</Link>) : (<Link to='/login'>주문조회</Link>)}
              </li>
              <li>
                <Link to="#">최근본상품</Link>
              </li>
              <li>
                <style.boardList>
                  <Link to="#">
                    고객센터
                    <i className="arrRgt"></i>
                  </Link>
                  <ul className="board_list">
                    <li>
                      <Link to="#">공지사항</Link>
                    </li>
                    <li>
                      <Link to="#">상품 사용후기</Link>
                    </li>
                    <li>
                      <Link to="#">상품 Q&A</Link>
                    </li>
                  </ul>
                </style.boardList>
              </li>
            </ul>
          </style.HeaderTop>
          <style.HeaderBottom>
            <style.LogoWrap>
              <Link to="/">
                <img
                  src="https://he0o0nje.github.io/Danoshop-clone-ts/img/header/logo.jpg"
                  alt=""
                />
              </Link>
            </style.LogoWrap>
            <style.MypageWrap>

              <Link to="/Login">
                <img style={{ display: !isLogin ? 'block' : 'none' }}
                  src="https://he0o0nje.github.io/Danoshop-clone-ts/img/header/mypage1.svg"
                  alt=""
                />
              </Link>

              <Link to="/cart">
                <img
                  src="https://he0o0nje.github.io/Danoshop-clone-ts/img/header/mypage2.svg"
                  alt=""
                />
                {cartCount > 0 && (
                  <span className="header-icons-cart">{cartCount}</span>
                )}
              </Link>
              <Link to="#">
                <img
                  src="https://he0o0nje.github.io/Danoshop-clone-ts/img/header/mypage3.svg"
                  alt=""
                />
              </Link>
            </style.MypageWrap>
            <style.BotCategory>
              <ul>
                <li>
                  <Link to={'/'}>전 상품</Link>
                </li>
                <li>
                  <Link to={'/sale'}>SALE</Link>
                </li>
                {location.pathname === '/' && cate.map(menu =>
                  <li>
                    <Link to='#' onClick={e => handleScroll(e, menu.id)}>{menu.name}</Link>
                  </li>
                )}
              </ul>
            </style.BotCategory>
          </style.HeaderBottom>
        </style.Header>
      </style.HeaderWrap>
    </>
  );
}

export default Header;
