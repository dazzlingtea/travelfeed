import {FEED_URL} from "../feed-list.js";
import {renderCarousel, setOneImgStyle} from "../image.js";
import {getRelTime} from "../util.js";


function setDetailModal(dto) {
  console.log("디테일모달 업데이트 실행!");
  const {feed, loginAccount, mine, admin} = dto;
  const {boardId, account, nickname, profileImage, content, createdAt, feedImageList} = feed;

  const $imgCarousel = document.querySelector('.feed-left-side .image-carousel');
  $imgCarousel.innerHTML = '';

  // 프로필 사진 적용
  const $profile = document.querySelector('.feed-right-side .profile-pic');
  $profile.src = profileImage || '/assets/img/anonymous.jpg';

  // 닉네임 적용
  const $nickname = document.querySelector('.feed-right-side .nickname');
  $nickname.textContent = nickname;

  // 날짜 적용
  const $created = document.querySelector('.feed-right-side .created-at');
  $created.textContent = getRelTime(createdAt);

  // content 적용
  const $content = document.querySelector('.detail-content');
  $content.firstElementChild.innerHTML = content;
  console.log('디테일모달 content: ', content);

  // 상세조회 캐러설에 이미지 추가
  $imgCarousel.innerHTML = renderCarousel(feedImageList, 'post-image d-block w-100', boardId, "Detail");
  setOneImgStyle();

  const $btnContainer = document.getElementById('detail-update-btn');
  $btnContainer.innerHTML = '';
  // 로그인 유저가 작성자 또는 관리자일 때 수정, 삭제 버튼 렌더링
  if( mine === true || admin === true ) {
    $btnContainer.innerHTML = `
    <button class="edit-feed detail-set-btn" id="editFeedBtn">수정</button>
    <button class="delete-feed detail-set-btn" id="deleteFeedBtn">삭제</button>`;
  }
  console.log('디테일: ',mine === true,' / ', admin === true,' / ',loginAccount);
}

// fetch 피드 상세 조회
export async function fetchFeedDetail(boardId) {

  const url = `${FEED_URL}/v1/${boardId}`
  const res = await fetch(url);
  if(!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }
  const feedResponseDto = await res.json();
  console.log("피드디테일 fetch 결과:",feedResponseDto);
  setDetailModal(feedResponseDto);
}