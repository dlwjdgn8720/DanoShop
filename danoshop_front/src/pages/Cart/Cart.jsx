import { React, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { RiDeleteBin6Line } from 'react-icons/ri';
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
// import { cartItemsCheck, updateCartItemsQty, getTotalPrice, cartItemsAddInfo } from "../../../utils/cart";
import { axiosPost, axiosPut, axiosDelete } from "../../../utils/dataFetch";
import TopBanner from "../../components/TopBanner/TopBanner";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import * as style from "./CartStyle";
import { NaverButton } from "../../components/Sub/TopStyle";

export default function Cart() {
  const navigate = useNavigate();

  // Store 상태 가져오기
  const [cartList, setCartList] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isUpdate, setIsUpdate] = useState(false);
  const cartItems = useAuthStore((s) => s.cartItems);
  const setCartCount = useAuthStore((s) => s.setCartCount);
  const setIsUpdateFlag = useAuthStore((s) => s.setIsUpdateFlag);
  const userData = useAuthStore((s) => s.userData);
  const setCartListStore = useAuthStore((s) => s.setCartList);

  // 로컬 UI 상태 관리
  const [selectedItems, setSelectedItems] = useState([]);
  const [showContents, setShowContents] = useState(true);

  // 배송비 계산 (기준: 70,000원)
  const shippingFee = Number(totalPrice) >= 50000 ? 0 : 3500;

  // 화면 진입 시 스크롤 최상단 이동
  useEffect(() => {
    window.scroll({ top: 0, behavior: "auto" });
  }, []);

  // cart DB 연동
  useEffect(() => {
    const fetchProducts = async () => {
      // console.log("midValue", userData.mid);
      if (userData && userData && userData.mid) {
        const midValue = userData?.mid

        if (midValue) {
          // console.log("midValue: ", midValue);

          const list = await axiosPost('/carts/list', { "userData": midValue });
          console.log("cartlist: ", list);

          setCartList(list);
          setCartListStore(list);

          if (list && list.length > 0) {
            setTotalPrice(list[0].total_price);
          }
        } else {
          console.log("아직 mid 값이 준비되지 않았습니다. 현재 상태:", userData);
        }
      } else {
        console.log("유저 정보(userData)를 아직 불러오지 못했거나 로그아웃 상태입니다.");
        setCartList([]);
        setTotalPrice(0);
      }
    };

    fetchProducts();
  }, [isUpdate]);

  const handleUpdateQty = async (cid, type) => {
    // 1. 현재 클릭한 아이템의 정보를 장바구니 리스트에서 검색.
    const currentItem = cartList.find((item) => item.cid === cid);

    // 2. 만약 현재 수량이 1개인데 사용자가 마이너스(-) 버튼을 눌렀다면 삭제 프로세스를 진행.
    if (currentItem && currentItem.qty === 1 && type === '-') {
      const isDeleteConfirm = window.confirm("상품을 장바구니에서 삭제하시겠습니까?");

      if (isDeleteConfirm) {
        const result = await axiosDelete("/carts/del", { cid });
        if (result.isDelete) {
          setIsUpdate(!isUpdate);     // 장바구니 리스트 재호출
          setIsUpdateFlag();         // 헤더 장바구니 카운트 재호출
        }
      }
      return; // 수량 변경 API가 호출되지 않도록 여기서 함수를 완전히 종료.
    }

    // 3. 수량이 2개 이상이거나 플러스(+) 버튼을 누른 정상적인 경우는 기존 수량 변경 API를 호출.
    const result = await axiosPut("/carts/qty", { cid, type });  //{cid:cid, ..}
    if (result.isUpdate) {
      setIsUpdate(!isUpdate);  //장바구니 리스트 재호출
      setIsUpdateFlag();      //장바구니 카운트 재호출 -> useAuthStore -> Header
    }
  };

  // [체크박스] 전체 선택 / 해제
  const handleAllCheck = () => {
    if (selectedItems.length === cartList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartList.map(item => item.cid));
    }
  };

  // [체크박스] 단일 선택 / 해제
  const handleSingleCheck = (cid) => {
    if (selectedItems.includes(cid)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== cid));
    } else {
      setSelectedItems([...selectedItems, cid]);
    }
  };

  // [삭제] 선택 항목 삭제
  const handleDeleteSelected = async (targetCid) => {
    // 1. targetCid가 배열인지 단일 문자열/숫자인지 판별하여 일관된 배열 형태로 정제.
    const cidsToDelete = Array.isArray(targetCid) ? targetCid : [targetCid];

    // 2. 삭제할 대상이 없는 경우 방어 코드 추가
    if (cidsToDelete.length === 0) {
      alert("삭제할 상품을 선택해 주세요.");
      return;
    }

    // 3. 사용자 확인 컨펌창
    const isConfirm = window.confirm(`선택한 ${cidsToDelete.length}개의 상품을 장바구니에서 삭제하시겠습니까?`);
    if (!isConfirm) return;

    try {
      // 4. Promise.all을 활용해 선택된 모든 cid 항목을 백엔드 DB에서 병렬로 안전하게 삭제 처리
      const deletePromises = cidsToDelete.map((cid) => axiosDelete("/carts/del", { cid }));
      await Promise.all(deletePromises);

      // 5. 성공 후 상태 초기화 및 화면 갱신
      alert("선택한 상품이 장바구니에서 삭제되었습니다.");
      setSelectedItems([]);
      setIsUpdate(!isUpdate);
      setIsUpdateFlag();

    } catch (error) {
      console.error("선택삭제 도중 오류 발생:", error);
      alert("일부 상품을 삭제하지 못했습니다. 다시 시도해 주세요.");
    }
  };

  // [할인율 계산] 문자열 파싱 예외 처리 포함
  const getDiscountAmount = (product) => {
    if (!product.sale_price) return 0;
    const original = parseInt(product.price?.toString().replace(/[^0-9]/g, "")) || 0;
    const sale = parseInt(product.sale_price?.toString().replace(/[^0-9]/g, "")) || 0;
    return original - sale;
  };

  // 배송비 계산 (서버에서 계산된 totalPrice 기준: 50,000원 이상 무료)
  const calculatedShippingFee = Number(totalPrice) >= 50000 ? 0 : 3500;
  const finalPaymentPrice = Number(totalPrice) + Number(calculatedShippingFee);

  return (
    <>
      <TopBanner />
      <Header isAboutHeader={true} />

      <style.Cart>
        {/* 네비게이션 경로 & 타이틀 */}
        <div className="section_path">
          <ol>
            <li><Link to="/">홈</Link></li>
            <li><strong>장바구니</strong></li>
          </ol>
        </div>

        <div className="title_area">
          <h2>장바구니</h2>
        </div>

        <div className="step_area">
          <ol className="step">
            <li className="selected">1. 장바구니</li>
            <li>2. 주문서작성</li>
            <li>3. 주문완료</li>
          </ol>
        </div>

        {/* 장바구니 컨텐츠 메인 */}
        <style.CartContainer>
          {cartList.length === 0 ? (
            <style.NoneCart>
              <img src="https://he0o0nje.github.io/Danoshop-clone-ts/img/icon/none_cart.svg" alt="Empty Cart" />
              <p>장바구니가 비어 있습니다.</p>
            </style.NoneCart>
          ) : (
            <div className="cart">
              {/* 왼쪽: 상품 리스트 영역 */}
              <div className="cart_prod">
                <div className="inner">
                  <style.Title $showContents={showContents} onClick={() => setShowContents(!showContents)}>
                    <h3>장바구니 상품</h3>
                  </style.Title>

                  {showContents && (
                    <div className="contents">
                      <div className="sub_title">일반상품({cartList.length})</div>

                      {cartList.map((item, index) => (
                        <div className="order_list" key={item.cid || index}>
                          <div className="prod_box">
                            <input
                              type="checkbox"
                              className="check"
                              checked={selectedItems.includes(item.cid)}
                              onChange={() => handleSingleCheck(item.cid)}
                            />

                            <div className="thumbnail">
                              <Link to={`/detail/${item.pid || item.id}`}>
                                <img src={item.image || item.img} alt={item.name} />
                              </Link>
                            </div>

                            <div className="description">
                              <strong>
                                <Link to={`/detail/${item.pid || item.id}`} className="name">{item.name}</Link>
                              </strong>
                              <ul className="price">
                                <li><strong>{item.price?.toString().replace(/원/, "")}</strong>원</li>
                                {item.sale_price && (
                                  <li>
                                    <span className="discount">-{getDiscountAmount(item).toLocaleString()}</span>원
                                  </li>
                                )}
                              </ul>
                              <ul className="delivery_info">
                                <li>배송 : <span>3,500원</span> [조건] / 기본배송</li>
                              </ul>
                            </div>

                            <ul className="option_grp">
                              <li><span>[옵션: {item.size || item.options || item.option || "기본"}]</span></li>
                            </ul>

                            <div className="quantity">
                              <span className="label">수량</span>
                              <div>
                                <span className="change_btn">
                                  <input type="text" value={item.qty} readOnly />
                                  <button className="up" onClick={() => handleUpdateQty(item.cid, '+')}>+</button>
                                  <button className="down" onClick={() => handleUpdateQty(item.cid, '-')}>-</button>
                                </span>
                                <button className="modify">변경</button>
                              </div>
                            </div>

                            <div className="sum_price">
                              <span className="label">주문금액</span>
                              {/* 개별 아이템 총액: 가격 * 수량 */}
                              <strong>{((parseInt(item.price?.toString().replace(/[^0-9]/g, "")) || 0) * item.qty).toLocaleString()}</strong>원
                            </div>

                            <div className="btn_group">
                              <button>관심상품</button>
                              <button>주문하기</button>
                            </div>
                          </div>

                          {/* DB 연동 삭제 함수 호출 */}
                          <button className="delete_btn" onClick={() => handleDeleteSelected(item.cid)}>삭제</button>
                        </div>
                      ))}

                      {/* 하단 기본 배송 요약 리스트 */}
                      <div className="summary">
                        <div className="title"><h5>[기본배송]</h5></div>
                        <div className="contents">
                          상품구매금액 <strong>{Number(totalPrice || 0)?.toLocaleString()}</strong>원 +
                          배송비 <strong>{calculatedShippingFee === 0 ? "0 (무료)" : `${calculatedShippingFee.toLocaleString()}원`}</strong>
                        </div>
                        <span className="total">합계 : <strong>{finalPaymentPrice.toLocaleString()}</strong>원</span>
                      </div>

                      <div className="base_btn">
                        <button onClick={handleAllCheck}>
                          {selectedItems.length === cartList.length ? "전체해제" : "전체선택"}
                        </button>
                        <button onClick={() => handleDeleteSelected(selectedItems)}>선택삭제</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 최종 결제 정보 우측 사이드바 영역 */}
              <div className="cart_total">
                <div className="total_summary">
                  <div className="summary_item">
                    <div className="heading">
                      <h4 className="title">총 상품금액</h4>
                      <div className="data"><strong>{Number(totalPrice || 0)?.toLocaleString()}</strong>원</div>
                    </div>
                  </div>

                  <div className="shipping">
                    <div className="heading">
                      <h4 className="title">총 배송비</h4>
                      <div className="data"><strong>{calculatedShippingFee.toLocaleString()}</strong>원</div>
                    </div>
                  </div>

                  <div className="total">
                    <h3 className="title">결제예정금액</h3>
                    <div className="payment_price"><strong>{finalPaymentPrice.toLocaleString()}</strong>원</div>
                  </div>
                </div>

                <div className="order_item">
                  <div className="order_btn">
                    {/* 주문하기 버튼 클릭 시 필요한 데이터를 주소 창 상태(State)로 전송 */}
                    <button className="all" onClick={() => navigate('/checkout', { state: { orderList: cartList, totalPrice } })}>전체상품주문</button>
                    <button className="select" onClick={() => navigate('/checkout', { state: { orderList: cartList.filter(item => selectedItems.includes(item.cid)), totalPrice } })}>선택상품주문</button>
                  </div>

                  {/* 네이버 페이 버튼 */}
                  <NaverButton>
                    <div className="npay_store" style={{ width: "66%" }}>
                      <div className="npay_btn_box">
                        <div className="npay_btn">
                          <table>
                            <tbody>
                              <tr>
                                <td><Link to="#" className="npay_btn_pay" style={{ width: "14rem" }}>-</Link></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="npay_event">
                          <p>
                            <strong>현장결제</strong>
                            <Link to="#">결제할 때 마다, 월 50번 포인트 뽑기!</Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  </NaverButton>
                </div>
              </div>
            </div>
          )}
        </style.CartContainer>

        {/* 하단 장바구니 이용안내 */}
        <style.Help>
          <h3>이용안내</h3>
          <div className="inner">
            <h4>장바구니 이용안내</h4>
            <ul>
              <li>선택하신 상품의 수량을 변경하시려면 수량변경 후 [변경] 버튼을 누르시면 됩니다.</li>
              <li>[쇼핑계속하기] 버튼을 누르시면 쇼핑을 계속 하실 수 있습니다.</li>
            </ul>
            <h4>무이자할부 이용안내</h4>
            <ul>
              <li>상품별 무이자할부 혜택을 받으시려면 무이자할부 상품만 선택하여 [주문하기] 버튼을 눌러 결제하시면 됩니다.</li>
            </ul>
          </div>
        </style.Help>
      </style.Cart>

      <Footer />
    </>
  );
}