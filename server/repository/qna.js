import pool from "../db/connection.js";

// 현재 시간을 한국 표준시(KST) 문자열로 변환하는 함수
function getKstTimestamp() {
  const offset = 1000 * 60 * 60 * 9; // 한국 시간은 UTC+9
  const koreaNow = new Date(new Date().getTime() + offset);

  // 'YYYY-MM-DD HH:mm:ss' 형식으로 포맷팅
  return koreaNow.toISOString().replace("T", " ").substring(0, 19);
}

/**
 * 답변 체크
 */
export const checkReply = async (id) => {
  const sql = `
      update qna
        set is_reply = 1
        where post_num = ?;
  `;

  const [rows] = await pool.execute(sql, [id]);
  return rows.affectedRows;
}


/** 
 * 조회수 업데이트
 */
export const updateViews = async (qid) => {

  const sql = `
        UPDATE qna 
          SET views = views + 1 
          WHERE qid = ?
    `;

  const [rows] = await pool.execute(sql, [qid]);
  return rows.affectedRows;
}

/**
 * qna 답글 등록
 */
export const replyQnaInfo = async (qnaInfo) => {

  const {
    category,
    title,
    content,
    isSecret,
    parentPostNum,
    pid,
    mid,
    writer,
  } = qnaInfo;
  const kstTime = getKstTimestamp();

  console.log(isSecret);

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
    isSecret,
    writer,
    pid, // post_num 해당 pid
    parentPostNum, // 프론트에서 넘겨준 원글의 post_num
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
    isSecret,
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
 * qna 글 업데이트
 */
export const updateQnaInfo = async (groupId, qnaInfo) => {
  const { category, title, content, isSecret, mid } = qnaInfo;

  const kstTime = getKstTimestamp(); // 예: '2026-06-01 13:55:00'
  const sql = `
          update qna set category = ?, title = ?, content = ?, is_secret = ?, udate = ?
          where group_id = ? 
          and mid = ?
      `;

  const [rows] = await pool.execute(sql, [
    category,
    title,
    content,
    isSecret,
    kstTime,
    groupId,
    mid,
  ]);
  return rows.affectedRows;
};

/**
 * qna 글 삭제
 */
export const deleteQnaInfo = async (id) => {
  console.log(id);

  const sql = `
        delete from qna where group_id = ?
    `;

  const [rows] = await pool.execute(sql, [id]);
  return rows.affectedRows;
};

/**
 * 페이징 처리를 위한 데이터 개수 조회(rc-pagination이 하단 페이지 번호를 계산할 때 필수)
 */
export const getQnaCount = async (id) => {
  const sql = `
                SELECT 
                    COUNT(*) AS total 
                    FROM qna q, product p
                    where q.pid = p.pid
                    and p.pid = ?
                `;
  const [countRows] = await pool.query(sql, [id]);
  const totalElements = countRows[0].total;
  return totalElements;
};

/**
 * 페이징 처리 qna 테이블 조회
 */
export const getQnaPagination = async (id, limit, offset) => {
  // 현재 페이지에 데이터 조회
  // group_id DESC,  -- 최신 질문 그룹을 위로 올림
  // post_num ASC;   -- 그룹 내에서는 질문이 먼저 나오고 답변이 아래에 달림
  // is_reply DESC; -- 그룹 내에서는 질문글에 답변이 달리면 원글 컬럼 is_reply가 1이됨.
  // 전체 개수에서 현재 정렬된 순서대로 번호를 역순으로 차감하여 가상 번호 생성
  // 전체개수 - offset - 현재배열index
  const sql = `
    SELECT 
        (SELECT COUNT(*) FROM qna q2 WHERE q2.pid = q.pid) - 
        (ROW_NUMBER() OVER (ORDER BY q.group_id DESC, q.is_reply DESC, q.post_num ASC)) + 1 AS id,
        q.category,
        q.title,
        q.writer AS author,
        DATE_FORMAT(q.cdate, '%Y-%m-%d %H:%i:%s') AS date,
        q.views,
        q.is_secret AS isLock,
        q.is_reply AS isReply,
        q.mid,
        q.content,
        q.group_id AS groupId,
        q.qid
      FROM qna q, product p
        where q.pid = p.pid
            and p.pid = ?
            ORDER BY q.group_id DESC, q.is_reply DESC, q.post_num ASC
            LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.query(sql, [id, limit, offset]);
  return rows;
};
