import pool from '../db/connection.js';

/**
 * 장바구니 아이템 삭제
 */
export const getDelete = async(cid) => {
    const sql = `
        delete from cart where cid = ?
    `;
    const [rows] = await pool.execute(sql, [cid]);
    return rows;  
}


/**
 * 고객별 장바구니 리스트 조회
 */
export const getList = async(userData) => {
    const sql = `
        select * from view_cartlist where mid=?
    `;
    const userId = String(userData);
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
}

/**
 * 고객별 qty 조회
 */
export const getCount = async(userData) => {
    const sql = `select sum(qty) as count from cart where mid = ?`;
    const userId = String(userData);
    const [rows] = await pool.execute(sql, [userId]);
    return rows[0];
}

/**
 * cartItem 수량 업데이트 - 장바구니 추가, 장바구니 리스트 수량 업데이트
 */
export const getQtyUpdate = async(cid, type) => {
    const param = type === '-'? 'greatest(qty - 1, 1)' : 'qty + 1';    
    const sql = ` update cart
                    set qty = ${param}
                    where cid = ?
    `;
    const [rows] = await pool.execute(sql, [cid]);
    return rows; // update, insert, delete = { affectedRows:1 ..}
}


/**
 * cartItem 추가
 */
export const getCartItemAdd = async(cartItem) => {
    const { pid, poid, qty, mid } = cartItem;
    console.log("repository cartItem => ", cartItem);
    const sql = `
        insert into cart(qty, pid, poid, mid, cdate)
            values(?, ?, ?, ?, now())
    `;
    const [rows] = await pool.execute(sql, [qty, pid, poid, mid]);
    return rows;
}


/**
 * cartItem 조회
 */
export const getFindItem = async(cartItem) => {
    const { pid, poid, mid } = cartItem;
    const sql = `
            select cid from cart
                where pid = ? and poid = ? and mid = ?
    `;
    const [rows] = await pool.execute(sql, [pid, poid, mid]);
    return rows[0];
}

// 장바구니 지우기
export const clearCart = async(mid) => {
    const sql = `
        DELETE FROM cart
        WHERE mid = ?
    `;

    const [rows] = await pool.execute(sql, [mid]);
    return rows[0];
}

// 오더 테이블에 넘기기
export const saveOrder = async(mid) => {
    const sql = `
        INSERT INTO orders (
            mid,
            image,
            product_name,
            option_name,
            qty,
            total_price
        )
        SELECT
            mid,
            image,
            name,
            size,
            qty,
            CAST(REPLACE(price, ',', '') AS UNSIGNED) * qty
        FROM view_cartlist
        WHERE mid = ?;
    `;
    const [rows] = await pool.execute(sql, [mid]);
    return rows[0];
}

// 주문 내역 출력
export const getOrder = async(mid) => {
    const sql = `
        select 
            oid, 
            mid, 
            order_date,
            image,
            product_name,
            option_name,
            qty,
            total_price
        from orders where mid = ?`
    const [rows] = await pool.execute(sql, [mid]);
    return rows;
}