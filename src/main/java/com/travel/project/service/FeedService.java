package com.travel.project.service;

import com.travel.project.common.Page;
import com.travel.project.common.PageMaker;
import com.travel.project.common.Search;
import com.travel.project.dto.response.FeedFindAllDto;
import com.travel.project.dto.response.FeedFindOneDto;
import com.travel.project.dto.request.FeedModifyDto;
import com.travel.project.dto.request.FeedPostDto;
import com.travel.project.dto.response.*;
import com.travel.project.entity.Board;
import com.travel.project.entity.BoardImage;
import com.travel.project.login.LoginUtil;
import com.travel.project.mapper.FeedMapper;
import com.travel.project.util.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedService {

    private final FeedMapper feedMapper;
    private final ImageService imageService;
    private final LikeService likeService;
    private final BookmarkService bookmarkService;

    // 피드 전체 조회
    public FeedListDto findAll(Search search, HttpSession session, String sort) {

        Page page = new Page(search.getPageNo(), search.getAmount());
        String loginAccount = LoginUtil.getLoggedInUserAccount(session);

        List<FeedFindAllDto> feedList = feedMapper.findAllFeeds(search, sort);

        // 조건에 맞는 피드가 없는 경우
        if (feedList.isEmpty()) {
            return null;
        }
        // 각 피드마다 이미지, 댓글 수, 좋아요 수, 북마크 수 추가
        List<FeedDetailDto> listDto = feedList.stream()
            .map(f -> {
                log.debug("전체조회 - 피드서비스 : {}", f);
                FeedDetailDto responseDto = f.toDetailDto();
                responseDto.setContent(formatContent(changeEol(f.getContent()))); // content 변경

                int boardId = (int) f.getBoardId(); // like service 가 int 요구하므로 다운캐스팅

                // 댓글 수 추가
                responseDto.setReplyCount(feedMapper.getTotalReplies(boardId));

                // 좋아요 수, 로그인 유저의 좋아요 여부 추가
                responseDto.setLikeCount(likeService.countLikes(boardId));
                responseDto.setUserLike(likeService.isLikedByUser(loginAccount, boardId));

                // 북마크 수, 로그인 유저의 북마크 여부 추가
                responseDto.setBookmarkCount(bookmarkService.countBookmarks(boardId));
                responseDto.setUserBookmark(bookmarkService.isBookmarkByUser(loginAccount, boardId));

                // Feed 디테일 응답객체에 이미지 담기
                List<BoardImage> feedImages = imageService.findFeedImages(f.getBoardId());
                if (feedImages != null) {
                    responseDto.setFeedImageList(feedImages);
                }
                return responseDto;
            })
            .collect(Collectors.toList());

        return FeedListDto.builder()
                .pageInfo(new PageMaker(page, getCount(search)))
                .feeds(listDto)
                .build();
    }

    // 피드 상세 조회 - 글 번호로
    public FeedDetailDto findById(long boardId) {
        log.debug("글번호: {}", boardId);

        // DB tbl_board 조회 결과 FeedFindOneDto 에 담기
        FeedFindOneDto feedById = feedMapper.findFeedById(boardId);
        log.debug("개별조회: {}", feedById);

        // 피드 상세조회 응답 DTO를 생성
        FeedDetailDto responseDto = feedById.toDetailDto();
        responseDto.setContent(changeEol(feedById.getContent())); // \r\n -> <br>

        // 이미지 모두 조회하여 추가
        List<BoardImage> feedImages = imageService.findFeedImages(feedById.getBoardId());
        if (feedImages != null && !feedImages.isEmpty()) {
            responseDto.setFeedImageList(feedImages);
        }

        return responseDto;
    }

    // 새로운 피드(post DTO)를 tbl_board insert 시도
    // 성공하면 새로운 boardId로 tbl_board_image 이미지 등록
    // 피드 & 이미지 insert 성공하면 새로운 boardId 리턴
    // 피드 & 이미지 insert 실패하면 -1 리턴
    @Transactional
    public long insertFeed(FeedPostDto newFeed, HttpSession session) {

        Board board = Board.builder()
                .content(newFeed.getContent())
                .account(newFeed.getAccount())
                .build();

        // 피드 insert 성공 시 1, 실패 시 0 리턴
        int res = feedMapper.saveFeed(board);

        if (res <= 0) { // 트랜잭션 취소
            throw new RuntimeException("피드 등록 - 글 저장에 실패했습니다.");
        }
        // tbl_board insert 성공하면 tbl_board_image 추가
        long newBoardId = feedMapper.getNewBoardId();
        log.debug("새 피드 번호: {}", newBoardId);

        List<MultipartFile> files = newFeed.getImages();

        if (files == null || files.isEmpty()) {
            throw new RuntimeException("피드 등록 - 이미지 파일이 없습니다.");
        }
        // file 존재하면 DB에 insert
        // 성공하면 등록한 BoardId를 리턴
        // 실패하면 트랜잭션 롤백
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            BoardImage b = BoardImage.builder()
                    .boardId(newBoardId)
                    .imagePath(FileUtil.uploadFile(file))
                    .imageOrder(i) // 인덱스 설정
                    .build();
            // DB insert 성공 ? 등록 이미지의 수 : -1
            int result = imageService.addImage(b);
            if (result < 0) {
                log.debug("file 추가 실패: {}", file);
                throw new RuntimeException("피드 등록 - 이미지 저장에 실패했습니다.");
            }
        }
        return newBoardId; // 피드 등록 완료

    }

    // 피드 수정
    @Transactional
    public boolean updateFeed(FeedModifyDto dto) {

        try {
            // tbl_board 수정
            Board newBoard = dto.toBoardEntity();
            boolean bFlag = feedMapper.modifyFeed(newBoard);
            if (!bFlag) {
                log.debug("게시글 디버그: {}", newBoard);
                throw new RuntimeException("피드 수정 - 글 수정 저장에 실패했습니다.");
            }

            // tbl_board_image 수정 (삭제 후 추가 )
            List<MultipartFile> files = dto.getImages();
            if (files == null || files.isEmpty()) {
                throw new RuntimeException("피드 수정 - 이미지 파일이 없습니다.");
            }

            boolean b = imageService.deleteImages(dto.getBoardId());
            if (!b) throw new RuntimeException("피드 수정 - 기존 이미지 파일 삭제에 실패했습니다.");

            int count = 0;
            for (MultipartFile file : files) {
                BoardImage imageEntity
                        = dto.toImageEntity(file, count++);
                int result = imageService.addImage(imageEntity);
                if (result <= 0) {
                    throw new RuntimeException("피드 수정 - 이미지 저장에 실패했습니다.\n" + imageEntity);
                }
            }

            return true;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // 피드 삭제
    public FeedListDto deleteFeed(long boardId, HttpSession session) {

        boolean flag = feedMapper.deleteFeed(boardId);
        log.debug("피드서비스 삭제: {}", flag);
        return flag ? findAll(new Search(new Page(1, 5)), session,"latest") : null;
    }
    // 조회수 증가
    public boolean addViewCount(long boardId) {
        return feedMapper.upViewCount(boardId);
    }

    // 총 피드 개수
    public int getCount(Search search) {
        return feedMapper.countFeeds(search);
    }

    // 디비에 저장된 textarea 개행문자를 br 태그로 변환
    public String changeEol(String content) {
        return content.replaceAll("\r\n", "<br>");
    }

    // 피드 전체 조회 시 정해진 글자수 이상은 생략
    public String formatContent(String content) {
        int len = 20; // 정해진 글자수

        String[] split = content.split("<br>");
        String result = split[0]; // 첫번째 줄

        // 첫번째 줄이 n글자 보다 긴 경우
        if(split[0].length() > len) {
            result = split[0].substring(0, len) + " ...";

        } else { // 첫번째 줄이 n글자 이하
            if(split.length > 1) { // 두번째 줄이 있는 경우
                result = split[0] + " ...";
            }
        }

        return result;
    }

    @Transactional
    public MyFeedListDto findFeedsByAccount(Search search, HttpSession session) {

        LoginUserInfoDto loggedInUser = LoginUtil.getLoggedInUser(session);

        List<FeedFindAllDto> feedList = feedMapper.findAllByAccount(search, loggedInUser.getAccount());

        // 해당 계정이 작성한 피드가 없는 경우
        if (feedList.isEmpty()) {
            return MyFeedListDto.builder()
                    .loginUser(loggedInUser)
                    .pageInfo(new PageMaker(new Page(search.getPageNo(), search.getAmount()), 0))
                    .myFeeds(null)
                    .build();
        }
        List<MyFeedDto> myFeeds = feedList.stream().map(f -> {

            MyFeedDto myFeed = f.toMyFeed();
            int boardId = (int) f.getBoardId();

            // 이미지 조회한 결과 추가 (1개)
            BoardImage firstOne = imageService.findFirstOne(f.getBoardId());
            if(firstOne == null) throw new RuntimeException("이미지가 존재하지 않습니다.");
            myFeed.setImage(firstOne);

            // 좋아요 수 추가
            myFeed.setLikeCount(likeService.countLikes(boardId));

            // 북마크 수 추가
            myFeed.setBookmarkCount(bookmarkService.countBookmarks(boardId));

            // 댓글 수 추가 (확인 필요)
            myFeed.setReplyCount(feedMapper.getTotalReplies(boardId));

            return myFeed;
        }).collect(Collectors.toList());

        PageMaker pageMaker = new PageMaker(new Page(search.getPageNo(), search.getAmount()), myFeeds.size());

        return MyFeedListDto.builder()
                .loginUser(loggedInUser)
                .pageInfo(pageMaker)
                .myFeeds(myFeeds)
                .build();
    }
}
