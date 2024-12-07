package com.travel.project.controller;

import com.travel.project.common.Page;
import com.travel.project.common.Search;
import com.travel.project.dto.response.FeedFindOneDto;
import com.travel.project.dto.request.FeedModifyDto;
import com.travel.project.dto.request.FeedPostDto;
import com.travel.project.dto.response.*;
import com.travel.project.login.LoginUtil;
import com.travel.project.mapper.FeedMapper;
import com.travel.project.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/feed/v1")
@Slf4j
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;
    private final LikeService likeService;
    private final FeedMapper feedMapper;
    private final BookmarkService bookmarkService;

    // 피드 전체 조회 요청
    @GetMapping("/list") // 페이지, 검색 쿼리스트링
//    @ResponseBody
    public ResponseEntity<?> list(
            @RequestParam(name = "pageNo", defaultValue = "1") int pageNo,
            @RequestParam(name = "type", defaultValue = "cw", required = false) String type,
            @RequestParam(name = "keyword", defaultValue = "", required = false) String keyword,
            @RequestParam(name = "sort", defaultValue = "latest", required = false) String sort
            , HttpSession session
    ) {
        Search page = new Search(new Page(pageNo, 5), type, keyword);
        page.setKeyword(keyword);
        page.setType(type);

        // DB 조회한 결과를 DTO에 담기
        FeedListDto feeds = feedService.findAll(page, session, sort);

        // 조회 결과가 없는 경우
        if (feeds == null && !keyword.isEmpty()) { // 검색 키워드가 존재하지만 검색결과가 없는 경우
            return ResponseEntity.noContent().build();
        } else if (feeds == null) { // 검색 키워드가 없다면
            return ResponseEntity.noContent().build();
        }
        feeds.setLoginUser(LoginUtil.getLoggedInUser(session));

        return ResponseEntity.ok().body(feeds);
    }

    // 피드 상세 조회 요청
    @GetMapping("/{boardId}")
    @ResponseBody
    public ResponseEntity<?> findOne(
            @PathVariable long boardId
            , HttpSession session) {

        log.debug("컨트롤러 글번호: {}", boardId);

        FeedDetailDto foundFeed = feedService.findById(boardId);

        if (foundFeed == null) {
            return ResponseEntity.noContent().build();
        }
        String loginAccount = LoginUtil.getLoggedInUserAccount(session);
        FeedResponseDto dto = FeedResponseDto.builder()
                .loginAccount(loginAccount)
                .isAdmin(LoginUtil.isAdmin(session))
                .isMine(LoginUtil.isMine(foundFeed.getAccount(), loginAccount))
                .feed(foundFeed)
                .build();
        log.debug("디테일응답: {}", dto);
        return ResponseEntity.ok().body(dto);
    }

    // 생성 요청
    @PostMapping("/list")
    @ResponseBody
    public ResponseEntity<?> makeNewFeed(
            @RequestPart("content") String content,
            @RequestPart("images") List<MultipartFile> images
            , HttpSession session
    ) {
        String loginAccount = LoginUtil.getLoggedInUserAccount(session);
        FeedPostDto dto = FeedPostDto.builder()
                .account(loginAccount)
                .content(content)
                .images(images)
                .build();

        long newBoardId = feedService.insertFeed(dto, session);
        if (newBoardId < 0) {
            return ResponseEntity
                    .internalServerError()
                    .body("피드 등록 실패!");
        }

        return ResponseEntity
                .ok().body(feedService.findById(newBoardId));
    }

    // 수정
    @RequestMapping(value = "/{boardId}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<?> updateFeed(
            @PathVariable long boardId,
            @RequestPart("content") String content,
            @RequestPart("images") List<MultipartFile> images,
            HttpSession session
    ) {

        String boardAccount = feedMapper.findFeedById(boardId).getAccount();
        String userAccount = LoginUtil.getLoggedInUserAccount(session);

        // 피드 작성자 또는 관리자가 아니면 수정 불가
        if (!LoginUtil.isMine(boardAccount, userAccount) && !LoginUtil.isAdmin(session)) {
            return ResponseEntity.badRequest().body("피드 작성자가 아니면 수정할 수 없습니다.");
        }
        FeedModifyDto dto = FeedModifyDto.builder()
                .boardId(boardId)
                .account(boardAccount)
                .content(content)
                .images(images)
                .categoryId(2)
                .build();
        log.debug("피드수정 컨트롤러 req: {}", dto);

        boolean flag = feedService.updateFeed(dto);
        if (!flag) {
            return ResponseEntity
                    .internalServerError()
                    .body("피드 등록 실패!");
        }

        return ResponseEntity
                .ok().body(feedService.findById(boardId));
    }

    // 삭제 - boardId를 받아서 status D로 변경
    @DeleteMapping("/{boardId}")
    @ResponseBody
    public ResponseEntity<?> delete(@PathVariable long boardId, HttpSession session) {

        FeedListDto feeds = feedService.deleteFeed(boardId, session);
        log.debug("컨트롤러 피드삭제 번호: {}", boardId);
        return ResponseEntity.ok().body(feeds);
    }

    // 좋아요 요청 비동기 처리
    @GetMapping("/like/{boardId}")
    @ResponseBody
    public ResponseEntity<?> like(@PathVariable int boardId, HttpSession session) throws SQLException {

        // 로그인 검증
        if (!LoginUtil.isLoggedIn(session)) {
            return ResponseEntity.status(403).body("좋아요는 로그인이 필요합니다.");
        }
        log.info("좋아요 async request 피드 컨트롤러!");
        String account = LoginUtil.getLoggedInUserAccount(session);
        FeedFindOneDto feedById = feedMapper.findFeedById((long) boardId);
        String boardAccount = feedById.getAccount();

        LikeDto dto = likeService.like(account, boardId, boardAccount);// 좋아요 요청 처리

        if (dto == null) {
            return ResponseEntity.status(403).body("자신이 작성한 피드에는 좋아요를 누를 수 없습니다.");
        }
        return ResponseEntity.ok().body(dto);
    }

    // 북마크 요청 비동기 처리
    @GetMapping("/bookmark/{boardId}")
    @ResponseBody
    public ResponseEntity<?> bookmark(@PathVariable int boardId, HttpSession session) throws SQLException {

        // 로그인 검증
        if (!LoginUtil.isLoggedIn(session)) {
            return ResponseEntity.status(403).body("북마크는 로그인이 필요합니다.");
        }
        log.info("북마크 async request 피드 컨트롤러!");
        String account = LoginUtil.getLoggedInUserAccount(session);
        FeedFindOneDto feedById = feedMapper.findFeedById((long) boardId);
        String boardAccount = feedById.getAccount();

        BookmarkDto dto = bookmarkService.bookmark(account, boardId, boardAccount);// 북마크 요청 처리

        if (dto == null) {
            return ResponseEntity.status(403).body("자신이 작성한 피드에는 북마크를 누를 수 없습니다.");
        }
        return ResponseEntity.ok().body(dto);
    }


}
