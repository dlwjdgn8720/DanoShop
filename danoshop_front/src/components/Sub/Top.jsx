import React, { useState, useEffect } from "react";
import useAuthStore from "../../../store/authStore.js";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItem, addSelectedOption, removeSelectedOption } from "../../store";
import { axiosGet, axiosPost } from "../../../utils/dataFetch.js";
import * as style from "./TopStyle";

// import am7 from "../../data/product/7am.json";
// import am10 from "../../data/product/10am.json";
// import pm1 from "../../data/product/1pm.json";
// import pm3 from "../../data/product/3pm.json";
// import pm6 from "../../data/product/6pm.json";
// import pm9 from "../../data/product/9pm.json";
// import pm11 from "../../data/product/11pm.json";
// import TryEat from "../../data/product/TryEat.json";

function Top({ product }) {
  const { id } = useParams();
  const [productOptions, setProductOptions] = useState([]);
  const [productFull, setProductFull] = useState([]);

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
  useEffect(() => {
    const getProductOption = async () => {
      try {
        const response = await axiosPost(`/product/option/${id}`, {});
        setProductFull(response?.result);
        setProductOptions(response?.result.map(item => item.option));
      } catch (error) {
        console.error("데이터(detail) 가져오기 실패:", error);
      }
    };
    getProductOption();

  }, []);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [optionQuantities, setOptionQuantities] = useState([]);

  // 선택한 옵션 데이터 만들기
  const handleProductSelect = (e) => {
    const selectedValue = e.target.value;


    if (selectedValue === "") {
      // 옵션 선택이 해제된 경우 선택목록에서 제거
      setSelectedOptions(
        selectedOptions.filter((option) => option !== selectedValue)
      );
      dispatch(removeSelectedOption(selectedValue));

      const updatedOptionQuantities = optionQuantities.filter(
        (entry) => entry.option !== selectedValue
      );
      setOptionQuantities(updatedOptionQuantities);
    } else {
      // 이미 선택한 옵션이 아니면 추가
      if (!selectedOptions.includes(selectedValue)) {
        setSelectedOptions([...selectedOptions, selectedValue]);
        dispatch(addSelectedOption(selectedValue));

        // 옵션 수량을 객체로 만들어 배열에 추가
        const optionQuantityEntry = {
          option: selectedValue,
          quantity:
            optionQuantities.find((entry) => entry.option === selectedValue)
              ?.quantity || 1,
        };
        setOptionQuantities([...optionQuantities, optionQuantityEntry]);
      } else {
        alert("이미 선택한 옵션입니다.");
      }
    }
  };

  // 옵션별 삭제 기능
  const handleProductDelete = (selectedOption) => {
    setSelectedOptions(
      selectedOptions.filter((option) => option !== selectedOption)
    );
    const updatedOptionQuantities = optionQuantities.filter(
      (entry) => entry.option !== selectedOption
    );
    setOptionQuantities(updatedOptionQuantities);
  };

  // 옵션별 수량 변경
  const handleQuantityChange = (
    newQuantity,
    selectedOption
  ) => {
    if (!selectedOption) {
      // 선택된 옵션이 없을 경우 처리
      return;
    }
    const updatedOptionQuantities = optionQuantities.map((entry) => {
      if (entry.option === selectedOption) {
        entry.quantity = newQuantity;
      }
      return entry;
    });
    setOptionQuantities(updatedOptionQuantities);
  };

  // 옵션별 원래 가격
  function getPriceForOption(productFull, optionName) {


    const selectedOption = productFull?.find(
      (product) => product.option === optionName
    );
    if (selectedOption) {
      const priceWithoutCommas = selectedOption.option_price.replace(/,/g, "");
      return parseInt(priceWithoutCommas);
    }

    return 0;
  }
  // 옵션별 원래 가격 * 수량
  const optionTotalPrice = (option) => {
    const optionQuantityEntry = optionQuantities.find(
      (entry) => entry.option === option
    );
    if (optionQuantityEntry) {
      const optionPrice = getPriceForOption(productFull, option);
      return optionPrice * optionQuantityEntry.quantity;
    }
    return 0;
  };

  // 옵션별 할인 가격을 저장하는 객체
  const optionPrices = {};
  productFull.forEach(product => {
    const priceWithoutWon = product.option_sale_price || product.option_price;
    const optionPrice = parseInt(priceWithoutWon.replace(/,/g, ""));
    optionPrices[product.option] = optionPrice;
  });
  // 옵션별 할인 가격 * 수량
  const calculateSubTotal = (option) => {
    const optionQuantityEntry = optionQuantities.find(
      (entry) => entry.option === option
    );
    if (optionQuantityEntry) {
      const optionPrice = optionPrices[option];

      return optionPrice * optionQuantityEntry.quantity;
    }
    return 0;
  };

  // 총 수량
  const totalQuantity = optionQuantities.reduce(
    (total, entry) => total + entry.quantity,
    0
  );

  // 총 가격
  const totalPrice = selectedOptions.reduce((total, option) => {
    const subTotal = calculateSubTotal(option);
    return total + subTotal;
  }, 0);

  let dispatch = useDispatch();

  const item = useSelector((state) => state.detail); // Redux 스토어에서 제품 세부 정보 가져오기

  // 장바구니로 보내기
  async function SendToCart(actionType) {
    try {
      // 1. Zustand 스토어에서 로그인한 유저의 mid 값 추출
      const midValue = useAuthStore.getState().accessToken
        ? useAuthStore.getState().userData?.mid
        : null;

      if (!midValue) {
        alert("로그인이 필요한 서비스입니다.");
        return;
      }

      // 2. 선택된 옵션 리스트(selectedOptions)를 순회하며 총 수량 합산 계산
      const totalQty = selectedOptions.reduce((sum, option) => {
        const optionQuantityEntry = optionQuantities.find((entry) => entry.option === option);
        return sum + (optionQuantityEntry ? optionQuantityEntry.quantity : 0);
      }, 0);

      // 수량 유효성 체크
      if (!selectedOptions[0]) {
        alert("상품 수량을 1개 이상 선택해 주세요.");
        return;
      }

      // 3. 백엔드 carts/add 명세(컨트롤러&리포지토리)와 100% 일치하는 단일 페이로드 구성
      /*
      const cartItem = {
        pid: product?.pid || product?.id, // 상품 마스터 ID (외래키 조건 만족 필수)
        qty: totalQty,                    // 선택한 총 수량
        userData: midValue                // 백엔드 컨트롤러에서 mid로 정제될 유저 아이디
      };
      */
        // 선택한 옵션명
        console.log("selectedOptions", selectedOptions);
        console.log("productFull", productFull);
        
        const selectedOption = selectedOptions[0];

        // 옵션 정보 찾기
        const optionInfo = productFull.find(
          item => item.option === selectedOption
        );

        

        // 서버 전송 객체
        const cartItem = optionQuantities.map( option => {
          const matchedItem = productFull?.find (item =>  item.option == option.option );
          const selectedPoid = matchedItem ? matchedItem.poid : undefined;

          return { "pid": product?.pid || product?.id,
            "poid" : selectedPoid,
            "qty" : option.quantity,
            "userData" : midValue };
        })
        // {
        //   pid: product?.pid || product?.id,
        //   poid: optionInfo?.poid,
        //   qty: totalQty,
        //   userData: midValue
        // };

        console.log("장바구니 전송 데이터:", cartItem);

      // 4. 디버깅 및 전송 확인을 위한 콘솔 로그 (요청 전 상태 확인)
      console.log("장바구니 서버 전송 데이터 객체:", cartItem);

      // 5. 서버 API 호출 (리덕스 dispatch 대신 백엔드 AWS DB에 직접 데이터 반영)
      const response = await axiosPost("/carts/add", cartItem);

      if (response && response.isAdd) {
        // alert("장바구니에 상품이 정상적으로 담겼습니다!");

        // 6. 성공 로그 출력 및 필요 시 장바구니 페이지로 이동
        console.log("서버 DB 반영 완료 상태 반환값:", response);
        // navigate("/cart"); // 장바구니 페이지 동선 이동 시 주석 해제
      } else {
        alert("장바구니 담기에 실패했습니다. 다시 시도해 주세요.");
      }

      if(actionType==='buy') movePage("/Cart");

    } catch (error) {
      console.error("SendToCart 실행 중 통신 에러 발생:", error);
      alert("장바구니 등록 중 네트워크 오류가 발생했습니다.");
    }
  }
  // function SendToCart(item) {
  //   const cartItems = selectedOptions.map((option) => {
  //     const optionQuantityEntry = optionQuantities.find(
  //       (entry) => entry.option === option
  //     );
  //     const quantity = optionQuantityEntry ? optionQuantityEntry.quantity : 0;

  //     // option을 찾아서 해당 option의 price 및 sale_price에 접근
  //     const selectedProduct = productFull.find(
  //       (selectOption) => selectOption.option === option
  //     );

  //     const price = selectedProduct ? selectedProduct.price : "";
  //     const salePrice = selectedProduct ? selectedProduct.sale_price : "";

  //     const subTotal = calculateSubTotal(option); // 옵션별 총 금액

  //     return {
  //       id: product?.id,
  //       img: product?.image,
  //       name: product?.name,
  //       price: price,
  //       sale_price: salePrice,
  //       option: option,
  //       quantity: quantity, // 수량정보 수정 필요
  //       subTotal: subTotal,
  //       options: selectedOptions, // 옵션정보 수정 필요
  //     };
  //   });

  //   // cartItems를 개별로 dispatch
  //   cartItems.forEach((cartItem) => {
  //     dispatch(addItem([cartItem]));
  //     console.log(cartItem);
  //   });
  // }

  const [CartAlert, setCartAlert] = useState(false);
  function activeCartAlert() {
    selectedOptions[0]? setCartAlert(!CartAlert) : alert('상품 옵션을 선택해주세요');
  }

  const movePage = useNavigate();
  function goCart() {
    selectedOptions[0] ? movePage("/Cart") : alert('상품 수량을 1개 이상 선택해 주세요.');
  }

  // console.log("옵션", selectedOptions);
  // console.log("선택옵션", optionQuantities);

  return (
    <>
      <style.HeadCategory>
        <ol>
          <li>
            <Link to="/">홈</Link>
          </li>
          <li>
            <Link to="#">다노절 이벤트</Link>
          </li>
        </ol>
      </style.HeadCategory>
      <style.SubTop>
        <style.DetailArea>
          <style.ImgArea>
            <div className="prod_img">
              <Link to="#">
                <img src={product?.product_imgb} alt="" />
              </Link>
            </div>
            <div className="list_img">
              <ul>
                <li>
                  <img src={product?.product_imgs} alt="" />
                </li>
              </ul>
            </div>
          </style.ImgArea>
          <style.InfoArea sale={!!product?.discount}>
            <div className="heading_area">
              <h1>{product?.name}</h1>
            </div>
            <table className="sale_info">
              <tbody>
                <tr>
                  <th>
                    <span>상품요약정보</span>
                  </th>
                  <td>
                    <span>{product?.summary_info}</span>
                  </td>
                </tr>
                <tr>
                  <th>
                    <span className="price">판매가</span>
                  </th>
                  <td>
                    <span className="price">
                      <strong>{product?.price}</strong>
                    </span>
                  </td>
                </tr>
                <tr className="sale">
                  <th>
                    <span className="sale_price">할인판매가</span>
                  </th>
                  <td>
                    <span className="sale_price">
                      {product?.sale_price}
                      <span className="percent">
                        {product?.discount}
                      </span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>
                    <span style={{ fontSize: "1.2rem", color: "#000" }}>
                      구성
                    </span>
                  </th>
                  <td>
                    <span style={{ fontSize: "1.2rem", color: "#000" }}>
                      {product?.composition}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>
                    <span>배송방법</span>
                  </th>
                  <td>
                    <span>택배</span>
                  </td>
                </tr>
                <tr>
                  <th>
                    <span>배송비</span>
                  </th>
                  <td>
                    <span>
                      <strong>3,500원</strong> (50,000원 이상 구매 시 무료)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="option">
              <tbody>
                <tr>
                  <th>옵션</th>
                  <td>
                    <select name="" id="" onChange={handleProductSelect}>
                      <option value="">- [필수] 옵션을 선택해 주세요 -</option>
                      <option value="">-------------------</option>
                      {productOptions.map((item, index) => (
                        <option key={index}>{item}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="guide_area">
              <p className="info ">(최소주문수량 1개 이상)</p>
            </div>
            {selectedOptions.map((selectedOption, index) => (
              <div className="total_products" key={index}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <p className="product">
                          {product?.name}
                          <br></br> - <span>{selectedOption}</span>
                        </p>
                      </td>
                      <td>
                        <span className="quantity">
                          <input
                            type="number"
                            value={
                              optionQuantities.find(
                                (entry) => entry.option === selectedOption
                              )?.quantity || 0
                            }
                            onChange={(e) =>
                              handleQuantityChange(
                                parseInt(e.target.value),
                                selectedOption
                              )
                            }
                          />
                          <button
                            className="up"
                            onClick={() => {
                              const currentQuantity =
                                optionQuantities.find(
                                  (entry) => entry.option === selectedOption
                                )?.quantity || 0;
                              handleQuantityChange(
                                currentQuantity + 1,
                                selectedOption
                              );
                            }}
                          >
                            +
                          </button>
                          <button
                            className="down"
                            onClick={() => {
                              const currentQuantity =
                                optionQuantities.find(
                                  (entry) => entry.option === selectedOption
                                )?.quantity || 0;
                              handleQuantityChange(
                                Math.max(currentQuantity - 1, 1),
                                selectedOption
                              );
                            }}
                          >
                            -
                          </button>
                        </span>
                        <button
                          className="delete"
                          onClick={() => handleProductDelete(selectedOption)}
                        >
                          <img
                            src="https://he0o0nje.github.io/Danoshop-clone-ts/img/icon/ico_product_delete.svg"
                            alt=""
                          />
                        </button>
                      </td>
                      <td>
                        <span className="right">
                          <span>{optionTotalPrice(selectedOption)} 원</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
            <div className="total_price">
              <strong className="title">
                TOTAL <span className="qty">(QUANTITY)</span>
              </strong>
              <span className="total">
                <strong>
                  <em>{totalPrice}원</em>
                </strong>{" "}
                ({totalQuantity}개)
              </span>
            </div>
            <div className="delivery_info">
              <div className="title">배송정보</div>
              <div className="info_value">
                <p className="type">다노배송(새벽/택배)</p>
                <p className="value">
                  새벽배송 : <span className="highlight">오후 5시</span>까지
                  결제 시 <span className="highlight">내일 오전 7시 전</span>{" "}
                  도착
                </p>
                <p className="value">
                  택배배송 : <span className="highlight">오후 5시</span>까지
                  결제 시 <span className="highlight">오늘</span> 출고
                </p>
              </div>
            </div>
            <div className="action_btn_wrap">
              <div className="action_btn">
                <button
                  className="btn_submit sizeL"
                  onClick={() => {
                    SendToCart('buy');
                    {/**goCart(); */ }
                  }}
                >
                  구매하기
                </button>
                <button
                  className="btn_normal sizeL action_cart"
                  onClick={() => {
                    SendToCart();
                    activeCartAlert();
                  }}
                >
                  장바구니
                </button>
                <button
                  className="btn_normal sizeL action_wish"
                  onClick={() => SendToCart(item)} // 테스트
                >
                  관심상품
                </button>
              </div>
              <style.NaverButton>
                <div className="npay_store">
                  <div className="npay_btn_box">
                    <div className="npay_btn">
                      <div className="npay_txt">
                        <span className="npay_blind"></span>
                      </div>
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              <Link to="#" className="npay_btn_pay">
                                -
                              </Link>
                            </td>
                            <td>
                              <Link to="#" className="npay_btn_zzim">
                                -
                              </Link>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="npay_event">
                      <p>
                        <strong>현장결제</strong>
                        <Link to="#">결제할 때 마다, 월 50번 포인트 뽑기!</Link>
                      </p>
                      <Link to="#" className="npay_more prev">
                        -
                      </Link>
                      <Link to="#" className="npay_more next">
                        -
                      </Link>
                    </div>
                  </div>
                </div>
              </style.NaverButton>
            </div>
          </style.InfoArea>
        </style.DetailArea>
      </style.SubTop>
      {CartAlert && (
        <style.AlertWrap>
          <div className="alert">
            <div className="content">
              <p>
                장바구니에 상품이<br></br>정상적으로 담겼습니다.
              </p>
            </div>
            <div className="submit_btn">
              <button className="continue" onClick={activeCartAlert}>
                계속 쇼핑하기
              </button>
              <Link to="/cart" className="cart">
                장바구니 이동
              </Link>
            </div>
            <button className="close_btn" onClick={activeCartAlert}>
              닫기
            </button>
          </div>
        </style.AlertWrap>
      )}
    </>
  );
}

export default Top;
