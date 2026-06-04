import express from "express";
import * as controller from "../controller/review.js";

const router = express.Router();

router.post("/media", controller.getMediaReviews);
router.post("/text", controller.getTextReviews);

export default router;
