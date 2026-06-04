import { create } from "zustand";

const useAuthStore = create((set) => ({
  // 1. 초기 상태 (State)
  userData: null,
  accessToken: null,
  //kakaoUserData: null,
  kakaoAccessToken: null,
  isLogin: false,
  authChecked: false,
  isKaKaoLogin: false,

  cartCount: 0,
  cartList: [],
  isUpdateFlag: false,

  // 2. 액션 (Actions)
  // 로그인 성공 시 백엔드에서 받은 유저 정보와 토큰을 저장
  login: ({ userData, accessToken, kakaoAccessToken, isKaKaoLogin }) =>
    set({
      userData,
      accessToken,
      kakaoAccessToken,
      isKaKaoLogin,
      isLogin: true,
      authChecked: true,
    }),

  // kakaoLogin: ({ kakaoUserData, kakaoAccessToken }) =>
  //   set({
  //     kakaoUserData,
  //     kakaoAccessToken,
  //     isLogin: true,
  //     isKaKaoLogin: true,
  //     authChecked: true,
  //   }),

  // 로그아웃 시 모든 상태를 초기화
  logout: () =>
    set({
      userData: null,
      accessToken: null,
      //kakaoUserData: null,
      kakaoAccessToken: null,
      cartCount: 0,
      cartList: [],
      isUpdateFlag: false,
      isLogin: false,
      isKaKaoLogin: false,
      authChecked: true,
    }),

  initCartCount: (count) => set(() => ({ cartCount: count })),
  setCartCount: () => set((state) => ({ cartCount: state.cartCount + 1 })),
  setIsUpdateFlag: () => set((state) => ({ isUpdateFlag: !state.isUpdateFlag })),
  setCartList: (cartList) => set(() => ({ cartList: cartList })),

  // 토큰 만료 시 재발급(Refresh)된 토큰만 업데이트하는 액션
  setAccessToken: (token) => set({ accessToken: token }),
}));

export default useAuthStore;

/*
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  userId: null,
  role: null,
  accessToken: null,
  isLogin: false,
  authChecked: false,
  cartCount: 0,
  cartList: [],          // 장바구니 리스트 공유 - Cart, Checkout 컴포넌트
  isUpdateFlag: false,    // 장바구니 리스트 수량 변경

  login: ({ userId, role, accessToken, isLogin }) =>
    set({ userId, 
          role, 
          accessToken, 
          isLogin, 
          authChecked: true }),
  logout: () =>
    set({ userId: null, 
          role: null, 
          accessToken: null, 
          isLogin: false, 
          authChecked: true, 
          cartCount: 0, 
        }),
        
  initCartCount: (count) => set(() => ({ cartCount: count })),
  setCartCount: () => set((state) => ({ cartCount: state.cartCount + 1 })), 
  setIsUpdateFlag: () => set((state) => ({ isUpdateFlag: !state.isUpdateFlag })),
  setCartList: (cartList) => set(() => ({ cartList: cartList})),
}));

*/
