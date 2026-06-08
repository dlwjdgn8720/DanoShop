import * as style from "./ProdDetailStyle";
import DetailTab from "./DetailTab";
// import am7 from "../../data/product/7am.json";
// import am10 from "../../data/product/10am.json";
// import pm1 from "../../data/product/1pm.json";
// import pm3 from "../../data/product/3pm.json";
// import pm6 from "../../data/product/6pm.json";
// import pm9 from "../../data/product/9pm.json";
// import pm11 from "../../data/product/11pm.json";
// import TryEat from "../../data/product/TryEat.json";
import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { axiosPost } from "../../../utils/dataFetch.js";

function ProdDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState([]);

  useEffect(() => {
    const getProductDetail = async () => {
      setProduct(null);
      try {
        const response = await axiosPost('/product/detailList', { id: Number(id) });
        setProduct(response.result[0] || []);
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    };
    getProductDetail();
  }, [id]);

  // const productId = parseInt(id || "", 10);
  // const dummy = [
  //   ...am7,
  //   ...am10,
  //   ...pm1,
  //   ...pm3,
  //   ...pm6,
  //   ...pm9,
  //   ...pm11,
  //   ...TryEat,
  // ];
  // const product = dummy.find((item) => item.id === productId);
  const info_name = product?.info_name;
  const keep = product?.keep;
  const volume = product?.volume;

  // const [selectedTab, setSelectedTab] = useState(1);
  // const tabContentRef = useRef(null);

  // const handleTabClick = (tab) => {
  //   setSelectedTab(tab);
  //   if (tabContentRef.current) {
  //     const tabContentOffset = tabContentRef.current.offsetTop;
  //     window.scrollTo({
  //       top: tabContentOffset,
  //       behavior: "smooth",
  //     });
  //   }
  // };
  if (!product || product.length === 0) return <div>데이터 로딩 중...</div>;

  return (
    <>
      {/* <DetailTab
        openTab={1}
        selectedTab={selectedTab}
        onTabClick={handleTabClick}
        ref={tabContentRef}
      /> */}
      <style.ProdDetail $show={!!info_name}>
        <div>
          {/* <p> */}
          {product && product?.image_set?.map((item, index) => (
            <div style={{ textAlign: "center" }} key={index}>
              <img src={item} alt="" />
            </div>
          ))}
          {/* </p> */}
          <br></br>
        </div>
        <div className="detail_info">
          <div className="info_container">
            <div className="info_title">
              <span> 상세정보 </span>
            </div>
            <div className="information">
              <table>
                <tbody>
                  <tr>
                    <th>
                      <strong>제품명</strong>
                    </th>
                    <td>
                      <span>{info_name}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <strong>보관방법</strong>
                    </th>
                    <td>
                      <div>
                        <span>{keep}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <strong>용량</strong>
                    </th>
                    <td>
                      <div>
                        <span>{volume}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <strong>소비기한</strong>
                    </th>
                    <td>
                      <div>
                        <span>제조일로부터 12개월(제품별도표기일까지)</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <strong>영양성분</strong>
                    </th>
                    <td>
                      <div>
                        <span>상세페이지 참조</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <strong>원재료명</strong>
                    </th>
                    <td>
                      <div>
                        <span>상세페이지 참조</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <strong>알레르기 정보</strong>
                    </th>
                    <td>
                      <div>
                        <span>상세페이지 참조</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <br></br>
          </div>
        </div>
      </style.ProdDetail>
    </>
  );
}

export default ProdDetail;
