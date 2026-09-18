import * as style from "./ProdQnAStyle";
import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { axiosGet, axiosPost, axiosPut, axiosDelete } from "../../../utils/dataFetch.js";
import useAuthStore from "../../../store/authStore.js";
import QnaForm from "./QnaForm.jsx";

// rc-pagination 패키지 및 기본 스타일 import
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import '../../../css/qna.css';

function ProdQnA() {

  // 'list' : Q&A 목록 화면
  // 'write' : 글쓰기 폼
  // 'edit' : 수정 폼
  // 'detail' : 상세 보기 폼
  // 'reply' : 관리자 답변 작성 폼

  const [viewMode, setViewMode] = useState('list');
  const [selectedPost, setSelectedPost] = useState(null); // 수정/상세에 사용할 선택된 글 데이터

  // 페이징 처리를 위한 현재 페이지 상태
  // --- 상태 관리 (State) ---
  const [qnaList, setQnaList] = useState([]);       // 서버에서 받아온 Q&A 목록
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (1부터 시작)
  const [totalCount, setTotalCount] = useState(0);   // 전체 게시글 개수 (서버에서 받아옴)
  const [loading, setLoading] = useState(false);     // 로딩 상태
  const [submitting, setSubmitting] = useState(false); // 등록/수정/답변 처리 중 중복 클릭 방지

  const pageSize = 10; // 페이지당 보여줄 게시글 수
  const { id } = useParams(); //상품 아이디 가져오기
  const currentUserId = useAuthStore((s) => s.userData?.mid);
  const writer = useAuthStore((s) => s.userData?.name);

  // 1. fetchQnaData 함수를 useEffect 밖으로 추출
  const fetchQnaData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await axiosGet(
        `/qna/paging?id=${id}&page=${currentPage}&size=${pageSize}&mid=${currentUserId || ''}`
      );
      setQnaList(data.content || []); // 게시글 배열 저장
      setTotalCount(data.totalElements || 0); // 전체 게시글 수 저장
    } catch (error) {
      console.error("Q&A 데이터를 불러오는 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, id, currentUserId]); // 함수가 참조하는 외부 변수들을 의존성 배열에 등록

  // 2. 페이지가 바뀌거나 함수가 갱신될 때 자동으로 호출하는 useEffect
  useEffect(() => {
    fetchQnaData();
  }, [fetchQnaData]); // fetchQnaData 함수가 변경될 때마다 자동 실행

  // --- 페이지 변경 핸들러 ---
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleMaskingName = (author) => {
    if (!author || typeof author !== 'string') return "";
    if (author === '다노샵') return '다노샵'
    const firstChar = author.charAt(0);
    const stars = "*".repeat(author.length - 1); // 첫 글자를 제외한 나머지 글자 수만큼 * 생성
    return firstChar + stars; // 합쳐서 반환 (예: 홍길동 -> 홍 + ** = 홍**)
  }

  // 폼 액션 핸들러 함수들
  // 등록 및 수정 완료 시 호출되는 함수(관리자 답글 등록 포함)
  const handleSaveForm = async (formData) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (viewMode === 'write') {
        const result = await axiosPost('/qna/create', { ...formData, pid: id, mid: currentUserId, writer: writer });
        if (result) alert('문의가 등록되었습니다.');

      } else if (viewMode === 'edit') {
        const result = await axiosPut(`/qna/update/${selectedPost.groupId}`, { ...formData, mid: currentUserId, pid: id });
        if (result) alert('문의가 수정되었습니다.');

      } else if (viewMode === 'reply') {
        const result = await axiosPost('/qna/reply', {
          ...formData,
          pid: id,
          mid: currentUserId,
          writer: writer,
          groupId: selectedPost.groupId, // 원글과 같은 그룹으로 묶기 위한 실제 group_id
        });
        if (result) alert('답변이 등록되었습니다.');
      }

      fetchQnaData(); // 목록 새로고침
      setViewMode('list'); // 다시 목록 화면으로 컴백
    } catch (error) {
      console.error('qna 처리중 에러::', error);
      alert(error?.response?.data?.error || '처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 삭제 버튼 클릭 시 호출되는 함수
  const handleDeleteForm = async (groupId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const result = await axiosDelete(`/qna/delete/${groupId}?mid=${currentUserId}&pid=${id}`);
      if (result) alert('삭제되었습니다.');
      fetchQnaData();
      setViewMode('list');
    } catch (e) {
      console.error('qna 삭제중 에러::', e);
      alert(e?.response?.data?.error || '삭제 중 오류가 발생했습니다.');
    }
  };

  // [뒤로가기 / 취소 / 목록으로] 버튼 클릭 시
  const handleBackToList = () => {
    setSelectedPost(null);
    setViewMode('list');
  };

  const handleReplyClick = (parentPost) => {
    setSelectedPost(parentPost); // 부모 글 데이터를 임시 저장
    setViewMode('reply');        // 답글 모드로 전환
  };

  // 현재 선택된 글에 이미 답변이 달렸는지 여부는 서버가 group 단위로 계산해 내려준 answered 값을 그대로 사용
  // (페이지에 상관없이 항상 정확함 - 답변글이 다른 페이지에 있어도 판단 가능)
  const isAlreadyReplied = selectedPost?.answered === true;

  // viewMode가 'list'가 아니라면 목록 테이블 대신 폼 컴포넌트를 렌더링
  if (viewMode !== 'list') {
    return (
      <QnaForm
        mode={viewMode}
        initialData={selectedPost}
        onSave={handleSaveForm}
        onCancel={handleBackToList} // 뒤로가기 동기화
        onReplyClick={handleReplyClick} // 관리자 답변하기 버튼 클릭 핸들러 전달
        isAdmin={currentUserId === 'admin'}
        isAlreadyReplied={isAlreadyReplied}
        submitting={submitting}
      />
    );
  }

  // 비로그인 상태에서 WRITE 버튼 누르면 안내 팝업 띄우기
  const handleWriteClick = () => {
    if (!currentUserId) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }
    setViewMode('write');
  };

  // 제목 클릭 시 비밀글 및 권한 체크(서버가 계산해 내려준 canView 사용), 조회수 업데이트
  const handleTitleClick = async (item) => {
    if (item.isLock && !item.canView) {
      alert("비밀글은 작성자만 조회할 수 있습니다.");
      return;
    }

    // 1. 조회수 증가 API 호출 (실패하더라도 상세보기 진입은 막지 않는다)
    try {
      await axiosPut(`/qna/updateViews/${item.qid}`);
    } catch (error) {
      console.error("조회수 업데이트 실패:", error);
    }

    // 2. 상세 데이터 세팅 및 모드 변경
    setSelectedPost(item);
    setViewMode('detail');

    // 3. 목록 새로고침 (올라간 조회수 반영)
    fetchQnaData();
  };

  return (
    <style.ProdQnA>
      <style.BoardTit>
        <h2>Q&amp;A</h2>
        <div className="QnA_btn_wrap">
          {currentUserId !== 'admin' && (
            <Link
              to="#"
              onClick={(e) => { e.preventDefault(); handleWriteClick(); }}
              className="normal_btn"
            >
              문의하기
            </Link>
          )}
        </div>
      </style.BoardTit>

      <style.Contents>
        <table>
          <colgroup>
            <col style={{ width: "70px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "auto" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "55px" }} />
          </colgroup>
          <thead>
            <tr>
              <th>번호</th>
              <th>카테고리</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>조회</th>
            </tr>
          </thead>
          <tbody className="center">
            {loading && (
              <tr>
                <td colSpan={6} className="empty-row">불러오는 중...</td>
              </tr>
            )}

            {!loading && qnaList.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">등록된 문의가 없습니다.</td>
              </tr>
            )}

            {!loading && qnaList.map((item) =>
              <tr key={item.qid}>
                <td>{item.id}</td>
                <td>
                  <span className="category-badge">{item.category}</span>
                </td>
                <td className="left subject">
                  <span className={`status-badge ${item.answered ? 'answered' : 'waiting'}`}>
                    {item.answered ? '✓ 답변완료' : '답변대기'}
                  </span>
                  {item.isLock && (
                    <span className="lock-icon" title="비밀글">🔒</span>
                  )}
                  {currentUserId && item.mid === currentUserId && (
                    <span className="my-post-badge">내글</span>
                  )}

                  <span
                    className="subject-title"
                    onClick={() => handleTitleClick(item)}
                  >
                    {item.title}
                  </span>

                  {currentUserId && item.mid === currentUserId && (
                    <span
                      className="row-action"
                      onClick={() => {
                        setSelectedPost(item);
                        setViewMode('edit');
                      }}
                    >
                      수정
                    </span>
                  )}

                  {currentUserId && item.mid === currentUserId && item.mid !== 'admin' && (
                    <span
                      className="row-action"
                      onClick={() => handleDeleteForm(item.groupId)}
                    >
                      삭제
                    </span>
                  )}
                </td>
                <td>{handleMaskingName(item.author)}</td>
                <td>{item.date}</td>
                <td>{item.views}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* rc-pagination 기반 페이징 처리 영역 */}
        {totalCount > 0 && (
          <div className="paginate_wrap">
            <Pagination
              current={currentPage}       // 현재 활성화된 페이지 번호
              total={totalCount}          // 서버에서 받아온 전체 아이템 데이터 총 개수
              pageSize={pageSize}         // 한 페이지에 보여줄 개수
              onChange={handlePageChange} // 페이지 클릭 시 실행할 함수
              locale={{
                prev_page: "이전 페이지",
                next_page: "다음 페이지",
              }}
            />
          </div>
        )}
      </style.Contents>
    </style.ProdQnA>
  );
}

export default ProdQnA;
