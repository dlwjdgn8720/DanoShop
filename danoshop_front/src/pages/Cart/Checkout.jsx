import React, { useState, useEffect, Fragment } from 'react';
import './Checkout.css';
import { useSelector } from 'react-redux';
import useAuthStore from '../../../store/authStore.js';
import { v4 as uuidv4 } from 'uuid';
import QRModal from '../../components/Sub/QRModal.jsx';
import { axiosPost } from '../../../utils/dataFetch.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { cartItemsCheck, updateCartItemsQty, getTotalPrice, cartItemsAddInfo } from "../../../utils/cart";

export default function Checkout() {
  // 1. Redux Store에서 장바구니 상품 및 계산된 금액 가져오기
  const [cartList, setCartList] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const setCartListStore = useAuthStore((s) => s.setCartList);
  const finalPriceValue = useSelector((state) => state.calculatePrice.finalPrice) || 0;
  const navigate = useNavigate();

  const userData = useAuthStore((s) => s.userData);

  // 받는 사람 정보 불러오기 // 5/29 완성 // 카카오로그인이랑 일반 로그인이랑 id 값이 달라서 분기.
  const userId = useAuthStore((s) => s.userData?.mid );
  const userZipcode = useAuthStore((s) =>
    s.userData?.zone_number || '12345'
  );

  // 주문 상품 불러오기
  const cartCount = useAuthStore((s) => s.cartCount);

  // 모달 및 QR URL 상태 관리
  const [qrUrl, setQrUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // 약관 및 결제수단 상태 관리
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [payment, setPayment] = useState('kakao');

  // 배송지 정보 정보 상태 관리
  const [receiver, setReceiver] = useState({
    name: '', 
    phone: '',
    zipcode: '12345', 
    address1: '',
    address2: '', 
    memo: '문앞',
  });

  // 배송비 계산 (Cart.jsx와 동일한 기준 적용: 70,000원)
  const shippingFee = totalPrice >= 50000 ? 0 : 3500;
  // 실제 최종 결제 금액 (총 상품금액 + 배송비)
  const FinalPrice = totalPrice + shippingFee;

  // 화면 진입 시 스크롤 최상단 이동
  useEffect(() => {
    window.scroll({ top: 0, behavior: "auto" });
  }, []);
  
  // 유저 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async() => {
      const info = await axios.get(`http://192.168.7.112:9000/member/userinfo/${userId}`);
      

      setReceiver({
        name: info.data.name,
        phone: info.data.phone,
        address1: info.data.address,
        address2: '',
        memo: '문앞',
      });
    }
    fetchUserInfo();
  }, []);

  // cart DB 연동
  useEffect(() => {
  const fetchProducts = async () => {
    if (!userData?.mid) {
      console.log("mid 없음");
      return;
    }

    try {
      const list = await axiosPost('/carts/list', {
        userData: userData.mid,
      });

      setCartList(list);
      setCartListStore(list);
      console.log('리스트 ===> ', list);

      // 총 금액 계산
      const total = list.reduce((sum, item) => {
        const price = item.price?.replace(/[^0-9]/g, '') || 0
        return sum + price * item.qty;
      }, 0);
      setTotalPrice(total);
    } catch (error) {
      console.error("장바구니 조회 실패", error);
    }
  };
  
  fetchProducts();
}, [userData]);

  // [결제하기] 버튼 클릭 핸들러
  const handlePayment = async () => {
    if (cartList.length === 0) {
      alert('주문할 상품이 장바구니에 없습니다.');
      return;
    }

    if (!terms || !privacy) {
        alert('필수 약관에 모두 동의해야 결제가 가능합니다.');
        return;
      }
      else if (payment === 'naver') {
        alert('네이버페이는 준비중입니다. 카카오페이를 선택해주세요.');
      } else
      
      try {
        // 고유 주문번호 생성 (UUID)
        const orderId = uuidv4();    
        
        // 상품명 표기 포맷팅 (ex: 단백질 쉐이크 외 2건 또는 단품명)
        const itemName = cartList.length > 1 
          ? `${cartList[0].name} 외 ${cartList.length - 1}건` 
          : cartList[0].name; 
        
        // 총 수량 계산
        const totalQuantity = cartList.reduce((sum, item) => sum + (item.quantity || 1), 0);

        // 카카오페이 준비 API 전송 데이터 정의
        const orderData = { 
          orderId, 
          userId, 
          itemName, 
          quantity: totalQuantity, 
          totalAmount: FinalPrice 
        };

        // API 호출
        const result = await axiosPost('/kakao/ready', orderData);
        const { tid, next_redirect_mobile_url } = result;
        
        if (tid) {
          setQrUrl(next_redirect_mobile_url);
          setShowModal(true);

          const interval = setInterval(async () => {
            try {
              const res = await axios.get(
                `http://192.168.7.112:9000/kakao/status?orderId=${orderId}`
              );

              if (res.data.success) {
                clearInterval(interval);

                if (!isPaid) {
                  setIsPaid(true);
                  setShowModal(false);
                  
                  window.location.href = '/success';
                }
              }
            } catch (err) {
              console.log(err);
            }
          }, 2000);
        }
        
      } catch (error) {
        console.error('/kakao/ready :: error -->', error);
        alert('결제 준비 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    };

    // 취소하기 버튼 이벤트
    const clickCancel = () => {
      alert('결제가 취소되었습니다.');
      navigate('/cart');
    }

  
  return (
    <div className="cart-container">
      <h2 className="cart-header">주문/결제</h2>

      {/* 1. 받는 사람 정보 세션 */}
      <div className="section">
        <h2 className="section-title">받는사람 정보</h2>
        <div className="info-box">
          <div className="info-grid">
            <div className="label">이름</div>
            <div className="value">{receiver.name}</div>
            
            <div className="label">배송주소</div>
            <div className="value">{userZipcode} / {receiver.address1} {receiver.address2}</div>
            
            <div className="label">연락처</div>
            <div className="value">{receiver.phone}</div>
            
            <div className="label">배송 요청사항</div>
            <div className="value phone-input">
              <input 
                type='text' 
                defaultValue={receiver.memo} 
                onChange={(e) => setReceiver({ ...receiver, memo: e.target.value })} 
              />
              <button className="btn" onClick={() => alert('수정되었습니다.')}>변경</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 주문 상품 리스트 세션 */}
      <div className="section">
        <h2 className="section-title">주문 상품</h2>
        <div className="info-box">
          <div className="info-grid">
            {cartList && cartList.length > 0 ? (
              cartList.map((item, index) => (
                <Fragment key={item.id || index}>
                  <div className="label">상품 정보</div>
                  <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={item.img || item.image} 
                      alt="product" 
                      style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                    <div>
                      <div><strong>{item.name}</strong></div>
                      <div style={{ fontSize: '1.2rem', color: '#666' }}>
                        옵션: {item.size || item.options || item.option || '기본'} / {item.qty}개
                      </div>
                      <div>{(Number(item.price.replace(/[^0-9]/g, "")) * item.qty).toLocaleString()}원</div>
                    </div>
                  </div>
                </Fragment>
              ))
            ) : (
              <div className="value">주문할 상품이 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. 최종 금액 계산 테이블 세션 */}
      <div className="section">
        <h2>결제 정보</h2>
        <table className="payment-table">
          <tbody>
            <tr>
              <td>총 상품가격</td>
              <td className="price">{totalPrice?.toLocaleString()}원</td>
            </tr>
            {/* <tr>    // 할인 금액 없애기로 함
              <td>총 할인금액</td>
              <td className="discount">-{totalDiscountValue.toLocaleString()}원</td>
            </tr> */}
            <tr>
              <td>배송비</td>
              <td className="price">{shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}</td>
            </tr>
            <tr className="total">
              <td>총 결제금액</td>
              <td className="total-price">{FinalPrice?.toLocaleString()}원
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. 결제 수단 선택 세션 */}
      <div className="section">
        <h2>결제 수단</h2>
        <div className="payment-method">
          <label className="radio-label">
            <input 
              type="radio" 
              name="payment" 
              value="kakao" 
              checked={payment === 'kakao'} 
              onChange={e => setPayment(e.target.value)} 
            /> 카카오페이
          </label>
        </div>
        <div className="payment-method">
          <label className="radio-label">
            <input 
              type="radio" 
              name="payment" 
              value="naver" 
              checked={payment === 'naver'} 
              onChange={e => setPayment(e.target.value)} 
            />
            <p>네이버페이</p>
          </label>
        </div>
      </div>

      {/* 5. 필수 약관 동의 세션 */}
      <div className="terms" style={{marginLeft:'30px'}}>
        <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)} />
        <label htmlFor="terms"> 구매조건 확인 및 결제대행 서비스 약관 동의 (필수)</label><br />
        <input type="checkbox" id="privacy" checked={privacy} onChange={e => setPrivacy(e.target.checked)} />
        <label htmlFor="privacy"> 개인정보 수집 및 이용, 국외 이전 동의 (필수)</label>
      </div>

        <div className='pay-button-top'>
          <button className="pay-button pay-button-pay" onClick={handlePayment}>결제하기</button>
          <button className="pay-button pay-button-cancel" onClick={() => clickCancel()}>취소하기</button>
        </div>

      {/* 6. 카카오페이 결제 QR 모달 오픈 */}
      {showModal && (
        <QRModal 
          qrUrl={qrUrl} 
          amount={FinalPrice} 
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}