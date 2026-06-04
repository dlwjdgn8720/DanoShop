import * as repository from "../repository/member.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

/**
 * 카카오 로그인 refresh
 */

export const getKakaoRefresh = async (req, res) => {
  const { accessToken } = req.body;
  const REST_API_KEY = process.env.KAKAO_LOGIN_CLIENT_ID;
  const ACCESS_SECRET = process.env.ACCESS_SECRET;
  const REFRESH_SECRET = process.env.REFRESH_SECRET;
  const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES;

  const kakaoRefreshToken = req.cookies.refreshToken; //카카오 api에서 가져온 refreshToken cookies에서 가져옴

  if (!kakaoRefreshToken) {
    return res
      .status(401)
      .json({ isLogin: false, message: "토큰이 없습니다." });
  }

  try {
    // 토큰 재발급 api
    const kakaoResponse = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: REST_API_KEY,
        refresh_token: kakaoRefreshToken, // 카카오에게 받았던 원래 refresh_token
      }),
      {
        headers: {
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      },
    );

    //console.log("kakaoResponse::", kakaoResponse.data);

    const { access_token: newKakaoAccessToken, refresh_token: newKakaoRefreshToken } = kakaoResponse.data;

    if (newKakaoRefreshToken) {
      res.cookie("kakaoRefreshToken", newKakaoRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
    }

    //엑세스 토큰으로 카카오 유저 정보 조회 api
    const userResponse = await axios({
      method: "GET",
      url: "https://kapi.kakao.com/v2/user/me",
      headers: {
        Authorization: `Bearer ${newKakaoAccessToken}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    //토큰으로 유저의 배송지 정보 조회
    const addressResponse = await axios.get(
      "https://kapi.kakao.com/v1/user/shipping_address",
      {
        headers: {
          Authorization: `Bearer ${newKakaoAccessToken}`,
        },
      },
    );

    // 사용자가 카카오에 등록한 배송지 목록 배열
    const shippingData = addressResponse.data;
    let kakaoUserData = userResponse.data;

    kakaoUserData = {
      mid: kakaoUserData.id,
      name: kakaoUserData.kakao_account.name,
      email: kakaoUserData.kakao_account.email,
      phone: shippingData.shipping_addresses[0]?.receiver_phone_number1,
      address: shippingData.shipping_addresses[0]?.base_address + " " + shippingData?.shipping_addresses[0]?.detail_address,
      receiver_name: shippingData.shipping_addresses[0]?.receiver_name,
      zone_number: shippingData.shipping_addresses[0]?.zone_number,
      zip_code: shippingData.shipping_addresses[0]?.zip_code,
    };

    const accessToken = jwt.sign({ mid: kakaoUserData.mid, role: "KAKAO_USER" }, ACCESS_SECRET, { expiresIn: '2h' });

    res.json({
      userData: kakaoUserData,
      accessToken: accessToken,
      isKaKaoLogin: true,
      kakaoAccessToken: newKakaoAccessToken
    });
  } catch (error) {
    console.error("❌ 토큰 갱신 실패:", error.response?.data || error.message);
    return res.status(403).json({
      isLogin: false,
      message: "인증이 만료되었습니다. 다시 로그인해주세요.",
    });
  }
};

/**
 *  카카오 로그아웃
 */
export const getKakaoLogout = async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: "Access Token이 없습니다." });
  }

  try {
    const logoutResponse = await axios({
      method: "POST",
      url: "https://kapi.kakao.com/v1/user/logout",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // 개발환경
      sameSite: "lax", // 개발환경
      path: "/",
    });

    res.json({ message: "로그아웃 성공" });
  } catch (error) {
    console.error(
      "카카오 로그아웃 실패:",
      error.response ? error.response.data : error.message,
    );
    res.status(500).json({ error: "로그아웃 처리 실패" });
  }
};

/**
 *  카카오 로그인 토큰 및 user정보 가져오기
 */

export const getKakaoLogin = async (req, res) => {
  const REST_API_KEY = process.env.KAKAO_LOGIN_CLIENT_ID;
  const REDIRECT_URI = process.env.KAKAO_LOGIN_REDIRECT_URL;
  const ACCESS_SECRET = process.env.ACCESS_SECRET;
  const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES;
  const { code } = req.body;
  //console.log("kakao code::", code);

  if (!code) {
    return res.status(400).json({ error: "인가 코드가 없습니다." });
  }

  try {
    // 1. 카카오에 토큰 요청
    const tokenResponse = await axios({
      method: "POST",
      url: "https://kauth.kakao.com/oauth/token",
      headers: {
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      data: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: REST_API_KEY,
        redirect_uri: REDIRECT_URI,
        code: code,
      }).toString(),
    });

    const accessKakaoToken = tokenResponse.data.access_token; //신원 확인용 카카오 엑세스 토큰
    const refreshKakaoToken = tokenResponse.data.refresh_token; // 카카오 재발급 토큰

    // 2. 받은 토큰으로 유저 정보 요청 및 member table insert
    const userResponse = await axios({
      method: "GET",
      url: "https://kapi.kakao.com/v2/user/me",
      headers: {
        Authorization: `Bearer ${accessKakaoToken}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    //토큰으로 유저의 배송지 정보 조회
    const addressResponse = await axios.get(
      "https://kapi.kakao.com/v1/user/shipping_address",
      {
        headers: {
          Authorization: `Bearer ${accessKakaoToken}`,
        },
      },
    );

    // 사용자가 카카오에 등록한 배송지 목록 배열
    const shippingData = addressResponse.data;
    console.log(shippingData);

    let kakaoUserData = userResponse.data;
    console.log(kakaoUserData);

    const result = await repository.getUserInfo(kakaoUserData.id);

    if (result === null || result === undefined) {
      const member = {
        mid: kakaoUserData.id,
        name: kakaoUserData.kakao_account.name,
        phone: shippingData.shipping_addresses[0].receiver_phone_number1,
        address:
          shippingData.shipping_addresses[0].base_address +
          " " +
          shippingData?.shipping_addresses[0]?.detail_address,
        email: kakaoUserData.kakao_account.email,
      };

      await repository.getKaKaoSignup(member);
    }

    kakaoUserData = {
      mid: kakaoUserData.id,
      name: kakaoUserData.kakao_account.name,
      email: kakaoUserData.kakao_account.email,
      phone: shippingData.shipping_addresses[0]?.receiver_phone_number1,
      address: shippingData.shipping_addresses[0]?.base_address + " " + shippingData?.shipping_addresses[0]?.detail_address,
      receiver_name: shippingData.shipping_addresses[0]?.receiver_name,
      zone_number: shippingData.shipping_addresses[0]?.zone_number,
      zip_code: shippingData.shipping_addresses[0]?.zip_code,
    };



    // 3. Refresh Token → HttpOnly 쿠키로 전달
    res.cookie("refreshToken", refreshKakaoToken, {
      httpOnly: true,
      secure: false, // 개발환경 고정
      sameSite: "lax", // 개발환경 고정
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 (ms) : 쿠키의 유효기간
      path: "/",
    });

    // 4. 서비스 전용 JWT 발급 및  프론트엔드로 필요한 유저 정보 응답
    const accessToken = jwt.sign({ mid: kakaoUserData.mid, role: "KAKAO_USER" }, ACCESS_SECRET, { expiresIn: '2h' });

    res.json({
      accessToken: accessToken,
      kakaoUserData: kakaoUserData,
      kakaoAccessToken: accessKakaoToken
    });
  } catch (error) {
    console.error(
      "카카오 인증 실패:",
      error.response ? error.response.data : error.message,
    );
    res.status(500).json({ error: "카카오 로그인 처리 실패" });
  }
};

/**
 *  로그아웃 - refresh 토큰 삭제
 */
export const getLogout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, // 개발환경
    sameSite: "lax", // 개발환경
    path: "/",
  });
  return res.status(200).json({ message: "로그아웃 완료" });
};

