import {FEED_URL} from "../feed-list.js";
import {imageFiles as importedImageFiles } from "../image.js";
import {fetchFeedDetail} from "./feed-detail.js";
import {fetchFeedList} from "./feed-getList.js";
import {initInfScroll} from "../feed-reply/feed-getReply.js";

const createFeedModal = document.getElementById('createFeedModal')
// const $feedPostBtn = document.getElementById('feed-post-Btn')
// const $imageInput = document.getElementById('postImage');
const $imageBox = createFeedModal.querySelector('.dropbox');
let imageFiles = importedImageFiles; // 다른 변수에 할당하여 재할당 가능



// 등록 후 디테일 모달 열기
function openDetailModal(newBoardId) {
    const detailModal = document.getElementById("detailFeedModal");
    detailModal.setAttribute("data-board-id", newBoardId);

    fetchFeedList();
    fetchFeedDetail(newBoardId);
    initInfScroll(newBoardId);
    detailModal.style.display = "block";
}


// 작성 모달 닫을 경우 모달 입력사항 리셋
export function resetPostModal() {
    document.getElementById('cr-content').value = '';
    document.querySelector('#createFeedForm .typing-count').textContent = '0';
    $imageBox.innerHTML = '';
}


// 미리보기 확인 후 fetch
export const fetchFeedPost = async (payload) => {
    console.log("fetchFeedPost 실행!");
    try {
        const res
            = await fetch(FEED_URL + '/v1/list', payload);
        if (res.ok) {
            const result = await res.json();

            console.log('fetchFeedPost 이후: ', result);

            document.getElementById('createFeedModal').style.display = 'none';
            imageFiles = []; // 파일 리스트 초기화
            $imageBox.innerHTML = '';

            const newBoardId = result.boardId;
            openDetailModal(newBoardId);

        } else {
            throw new Error('서버 응답이 올바르지 않습니다.');
        }
    } catch (e) {
        console.log('fetchFeedPost 에러: ', e);
    }
};



