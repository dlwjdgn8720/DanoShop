import express from "express";
import * as controller from "../controller/qna.js";

const router = express.Router();

router.get("/paging", controller.getQnaPagination);
router.get("/count", controller.getQnaCount);
router.post("/create", controller.createQnaInfo);
router.put("/update/:groupId", controller.updateQnaInfo);
router.delete("/delete/:id", controller.deleteQnaInfo);
router.post("/reply", controller.replyQnaInfo);
router.put("/updateViews/:qid", controller.updateViews);

export default router;