/**
 * refresh 토큰 확인 및 액세스 토큰 생성
 */
export const getRefresh = async (req, res, next) => {
  // ① 쿠키에서 refreshToken 추출
  const refreshToken = req.cookies?.refreshToken;
  //console.log("\n🍪 [refresh] 쿠키 수신:", refreshToken ? "있음" : "없음");
  console.log("🍪 refreshToken =", refreshToken);

  const ACCESS_SECRET = process.env.ACCESS_SECRET;
  const REFRESH_SECRET = process.env.REFRESH_SECRET;

  if (!refreshToken) {
    //console.warn("❌ [refresh] refreshToken 없음 → 401");
    return res.status(401).json({ message: "refreshToken 없음" });
  }

  try {
    // ② refreshToken 검증
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    console.log("🔥 decoded =", decoded);
    console.log("🔥 decoded.mid =", decoded.mid);
    //console.log("✅ [refresh] 토큰 검증 성공 ->", decoded);
    // console.log("✅ [refresh] 토큰 검증 성공 → userId:", decoded.id);
    // console.log("토큰 만료시각:", new Date(decoded.exp * 1000).toLocaleString());
    // console.log("현재 시각:    ", new Date().toLocaleString());
    // console.log("남은 시간(초):", decoded.exp - Math.floor(Date.now() / 1000));

    // ③ 새 accessToken 발급
    const accessToken = jwt.sign(
      { mid: decoded.mid, role: decoded.role },
      ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    //console.log("✅ [refresh] 새 accessToken 발급 완료::", accessToken);
    //디코딩된 mid로 유저정보 다시 조회
    const userData = await repository.getUserInfo(decoded.mid);

    // ④ 새 accessToken JSON으로 응답
    return res
      .status(200)
      .json({ userData: userData, accessToken: accessToken });
  } catch (error) {
    console.error("❌ [refresh] 토큰 검증 실패:", error.message);

    // refreshToken 만료 또는 위조 → 쿠키 삭제
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // 개발환경 고정
      sameSite: "lax", // 개발환경 고정
    });
    return res.status(401).json({ message: "refreshToken 만료" });
  }
};

