import pool from "../db/connection.js";

// 현재 시간을 한국 표준시(KST) 문자열로 변환하는 함수
function getKstTimestamp() {
  const offset = 1000 * 60 * 60 * 9; // 한국 시간은 UTC+9
  const koreaNow = new Date(new Date().getTime() + offset);

  // 'YYYY-MM-DD HH:mm:ss' 형식으로 포맷팅
  return koreaNow.toISOString().replace("T", " ").substring(0, 19);
}

/**
 * 조회수 업데이트
 */
export const updateViews = async (qid) => {
  const sql = `UPDATE qna SET views = views + 1 WHERE qid = ?`;
  const [rows] = await pool.execute(sql, [qid]);
  return rows.affectedRows;
};

/**
 * qna 답글 등록
 * groupId: 원글(질문)의 group_id. 답글도 같은 group_id를 가져야 목록/비밀글 권한 로직에서
 * 질문-답변이 하나의 묶음으로 인식된다.
 */
export const replyQnaInfo = async (qnaInfo) => {
  const { category, title, content, isSecret, groupId, pid, mid, writer } = qnaInfo;
  const kstTime = getKstTimestamp();

  // 해당 상품(pid) 내에서 새롭게 부여할 post_num을 서브쿼리로 계산하여 삽입
  const sql = `
    INSERT INTO qna (category, title, content, is_secret, writer, post_num, group_id, is_reply, cdate, mid, pid)
    VALUES (
      ?, ?, ?, ?, ?,
      (SELECT IFNULL(MAX(post_num), 0) + 1 FROM qna q WHERE q.pid = ?),
      ?,
      0,
      ?, ?, ?
    )
  `;

  const [rows] = await pool.execute(sql, [
    category,
    title,
    content,
    isSecret ? 1 : 0,
    writer,
    pid, // post_num 채번 대상 pid
    groupId, // 원글의 group_id (질문-답변 묶음 연결)
    kstTime,
    mid, // 관리자 mid
    pid, // 상품 pid
  ]);

  return rows.affectedRows;
};

/**
 * qna 글 등록
 */
export const createQnaInfo = async (qnaInfo) => {
  const { category, title, isSecret, writer, content, mid, pid } = qnaInfo;

  const kstTime = getKstTimestamp(); // 예: '2026-06-01 13:55:00'

  const sql = `
        insert into qna (category, title, is_secret, writer, content, post_num, group_id, cdate, mid, pid, is_reply)
                values (?,?,?,?,?,
                    (SELECT IFNULL(MAX(post_num), 0) + 1 FROM qna q WHERE q.pid = ?),
                    (SELECT IFNULL(MAX(post_num), 0) + 1 FROM qna q WHERE q.pid = ?),
                    ?,?,?,1
                )
        `;
  const [rows] = await pool.execute(sql, [
    category,
    title,
    isSecret ? 1 : 0,
    writer,
    content,
    pid,
    pid,
    kstTime,
    mid,
    pid,
  ]);
  return rows.affectedRows;
};

/**
 * qna 글 업데이트 (작성자 본인 글만 수정 가능)
 * group_id는 pid별로 다시 채번되는 값이라 pid까지 함께 조건에 걸어야
 * 다른 상품의 같은 group_id 글이 실수로 함께 수정되는 것을 막을 수 있다.
 */
export const updateQnaInfo = async (groupId, qnaInfo) => {
  const { category, title, content, isSecret, mid, pid } = qnaInfo;

  const kstTime = getKstTimestamp(); // 예: '2026-06-01 13:55:00'
  const sql = `
          update qna set category = ?, title = ?, content = ?, is_secret = ?, udate = ?
          where group_id = ?
          and pid = ?
          and mid = ?
      `;

  const [rows] = await pool.execute(sql, [
    category,
    title,
    content,
    isSecret ? 1 : 0,
    kstTime,
    groupId,
    pid,
    mid,
  ]);
  return rows.affectedRows;
};

/**
 * qna 글 삭제 (원글 작성자 본인 또는 admin만 삭제 가능)
 * 원글(is_reply = 1)의 작성자만 확인하고, 승인되면 답변까지 그룹 전체를 삭제한다.
 * (그룹 내 개별 행의 mid로 필터링하면 답변행(mid=admin)이 남는 문제가 있어 이렇게 처리)
 *
 * 주의: group_id는 pid(상품)별로 1부터 다시 채번되는 값이라 상품이 다르면 얼마든지 같은 값이
 * 나올 수 있다. 반드시 pid까지 함께 조건에 걸어야 다른 상품의 같은 group_id 글이 함께
 * 삭제되는 사고를 막을 수 있다.
 */
