import * as repository from '../repository/carts.js';

/**
 * 장바구니 아이템 삭제
 */
export const getDelete = async(req, res, next) => {
    const result = await repository.getDelete(req.body.cid);
    res.json({"isDelete": result.affectedRows});    
}


/**
 * 장바구니 수량 변경
 */
export const getQtyUpdate = async(req, res, next) => {
    const { cid, type } = req.body;
    const result = await repository.getQtyUpdate(cid, type);
    res.json({"isUpdate": result.affectedRows});
}


/**
 * 고객별 장바구니 리스트 조회
 */
export const getList = async(req, res, next) => {
    const result = await repository.getList(req.body.userData);
    res.json(result);
}

/**
 * 장바구니 수량 조회
 */
export const getCount = async(req, res, next) => {
    const result = await repository.getCount(req.body.userData);  // {userData: test00}
    // console.log(result);  //{count: 21}
    res.json(result);
}

// 주문 내역 불러오기
export const getOrder = async(req, res, next) => {
    const result = await repository.getOrder(req.body.mid);
    console.log('오더 불러오기', result);
    res.json(result);
}


/**
 * 장바구니 추가
 */
export const getAdd = async(req, res, next) => {
    //카트 아이템(pid, size) 동일한 경우 : update 수량 1증가 
    //카트 아이템 없는 경우 : insert
    const cartItems = req.body;

    try {
        let totalAffectedRows = 0;

        // 💡 비동기(await) 루프를 위해 for...of 문을 사용.
        for (const cartItem of cartItems) {
            const { pid, poid, qty, userData } = cartItem; 
            
            const cartData = {
                pid: parseInt(pid),
                poid: parseInt(poid),
                qty: parseInt(qty) || 1,
                mid: userData
            };
            console.log("cartData ===> ", cartData);

            // 1. 이미 동일 상품군이 담겨있는지 조회
            const findResult = await repository.getFindItem(cartData);
            let result = null;

            if (findResult) {
                // 2. 존재하면 기존 수량에 프론트에서 넘어온 수량(qty)만큼 증가.
                result = await repository.getQtyUpdate(findResult.cid, '+'); 
            } else {
                // 3. 존재하지 않으면 새 행(Row) 생성
                result = await repository.getCartItemAdd(cartData);
            }
            
            // 영향받은 행의 수를 누적합산
            if (result && result.affectedRows) {
                totalAffectedRows += result.affectedRows;
            }
        }
        res.json({ "isAdd": totalAffectedRows > 0 ? 1 : 0 });
        
    } catch (error) {
        console.error("장바구니 추가 중 서버 에러 발생:", error);
        res.status(500).json({ error: error.message });
    }
}