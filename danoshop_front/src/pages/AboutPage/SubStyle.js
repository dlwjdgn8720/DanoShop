import styled from "styled-components";

export const Sub = styled.div`
  width: 100%;
  margin: 0 auto;
  margin-top: 22rem;
  position: relative;
`;

export const DetailSec = styled.div`
  max-width: 1420px;
  width: 92%;
  margin: 0 auto 12rem;

  .product-detail-tab {
    width: 100%;
    margin-bottom : 10rem;
    
    .tab-menu {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
      width: 100%;
      border-bottom: 1px solid #dbdbdb; /* 전체를 가로지르는 연한 회색 선 */
      box-sizing: border-box;
    }

    .tab-item {
      flex: 1;                         /* 탭 너비 균등 분할 */
      text-align: center;              /* 텍스트 가운데 정렬 */
      padding: 1.5rem 0;               /* 위아래 여백 */
      font-size: 1.5rem;               /* 글자 크기 */
      color: #777777;                  /* 비활성화 글자 색상 */
      cursor: pointer;
      border-bottom: 1px solid #dbdbdb;
      background-color: #fafafa;       /* 비활성화 배경색 */
      transition: all 0.2s ease;

      &:hover {
        color: #333;
      }

      /* 활성화된 탭 스타일 (.active) */
      &.active {
        color: #000000;
        font-weight: bold;
        background-color: #ffffff;      /* 활성화 탭은 완전 흰색 */
        
        border-top: 1px solid #000000;   /* 위쪽 검은 선 */
        border-left: 1px solid #dbdbdb;  /* 왼쪽 선 */
        border-right: 1px solid #dbdbdb; /* 오른쪽 선 */
        border-bottom: 1px solid #ffffff;/* 아래쪽 선을 흰색으로 덮어 뚫린 효과 */
        
        margin-bottom: -1px;            /* 부모 border와 겹치게 위로 1px 올림 */
      }

      /* 숫자 뱃지 스타일 */
      .count {
        display: inline-block;
        background-color: #8e8e93;      /* 회색 배경 */
        color: #ffffff;                 /* 흰색 글자 */
        font-size: 1.1rem;
        font-weight: normal;
        padding: 0.2rem 0.6rem;
        border-radius: 0.3rem;
        margin-left: 0.5rem;
        vertical-align: middle;
      }
    }
  }
`;

export const Alert404 = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20rem auto;
  text-align: center;
  font-size: 2rem;
  width: 30rem;
  height: 10rem;
  line-height: 3.5rem;
  background-color: #eee;
  border-radius: 1rem;
  border: 1px solid #aaa;
`;

export const AlertWrap = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10000;
  .alert {
    position: fixed;
    top: 50%;
    left: 0;
    right: 0;
    margin: 0 auto;
    padding: 0;
    transform: translateY(calc(-50% + 0.5rem));
    width: 36rem;
    z-index: 1001;
    border: 0.1rem solid #000;
    border-radius: 0;
    background: #fff;
    .content {
      padding: 4.5rem 0 2.5rem;
      text-align: center;
      font-size: 1.3rem;
      line-height: 2.2rem;
      min-height: 9rem;
      p {
        font-weight: bold;
        color: #2e2e2e;
      }
    }
    .submit_btn {
      margin: 2rem 0;
      text-align: center;
      button {
        height: 5rem;
        padding: 0 1rem;
        line-height: 5rem;
        font-size: 1.4rem;
      }
      button + button {
        margin-left: 0.8rem;
      }
      .continue {
        border: 0.1rem solid #d6d6d6;
      }
      .cart {
        background: #1a1a1a;
        color: #fff;
      }
    }
    .close_btn {
      position: absolute;
      right: 0.7rem;
      top: 2rem;
      padding: 1rem;
      cursor: pointer;
      display: block;
      width: 2rem;
      height: 2rem;
      font-size: 0.1rem;
      line-height: 0;
      color: transparent;
      white-space: nowrap;
      transform: rotate(45deg);
      &::before {
        content: "";
        position: absolute;
        top: 0;
        right: 1rem;
        width: 0.1rem;
        height: 2.1rem;
        margin: 1rem 1rem 0 0;
        background: #000;
        transition: 0.3s ease-out;
      }
      &::after {
        content: "";
        position: absolute;
        top: 1rem;
        right: 0;
        width: 2.1rem;
        height: 0.1rem;
        margin: 1rem 1rem 0 0;
        background: #000;
        transition: 0.3s ease-out;
      }
    }
  }
`;
