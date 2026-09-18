import axios from "axios";
import useAuthStore from "../store/authStore.js";

//(1) 쿠키를 자동으로 주고받으려면 전역 설정 필수, axios 대신 instance 객체가 쿠키포함 처리하도록 수정
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9000",
  withCredentials: true, // 모든 요청에 쿠키 자동 첨부
});

//(2) Request interceptor — 모든 요청에 accessToken 자동 삽입을 전역객체(useAuthStore)에서 가져옴
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  //console.log(token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // 중요: 만약 우리 토큰이 없으면 카카오 토큰을 절대 임의로 넣지 못하게 비워둡니다.
    // 이렇게 해야 카카오 토큰이 주입되어 백엔드에서 jwt malformed 에러가 나는 걸 막을 수 있습니다.
    delete config.headers.Authorization;
  }
  return config;
});

//(3) Response interceptor — 401 시 자동 재발급
// 기준 — instance로 보낸 요청만 인터셉트
instance.interceptors.response.use(
  (res) => {
    console.log(
      `✅ [${res.config.method.toUpperCase()}] ${res.config.url} →`,
      res.status,
    );
    return res;
  },
  async (error) => {
    //서버에서 accessToken 만료 여부 판단결과 전송, status=401 을 에러가 판단하기로 함
    const { config, response } = error;
    console.warn(
      `❌ [${config.method.toUpperCase()}] ${config.url} →`,
      response?.status,
    );

    // if (error.response?.status === 401 && !config._retry) {
    //   console.log("🔄 401 감지 → /member/refresh 요청 시작");

    // ✅ 핵심: refresh 요청 자체거나 이미 재시도한 요청은 바로 reject
    if (
      response?.status === 401 &&
      !config._retry && // 👈 이미 재시도한 요청 제외
      !config.url.includes("/member/refresh")
    ) {
      // 👈 refresh 요청 자체 제외

      config._retry = true; // 👈 재시도 표시
      try {
        const { data } = await instance.post("/member/refresh");
        console.log(
          "✅ 새 accessToken 발급 성공:",
          data.accessToken.slice(0, 20) + "...",
        );

        useAuthStore.getState().login({
          accessToken: data.accessToken,
          userData: data.userData,
          /* userData: data.userId,
          isLogin: true,    
          충돌 */
        });
        console.log("✅ Zustand(리덕스) 업데이트 완료");

        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        console.log("🔁 원래 요청 재시도:", config.url);

        return instance(error.config);
      } catch (error) {
        console.error("❌ refreshToken 만료 → 강제 로그아웃");
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    // return Promise.reject(error);
    return Promise.reject(error); // 👈 조건 미해당 시 그냥 에러 반환
  },
);

/**
 * 서버 연동을 위한 HTTP 메소드 CRUD 정의
 * - get(R), post(C), put(U), delete(D)
 */
export const axiosGet = async (path) => {
  //const url = `http://192.168.7.112:9000${path}`;
  const res = await instance.get(path);
  return res.data;
};

export const axiosPost = async (path, data) => {
  //const url = `http://192.168.7.112:9000${path}`;
  const res = await instance.post(path, data);
  return res.data;
};

export const axiosPut = async (path, data) => {
  //const url = `http://192.168.7.112:9000${path}`;
  const res = await instance.put(path, data);
  return res.data;
};

export const axiosDelete = async (path, data) => {
  //const url = `http://192.168.7.112:9000${path}`;
  const res = await instance.delete(path, { data: data });
  return res.data;
};
