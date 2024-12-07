import {
  clearImageFiles,
  dataToFormData,
  deletePreview,
  handleFileInputChange,
  imageFiles as importedImages
} from "../image.js";
import {fetchFeedPost, resetPostModal} from "./feed-post.js";
import {fetchFeedDetail} from "./feed-detail.js";

import {fetchFeedModify, setEditModal} from "./feed-modify.js";
import {fetchFeedList, getSearchKeyword, getSortSelected} from "./feed-getList.js";
import {fetchFeedDelete} from "./feed-delete.js";
import {fetchBookmark, fetchLike} from "./feed-interaction.js";

import {initInfScroll} from "../feed-reply/feed-getReply.js";
import {fetchReplyPost} from "../feed-reply/feed-postReply.js";
import {modifyReplyClickEvent, isEditModeActive, fetchReplyModify} from "../feed-reply/feed-modifyReply.js";
import {removeReplyClickEvent} from "../feed-reply/feed-deleteReply.js";


export function initFeedFormEvents() {
  const $feedPostBtn = document.getElementById('feed-post-Btn');
  const $feedEditBtn = document.getElementById('feed-modify-Btn');
  const $feedDeleteBtn = document.getElementById('confirmDeleteBtn');
  const $feedDelCancelBtn = document.getElementById('cancelDeleteBtn');
  const $imageInputPost = document.getElementById('postImage');
  const $imageInputEdit = document.getElementById('editPostImage');
  const $imageBoxPost = document.getElementById('post-preview');
  const $imageBoxEdit = document.getElementById('edit-preview');
  const $replyAddBtn = document.getElementById('replyAddBtn'); // 댓글 등록 버튼

  let imageFiles = [];

  const createModal = document.getElementById("createFeedModal");
  const editModal = document.getElementById("editFeedModal");
  const detailModal = document.getElementById("detailFeedModal");
  const deleteModal = document.getElementById('deleteFeedModal')

  function openModal(modal, boardId) {
    modal.style.display = "block";
    modal.setAttribute("data-board-id", boardId);
  }

  // 모달 및 모달 닫기 버튼 처리
  document.addEventListener('click', function (e) {

    // 모달 열기 버튼 처리
    if (e.target.id === "createFeedBtn" || e.target.closest('#createFeedBtn')) {
      const tag = e.target.id === 'createFeedBtn' ? e.target : e.target.closest('#createFeedBtn');
      if (tag.dataset.feedUser) {
        createModal.style.display = "block";
      } else {
        alert("피드 작성 시 로그인이 필요합니다.");
        window.location.href = '/sign-in';
      }

    } else if (e.target.classList.contains("show-detail") || e.target.closest('.show-detail')) { // 더보기, 피드목록 댓글 클릭시 디테일 모달 열기
      const boardId = e.target.closest('.feed-item').dataset.feedId;
      openModal(detailModal, boardId);
      fetchFeedDetail(boardId);
      initInfScroll(boardId);

    } else if (e.target.id === "editFeedBtn") { // 디테일 모달의 수정 버튼
      const boardId = e.target.closest('.detail-modal').dataset.boardId;
      openModal(editModal, boardId);
      setEditModal(); // 수정모달 초기값 렌더링

    } else if (e.target.id === "deleteFeedBtn") { // 디테일 모달의 삭제 버튼
      const boardId = e.target.closest('.detail-modal').dataset.boardId;
      openModal(deleteModal, boardId);
    }


    // 모달 닫기 버튼 처리
    if (e.target.classList.contains("close")) {
      const modal = e.target.closest('.modal');
      const modalDetail = e.target.closest('.detail-modal');
      const modalConfirm = e.target.closest('.confirm-modal');
      if (modal) {
        resetPostModal(); // 모달 입력사항 초기화
        clearImageFiles(); // 모달이 닫힐 때 imageFiles 초기화
        imageFiles = [];
        modal.style.display = "none";
      } else if (modalDetail) {
        modalDetail.style.display = "none";
        clearImageFiles();
      } else if (modalConfirm) {
        modalConfirm.style.display = "none";
        detailModal.style.display = "none";
      }

    }

    // 모달 백드롭 클릭 시 닫기 처리
    if (e.target.matches('#createFeedModal')
      || e.target.matches('#editFeedModal')
      || e.target.matches('#detailFeedModal')
      || e.target.matches('#deleteFeedModal')
    ) {
      if (!e.target.closest('.modal-content') && !e.target.closest('.detail-modal-content')) {
        e.target.style.display = "none";
        resetPostModal(); // 피드 작성 모달 입력사항 초기화
        clearImageFiles(); // 모달이 닫힐 때 imageFiles 초기화
      }
    }
    // 마이페이지 피드 상세 조회
    const urlParams = new URLSearchParams(window.location.search);
    const feedId = urlParams.get('feedId'); // feedId 파라미터 추출

    if (feedId) {
      openModal(detailModal, feedId);
      fetchFeedDetail(feedId);
      initInfScroll(feedId);
    }

  });

  // 이미지 input 변경 시 발생 이벤트
  function validateImageInput(tag, qsName, e) {
    const $imgMsg = document.querySelector(qsName + ' .img-msg');
    const $box =
      qsName.substring(1, 7).toLowerCase() === 'create' ? $imageBoxPost : $imageBoxEdit;
    console.log('validate이미지 : ', imageFiles)
    console.log('validateImported : ', importedImages)
    console.log('v tag: ', tag);
    console.log('v e.target: ', e.target);

    if (imageFiles.length === 10 || importedImages.length === 10) {
      $imgMsg.classList.add('warning');
      return;
    }
    if(tag === e.target) {
      imageFiles = handleFileInputChange(e, importedImages, $box);
    }
    if (imageFiles.length === 0) {
      $imgMsg.classList.add('warning');
      return false;
    } else {
      $imgMsg.classList.remove('warning');
      return true;
    }
  }

  $imageInputPost.addEventListener('change', e => {
    validateImageInput($imageInputPost, '#createFeedModal', e);
  });

  $imageInputEdit.addEventListener('change', e => {
    validateImageInput($imageInputEdit, '#editFeedModal', e);
  });

  // 텍스트 입력 및 검증 이벤트
  const $textareaPost = document.getElementById('cr-content');
  const $textareaEdit = document.getElementById('ed-content');

  function validateTextarea(tag, qsName) {
    const text = tag.value;
    const length = text.length;
    const $typingCnt = document.querySelector(qsName + ' .typing-count');
    const $span = document.querySelector(qsName + ' .txt-msg');

    $typingCnt.textContent = length.toString();

    if (length > 50 || tag.clientHeight !== tag.scrollHeight) {
      // alert('피드 본문은 최대 4줄 또는 50자까지 입력 가능합니다.');
      $span.classList.add('warning');
      // 글자 수가 50자 이상인 경우
      if (length > 50) {
        tag.value = text.substring(0, 50);
      }
      // 줄 수가 4줄을 초과한 경우
      if (tag.clientHeight !== tag.scrollHeight) {
        const lines = text.split('\n');
        tag.value = lines.slice(0, 4).join('\n');
      }
    } else {
      $span.classList.remove('warning');
    }
    $typingCnt.textContent = tag.value.length.toString();
    if (tag.value) {
      $span.classList.remove('hidden');
      return true;
    } else {
      $span.classList.add('hidden');
      return false;
    }
  }

  $textareaPost.addEventListener('input', e => {
    validateTextarea(e.target, '#createFeedModal');
  });
  $textareaEdit.addEventListener('input', e => {
    validateTextarea(e.target, '#editFeedModal');
  });


  // 미리보기 삭제 버튼 이벤트
  $imageBoxPost.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-prev-image')) {
      deletePreview(e, $imageBoxPost);
    }
  })
  $imageBoxEdit.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-prev-image')) {
      deletePreview(e, $imageBoxEdit);
    }
  });

  // 모달 작성 완료 버튼 클릭 시 이벤트
  $feedPostBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    // 태그들 value, 이미지 파일명 가져오기
    const createContent = document.getElementById('cr-content').value;
    const modalId = '#createFeedModal';
    if (!(
      validateTextarea($textareaPost, modalId)
      &&
      validateImageInput($imageInputPost, modalId, e)
    )) {
      const $stopSpan = document.querySelector(modalId + ' .stop-msg');
      $stopSpan.classList.remove('hidden');
      return;
    }

    const data = {
      content: createContent,
    }
    const formData = dataToFormData(data, importedImages);
    const payload = {
      method: 'POST',
      body: formData
    };

    await fetchFeedPost(payload);
  });

  // 모달 수정 완료 버튼
  $feedEditBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const boardId = document.getElementById('editFeedModal').dataset.boardId;
    const editContent = document.getElementById('ed-content').value;
    const modalId = '#editFeedModal';

    if (!(
      validateTextarea($textareaEdit, modalId, e)
      &&
      validateImageInput($imageInputEdit, modalId, e)
    )) {
      const $stopSpan = document.querySelector(modalId + ' .stop-msg');
      $stopSpan.classList.remove('hidden');
      return;
    }

    const data = {
      content: editContent,
    }
    const formData = dataToFormData(data, importedImages);
    const payload = {
      method: 'PUT',
      body: formData
    }
    await fetchFeedModify(boardId, payload);
  })

  // 모달 삭제 확인 버튼
  $feedDeleteBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const boardId = document.getElementById('deleteFeedModal').dataset.boardId;
    const payload = {
      method: 'DELETE',
      headers: {'content-type': 'application/json'}
    }
    await fetchFeedDelete(boardId, payload)
    deleteModal.style.display = "none";
    detailModal.querySelector('.close').click();
    await fetchFeedList();
    window.scrollTo(0, 0);

  })

  // 스크롤 최상단으로 이동 버튼
  const topBtn = document.getElementById('goTopBtn');
  topBtn.addEventListener('click', e => {
    e.preventDefault();
    document.body.scrollTo({top: 0, behavior: 'smooth'});
  })
  window.addEventListener('scroll', () => {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      topBtn.style.display = 'block';
    } else {
      topBtn.style.display = 'none';
    }
  });

  // 스크롤 최하단으로 이동 버튼
  const bottomBtn = document.getElementById('goBottomBtn');
  bottomBtn.addEventListener('click', e => {
    e.preventDefault();
    document.body.scrollTop = document.body.scrollHeight;
  })

  // 좋아요 버튼, 북마크 버튼 클릭 시 상태 업데이트
  document.addEventListener('click', e => {
    const $heartSpan = e.target.closest('.hearts');
    if ($heartSpan) {
      const boardId = $heartSpan.closest('.feed-item').dataset.feedId;
      fetchLike($heartSpan.firstElementChild, boardId);
    }

  })
  document.addEventListener('click', e => {
    const $bookmarkSpan = e.target.closest('.bookmarks');
    if ($bookmarkSpan) {
      const boardId = $bookmarkSpan.closest('.feed-item').dataset.feedId;
      fetchBookmark($bookmarkSpan.firstElementChild, boardId);
    }
  })

  // 검색
  document.querySelector('.search input[name="keyword"]').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchFeedList();
    }
  });
  // 정렬
  document.getElementById('filters-box').addEventListener('click', e => {
    const $latest = document.getElementById('filter-latest');
    const $popular = document.getElementById('filter-pop');
    if (e.target.matches('#filter-latest')) {
      $latest.classList.add('active-filter');
      $popular.classList.remove('active-filter');
    } else if (e.target.matches('#filter-pop')) {
      $latest.classList.remove('active-filter');
      $popular.classList.add('active-filter');
    }
    fetchFeedList();
  })

  // 댓글 관련 이벤트

  document.getElementById('replyAddBtn').onclick = async () => {
    if (isEditModeActive()) {
      // 수정 모드일 때
      await fetchReplyModify();
    } else {
      // 일반 모드일 때
      await fetchReplyPost();
    }
  };


  const newReplyText = document.getElementById('newReplyText');
  const replyAddBtn = document.getElementById('replyAddBtn');

  const toggleReplyAddBtnVisibility = () => {
    if (newReplyText.value.trim() !== "") {
      replyAddBtn.style.display = "block"; // Show button
    } else {
      replyAddBtn.style.display = "none"; // Hide button
    }
  };

  newReplyText.addEventListener('input', toggleReplyAddBtnVisibility);

  newReplyText.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      if (newReplyText.value.trim() !== "") {
        if (isEditModeActive()) {
          // 수정 모드일 때
          await fetchReplyModify();
        } else {
          // 일반 모드일 때
          await fetchReplyPost();
        }
        newReplyText.value = "";
        replyAddBtn.style.display = "none";
      }
    }
  });

  replyAddBtn.style.display = "none";


  modifyReplyClickEvent();
  removeReplyClickEvent();
}