/**
 * 액세스 토큰 검증
 */
export const verifyToken = async (req, res, next) => {
  //console.log("[verifyToken] 토큰 만료 확인");
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error("❌ accessToken 만료 → 토큰 없음"); // ← 토큰 자체가 없음
    return res.status(401).json({ message: "토큰 없음" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"

  try {
    const decoded = await jwt.verify(token, process.env.ACCESS_SECRET);
    //console.log("✅ [verifyToken] 토큰 유효 → userId:", decoded.mid); // ← 정상
    req.user = decoded;
    next();
  } catch (error) {
    console.log("⏰ [verifyToken] 토큰 만료 또는 위조 →", error.message); // ← 만료된 경우
    return res.status(401).json({ message: "토큰 만료 또는 유효하지 않음" });
  }
};

/**
 *  로그인 - 엑세스, refresh 토큰 생성 및 전송
 */
export const getLogin = async (req, res, next) => {
  const { mid, pwd } = req.body;
  //(1) .env 파일에서 JWT 시크릿 키, 만료 시간 가져오기
  const ACCESS_SECRET = process.env.ACCESS_SECRET;
  const REFRESH_SECRET = process.env.REFRESH_SECRET;
  const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "10s";
  const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

  const userInfo = await repository.getUserInfo(mid);

  console.log('login::', userInfo);


  try {
    if (!userInfo) {
      res.json({ isLogin: false, isComparePwd: true });
    } else {
      const isLogin = await bcrypt.compare(pwd, userInfo.pwd);

      if (isLogin) {
        //(2) AccessToken(메모리 저장), RefreshToken(HttpOnly 쿠키 저장) 발급
        const accessToken = jwt.sign(
          { mid, role: userInfo.role },
          ACCESS_SECRET,
          { expiresIn: ACCESS_EXPIRES },
        );
        const refreshToken = jwt.sign(
          { mid, role: userInfo.role },
          REFRESH_SECRET,
          { expiresIn: REFRESH_EXPIRES },
        );

        //(3) Refresh Token → HttpOnly 쿠키로 전달
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false, // 개발환경 고정
          sameSite: "lax", // 개발환경 고정
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 (ms) : 쿠키의 유효기간
          path: "/",
        });

        //(4) Access Token만 JSON으로 응답 (Refresh Token은 포함하지 않음)
        res.status(200).json({ isLogin, accessToken, userInfo });
      } else {
        res.json({ isComparePwd: false });
      }
    }
  } catch (error) {
    console.log("login error :: ", error);
  }
};

/**
 *  회원가입(패스워드 암호화 및 email concat)
 */
export const getSignup = async (req, res, next) => {
  const { mid, pwd, name, phone, address, emailDomain, emailName } = req.body;
  const pwdHash = await bcrypt.hash(pwd, 10);
  const email = emailName.concat("@", emailDomain);
  const member = { ...req.body, pwdHash: pwdHash, email: email };

  const result = await repository.getSignup(member);
  res.json({ isSignup: result });
};

/**
 *  아이디 중복 체크
 */
export const getIdCheck = async (req, res, next) => {
  const isIdCheck = await repository.getIdCheck(req.body.mid);
  res.json(isIdCheck);
};

/**
 *  유저 정보 조회
 */
export const getUserInfo = async (req, res, next) => {
  const userInfo = await repository.getUserInfo(req.params.mid);
  // console.log('userInfo ==> ', userInfo);
  res.json(userInfo);
};
