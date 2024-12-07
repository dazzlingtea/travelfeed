package com.travel.project.config;


import com.travel.project.intercertor.AccBoardInterceptor;
import com.travel.project.intercertor.AfterLoginInterceptor;
import com.travel.project.intercertor.AutoLoginInterceptor;
import com.travel.project.intercertor.FeedInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 만들어 놓은 인터셉터들을 스프링 컨텍스트에 등록하는 설정 파일
@Configuration
@RequiredArgsConstructor
public class InterceptorConfig implements WebMvcConfigurer {

    private final AutoLoginInterceptor autoLoginInterceptor;
    private final AfterLoginInterceptor afterLoginInterceptor;
    private final AccBoardInterceptor accBoardInterceptor;
    private final FeedInterceptor feedInterceptor;

    // 설정 메서드
    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        registry
                .addInterceptor(afterLoginInterceptor)
                // 해당 인터셉터가 동작할 URL을 설정
                .addPathPatterns("/sign-up", "/sign-in") // /sign-up", "/sign-in" 에 대해서 동작을 시키겠다
        ;

        // 게시판 인터셉터
        registry
                .addInterceptor(accBoardInterceptor)
                .addPathPatterns("/acc-board/write", "/acc-board/modify", "/acc-board/delete");


        // 자동로그인 인터셉터 등록
        registry
                .addInterceptor(autoLoginInterceptor)
                .addPathPatterns("/**"); // 모든 경로


        // 피드 인터셉터
        registry
                .addInterceptor(feedInterceptor)
                .addPathPatterns("/feed/v1/**");
    }
}