package com.travel.project.dto.request;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter @ToString
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Builder
public class FeedPostDto {

    private String content; // 피드 내용

    private String account; // 피드 작성자 계정

    // 피드 이미지 데이터
    private List<MultipartFile> images;

}
