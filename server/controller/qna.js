import * as repository from "../repository/qna.js";

/**
 * 조회수 업데이트
 */
export const updateViews = async (req, res, next) => {
  try {
    const result = await repository.updateViews(req.params.qid);
    res.json({ result });
  } catch (err) {
    console.error("[qna] updateViews 실패:", err);
    res.status(500).json({ error: "조회수 업데이트에 실패했습니다." });
  }
};

/**
 * qna 답글 등록 (관리자 답변)
 */
export const replyQnaInfo = async (req, res, next) => {
  try {
    const { title, content, groupId, pid, mid } = req.body;
    if (!title?.trim() || !content?.trim() || !groupId || !pid || !mid) {
      return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
    }
    const result = await repository.replyQnaInfo(req.body);
    res.json({ result });
  } catch (err) {
    console.error("[qna] replyQnaInfo 실패:", err);
    res.status(500).json({ error: "답변 등록에 실패했습니다." });
  }
};

/**
 * qna 글 등록
 */
export const createQnaInfo = async (req, res, next) => {
  try {
    const { title, content, pid, mid, writer } = req.body;
    if (!title?.trim() || !content?.trim() || !pid || !mid || !writer) {
      return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
    }
    const result = await repository.createQnaInfo(req.body);
    res.json({ result });
  } catch (err) {
    console.error("[qna] createQnaInfo 실패:", err);
    res.status(500).json({ error: "문의 등록에 실패했습니다." });
  }
};

/**
 * qna 글 업데이트
 */
export const updateQnaInfo = async (req, res, next) => {
  try {
    const { title, content, mid, pid } = req.body;
    if (!title?.trim() || !content?.trim() || !mid || !pid) {
      return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
    }
    const result = await repository.updateQnaInfo(req.params.groupId, req.body);
    if (!result) {
      return res.status(403).json({ error: "수정 권한이 없거나 존재하지 않는 글입니다." });
    }
    res.json({ result });
  } catch (err) {
    console.error("[qna] updateQnaInfo 실패:", err);
    res.status(500).json({ error: "문의 수정에 실패했습니다." });
  }
};

/**
 * qna 글 삭제 (본인 또는 admin만 가능)
 */
export const deleteQnaInfo = async (req, res, next) => {
  try {
    const { mid, pid } = req.query;
    if (!mid || !pid) {
      return res.status(400).json({ error: "요청자 정보(mid)와 상품 정보(pid)가 필요합니다." });
    }
    const result = await repository.deleteQnaInfo(req.params.id, mid, pid);
    if (!result) {
      return res.status(403).json({ error: "삭제 권한이 없거나 존재하지 않는 글입니다." });
    }
    res.json({ result });
  } catch (err) {
    console.error("[qna] deleteQnaInfo 실패:", err);
    res.status(500).json({ error: "문의 삭제에 실패했습니다." });
  }
};

/**
 * 페이징 처리를 위한 데이터 개수 조회(rc-pagination이 하단 페이지 번호를 계산할 때 필수)
 */
export const getQnaCount = async (req, res, next) => {
  try {
    const id = req.query.id;
    const qnaCount = await repository.getQnaCount(id);
    res.json(qnaCount);
  } catch (err) {
    console.error("[qna] getQnaCount 실패:", err);
    res.status(500).json({ error: "문의 개수 조회에 실패했습니다." });
  }
};

/**
 * 페이징 처리 qna 테이블 조회
 */
export const getQnaPagination = async (req, res, next) => {
  try {
    // 1. 프론트엔드 파라미터 파싱 (기본값: 1페이지, 페이지당 5개)
    const page = parseInt(req.query.page, 10) || 1;
    const size = parseInt(req.query.size, 10) || 5;
    const id = req.query.id;
    const requesterMid = req.query.mid || null;

    // SQL 페이징 계산 (Offset은 0부터 시작하므로 page - 1 처리)
    const limit = size;
    const offset = (page - 1) * size;
    const totalElements = await repository.getQnaCount(id);
    const content = await repository.getQnaPagination(id, limit, offset, requesterMid);

    const transformedContent = content.map((item) => ({
      ...item,
      isLock: item.isLock === 1,
      answered: item.answered === 1,
      canView: item.canView === 1,
    }));

    // rc-pagination 연동용 공통 포맷으로 응답 리턴
    res.json({
      content: transformedContent, // 현재 페이지에 해당하는 Q&A 배열 리스트
      totalElements: totalElements, // 전체 Q&A 데이터 행 개수
      currentPage: page,
      pageSize: size,
    });
  } catch (err) {
    console.error("[qna] getQnaPagination 실패:", err);
    res.status(500).json({ error: "문의 목록 조회에 실패했습니다." });
  }
};
