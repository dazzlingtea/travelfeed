<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>피드 : 위드트립</title>
    <%@ include file="include/static-head.jsp" %>
    <link rel="stylesheet" href="/assets/css/feed-list.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.2/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
</head>
<body>
<%@ include file="include/sub_header.jsp" %>
<section id="feed-header">
    <div class="top-section">
        <!-- 검색창 영역 -->
        <div class="search">
            <form id="searchFeed" method="get">
                <input type="hidden" name="type" value="cw">
                <input type="text" class="form-control" name="keyword" placeholder="피드를 찾아보세요." >
            </form>
        </div>

        <div class="filters" id="filters-box">
            <div id="filter-latest" class="filter-item active-filter" data-sort="latest">최신글</div>
            <div id="filter-pop" class="filter-item" data-sort="pop">인기글</div>
        </div>
    </div>
</section>
<%-- 사이드 버튼 --%>
<div class="btn-container">
    <div id="goTopBtn" class="side-btn"><i class="fas fa-angle-double-up"></i></div>
    <div id="goBottomBtn" class="side-btn"><i class="fas fa-angle-double-down"></i></div>
</div>
<%-- 피드 헤더 끝 --%>
<%-- 피드 목록 시작 --%>
<section id="feed-list">
    <div class="feed-container" id="feedData">
    <%-- 피드 목록 아이템 --%>
    </div>
    <%-- 피드 목록 스피너 --%>
    <div class="spinner-section">
        <div class="spinner-container" id="loadingFeedSpinner">
            <div class="spinner-border text-gray" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
</section>
<%-- 피드 목록 끝 --%>
<%-- 피드 작성 버튼 --%>
<div class="cr-btn-container">
    <div id="createFeedBtn" class="" data-feed-user="${user != null ? user.account : ""}"> 새로운 피드 작성  <i class="fas fa-pen"></i></div>
</div>
<!-- 피드 작성 모달 -->
<div id="createFeedModal" class="modal" data-feed-user="${user != null ? user.account : "null"}">
    <div class="modal-content">
        <span class="close close-modal">&times;</span>
        <div id="createFeedForm">
            <label for="cr-nickname">닉네임</label>
            <input type="text" id="cr-nickname" name="nickname" required value="${user.nickname}" readonly>
            <label for="cr-content">내용</label>
            <span class="typing-text"> <span class="typing-count">0</span>/50</span> <span class="typing-text txt-msg hidden">최대 4줄 또는 50자까지 입력 가능합니다.</span>
            <textarea id="cr-content" name="content" rows="4" placeholder="최대 4줄 또는 50자까지 입력 가능합니다." required></textarea>
            <label for="postImage" class="fake-upload">+ 이미지 업로드</label>
            <span class="typing-text img-msg">최대 10장까지 업로드 가능합니다.</span>
            <input type="file" id="postImage" name="postImage" class="hidden" accept="image/*" required>
            <div class="dropbox" id="post-preview"></div>
            <span class="hidden warning stop-msg">내용 또는 이미지가 없습니다!</span>
            <button type="submit" id="feed-post-Btn" class="one-modal-btn">새로운 피드 등록하기</button>
        </div>
    </div>
</div>
<!-- 피드 작성 모달 끝 -->
<!-- 피드 수정 모달 -->
<div id="editFeedModal" class="modal">
    <div class="modal-content">
        <span class="close close-modal">&times;</span>
        <div id="editFeedForm">
            <label for="ed-nickname">닉네임</label>
            <input type="text" id="ed-nickname" name="nickname" required readonly>
            <label for="ed-content">내용</label>
            <span class="typing-text"> <span class="typing-count">0</span>/50</span> <span class="typing-text txt-msg hidden">최대 4줄 또는 50자까지 입력 가능합니다.</span>
            <textarea type="text" id="ed-content" name="nickname" rows="4" placeholder="최대 4줄 또는 50자까지 입력 가능합니다." required></textarea>
            <label for="editPostImage" class="fake-upload">+ 이미지 업로드</label>
            <span class="typing-text img-msg">최대 10장까지 업로드 가능합니다.</span>
            <input type="file" id="editPostImage" name="postImage" class="hidden" accept="image/*">
            <div class="dropbox" id="edit-preview"></div>
            <span class="hidden warning stop-msg">내용 또는 이미지가 없습니다!</span>
            <button type="submit" id="feed-modify-Btn" class="one-modal-btn">수정 완료</button>
        </div>
    </div>
