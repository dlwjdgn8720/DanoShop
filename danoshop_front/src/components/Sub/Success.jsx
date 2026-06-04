import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Success() {
    const navigate = useNavigate();
    const alerted = useRef(false);

    useEffect(() => {
        if (alerted.current) return;

        alerted.current = true;

        alert('결제가 완료되었습니다!');
        navigate('/carts/order');
    }, []);

    return <div>결제 완료 처리중...</div>;
}