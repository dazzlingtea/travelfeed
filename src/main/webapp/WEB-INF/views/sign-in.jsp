<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="KO">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form action="/sign-in" name="sign-in" method="post" id="signInForm">
        <input 
        type="text" 
        name="account" 
        id="signInId"
        class="form-control tooltipstered" 
        required="required" 
        placeholder="최대 10자"
        >
        <input 
        type="password" 
        size="17" 
        maxlength="20" 
        id="signInPw"
        name="password" 
        class="form-control tooltipstered"
        required="required"
        placeholder="최소 8자"
        >
        <label class="auto-label" for="auto-login">
            <span><i class="fas fa-sign-in-alt"></i>자동 로그인</span>
            <input type="checkbox" id="auto-login" name="autoLogin">
        </label>
        <div class="login_btn">
            <input type="submit" value="로그인" class="btn form-control tooltipstered" id="signIn-btn">
        </div>
    </form> 
    
    <script>
        //서버에 전송된 로그인 검증 메세지
        const result = '${result}';
        console.log('result : ', result);
        if(result == 'NO_ACC'){
            alert('아이디가 없어');
        }else if(result == 'NO_PW'){
            alert('비번이 틀려쪙');
        }

        // 비회원 상태로 접근제한 페이지에 들어갔다 온 경우
        const params = new URLSearchParams(window.location.search);
        const message = params.get('message');

        if (message === 'login-required') {
            alert('로그인이 필요한 서비스입니다.')
            const newUrl = window.locaion.origin + window.location.pathname;
            history.replaceState(null, null, newUrl);
        }
    </script>
</body>
</html>