import express from 'express';
import * as controller from '../controller/carts.js';
import { verifyToken } from "../controller/member.js"; // 토큰 유효 기간 확인 미들웨어 추가

const router = express.Router();

router.post("/add", verifyToken, controller.getAdd);
router.post("/count", verifyToken, controller.getCount);
router.post("/list", verifyToken, controller.getList);
router.put("/qty", verifyToken, controller.getQtyUpdate);
router.delete("/del", verifyToken, controller.getDelete);
router.post("/order", verifyToken, controller.getOrder);

export default router;