export const deleteQnaInfo = async (groupId, mid, pid) => {
  if (mid !== "admin") {
    const [owner] = await pool.execute(
      `SELECT 1 FROM qna WHERE group_id = ? AND pid = ? AND is_reply = 1 AND mid = ? LIMIT 1`,
      [groupId, pid, mid]
    );
    if (owner.length === 0) return 0;
  }

  const [rows] = await pool.execute(`DELETE FROM qna WHERE group_id = ? AND pid = ?`, [groupId, pid]);
  return rows.affectedRows;
};

/**
 * 페이징 처리를 위한 데이터 개수 조회(rc-pagination이 하단 페이지 번호를 계산할 때 필수)
 * 목록에는 질문(원글)만 노출하므로 개수도 질문 기준으로 센다 (답변은 상세보기에 같이 붙어 나온다).
 */
export const getQnaCount = async (pid) => {
  const sql = `SELECT COUNT(*) AS total FROM qna WHERE pid = ? AND is_reply = 1`;
  const [countRows] = await pool.query(sql, [pid]);
  return countRows[0].total;
};

/**
 * 페이징 처리 qna 테이블 조회
 * 일반 쇼핑몰 문의 게시판과 동일하게, 목록에는 질문(원글)만 노출하고
 * 답변 내용은 같은 행에 answer* 컬럼으로 함께 실어보내 상세보기에서 바로 붙여서 보여준다.
 * requesterMid: 조회를 요청한 사용자의 mid (비로그인 시 null). 비밀글 권한 판정 및 콘텐츠 마스킹에 사용.
 */
export const getQnaPagination = async (pid, limit, offset, requesterMid) => {
  const sql = `
    SELECT
        (SELECT COUNT(*) FROM qna q2 WHERE q2.pid = q.pid AND q2.is_reply = 1) -
        (ROW_NUMBER() OVER (ORDER BY q.group_id DESC)) + 1 AS id,
        q.category,
        q.title,
        q.writer AS author,
        DATE_FORMAT(q.cdate, '%Y-%m-%d %H:%i:%s') AS date,
        q.views,
        q.is_secret AS isLock,
        q.mid,
        q.group_id AS groupId,
        q.qid,
        -- 같은 상품(pid) + 같은 group_id 안에 답변글(is_reply = 0)이 이미 존재하는지 여부
        -- group_id는 pid별로 1부터 다시 채번되므로 r.pid = q.pid 없이는 다른 상품의 글이 섞일 수 있다.
        EXISTS (
          SELECT 1 FROM qna r WHERE r.pid = q.pid AND r.group_id = q.group_id AND r.is_reply = 0
        ) AS answered,
        -- 비밀글 열람 권한: 본인 글, 관리자, 또는 이 질문의 작성자 본인인 경우 true
        (q.is_secret = 0 OR q.mid = ? OR ? = 'admin') AS canView,
        CASE
          WHEN q.is_secret = 0 OR q.mid = ? OR ? = 'admin' THEN q.content
          ELSE NULL
        END AS content,
        (SELECT r.writer FROM qna r WHERE r.pid = q.pid AND r.group_id = q.group_id AND r.is_reply = 0 LIMIT 1) AS answerAuthor,
        (SELECT DATE_FORMAT(r.cdate, '%Y-%m-%d %H:%i:%s') FROM qna r WHERE r.pid = q.pid AND r.group_id = q.group_id AND r.is_reply = 0 LIMIT 1) AS answerDate,
        CASE
          WHEN q.is_secret = 0 OR q.mid = ? OR ? = 'admin'
            THEN (SELECT r.content FROM qna r WHERE r.pid = q.pid AND r.group_id = q.group_id AND r.is_reply = 0 LIMIT 1)
          ELSE NULL
        END AS answerContent
      FROM qna q
        WHERE q.pid = ? AND q.is_reply = 1
        ORDER BY q.group_id DESC
        LIMIT ? OFFSET ?
  `;
  const mid = requesterMid || "";
  const [rows] = await pool.query(sql, [
    mid, mid, // canView
    mid, mid, // content CASE
    mid, mid, // answerContent CASE
    pid,
    limit,
    offset,
  ]);
  return rows;
};
