import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import { axiosPost } from "../../../utils/dataFetch"; // 기존에 정의된 토큰 처리용 axios 인스턴스
import './Order.css';

import TopBanner from "../../components/TopBanner/TopBanner";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import * as style from "./CartStyle";

export default function Order() {
    const navigate = useNavigate();
    
    // 상태 관리: 실제 백엔드에서 받아올 주문 내역 배열
    const [orderList, setOrderList] = useState([]);
    const userData = useAuthStore((s) => s.userData);

    // 화면 진입 시 스크롤 최상단 이동
    useEffect(() => {
        window.scroll({ top: 0, behavior: "auto" });
    }, []);

useEffect(() => {
    const fetchOrder = async () => {
        // [디버깅 로그] 현재 userData가 어떻게 들어오는지 실시간 추적
        console.log("현재 체킹중인 전역 userData 상태값:", userData);

        // 아직 유저 데이터 자체가 안 들어왔다면 대기
        if (!userData) return;

        // 구조 분해 할당을 통해 안전하게 mid 추출 시도
        const midValue = userData?.userData?.mid || userData?.mid;

        if (midValue) {
            try {
                console.log("🚀 주문 데이터 호출 조건 만족! mid:", midValue);
                const response = await axiosPost('/carts/order', { "mid": midValue });
                console.log(' 백엔드 응답 성공! 받아온 데이터 ===>', response);
                
                setOrderList(response || []);
            } catch (error) {
                console.error("❌ 주문 테이블 연동 중 백엔드 에러 발생:", error);
            }
        } else {
            console.log("⚠️ userData는 존재하지만 내부에 mid 값이 발견되지 않았습니다.", userData);
        }
    };

    fetchOrder();
}, [userData]); // userData 상태 변경 감지

    return (
        <>
            <TopBanner />
            <Header isAboutHeader={true} />
            
            <style.Cart>
                <div className="title_area" style={{padding:'60px'}}>
                    <h2>주문조회</h2>
                </div>
                <div className="order-cart-container">
                    <table className="order-cart-table">
                        <thead>
                            <tr>
                                <th>주문번호 / 주문날짜</th>
                                <th>상품</th>
                                <th>수량</th>
                                <th>주문금액</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-order">
                                        최근 주문한 내역이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                orderList.map((list, idx) => (
                                    <tr key={idx}>
                                        <td className="order-info">
                                            {/* 주문 번호 */}
                                            <div className="order-number">
                                                {list.oid}
                                            </div>
                                            {/* 주문 날짜 */}
                                            <div className="order-date">
                                                {new Date(list.order_date).toLocaleString('ko-KR')}
                                            </div>
                                        </td>
                                        {/* 상품 정보 */}
                                        <td>
                                            <div className="product-cell">
                                                <img
                                                    src={list.image}
                                                    alt={list.product_name}
                                                    className="product-image"
                                                />
                                                <div className="product-detail">
                                                    <div className="product-name">
                                                        {list.product_name}
                                                    </div>
                                                    <div className="product-option">
                                                        옵션 : {list.option_name || '기본'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* 상품 수량 */}
                                        <td>{list.qty}개</td>
                                        {/* 주문 금액 */}
                                        <td className="order-price">
                                            {Number(list.total_price).toLocaleString()}원
                                        </td>
                                        {/* 배송 상태 */}
                                        <td>
                                            <div className="order-status">
                                                배송완료
                                            </div>
                                            <button className="delivery-btn">
                                                배송조회
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </style.Cart>
            
            <Footer />
        </>
    );
}