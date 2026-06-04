import React from "react";
import * as style from "./ProductStyle";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { axiosGet, axiosPost } from "../../../utils/dataFetch.js";

function Product() {
  const category = '3pm';
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axiosPost('/product/show', { category });
        setProductList(response.result || []);
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    };
    getProducts();
  }, []);

  return (
    <>
      <style.MainProdList $small={true}>
        <ul className="prod_list">
          {productList.map((item, index) => (
            <li className="product" key={index}>
              <style.MainProd $sale={!!item.sticker}>
                <div className="prod_thumb">
                  <Link to={`detail/${item.pid}`}>
                    <img src={item.image} alt="" />
                  </Link>
                  <div className="icon_box">
                    <span>WISH</span>
                    <span>ADD</span>
                    <span>OPTION</span>
                  </div>
                  <span
                    className="sale_sticker"
                    style={{ opacity: item.sticker ? 1 : 0 }}
                  >
                    {item.sticker}
                  </span>
                </div>
                <div className="prod_desc">
                  <div className="name">
                    <Link to={`detail/${item.pid}`}>{item.name}</Link>
                  </div>
                  <ul>
                    <li className="composition">
                      <strong>구성 : </strong>
                      <span>{item.composition}</span>
                    </li>
                    <li className="price">
                      <span>{item.price}</span>
                    </li>
                    <li className="sale_price">
                      <span>{item.sale_price}</span>
                    </li>
                  </ul>
                </div>
              </style.MainProd>
            </li>
          ))}
        </ul>
      </style.MainProdList>
    </>
  );
}

export default Product;
