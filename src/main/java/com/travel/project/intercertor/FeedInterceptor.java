package com.travel.project.intercertor;

import com.travel.project.entity.AccBoard;
import com.travel.project.login.LoginUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import static com.travel.project.login.LoginUtil.isMine;

@Configuration
@Slf4j
public class FeedInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        HttpSession session = request.getSession();
        if(!LoginUtil.isLoggedIn(session)) {
            // 로그인하지 않은 경우 403 상태코드를 전송
            log.info("인가되지 않은 접근입니다. : {}", request.getRequestURI());
            response.sendError(403);
            return false; // 컨트롤러 진입 차단
        }

        return true;
    }
}
