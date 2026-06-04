import * as style from "./ProdQnAStyle";
import DetailTab from "./DetailTab";
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
  // 'delete' : 삭제

  const [viewMode, setViewMode] = useState('list');
  const [selectedPost, setSelectedPost] = useState(null); // 수정/상세에 사용할 선택된 글 데이터

  // 페이징 처리를 위한 현재 페이지 상태
  // --- 상태 관리 (State) ---
  const [qnaList, setQnaList] = useState([]);       // 서버에서 받아온 Q&A 목록
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (1부터 시작)
  const [totalCount, setTotalCount] = useState(0);   // 전체 게시글 개수 (서버에서 받아옴)
  const [loading, setLoading] = useState(false);     // 로딩 상태

  const pageSize = 10; // 페이지당 보여줄 게시글 수
  const { id } = useParams(); //상품 아이디 가져오기
  const currentUserId = useAuthStore((s) => s.userData?.mid);
  const writer = useAuthStore((s) => s.userData?.name);

  // 1. fetchQnaData 함수를 useEffect 밖으로 추출
  const fetchQnaData = useCallback(async () => {
    setLoading(true);
    try {
      // 내부에서 사용하는 주소 값들을 반영
      const data = await axiosGet(`/qna/paging?id=${id}&page=${currentPage}&size=${pageSize}`);
      setQnaList(data.content || []); // 게시글 배열 저장
      setTotalCount(data.totalElements || 0); // 전체 게시글 수 저장
    } catch (error) {
      console.error("Q&A 데이터를 불러오는 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]); // 함수가 참조하는 외부 변수들을 의존성 배열에 등록

  // 2. 페이지가 바뀌거나 함수가 갱신될 때 자동으로 호출하는 useEffect
  useEffect(() => {
    fetchQnaData();
  }, [fetchQnaData]); // fetchQnaData 함수가 변경될 때마다 자동 실행

  // --- 페이지 변경 핸들러 ---
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 필요 시 상단 스크롤 이동 로직 추가 가능
    // window.scrollTo({ top: 0, behavior: 'smooth' });
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
    try {
      if (viewMode === 'write') {
        const result = await axiosPost('/qna/create', { ...formData, pid: id, mid: currentUserId, writer: writer });
        if (result) alert('문의가 등록되었습니다.');

      } else if (viewMode === 'edit') {
        const result = await axiosPut(`/qna/update/${selectedPost.groupId}`, { ...formData, mid: currentUserId });
        if (result) alert('문의가 수정되었습니다.');

      } else if (viewMode === 'reply') {
        const result = await axiosPost('/qna/reply', { ...formData, pid: id, mid: currentUserId, writer: writer, parentPostNum: selectedPost.id });

        if (result) {
          await axiosPut(`qna/checkReply/${selectedPost.id}`);
          alert('답글이 등록 완료되었습니다.')
        }
      }

      fetchQnaData(); // 목록 새로고침
      setViewMode('list'); // 다시 목록 화면으로 컴백
    } catch (error) {
      console.error('qna 처리중 에러::', error);
    }
  };

  // 삭제 버튼 클릭 시 호출되는 함수
  const handleDeleteForm = async (postId) => {

    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const result = await axiosDelete(`/qna/delete/${postId}`);
      if (result) alert('삭제되었습니다.');
      fetchQnaData();
      setViewMode('list');
    } catch (e) {
      console.log(e);
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

  // 현재 띄워진 상세 글(selectedPost)에 답변이 이미 존재치 체크하는 로직
  // 클릭한 글과 group_id가 같으면서 'is_reply === 0(답변글)'인 데이터가 리스트에 존재하는가?
  const isAlreadyReplied = qnaList.some(
    (qna) => selectedPost && qna.groupId === selectedPost.groupId && qna.isReply === false
  );

  // viewMode가 'list'가 아니라면 목록 테이블 대신 폼 컴포넌트를 렌더링
  if (viewMode !== 'list') {

    return (
      <QnaForm
        mode={viewMode}
        initialData={selectedPost}
        onSave={handleSaveForm}
        //onDelete={handleDeleteForm}
        onCancel={handleBackToList} // 뒤로가기 동기화
        onReplyClick={handleReplyClick} // 관리자 답변하기 버튼 클릭 핸들러 전달
        isAdmin={currentUserId === 'admin'}
        isAlreadyReplied={isAlreadyReplied}
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

  // 제목 클릭 시 비밀글 및 권한 체크 , 조회수 업데이트
  const handleTitleClick = async (item) => {
    console.log(item);

    const isMyPost = item.mid === currentUserId;
    const isAdmin = currentUserId === 'admin';

    // 규칙 변경 반영: group_id가 같고, is_reply === 1(질문글)이며, 작성자가 나인 원글이 목록에 있는지 찾음
    const isMyGroupPost = qnaList.some(
      (qna) => qna.groupId === item.groupId && qna.isReply === true && qna.mid === currentUserId
    );

    // 관리자(admin)가 남긴 '답변글(is_reply === 0)'인지 확인
    const isAdminReply = item.isReply === false && (item.mid === 'admin' || item.author === '다노샵');

    // 비밀글 조건 체크 (isLock 또는 is_secret이 1일 때)
    if (item.isLock === true) {
      // 내 글도 아니고, 총관리자도 아니고, 내 질문 묶음도 아니라면 컷!
      // 단, 관리자의 답변글(isAdminReply)이면서 내가 질문한 묶음(isMyGroupPost)이면 통과시킵니다.
      if (!isMyPost && !isAdmin && !(isAdminReply && isMyGroupPost) && !isMyGroupPost) {
        alert("비밀글은 작성자만 조회할 수 있습니다.");
        return;
      }
    }

    // 1. 조회수 증가 API 호출
    await axiosPut(`/qna/updateViews/${item.qid}`);

    // 2. 상세 데이터 세팅 및 모드 변경
    setSelectedPost(item);
    setViewMode('detail');

    // 3. 목록 새로고침 (올라간 조회수 반영)
    fetchQnaData();
  };

  return (
    <>
      <style.ProdQnA>
        <div>
          <style.BoardTit>
            <h2>Q&amp;A</h2>
            <div className="QnA_btn_wrap">
              {/* <Link to="#" className="normal_btn" onClick={(e) => { e.preventDefault(); setViewMode('list'); }}>LIST</Link>  */}
              {currentUserId !== 'admin' && (<Link to="#"
                onClick={(e) => { e.preventDefault(); handleWriteClick(); }}
                className="normal_btn">WRITE {/** Qna 작성 */}
              </Link>)}
            </div>
          </style.BoardTit>

          <style.Contents>
            <table>
              <colgroup>
                <col style={{ width: "70px" }} />
                <col style={{ width: "134px" }} />
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
                {qnaList.map((item) =>
                  <tr key={item.id} style={{ backgroundColor: item.isReply === false ? '#fcfcfc' : '#fff' }}>
                    <td>{item.id}</td>
                    <td>{item.category}</td>
                    <td className="left subject" style={{ paddingLeft: item.isReply === false ? '30px' : '15px' }}>
                      {/* 답변 아이콘 조건부 렌더링 */}
                      {item.isReply === false && (
                        <>
                          &nbsp;&nbsp;&nbsp;
                          <span style={{ color: '#a8a29e', fontWeight: 'bold', marginRight: '5px' }}>↳</span>
                          <span style={{
                            backgroundColor: '#78716c',
                            color: '#fff',
                            fontSize: '10px',
                            padding: '2px 5px',
                            borderRadius: '3px',
                            marginRight: '8px',
                            verticalAlign: 'middle'
                          }}>RE</span>
                          {/* <img src="https://he0o0nje.github.io/Danoshop-clone-ts/img/icon/ico_re.gif" alt="답변" /> */}
                        </>
                      )}
                      {/* 비밀글 아이콘 조건부 렌더링 */}
                      &nbsp;&nbsp;&nbsp;
                      {item.isLock && (
                        <img src="https://he0o0nje.github.io/Danoshop-clone-ts/img/icon/ico_lock.gif" alt="비밀글"
                          style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      )}
                      &nbsp;&nbsp;&nbsp;
                      {currentUserId && item.mid === currentUserId && (
                        <span style={{ color: '#f97316', fontWeight: 'bold', marginRight: '4px' }}>[내글 ✅]</span>
                      )}
                      {/* 제목 클릭 시 내부 모드를 detail로 바꾸고 데이터 세팅 */}
                      <span
                        onClick={() => handleTitleClick(item)}
                        style={{
                          cursor: 'pointer',
                          color: item.isReply ? '#57534e' : '#1c1917',
                          fontWeight: item.isReply ? 'normal' : '500'
                        }}
                      >
                        {item.title}
                      </span>

                      {/* 수정 클릭 시 내부 모드를 edit로 바꾸고 데이터 세팅 */}
                      {currentUserId && item.mid === currentUserId && (
                        <span
                          onClick={() => {
                            setSelectedPost(item);
                            setViewMode('edit');
                          }}
                          style={{ marginLeft: '10px', fontSize: '12px', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          수정
                        </span>
                      )}

                      {currentUserId && item.mid === currentUserId && item.mid !== 'admin' && (
                        <span
                          onClick={() => handleDeleteForm(item.groupId)}
                          style={{ marginLeft: '10px', fontSize: '12px', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          삭제
                        </span>
                      )}
                      &nbsp;&nbsp;&nbsp;
                      <span className="comment"></span>
                    </td>
                    <td>{handleMaskingName(item.author)}</td>
                    <td>{item.date}</td>
                    <td>{item.views}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* rc-pagination 기반 페이징 처리 영역 */}
            <div className="paginate_wrap" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <Pagination
                current={currentPage}       // 현재 활성화된 페이지 번호
                total={totalCount}          // 서버에서 받아온 전체 아이템 데이터 총 개수
                pageSize={pageSize}         // 한 페이지에 보여줄 개수 (5개)
                onChange={handlePageChange} // 페이지 클릭 시 실행할 함수
                locale={{
                  prev_page: "이전 페이지",
                  next_page: "다음 페이지",
                }}
              />
            </div>
          </style.Contents>
        </div>
      </style.ProdQnA >
    </>
  );
}

export default ProdQnA;