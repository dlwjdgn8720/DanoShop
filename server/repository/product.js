import pool from '../db/connection.js';



export const getProduct = async(category) => {
    const sql = `select * from product where image like '%/${category}/%';`;
    const [rows] = await pool.execute(sql, []);

    return rows;
}

export const getProductDetail = async(id) => {
    const sql = `select * from product where pid = ?`;
    const [rows] = await pool.execute(sql, [id]);

    return rows;
}

export const getProductOption = async(pid) => {
    const sql = `select p.pid, image, sticker, \`name\`, composition, p.price, p.sale_price, product_imgb, product_imgs,
		                image_set, summary_info, discount, info_name, keep, volume, poid, \`option\`, 
                        po.price as option_price, po.sale_price as option_sale_price
                from product p, product_option po
                where p.pid = po.pid and p.pid = ?;`;
    const [rows] = await pool.execute(sql, [pid]);

    return rows;
}

export const getProductDetailList = async(id) => {
    const sql = `select image_set, info_name, keep, volume from product where pid = ?`;
    const [rows] = await pool.execute(sql, [id]);

    return rows;
}

export const getProductSale = async() => {
    const sql = `select * from product where discount is not null`;
    const [rows] = await pool.execute(sql, []);

    return rows;
}