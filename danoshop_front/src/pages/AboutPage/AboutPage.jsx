import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TopBanner from "../../components/TopBanner/TopBanner";
import Header from "../../components/Header/Header";
import Top from "../../components/Sub/Top";
import ProdDetail from "../../components/Sub/ProdDetail";
import ProdReview from "../../components/Sub/ProdReview";
import ProdQnA from "../../components/Sub/ProdQnA";
import ProdInfo from "../../components/Sub/ProdInfo";
import Footer from "../../components/Footer/Footer";
import * as style from "./SubStyle";
import { axiosPost, axiosGet } from "../../../utils/dataFetch.js";

// 데이터 임포트
// import am7 from "../../data/product/7am.json";
// import am10 from "../../data/product/10am.json";
// import pm1 from "../../data/product/1pm.json";
// import pm3 from "../../data/product/3pm.json";
// import pm6 from "../../data/product/6pm.json";
// import pm9 from "../../data/product/9pm.json";
// import pm11 from "../../data/product/11pm.json";
// import TryEat from "../../data/product/TryEat.json";

// 임의로 만든 Tabs 컴포넌트가 없다면 아래처럼 페이지 내에 만들거나 
// 공통 컴포넌트 탭이 있다면 그것을 import해서 사용하세요.
function AboutPage() {
  const { id } = useParams();
  // const productId = parseInt(id || "", 10);

  // 1. 현재 선택된 탭을 관리할 상태 추가 (기본값: 'detail')
  const [tabName, setTabName] = useState('detail');
  const [product, setProduct] = useState({});
  const [qnaCount, setQnaCount] = useState(0);
  // const dummy = [
  //   ...am7, ...am10, ...pm1, ...pm3, ...pm6, ...pm9, ...pm11, ...TryEat,
  // ];
  // const product = dummy.find((item) => item.id === productId);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await axiosPost('/product/detail', { id });
        setProduct(response?.result[0] || {});
      } catch (error) {
        console.error("데이터(detail) 가져오기 실패:", error);
      }
    };
    getProduct();
  }, []);

  if (!product) {
    return <style.Alert404>제품을 찾을 수 없습니다.</style.Alert404>;
  }

  useEffect(() => {
    const getQnaCount = async () => {
      //qna count 조회
      const count = await axiosGet(`/qna/count?id=${id}`);
      setQnaCount(count);
    }
    getQnaCount();
  }, [qnaCount])

  // 페이지 진입 시 스크롤 상단 이동
  // window.scroll({ top: 0, behavior: "auto" });

  // 화면 진입 시 스크롤 최상단 이동
  useEffect(() => {
    window.scroll({ top: 0, behavior: "auto" });
  }, []);

  return (
    <>
      <TopBanner />
      <Header isAboutHeader={true} />
      <style.Sub>
        <Top product={product} />

        <style.DetailSec>
          {/* 2. ProductDetail.jsx 스타일의 탭 네비게이션 구현 */}
          {/* 만약 별도의 <Tabs /> 컴포넌트가 없다면 아래와 같이 매핑할 수 있습니다. */}
          <div className="product-detail-tab">
            <ul className="tab-menu">
              <li
                onClick={() => setTabName('detail')}
                className={`tab-item ${tabName === 'detail' ? 'active' : ''}`}
              >
                상세정보
              </li>
              <li
                onClick={() => setTabName('review')}
                className={`tab-item ${tabName === 'review' ? 'active' : ''}`}
              >
                상품후기 <span className="count">2,020</span>
              </li>
              <li
                onClick={() => setTabName('qna')}
                className={`tab-item ${tabName === 'qna' ? 'active' : ''}`}
              >
                상품문의 <span className="count">{qnaCount}</span>
              </li>
              <li
                onClick={() => setTabName('info')}
                className={`tab-item ${tabName === 'info' ? 'active' : ''}`}
              >
                배송/교환/환불 안내
              </li>
            </ul>
          </div>

          {/* 3. 조건부 렌더링을 통해 선택된 탭의 컴포넌트만 노출 */}
          <div className="tabs_contents">
            {tabName === 'detail' && <ProdDetail product={product} />}
            {tabName === 'review' && <ProdReview />}
            {tabName === 'qna' && <ProdQnA />}
            {tabName === 'info' && <ProdInfo />}
          </div>
        </style.DetailSec>
      </style.Sub>
      <Footer />
    </>
  );
}

export default AboutPage;