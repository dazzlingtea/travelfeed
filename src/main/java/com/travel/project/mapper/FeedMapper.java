package com.travel.project.mapper;

import com.travel.project.common.Search;
import com.travel.project.dto.response.FeedFindAllDto;
import com.travel.project.dto.response.FeedFindOneDto;
import com.travel.project.entity.Board;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeedMapper {

    // 전체 피드 조회
    List<FeedFindAllDto> findAllFeeds(
            @Param("s") Search s,
            @Param("sort") String sort);

    // 피드 하나 조회
    FeedFindOneDto findFeedById(long boardId);

    // 회원이 작성한 피드 전체 조회
    List<FeedFindAllDto> findAllByAccount(
            @Param("s") Search s,
            @Param("account") String account);

    // 피드 생성
    int saveFeed(Board newBoard);

    // 피드 내용 수정
    boolean modifyFeed(Board newBoard);

    // 피드 삭제 : status 'A' -> 'D' update
    boolean deleteFeed(long boardId);

    // 피드 조회수 갱신 (모달 띄우면 조회수 +1)
    boolean upViewCount(long boardId);

    // 총 피드 수
    int countFeeds(@Param("s") Search search);

    // 피드 총 조회수
    int sumViewCount(long boardId);

    // 새로운 피드 id 조회
    int getNewBoardId();

    // 피드 하나의 총 댓글 수 (댓글 + 대댓글)
    int getTotalReplies(long boardId);

}
