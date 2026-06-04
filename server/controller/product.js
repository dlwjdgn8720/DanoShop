import * as repository from "../repository/product.js";

/**
 *  메인페이지 상품 정보 DB 연동
 */
export const getProduct = async (req, res, next) => {
    const result = await repository.getProduct(req.body.category);
    
    res.json({result});
};

export const getProductDetail = async(req, res, next) => {
    const result = await repository.getProductDetail(req.body.id);
    
    res.json({result});
}

export const getProductOption = async(req, res, next) => {
    const result = await repository.getProductOption(req.params.pid);
    
    res.json({result});
}

export const getProductDetailList = async(req, res, next) => {
    const result = await repository.getProductDetailList(req.body.id);
    
    res.json({result});
}

export const getProductSale = async(req, res, next) => {
    const result = await repository.getProductSale();
    
    res.json({result});
}