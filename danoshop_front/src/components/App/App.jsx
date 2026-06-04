import React, { useEffect, useRef } from "react";
import HomePage from "../../pages/HomePage/HomePage";
import Sale from "../../pages/Sale/Sale.jsx";
import AboutPage from "../../pages/AboutPage/AboutPage";
import Cart from "../../pages/Cart/Cart";
import Checkout from "../../pages/Cart/Checkout";
import Order from "../../pages/Cart/Order.jsx";
import Login from "../../pages/Member/Login";
import Signup from "../../pages/Member/Signup";
import KakaoCallback from "../../pages/Member/KakaoCallBack.jsx";
import * as style from "./AppStyle";
import GlobalStyles from "../../GlobalStyles";
import "bootstrap/dist/css/bootstrap.min.css";
// import { ScrollProvider } from "../Sub/ScrollContext";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import useAuthStore from '../../../store/authStore.js';
import axios from "axios";
import { axiosPost } from "../../../utils/dataFetch.js"
import Success from "../Sub/Success.jsx";

function App() {
  // console.log("App 렌더링!!!");

  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const authChecked = useAuthStore((s) => s.authChecked);
  const isLogin = useAuthStore((s) => s.isLogin);
  const accessToken = useAuthStore((s) => s.accessToken);

  // ✅ 로그인 필요한 페이지 보호
  const PrivateRoute = ({ children }) => {
    return isLogin ? children : <Navigate to="/login" replace />;
  };
  //① 앱 시작 시 1회 — refreshToken으로 로그인 상태 복구
  const isProcessed = useRef(false);

  useEffect(() => {
    // console.log("useEffect 진입!!!!");

    const restoreLogin = async () => {
      if (isProcessed.current) return;

      if (localStorage.getItem('loginType') === 'kakao') {
        isProcessed.current = true;
        const res = await axios.post("http://localhost:9000/member/kakaoRefresh",
          { accessToken: accessToken },
          {
            withCredentials: true,
            validateStatus: (status) => status < 500, // ✅ 401도 throw 안 함
          },)

        login({ ...res.data })

      } else {
        try {
          // ✅ instance 대신 별도 axios 사용 (인터셉터 제외)
          const res = await axios.post("http://localhost:9000/member/refresh", {},
            {
              withCredentials: true,
              validateStatus: (status) => status < 500, // ✅ 401도 throw 안 함
            },
          );
          //console.log(res);
          if (res.status === 401) {
            // ✅ 비로그인 처리
            logout();
            return;
          }

          login({ ...res.data, isLogin: true });

        } catch {
          logout();
        }
      }
    };
    restoreLogin();
  }, []);

  const location = useLocation();


  // ② 복구 완료 전까지 렌더링 보류 (깜빡임 방지)
  if (!authChecked) return null;

  return (
    <>
      {/* <ScrollProvider> */}
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/detail/:id" element={<AboutPage key={location.pathname} />} />
        <Route path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/carts/order" element={<Order />} />
        <Route path="/success" element={<Success />} />
        <Route path="login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth/callback/kakao" element={<KakaoCallback />} />
      </Routes>
      <style.ShadowLayer />
      {/* </ScrollProvider> */}
    </>
  );
}

export default App;
