import express from "express";
import * as controller from "../controller/member.js";

const router = express.Router();
router.post("/signup", controller.getSignup); //회원가입
router.post("/idCheck", controller.getIdCheck); //아이디 체크
router.post("/login", controller.getLogin); //로그인
router.post("/logout", controller.getLogout); //로그아웃
router.post("/refresh", controller.getRefresh); //토큰 재발급
router.post("/kakaoLogin", controller.getKakaoLogin); //카카오 소셜 로그인
router.post("/kakaoLogout", controller.getKakaoLogout); //카카오 소셜 로그아웃
router.post("/kakaoRefresh", controller.getKakaoRefresh); //카카오 소셜 로그인 refresh 토큰

router.get("/userinfo/:mid", controller.getUserInfo); // 유저 정보 조회
export default router;
