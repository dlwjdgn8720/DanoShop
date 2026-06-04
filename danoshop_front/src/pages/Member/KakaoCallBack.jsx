import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
//import axios from 'axios';
import { axiosPost } from '../../../utils/dataFetch.js';
import useAuthStore from "../../../store/authStore.js";

const KakaoCallback = () => {
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();
    const isProcessed = useRef(false);

    useEffect(() => {
        const getKakaoToken = async () => {
            // URL에서 인가 코드(code) 추출
            const code = new URL(window.location.href).searchParams.get('code');

            if (code && !isProcessed.current) {
                isProcessed.current = true;
                // 백엔드 Node.js 서버(예: 포트 9000)로 인가 코드 전송
                try {
                    const res = await axiosPost('/member/kakaoLogin', { code });
                    console.log('login::', res);
                    // 전역 로그인 액션 수행 (기존 함수 가져와서 사용)
                    login({
                        userData: res.kakaoUserData,
                        accessToken: res.accessToken,
                        isKaKaoLogin: true,
                        kakaoAccessToken: res.kakaoAccessToken
                    });
                    localStorage.setItem('loginType', 'kakao');

                    alert('로그인에 성공했습니다.');
                    navigate('/');
                } catch (err) {
                    console.error('카카오 로그인 에러:', err);
                    isProcessed.current = false;
                    navigate('/login'); // 에러 시 로그인 페이지로 복귀
                }
            }
        };
        getKakaoToken();
    }, [navigate]);

    return <div>로그인 처리 중입니다. 잠시만 기다려주세요...</div>;
};

export default KakaoCallback;