import {debounce} from "../util.js";

const $myFeedBtn = document.getElementById('my-feed-btn');
const $myBoardBtn = document.getElementById('my-board-btn');
const $feedTab = document.getElementById('my-feed-tab');
const $boardTab = document.getElementById('my-board-tab');

let currentMyFeedPage = 1; // 현재 무한스크롤시 진행되고 있는 페이지 번호
let isFetchingMyFeed = false; // 데이터 불러오는 중에는 더 가져오지 않게 제어하기 위한 논리변수
let totalMyFeeds = 0;  // 총 게시글 수
let loadedMyFeeds = 0;  // 로딩된 게시글 수

// 마이페이지 동행 탭 닫고 피드 탭 열기
function openFeedTab(account) {
  fetchMyFeedList(account);
  $boardTab.classList.add('inactive-tab');
  $boardTab.classList.remove('active-tab')
  $myBoardBtn.classList.remove('active-tab-btn');

  $feedTab.classList.add('active-tab');
  $feedTab.classList.remove('inactive-tab');
  $myFeedBtn.classList.add('active-tab-btn');
}
function openBoardTab(account) {
  $feedTab.classList.add('inactive-tab');
  $feedTab.classList.remove('active-tab');
  $myFeedBtn.classList.remove('active-tab-btn');

  $boardTab.classList.add('active-tab');
  $boardTab.classList.remove('inactive-tab');
  $myBoardBtn.classList.add('active-tab-btn')
}

// 피드 탭 열기 이벤트
$myFeedBtn.addEventListener('click', e => {
  const account = $myFeedBtn.dataset.myAccount
  openFeedTab(account);
});
$myBoardBtn.addEventListener('click', e => {
  const account = $myBoardBtn.dataset.myAccount
  openBoardTab(account);
})

// 마이페이지 피드 탭에 태그 추가
function appendMyFeeds(myFeedListDto) {
  const {myFeeds, loginUser} = myFeedListDto;
  let tag = '';

  if (myFeeds === null) { // 작성한 피드가 없는 경우
    tag = `
      <div class="no-feed">
        <p>모든 피드를 다 보셨거나 작성하신 피드가 없습니다.</p>
        <p>${loginUser ? loginUser.nickname : '방문자'}님 기억에 남은 여행을 공유하면 어떨까요?</p>
        <a href="/feed/list"><p>피드 작성하러 가기 →</p></a>
      </div>
      `;
  } else { // 작성한 피드가 존재하는 경우
    myFeeds.forEach(f => {
      const {boardId, image, likeCount, bookmarkCount, replyCount} = f;
      tag += `
        <div class="myfeed-item" data-feed-id="${boardId}">
          <img src="${image.imagePath}" alt="Image 1">
          <div class="overlay">
            <div class="text">
              <ion-icon name="chatbubble" ></ion-icon> ${replyCount}
              <ion-icon name="heart"></ion-icon> ${likeCount}  
              <ion-icon name="bookmark"></ion-icon> ${bookmarkCount}
            </div>
          </div>
        </div>          
      `;
    });
  }
  $feedTab.innerHTML += tag;
}

async function fetchMyFeedList(account, pageNo = 1) {

  const url = `http://localhost:8181/mypage/v1/list/${account}/${pageNo}`;

  if (isFetchingMyFeed) return; // 서버에서 데이터를 가져오는 중이면 return;
  isFetchingMyFeed = true;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }
  const myFeedListDto = await res.json();
  console.log('마이피드: ', myFeedListDto);

  if (pageNo === 1) {
    totalMyFeeds = myFeedListDto.pageInfo.totalCount;
    loadedMyFeeds = 0;

    const $feedTab = document.getElementById('my-feed-tab');
    $feedTab.innerHTML = '';
    setupMyFeedInfiniteScroll();
  }
  // 피드 목록 렌더링
  appendMyFeeds(myFeedListDto);
  currentMyFeedPage = pageNo;
  isFetchingMyFeed = false;

  $feedTab.addEventListener('click', e => {
    const feedId = +e.target.closest('.myfeed-item').dataset.feedId;
    if (!feedId) return;

    window.location.href = `/feed/list?feedId=${feedId}`;
  });

  // 피드 모두 가져오면 스크롤이벤트 제거
  if (loadedMyFeeds >= totalMyFeeds) {
    console.log('마이페이지 피드 모두 가져옴! 스크롤 이벤트 제거')
    document.body.removeEventListener('scroll', debouncedMyFeedScrollHandler);
  }

}

// 디바운싱 스크롤 이벤트 핸들러
const debouncedMyFeedScrollHandler = debounce(async function (e) {

  console.log("스크롤 이벤트 시작!");
  const scrollHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
  );
  const scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
  const clientHeight = document.documentElement.clientHeight;

  // 스크롤이 최하단부로 내려갔을 때만 이벤트 발생시켜야 함
  if (scrollTop + clientHeight + 200 >= scrollHeight
    && !isFetchingMyFeed
  ) {
    // 서버에서 데이터를 비동기로 불러와야 함
    console.log("스크롤 이벤트 핸들러 함수 실행");
    // showSpinner();
    await new Promise(resolve => setTimeout(resolve, 700));
    const account = $myFeedBtn.dataset.myAccount;
    await fetchMyFeedList(account, currentMyFeedPage + 1);
  }
}, 700);

// 무한 스크롤 이벤트 생성 함수
export function setupMyFeedInfiniteScroll() {
  console.log("스크롤이벤트 생성 함수 실행");

  document.body.addEventListener('scroll', debouncedMyFeedScrollHandler)
}