</div>
<!-- 피드 수정 모달 끝 -->
<!-- 피드 상세조회 모달 -->
<div id="detailFeedModal" class="detail-modal" data-login="${user != null ? user.account : ""}">
    <div class="detail-modal-content">
        <div class="feed-left-side">
            <div class="image-carousel">
                <img src="/assets/img/floating.jpg" alt="Post Image" class="post-image">
                <!-- Add more images here for carousel -->
            </div>
        </div>

        <div class="feed-right-side">
            <div class="profile-section">
                <div class="profile-row">
                    <div class="profile-box">
                        <img src="/assets/img/anonymous.jpg" alt="Profile Picture" class="profile-pic">
                    </div>
                    <div class="profile-column">
                        <span class="nickname">nickname</span>
                        <span class="created-at">createdAt</span>
                    </div>
                </div>
                <div class="profile-row row2" id="detail-update-btn">
                </div>
            </div>
            <div class="detail-content">
                <p>
                </p>
            </div>
            <!-- 댓글 영역 -->

            <div id="replies" class="row">
                <div class="offset-md-1 col-md-10">

                    <!--댓글 내용 영역-->
                    <div class="card" style="width: 427px">
                        <!-- 댓글 내용 헤더 -->
                        <div class="card-header text-white m-0" style="width: 427px;">
                            <div class="float-left">댓글 (<span id="replyCnt" style="padding: 0;">0</span>)</div>
                        </div>

                        <!-- 댓글 내용 바디 -->
                        <div id="replyCollapse" class="card" style="width: 427px;">
                            <div id="replyData">
                                <!--
                                < JS로 댓글 정보 DIV삽입 >
                                -->
                                <!-- 대댓글 내용 바디 -->
                                <div id="nestedReplyCollapse" class="card">
                                    <div id="nestedReplyData">
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>


                    <!-- 댓글 쓰기 영역 -->
                    <div class="card" style="width: 427px;">
                        <div class="card-body">
                            <c:if test="${user == null}">
                                <a href="/sign-in" style="text-decoration-line: none; font-weight: 700;">댓글은 로그인 이후에 작성해주세요! :)</a>
                            </c:if>
                            <c:if test="${user != null}">
                                <div class="rows">
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="newReplyWriter" hidden>댓글 작성자</label>
                                            <input
                                                    id="newReplyWriter"
                                                    name="replyWriter"
                                                    type="text"
                                                    value="${user.nickname}"
                                                    class="form-control"
                                                    placeholder="작성자 이름"
                                                    style="margin-bottom: 6px;
                                 width: 100px;"
                                                    readonly
                                            />
                                        </div>
                                        <div class="col-md-90">
                                            <div class="form-group">
                                                <label for="newReplyText" hidden>댓글 내용</label>
                                                <input
                                                        rows="3"
                                                        id="newReplyText"
                                                        name="replyText"
                                                        class="form-control"
                                                        style="width: 232px;"
                                                        placeholder="댓글을 입력해주세요."
                                                />
                                            </div>
                                            <button
                                                    id="replyAddBtn"
                                                    type="button"
                                                    class="btn btn-dark form-control1"
                                                    style="width: 60px;
                                 margin: 6px 0;"
                                            >
                                                등록
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </c:if>
                        </div>
                    </div>
                    <!-- end reply write -->


                    <!-- 댓글 페이징 영역 -->
                    <ul class="pagination justify-content-center">
                        <!--
                        < JS로 댓글 페이징 DIV삽입 >
                        -->
                    </ul>
                </div>
            </div>
            <!-- end reply content -->

            <!-- 댓글, 대댓글 삭제모달 -->
            <div id="deleteConfirmModal1" class="modal1" style="display: none;">
                <div class="modal-content1" style="bottom: -190px;">
                    <span class="close1" style="text-align: end;">&times;</span>
                    <p style="font-size: 30px; text-align: center;">정말 삭제하시겠습니까?</p>
                    <div class="modal-buttons1" style="top: 25px;">
                        <button id="confirmDeleteBtn1">삭제</button>
                        <button id="cancelDeleteBtn1">취소</button>
                    </div>
                </div>
            </div>       

            <div class="spinner-container" id="loadingSpinner">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
        <!-- end replies row -->


        <%-- 디테일 모달 닫기 --%>
        <span class="close">&times;</span>

    </div>
</div>
<%-- 피드 상세조회 모달 끝 --%>
<%-- 삭제 확인 모달 --%>
<!-- Button trigger modal -->
<%--<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">--%>
<%--    Launch demo modal--%>
<%--</button>--%>

<!-- Modal -->
<div id="deleteFeedModal" class="confirm-modal">
    <div class="modal-content confirm">
        <span class="close close-modal">&times;</span>
        <h3>피드 삭제</h3>
        <p>정말 삭제하시겠습니까?</p>
        <div class="modal-buttons">
            <button id="cancelDeleteBtn" class="cancel-btn">취소</button>
            <button id="confirmDeleteBtn" class="confirm-btn">삭제</button>
        </div>
    </div>
</div>
<%-- 삭제 확인 모달 끝 --%>


<%-- 스크립트 --%>
<%-- 부트스트랩, 스크롤매직--%>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.8/ScrollMagic.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>

<%-- 아이콘 --%>
<script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
<%--<script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>--%>
<%-- 스크립트 모듈 --%>
<script type="module" src="/assets/js/feed-list.js"></script>

</body>
</html>