import React from "react";
import * as style from "./MainStyle";
import TopBanner from "../../components/TopBanner/TopBanner";
import Header from "../../components/Header/Header";
import Banner from "../../components/Main/Banner";
import Am7 from "../../components/Main/Am7";
import Am10 from "../../components/Main/Am10";
import FirstBenefit from "../../components/Main/FirstBenefit";
import Pm1 from "../../components/Main/Pm1";
import Pm3 from "../../components/Main/Pm3";
import Pm6 from "../../components/Main/Pm6";
import Pm9 from "../../components/Main/Pm9";
import Pm11 from "../../components/Main/Pm11";
import TryEat from "../../components/Main/TryEat";
import BotBanner from "../../components/Main/BotBanner";
import Footer from "../../components/Footer/Footer";

function HomePage() {
  window.scroll({ top: 0, behavior: "auto" });

  return (
    <>
      <TopBanner />
      <Header isAboutHeader={false} />
      <style.Main>
        <Banner />
        <div id="am7-section"><Am7 /></div>
        <div id="am10-section"><Am10 /></div>
        <FirstBenefit />
        <div id="pm1-section"><Pm1 /></div>
        <div id="pm3-section"><Pm3 /></div>
        <div id="pm6-section"><Pm6 /></div>
        <div id="pm9-section"><Pm9 /></div>
        <div id="pm11-section"><Pm11 /></div>
        <div id="try-section"><TryEat /></div>
        <BotBanner />
      </style.Main>
      <Footer />
    </>
  );
}

export default HomePage;
