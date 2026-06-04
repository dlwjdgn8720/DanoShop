import React, { useState, useEffect } from 'react';
import '../../../css/qnaform.css'; // 작성한 일반 CSS 파일 import
import useAuthStore from '../../../store/authStore.js';

export default function QnaForm({ mode = 'write', initialData, onSave, onDelete, onCancel, onReplyClick, isAdmin, isAlreadyReplied }) {

    const currentUserId = useAuthStore((s) => s.userData?.mid);

    const [formData, setFormData] = useState({
        category: '기타문의',
        title: '',
        content: '',
        isSecret: false
    });

    useEffect(() => {
        if ((mode === 'reply') && initialData) {
            setFormData({
                category: initialData.category || '기타문의',
                title: '',
                content: '',
                isSecret: initialData.isLock || false,
            });
        } else if ((mode === 'edit' || mode === 'detail') && initialData) {
            console.log(initialData);

            setFormData({
                category: initialData.category || '기타문의',
                title: initialData.title || '',
                content: initialData.content || '',
                isSecret: initialData.isLock || false,
            });
        }
    }, [mode, initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return alert('제목을 입력해주세요.');
        if (!formData.content.trim()) return alert('내용을 입력해주세요.');

        onSave(formData);
    };

    // '상세 조회(detail)' 모드 이거나 '답변 작성(reply)' 모드일 때 readonly 처리
    const isReadonlyField = mode === 'detail' || mode === 'reply';
    const isReadonlyForm = mode === 'detail'; // 폼 전체(내용 포함)가 읽기 전용인 경우

    return (
        <div className="qna-form-container">
            {/* 상단 타이틀 */}
            <div className="qna-form-header">
                <h2>
                    {mode === 'write' && 'Q&A 문의하기'}
                    {mode === 'edit' && 'Q&A 수정하기'}
                    {mode === 'detail' && 'Q&A 상세내용'}
                    {mode === 'reply' && 'Q&A 답변하기'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="qna-form">
                {/* 카테고리 & 비밀글 옵션 */}
                <div className="form-group-row">
                    <div className="form-group-category">
                        <label className="form-label">카테고리</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            disabled={isReadonlyField}
                            className="form-select"
                            style={{ width: 'auto !important', fontSize: '13px' }}
                        >
                            <option value="기타문의">기타문의</option>
                            <option value="상품문의">상품문의</option>
                            <option value="배송문의">배송문의</option>
                            <option value="교환/반품">교환/반품</option>
                        </select>
                    </div>

                    <div>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isSecret"
                                checked={formData.isSecret}
                                onChange={handleChange}
                                disabled={isReadonlyField}
                                className="form-checkbox"
                            />
                            <span>🔒 비밀글로 문의하기</span>
                        </label>
                    </div>
                </div>

                {/* 제목 입력 */}
                <div>
                    <label className="form-label">제목</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={isReadonlyForm}
                        placeholder="제목을 입력해주세요."
                        className="form-input"
                    />
                </div>

                {/* 내용 입력 */}
                <div>
                    <label className="form-label">내용</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        disabled={isReadonlyForm}
                        rows="10"
                        placeholder={mode === 'reply' && ('정확한 답변 부탁드립니다.') || "문의하실 내용을 입력해주세요. 상세히 적어주실수록 정확한 답변이 가능합니다."}
                        className="form-textarea"
                    />
                </div>

                {/* 하단 버튼 영역 */}

                <div className="qna-form-footer">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-cancel"
                    >
                        {isReadonlyForm ? '목록으로' : '취소'}
                    </button>

                    {/* 관리자가 상세 조회 중이고, 원글(is_reply !== 1)일 때만 답변하기 버튼 노출 */}
                    {mode === 'detail' && isAdmin && initialData.isReply === true && !isAlreadyReplied && (
                        <button
                            type="button"
                            onClick={() => onReplyClick(initialData)}    // 부모에게 답글 폼 요청
                            style={{ border: '1px solid #d1d5db', backgroundColor: 'orange', color: 'white', marginLeft: '10px', padding: '8px 20px', fontSize: '14px' }}
                        >
                            답변하기
                        </button>
                    )}

                    {!isReadonlyForm && (
                        <button type="submit" className="btn-submit">
                            {mode === 'reply' && '답변완료'}
                            {mode === 'write' && '등록하기'}
                            {mode === 'edit' && '수정완료'}
                        </button>
                    )}
                </div>
            </form >
        </div >
    );
}