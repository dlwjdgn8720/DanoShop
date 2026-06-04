import React from "react";
import * as style from "./ProdTitStyle";
import Product from "./OnSaleProduct.jsx";

function Am7() {
  return (
    <>
      <style.MainCont>
        <style.MainTit>
            <p>망설임은 배송만 늦출 뿐! 한정 수량 SALE</p>
            <p>오늘만 이 가격, 고민하는 순간 솔드아웃! 서둘러 장바구니에 담아보세요.</p>
        </style.MainTit>
        <Product></Product>
      </style.MainCont>
    </>
  );
}

export default Am7;