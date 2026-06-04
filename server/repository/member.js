import pool from "../db/connection.js";

/**
 *  카카오 로그인시 member table insert
 */
export const getKaKaoSignup = async (member) => {
  const { mid, name, phone, address, email } = member;
  const sql = `
        insert into member (mid, name, phone, address, email, mdate, role) 
                values (?, ?, ?, ?, ?, curdate(), 'KAKAO_USER')
        `;

  const [rows] = await pool.execute(sql, [mid, name, phone, address, email]);

  return rows.affectedRows;
};

/**
 *  회원가입
 */
export const getSignup = async (member) => {
  const { mid, pwdHash, name, phone, address, email } = member;

  console.log(member);

  const sql = `
        insert into member (mid, pwd, name, phone, address, email, mdate) 
                values (?, ?, ?, ?, ?, ?, curdate())
        `;
  const [rows] = await pool.execute(sql, [
    mid,
    pwdHash,
    name,
    phone,
    address,
    email,
  ]);
  return rows.affectedRows;
};

/**
 *  중복 아이디 체크
 */
export const getIdCheck = async (mid) => {
  const sql = `select count(mid) as isFind from member where mid = ?`;
  const [rows] = await pool.execute(sql, [mid]);
  return rows[0];
};

/**
 *  유저 정보 조회
 */
export const getUserInfo = async (mid) => {
  const sql = `select * from member where mid =?`;
  const [rows] = await pool.execute(sql, [mid]);
  return rows[0];
};
