package com.travel.project.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedFindOneDto {
    @Setter
    private long boardId; // 게시글 id

    private String account; // 게시글 작성자 계정
    private String nickname; // 게시글 작성자 닉네임
    private String profileImage; // 게시글 작성자 프사
    private int categoryId; // 게시글 카테고리 id(동행 1, 피드 2) 번호
    //    private String title; // 게시글 제목
    private String content; // 게시글 내용
    private int viewCount; // 조회수

    private LocalDateTime createdAt; // 생성일 - 타임스탬프
    private LocalDateTime updatedAt; // 수정일 - 타임스탬프
//    private Status status; // 디폴트 A, 삭제시 D로 수정 필요

    public FeedDetailDto toDetailDto () {
        return FeedDetailDto.builder()
                .boardId(this.boardId)
                .account(this.account)
                .nickname(this.nickname)
                .profileImage(this.profileImage)
                .categoryId(this.categoryId)
                .content(this.content)
                .viewCount(this.viewCount)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

}
