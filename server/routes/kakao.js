import express from "express";
import * as controller from '../controller/kakao.js';

const router = express.Router();

router.post('/ready', controller.getReady);     //결제하기 버튼 클릭 시 호출
router.get('/approve', controller.getApprove);  //QR클릭시 카카오페이 서버에서 리다이렉션
router.get('/status', controller.checkPaymentStatus);

export default router;
