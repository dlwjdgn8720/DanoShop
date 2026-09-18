import styled from "styled-components";

export const ProdQnA = styled.div`
  padding-top: 0rem;
`;

export const BoardTit = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.4rem;
  h2 {
    font-size: 2rem;
    margin: 0;
  }
  .QnA_btn_wrap {
    a.normal_btn {
      display: inline-block;
      padding: 1rem 2rem;
      font-size: 1.3rem;
      font-weight: 500;
      border: 0.1rem solid #f97316;
      border-radius: 0.4rem;
      text-align: center;
      color: #f97316;
      background-color: #fff;
      transition: background-color 0.15s ease, color 0.15s ease;
      &:hover {
        background-color: #f97316;
        color: #fff;
      }
    }
  }
`;

export const Contents = styled.div`
  font-size: 1.3rem;

  table {
    width: 100%;
    text-align: center;
    border-top: 0.2rem solid #1c1917;

    th {
      padding: 1.5rem 1rem 1.6rem;
      background-color: #f6f6f6;
      height: 2.9rem;
      line-height: 2.2rem;
      font-weight: 600;
    }
    td {
      padding: 1.5rem 1rem 1.6rem;
      border-bottom: 0.1rem solid #e5e5e5;
      height: 2.9rem;
      line-height: 2.2rem;
      vertical-align: middle;
    }
    tr:hover td {
      background-color: #fafaf9;
    }
    .empty-row {
      padding: 4rem 1rem;
      color: #a8a29e;
      text-align: center;
    }
    .subject {
      padding: 0 2rem;
    }
    .left {
      text-align: left;
    }

    .category-badge {
      display: inline-block;
      padding: 0.3rem 0.8rem;
      font-size: 1.1rem;
      color: #57534e;
      background-color: #f5f5f4;
      border-radius: 999px;
    }

    .lock-icon {
      margin-right: 0.6rem;
      font-size: 1.2rem;
      vertical-align: middle;
    }
    .my-post-badge {
      display: inline-block;
      color: #f97316;
      border: 0.1rem solid #f97316;
      font-size: 1rem;
      font-weight: 600;
      padding: 0.1rem 0.5rem;
      border-radius: 0.3rem;
      margin-right: 0.6rem;
      vertical-align: middle;
    }
    .status-badge {
      display: inline-block;
      font-size: 1.05rem;
      font-weight: 700;
      padding: 0.25rem 0.9rem;
      border-radius: 999px;
      margin-right: 0.8rem;
      vertical-align: middle;
      letter-spacing: -0.02rem;
      &.answered {
        color: #15803d;
        background-color: #dcfce7;
      }
      &.waiting {
        color: #92400e;
        background-color: #fef3c7;
      }
    }

    .subject-title {
      cursor: pointer;
      color: #1c1917;
      &:hover {
        text-decoration: underline;
      }
    }

    .row-action {
      margin-left: 1rem;
      font-size: 1.1rem;
      color: #78716c;
      text-decoration: underline;
      cursor: pointer;
      &:hover {
        color: #1c1917;
      }
    }
  }

  .paginate_wrap {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
  }
`;
