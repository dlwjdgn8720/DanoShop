import React from "react";
import { Link, useParams } from "react-router-dom";
import * as style from "./ProdReviewStyle";
import DetailTab from "./DetailTab";
import { useEffect, useState } from "react";
import { axiosPost } from "../../../utils/dataFetch.js";

// // 1. 방대한 상품 데이터 결합 로직을 컴포넌트 외부로 분리
// import am7 from "../../data/product/7am.json";
// import am10 from "../../data/product/10am.json";
// import pm1 from "../../data/product/1pm.json";
// import pm3 from "../../data/product/3pm.json";
// import pm6 from "../../data/product/6pm.json";
// import pm9 from "../../data/product/9pm.json";
// import pm11 from "../../data/product/11pm.json";
// import TryEat from "../../data/product/TryEat.json";

// const getAllProducts = () => [
//   ...am7,
//   ...am10,
//   ...pm1,
//   ...pm3,
//   ...pm6,
//   ...pm9,
//   ...pm11,
//   ...TryEat,
// ];

// 2. 재사용 가능한 소형 컴포넌트 및 아이콘 선언
const StarIcon = () => (
  <img
    src="https://he0o0nje.github.io/Danoshop-clone-ts/img/icon/ico_star.svg"
    alt="star"
  />
);

const ArrowDownIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 8 8"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M.667 2.333L4 5.667l3.333-3.334"
    />
  </svg>
);

// 별점 게이지 정적 데이터
const REVIEW_GAUGES = [
  {
    title: "아주 좋아요",
    count: 1964,
    width: "max(97%, 12px)",
    highlighted: true,
  },
  { title: "맘에 들어요", count: 42, width: "max(2%, 12px)" },
  { title: "보통이에요", count: 10, width: "max(0%, 0px)" },
  { title: "그냥 그래요", count: 3, width: "max(0%, 0px)" },
  { title: "별로예요", count: 4, width: "max(0%, 0px)" },
];

