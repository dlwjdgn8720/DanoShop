import styled from "styled-components";

export const HeaderWrap = styled.div`
  width: 100%;
  margin: 0 auto;
  background-color: #fff;
  z-index: 9999;
  position: ${(props) => (props.isFixed ? "fixed" : "absolute")};
  top: ${(props) => (props.isFixed ? "-5rem" : "auto")};
  border-bottom: ${(props) =>
    props.isFixed
      ? "1px solid #e8e8e8"
      : props.isAboutHeader
        ? "1px solid #e8e8e8"
        : "1px solid #fff"};
`;

export const Header = styled.div`
  max-width: 1680px;
  width: 92%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 5rem;
  position: relative;
  .top_list {
    display: flex;
  }
  li {
    font-size: 1.3rem;
    margin-left: 1.5rem;
    a {
      color: #666;
      display: flex;
      align-items: center;
    }
    .arrRgt {
      width: 0.6rem;
      height: 0.6rem;
      margin-left: 0.5rem;
      border-left: 0.1rem solid #000;
      border-bottom: 0.1rem solid #000;
      transform: rotate(-135deg);
    }
  }
`;

export const boardList = styled.div`
  position: relative;
  .board_list {
    display: none;
    position: absolute;
    top: 2.2rem;
    right: -3.1rem;
    padding: 0 2rem;
    border: 0.1rem solid #999;
    background: #fff;
  }
  .board_list li {
    margin: 1.5rem 0;
  }
  .board_list a {
    font-size: 1.2rem;
    white-space: nowrap;
  }
`;

export const HeaderBottom = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  height: auto;
  margin-top: 3rem;
`;

export const LogoWrap = styled.div`
  order: 1;
  flex-basis: 50%;
  flex-shrink: 0;
  height: 6rem;
  img {
    max-width: 40rem;
    max-height: 6rem;
  }
`;

export const MypageWrap = styled.div`
  order: 2;
  display: flex;
  position: relative;
  justify-content: flex-end;
  flex-basis: 50%;
  flex-shrink: 0;
  margin-left: auto;
  a {
    position: relative; /* 아이콘을 감싸는 Link 태그에도 fixed/absolute 기준 부여 */
    display: inline-block;
    margin-left: 3rem;
  }

  /* 🔴 장바구니 동그란 배지 스타일 추가 */
  span.header-icons-cart {
    position: absolute;
    top: -5px;     /* 아이콘의 우측 상단으로 올리기 위한 위치 조절 (상황에 맞게 조절) */
    right: -8px;   /* 아이콘의 우측 상단으로 올리기 위한 위치 조절 (상황에 맞게 조절) */
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    min-width: 18px;    /* 글자 수에 상관없이 동그라미 형태 유지를 위한 최소 너비 */
    height: 18px;
    padding: 0 4px;     /* 숫자가 두 자리가 되었을 때 옆으로 이쁘게 늘어나도록 여백 부여 */
    
    background-color: #ff4d4f; /* 배지 배경색 (다노샵 스타일이나 포인트 레드 컬러) */
    color: #ffffff;            /* 글자 색상 (흰색) */
    font-size: 11px;           /* 작은 글씨 크기 */
    font-weight: bold;
    border-radius: 50%;        /* ⚠️ 핵심: 완벽한 동그라미를 만드는 속성 */
    
    line-height: 1;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15); /* 살짝 입체감을 주는 그림자 효과 */
  }
`;

export const BotCategory = styled.div`
  order: 3;
  display: flex;
  width: 100%;
  ul {
    display: flex;
    height: 8rem;
  }
  li {
    padding-right: 5rem;

    &:nth-child(2) {
      a {
        color: orange;
        font-weight: 800;             /* 글씨를 아주 두껍게 */
        text-underline-offset: 0.5rem;/* 밑줄과 글자 간격 띄우기 */
      }
    }
  }
  a {
    font-size: 1.6rem;
    line-height: 7.8rem;
    color: #1a1a1a;
  }
`;
