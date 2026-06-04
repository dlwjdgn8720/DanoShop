import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/signup.css";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { axiosPost } from "../../../utils/dataFetch.js";

const initForm = (keys) => keys.reduce((acc, k) => ({ ...acc, [k]: "" }), {});

export default function Signup() {
  const navigate = useNavigate();
  const idRef = useRef(null);
  const pwdRef = useRef(null);
  const initArray = ["mid", "pwd", "cpwd", "name", "phone", "address", "emailName", "emailDomain"];
  const [form, setForm] = useState(initForm(initArray));
  const [errors, setErrors] = useState(initForm(initArray));
  const phoneRegex = /^010-\d{3,4}-\d{4}$/;

  // 🌟 카카오 주소 API 스크립트 동적 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // 컴포넌트 언마운트 시 정리
    };
  }, []);

  // 카카오 주소 팝업창 실행 함수
  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 서비스 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data) {
        console.log('Postcode::', data);

        // 사용자가 선택한 주소 타입에 따른 최종 주소 변수 설정
        let fullAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;

        // 참고항목(건물명, 동 이름 등)이 있을 경우 추가 조립
        let extraAddress = '';
        if (data.userSelectedType === 'R') {
          if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '' && data.apartment === 'Y') {
            extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        // 선택된 주소를 form 상태에 바인딩하고 에러 지우기
        setForm((prev) => ({ ...prev, address: fullAddress }));
        setErrors((prev) => ({ ...prev, address: "" }));
      }
    }).open();
  };


  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((p) => ({ ...p, [name]: "" }));
    //setErrors(initForm(initArray));
  };

  const handleResetForm = () => {
    setForm(initForm(initArray));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false; // 에러 판별용 변수

    if (!form.mid) {
      setErrors((p) => ({ ...p, mid: "아이디를 입력해주세요" }));
      hasError = true;
    } else if (form.mid.length > 20) {
      setErrors((p) => ({ ...p, mid: "20자이내로 아이디 입력해주세요" }));
      hasError = true;
    }
    if (!form.pwd) {
      setErrors((p) => ({ ...p, pwd: "비밀번호를 입력해주세요" }));
      hasError = true;
    }

    if (!form.cpwd) {
      setErrors((p) => ({ ...p, cpwd: "비밀번호를 재입력해주세요" }));
      hasError = true;
    } else if (form.pwd.trim() !== form.cpwd.trim()) {
      setErrors((p) => ({ ...p, cpwd: "비밀번호가 일치하지 않습니다" }));
      hasError = true;
    }
    if (!form.name) {
      setErrors((p) => ({ ...p, name: "이름을 입력해주세요" }));
      hasError = true;
    }

    if (!form.phone) {
      setErrors((p) => ({ ...p, phone: "전화번호를 입력해주세요" }));
      hasError = true;
    } else if (!phoneRegex.test(form.phone)) {
      setErrors((p) => ({
        ...p,
        phone: "하이픈(-)을 포함하여 정확히 입력해주세요",
      }));
      hasError = true;
    }
    if (!form.address) {
      setErrors((p) => ({ ...p, address: "주소를 입력해주세요" }));
      hasError = true;
    }

    if (!form.emailName) {
      setErrors((p) => ({ ...p, emailName: "이메일을 입력해주세요" }));
      hasError = true;
    } else if (!form.emailDomain) {
      setErrors((p) => ({ ...p, emailDomain: "이메일 도메인을 선택해주세요" }));
      hasError = true;
    }

    if (!hasError) {
      //회원가입 DB연동 
      try {
        //console.log(form);
        const result = await axiosPost('/member/signup', form);
        if (result.isSignup) {
          alert("가입이 완료되었습니다.");
          navigate('/login');
        }
      } catch (error) {
        console.log('Signup Error ::', error);
      }
    }
  };


  const handleIdCheck = async () => {
    //1. id 유효청 체크
    if (idRef.current.value === "") {
      alert("아이디를 입력해주세요");
      idRef.current.focus();
      return;
    } else if (idRef.current.value.length > 20) {
      alert("아이디를 20자내로 입력해주세요");
      idRef.current.focus();
      return;
    } else {
      //2. 서버에 id 전송
      const result = await axiosPost('/member/idCheck', { "mid": form.mid.trim() });
      if (result.isFind) {
        alert('이미 사용중인 아이디입니다. 다시 입력해주세요');
        idRef.current.focus();
      } else {
        alert('사용이 가능한 아이디입니다.');
        pwdRef.current.focus();
      }
    };
  }

  const handleIdKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 폼 제출 막기
      handleIdCheck();    // 중복확인 실행  
    }
  };

  return (
    <>
      <Header isAboutHeader={false} />
      <div className="content">
        <div className="join-form center-layout">
          <h1 className="center-title">회원가입</h1>
          <form onSubmit={handleSubmit}>
            <ul>
              <li>
                <label htmlFor="mid"><b>아이디</b></label>
                {errors.mid && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.mid}</span>}
                <div>
                  <input type="text" id="mid" name="mid" value={form.mid} onChange={handleChangeForm} onKeyDown={handleIdKeyDown} placeholder="아이디 입력(20자이내)" ref={idRef} />
                  <button type="button" onClick={handleIdCheck}> 중복확인</button>
                </div>
              </li>
              <li>
                <label htmlFor="pwd"><b>비밀번호</b></label>
                {errors.pwd && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.pwd}</span>}
                <div><input type="password" id="pwd" name="pwd" value={form.pwd} onChange={handleChangeForm} placeholder="비밀번호 입력" ref={pwdRef} /></div>
              </li>
              <li>
                <label htmlFor="cpwd"><b>비밀번호 확인</b></label>
                {errors.cpwd && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.cpwd}</span>}
                <div><input type="password" id="cpwd" name="cpwd" value={form.cpwd} onChange={handleChangeForm} placeholder="비밀번호 재입력" /></div>
              </li>
              <li>
                <label htmlFor="name"><b>이름</b></label>
                {errors.name && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.name}</span>}
                <div><input type="text" id="name" name="name" value={form.name} onChange={handleChangeForm} placeholder="이름을 입력해주세요" /></div>
              </li>
              <li>
                <label htmlFor="phone"><b>전화번호</b></label>
                {errors.phone && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.phone}</span>}
                <div><input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChangeForm} placeholder="휴대폰 번호 입력('-' 포함)" /></div>
              </li>
              <li>
                <label htmlFor="address"><b>주소</b></label>
                {errors.address && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.address}</span>}
                <div>
                  <input type="text" i d="address" name="address" value={form.address} onChange={handleChangeForm} placeholder="주소를 입력해주세요" readOnly />
                  <button type="button" onClick={handleAddressSearch}>주소 검색</button>
                </div>
              </li>
              <li>
                <label htmlFor="emailName"><b>이메일 주소</b></label>
                {errors.emailName && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.emailName}</span>}
                {errors.emailDomain && <span style={{ color: 'red', fontSize: '1.2rem' }}>{errors.emailDomain}</span>}
                <div>
                  <input type="text" id="emailName" name="emailName" value={form.emailName} onChange={handleChangeForm} placeholder="이메일 주소" />
                  <span style={{ fontSize: '1.7rem' }}>@</span>
                  <select name="emailDomain" value={form.emailDomain} onChange={handleChangeForm}>
                    <option value="">선택</option>
                    <option value="naver.com">naver.com</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="daum.net">daum.net</option>
                  </select>
                </div>
              </li>
              <li>
                <button type="submit">가입하기</button>
                <button type="reset" onClick={handleResetForm}>다시쓰기</button>
              </li>
            </ul>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