function ProdReview() {
  const { id } = useParams();

  const [mediaReviews, setMediaReviews] = useState([]);
  const [textReviews, setTextReviews] = useState([]);

  useEffect(() => {
    const dataFetch = async () => {
      const response1 = await axiosPost("/review/media/", { id });
      const response2 = await axiosPost("/review/text/", { id });

      // console.log("--->>>>", response1, response2);

      setMediaReviews(response1?.mediaReviews || []);
      setTextReviews(response2?.textReviews || []);
    };
    dataFetch();
  }, []);
  // const productId = parseInt(id || "", 10);

  // const products = getAllProducts();
  // const product = products.find((item) => item.id === productId);

  return (
    <style.ProdReview>
      {/* <DetailTab openTab={2} /> */}

      <style.ReviewWrap>
        {/* 헤더 영역 */}
        <div className="header">
          <div className="title_wrap">
            <span className="title"> REVIEW </span>
            <span className="review_count"> (2,020) </span>
          </div>
          <div className="all_review">
            <Link to="#">전체 상품 리뷰 보기</Link>
          </div>
        </div>

        {/* 리뷰 요약 (별점 분포) */}
        <style.ReviewSummary>
          <div className="left_content">
            <div className="score">
              <div className="icon">
                <StarIcon />
              </div>
              <span className="text">5.0</span>
            </div>
            <div className="score_percentage">
              <b>99%</b>의 구매자가 이 상품을 좋아합니다.
            </div>
            <button className="create_review_btn">상품 리뷰 작성하기</button>
          </div>

          <div className="right_content">
            <ul>
              {REVIEW_GAUGES.map((gauge, idx) => (
                <li
                  key={idx}
                  className={gauge.highlighted ? "highlighted" : ""}
                >
                  <div className="title">{gauge.title}</div>
                  <div className="gauge">
                    <div
                      style={{ width: gauge.width }}
                      className="percentile"
                    ></div>
                  </div>
                  <div className="count">{gauge.count.toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        </style.ReviewSummary>

        {/* 포토 & 동영상 미디어 요약 */}
        {mediaReviews && (
          <style.MediaSummary>
            <div className="header">
              <div className="title_wrap">
                <span className="title">포토&동영상</span>
                <span className="review_count">({mediaReviews?.length})</span>
              </div>
              <div className="more_btn">
                <Link to="#">
                  전체보기 <ArrowDownIcon className="show_all_arrow" />
                </Link>
              </div>
            </div>
            <div className="summary_content">
              <ul>
                {mediaReviews?.map((item, index) => (
                  <li key={index}>
                    <img src={item.media} alt={`media-review-${index}`} />
                  </li>
                ))}
              </ul>
            </div>
          </style.MediaSummary>
        )}

        {/* 정렬 및 필터 바 */}
        <style.SortFilter>
          <ul>
            <li className="basic_sort">
              <ul>
                <li> 추천순 </li>
                <li> 최신순 </li>
                <li className="selected"> 별점순 </li>
              </ul>
            </li>
            <li className="search">
              <div className="input_container">
                <input type="text" placeholder="리뷰 키워드 검색" />
                <Link to="#">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 18 18"
                    className="search_input_icon"
                  >
                    <rect
                      width="10.5"
                      height="10.5"
                      x="2.25"
                      y="2.25"
                      strokeWidth="1.5"
                      rx="5.25"
                    />
                    <path strokeWidth="1.5" d="M11.78 11.47L16.28 15.97" />
                  </svg>
                </Link>
              </div>
            </li>
            {mediaReviews && (
              <li className="media_first">
                <Link to="#">
                  <div className="toggle_btn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="on"
                    >
                      <rect
                        width="18.5"
                        height="18.5"
                        x="2.75"
                        y="2.75"
                        strokeWidth="1.5"
                        rx="9.25"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M7 12l4 4 6-7"
                      />
                    </svg>
                    <span>포토/동영상 먼저 보기</span>
                  </div>
                </Link>
              </li>
            )}
          </ul>
          <div className="filter_list">
            <ul>
              <li>
                <div className="filter_btn">
                  <div className="dropdown">
                    <div className="dropdown_btn">
                      별점 <ArrowDownIcon className="dropdown_arrow" />
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </style.SortFilter>

        {/* 리뷰 리스트 영역 */}
        <style.ReviewList>
          <ul className="review_list">
            {textReviews?.map((item, index) => (
              <li key={index}>
                <div className="left_content">
                  <div className="tag_section">
                    {item.tag_new && (
                      <span className="tag_new">{item.tag_new}</span>
                    )}
                    {item.tag_repurchase && (
                      <span className="tag_repurchase">
                        {item.tag_repurchase}
                      </span>
                    )}
                  </div>
                  <div className="score_section">
                    <div className="score_container">
                      <div className="score_star">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i}>
                            <StarIcon />
                          </div>
                        ))}
                      </div>
                      <div className="score_text">아주 좋아요</div>
                    </div>
                    <div className="edit_container">
                      <div className="date">{item.date}</div>
                    </div>
                  </div>
                  <div className="content_section">
                    <div className="message">{item.message}</div>
                  </div>
                  <div className="like_section">
                    <div className="comment_info">
                      <Link to="#">
                        <span className="text">댓글</span>
                        <span className="count">0</span>
                        <ArrowDownIcon />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="right_content">
                  <div className="user_name_msg">
                    <b>{item.user_name}****</b> 님의 리뷰입니다.
                  </div>
                  <div className="options_section">
                    <span className="name">옵션</span>
                    <span className="value">{item.option}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </style.ReviewList>

        {/* 페이지네이션 */}
        <style.ReviewPagination>
          <div className="pagination">
            <Link to="#" className="disabled">
              {"<"}
            </Link>
            <Link to="#" className="active">
              1
            </Link>
            {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Link key={num} to="#">
                {num}
              </Link>
            ))}
            <Link to="#">{">"}</Link>
          </div>
        </style.ReviewPagination>
      </style.ReviewWrap>
    </style.ProdReview>
  );
}

export default ProdReview;
