import {FEED_URL} from "../feed-list.js";

// 좋아요 상태 업데이트
function updateLike($icon, likeCount, userLike) {
    const heartsElement = $icon.closest('.hearts');
    let tag = `<ion-icon name="heart"></ion-icon> ${likeCount}`;
    if(userLike) {
        tag = `<ion-icon name="heart" class="liked"></ion-icon> ${likeCount}`;
    }
    heartsElement.innerHTML = tag;

}
// 좋아요 비동기 요청
export async function fetchLike(tag, boardId) {
    const url = FEED_URL + '/v1/like/'+boardId;
    const res = await fetch(url);

    if (res.status === 403) {
        const msg = await res.text()
        console.log(msg);
        alert(msg);
        window.location.href = '/sign-in';
    }
    const {likeCount, userLike} = await res.json();
    updateLike(tag, likeCount, userLike);

}

// 북마크 상태 업데이트
function updateBookmark($icon, bookmarkCount, userBookmark) {
    const bookmarkElement = $icon.closest('.bookmarks');
    let tag = `<ion-icon name="bookmark"></ion-icon> ${bookmarkCount}`;
    if(userBookmark) {
        tag = `<ion-icon name="bookmark" class="bookmarked"></ion-icon> ${bookmarkCount}`;
    }
    bookmarkElement.innerHTML = tag;

}
// 북마크 비동기 요청
export async function fetchBookmark(tag, boardId) {
    const url = FEED_URL + '/v1/bookmark/'+boardId;
    const res = await fetch(url);

    if (res.status === 403) {
        const msg = await res.text()
        console.log(msg);
        alert(msg);
        window.location.href = '/sign-in';
    }
    const {bookmarkCount, userBookmark} = await res.json();
    updateBookmark(tag, bookmarkCount, userBookmark);

}
