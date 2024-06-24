<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Web Study</title>
  <link rel="stylesheet" href="/assets/css/feed-list.css">
  <link rel="stylesheet"href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.8/ScrollMagic.min.js"></script>
</head>
<body>

<section id="feed-header">
  <div class="top-section">
    <!-- 검색창 영역 -->
    <div class="search">
      <form action="/feed/list" method="get">

        <select class="form-select" name="type" id="search-type">

          <option value="content">내용</option>
          <option value="writer">작성자</option>
          <option value="cw">내용+작성자</option>
        </select>

        <input type="text" class="form-control" name="keyword" value="${s.keyword}">

        <button class="btn btn-primary" type="submit">
  <%--        <i class="fas fa-search"></i>--%>
          검색
        </button>

      </form>
    </div>

  </div>

  <div class="btn-container">
    <button id="createFeedBtn">새 피드 작성</button>
<%--    <button id="editFeedBtn">피드 수정</button>--%>
  </div>

</section>
<%-- 피드 헤더 끝 --%>
<%-- 피드 목록 시작 --%>
<section id="feed-list">
  <div class="feed-container" id="feedData">
    <div class="feed-item">
      <div class="profile-section">
        <img src="/assets/img/mimo.png" alt="Profile Picture" class="profile-pic">
        <span class="nickname">nickname123</span>
      </div>
      <div class="image-carousel">
        <img src="/assets/img/floating.jpg" alt="Post Image" class="post-image">
        <!-- Add more images here for carousel -->
      </div>
      <div class="content-section">
        <span>너무 더워</span>
      </div>
      <div class="interaction-section">
        <span class="comments">💬 10</span>
        <span class="hearts">❤️ 25</span>
        <span class="bookmarks">🔖 5</span>
      </div>
    </div>
  </div>
</section>
<%-- 피드 목록 끝 --%>
<!-- 피드 작성 모달 -->
<div id="createFeedModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <div id="createFeedForm">
      <label for="cr-nickname">닉네임:</label>
      <input type="text" id="cr-nickname" name="nickname" required>
      <label for="cr-content">내용:</label>
      <input type="text" id="cr-content" name="content" required>
      <label for="postImage">이미지 업로드:</label>
      <input type="file" id="postImage" name="postImage" accept="image/*" required>
      <div class="dropbox"></div>
      <button type="submit" id="feed-post-Btn">게시</button>
    </div>
  </div>
</div>
<!-- 피드 작성 모달 끝 -->
<!-- 피드 수정 모달 -->
<div id="editFeedModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <div id="editFeedForm">
      <label for="editNickname">닉네임:</label>
      <input type="text" id="editNickname" name="nickname" required>
      <label for="editContent">내용:</label>
      <input type="text" id="editContent" name="nickname" required>
      <label for="editPostImage">이미지 업로드:</label>
      <input type="file" id="editPostImage" name="postImage" accept="image/*">
      <button type="submit" id="feed-modify-Btn">수정 적용</button>
    </div>
  </div>
</div>
<!-- 피드 수정 모달 끝 -->
<!-- 피드 상세조회 모달 -->
<div id="detailFeedModal" class="detail-modal">
  <div class="detail-modal-content">
    <div class="feed-left-side">
      <div class="image-carousel">
        <img src="/assets/img/floating.jpg" alt="Post Image" class="post-image">
        <!-- Add more images here for carousel -->
      </div>
    </div>
    <div class="feed-right-side">
      <div class="profile-section">
        <img src="/assets/img/mimo.png" alt="Profile Picture" class="profile-pic">
        <span class="nickname">nickname</span>
        <span class="created-at">createdAt</span>
        <button class="edit-feed" id="editFeedBtn">수정</button>
        <button class="delete-feed" id="deleteFeedBtn">삭제</button>
      </div>
      <div class="detail-content">
<%--        <h2>Title</h2>--%>
        <p>Some description or content goes here...</p>
      </div>
      <div class="feed-comments">
        <h3>댓글</h3>
        <div class="comment">
          <p><strong>User1:</strong> This is a comment.</p>
        </div>
        <div class="comment">
          <p><strong>User2:</strong> Another comment.</p>
        </div>
        <!-- Add more comments here -->
      </div>
    </div>
    <span class="close">&times;</span>
  </div>
</div>
<%-- 피드 상세조회 모달 끝 --%>

<%-- 스크립트 --%>
<script type="module" src="/assets/js/feed-list.js"></script>
</body>
</html>