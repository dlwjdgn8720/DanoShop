import React from "react";
import * as style from "./MainStyle";
import TopBanner from "../../components/TopBanner/TopBanner";
import Header from "../../components/Header/Header";
import Banner from "../../components/Main/Banner";
import OnSale from "../../components/Main/OnSale.jsx"
import OnSaleProduct from "../../components/Main/OnSaleProduct.jsx"
import FirstBenefit from "../../components/Main/FirstBenefit";
import TryEat from "../../components/Main/TryEat";
import BotBanner from "../../components/Main/BotBanner";
import Footer from "../../components/Footer/Footer";

function Sale() {
  window.scroll({ top: 0, behavior: "auto" });

  return (
    <>
      <TopBanner />
      <Header isAboutHeader={false} />
      <style.Main>
        <Banner />
        <OnSale />
        <FirstBenefit />
      </style.Main>
      <Footer />
    </>
  );
}

export default Sale;
