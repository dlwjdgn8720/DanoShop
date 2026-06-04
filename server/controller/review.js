import * as repository from "../repository/review.js";

export const getMediaReviews = async (req, res) => {
  try {
    const pid = req.body.id;

    const mediaReviews = await repository.getMediaReviews(pid);
    // console.log("컨트롤러에서 조회된 미디어 리뷰:", mediaReviews);

    res.json({
      mediaReviews,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "리뷰 조회 실패",
    });
  }
};

export const getTextReviews = async (req, res) => {
  try {
    const pid = req.body.id;

    const textReviews = await repository.getTextReviews(pid);
    // console.log("컨트롤러에서 조회된 텍스트 리뷰:", textReviews);
    res.json({
      textReviews,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "리뷰 조회 실패",
    });
  }
};
