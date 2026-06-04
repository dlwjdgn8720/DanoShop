import * as repository from "../repository/qna.js";

/** 
 *  답변 체크
 */
export const checkReply = async (req, res, next) => {
  const result = await repository.checkReply(req.params.id);
  res.json({ result })
}

/** 
 * 조회수 업데이트
 */
export const updateViews = async (req, res, next) => {
  const result = await repository.updateViews(req.params.qid);
  res.json({ result });
}

/**
 * qna 답글 등록
 */
export const replyQnaInfo = async (req, res, next) => {
  console.log(req.body);
  const result = await repository.replyQnaInfo(req.body);
  res.json({ result });
};

/**
 * qna 글 등록
 */
export const createQnaInfo = async (req, res, next) => {
  const result = await repository.createQnaInfo(req.body);
  res.json({ result });
};

/**
 * qna 글 업데이트
 */
export const updateQnaInfo = async (req, res, next) => {

  const result = await repository.updateQnaInfo(req.params.groupId, req.body);
  res.json({ result });
};

/**
 * qna 글 삭제
 */
export const deleteQnaInfo = async (req, res, next) => {
  const result = await repository.deleteQnaInfo(req.params.id);
  res.json({ result });
};

/**
 * 페이징 처리를 위한 데이터 개수 조회(rc-pagination이 하단 페이지 번호를 계산할 때 필수)
 */
export const getQnaCount = async (req, res, next) => {
  const id = req.query.id;
  const qnaCount = await repository.getQnaCount(id);
  res.json(qnaCount);
};

/**
 * 페이징 처리 qna 테이블 조회
 */
export const getQnaPagination = async (req, res, next) => {
  // 1. 프론트엔드 파라미터 파싱 (기본값: 1페이지, 페이지당 5개)
  const page = parseInt(req.query.page, 10) || 1;
  const size = parseInt(req.query.size, 10) || 5;
  const id = req.query.id;

  // SQL 페이징 계산 (Offset은 0부터 시작하므로 page - 1 처리)
  const limit = size;
  const offset = (page - 1) * size;
  const totalElements = await repository.getQnaCount(id);
  const content = await repository.getQnaPagination(id, limit, offset);

  const transformedContent = content.map((item) => ({
    ...item,
    isLock: item.isLock === 1,
    isReply: item.isReply === 1,
  }));

  // rc-pagination 연동용 공통 포맷으로 응답 리턴
  res.json({
    content: transformedContent, // 현재 페이지에 해당하는 Q&A 배열 리스트
    totalElements: totalElements, // 전체 Q&A 데이터 행 개수
    currentPage: page,
    pageSize: size,
  });
};
