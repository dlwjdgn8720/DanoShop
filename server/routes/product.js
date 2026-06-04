import express from "express";
import * as controller from "../controller/product.js";

const router = express.Router();

router.post("/show", controller.getProduct);       // 메인페이지 DB 연동
router.post("/detail", controller.getProductDetail);    // 상세정보 페이지 DB 연동
router.post("/option/:pid", controller.getProductOption);    // 상품 별 option DB에서 호출
router.post("/detailList", controller.getProductDetailList);    // 상품 별 상세정보 이미지 호출
router.post("/sale", controller.getProductSale);    // 상품 별 상세정보 이미지 호출


export default router;
