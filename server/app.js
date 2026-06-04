import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import memberRouter from "./routes/member.js";
import productRouter from "./routes/product.js";
import cartRouter from "./routes/carts.js";
import kakaoRouter from "./routes/kakao.js";
import reviewRouter from "./routes/review.js";
import qnaRouter from "./routes/qna.js";

dotenv.config();

//PORT
const app = express();
const PORT = process.env.SERVER_PORT || 9000;

// 미들웨어(공통작업 정의)
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // 프론트 주소 정확히 명시 (포트 포함)
    credentials: true, // withCredentials 대응
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// 라우터
app.use("/member", memberRouter);
app.use("/product", productRouter);
app.use("/carts", cartRouter);
app.use("/kakao", kakaoRouter);
app.use("/review", reviewRouter);
app.use("/qna", qnaRouter);

//PORT 실행
app.listen(PORT, () => {
  console.log(`서버 실행 => ${PORT}`);
});
