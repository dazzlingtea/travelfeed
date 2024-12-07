// 이미지
export let imageFiles = [];
// DataTransfer 객체 생성
const dataTransfer = new DataTransfer();

// 이미지 배열 순서대로 미리보기 렌더링
function updatePreview(file, index) {
  const imgUrl = URL.createObjectURL(file);
  return `
        <div class="image-frame"> 
            <img src="${imgUrl}" class="image-item" alt="preview image">
            <div class="delete-prev-image" data-image-order="${index}">취소</div>
        </div>
  `;
}


// input 업로드된 파일 미리보기 렌더링 함수
// imageBox는 미리보기 이미지가 렌더링될 DOM
export function previewImages(files, imageBox) {
  // imageBox.innerHTML = ''; // 기존 미리보기 초기화
  let tagString = '';
  if(!files) return; // 업로드 할 이미지가 없으면 종료

  for (let i = 0; i < files.length; i++) {
    tagString += updatePreview(files[i], i);
  }
  imageBox.innerHTML = tagString;
}

function getOriginalFileName(url) {
  const str = url.split("/");
  const setStr = str[str.length - 1].split("_");
  return setStr[setStr.length - 1];
}

// 기존 이미지를 파일로 변환하여 imageFiles에 추가하고 미리보기로 렌더링하는 함수
// images는 img 태그의 src 배열
export async function addExistingImagesToPreview(images, imageBox) {
  // imageBox.innerHTML = ''; // 기존 미리보기 초기화
  let tagString = '';
  imageFiles = []; // 이미지 배열 초기화

  for (let i = 0; i < images.length; i++) {
    const src = images[i];
    const res = await fetch(src);
    const blob = await res.blob();
    const file = new File([blob], getOriginalFileName(src), { type: blob.type });
    imageFiles.push(file);
    tagString += updatePreview(file, i);
  }
  imageBox.innerHTML = tagString;
  console.log('기존미리보기 imageFiles: ', imageFiles)
}

// 이미지 input 변경 시 미리보기 및 이미지 배열 생성
export function handleFileInputChange(e, imageArray, imageBox) {
  console.log(e.target.files)
  imageArray.push(...e.target.files);
  console.log('image.js handle 이미지들 : ', imageArray);
  previewImages(imageArray, imageBox);
  e.target.value = '';
  return imageArray;
}

// 게시글 작성, 수정(이미지 포함) FormData에 담는 함수
// data: FormData에 담아야 할 객체 (ex. {content:''})
export function dataToFormData(data, imageList) {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  imageList.forEach((file, index) => {
    formData.append(`images`, file);
    console.log(index, ' : ', file);
  });
  return formData;
}

// 캐러셀 템플릿에 추가
function addToCarousel(tagBtn, tagImg, identifier) {
  return `
<!--  <div id="carousel${identifier}" class="carousel slide" data-bs-ride="carousel">-->
  <div id="carousel${identifier}" class="carousel slide" data-bs-interval="false">
    <div class="carousel-indicators carousel-one">
      ${tagBtn}
    </div>
    <div class="carousel-inner">
      ${tagImg}
    </div>
    <button class="carousel-control-prev carousel-one" type="button" data-bs-target="#carousel${identifier}" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next carousel-one" type="button" data-bs-target="#carousel${identifier}" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
  `;
}

// 캐러셀 인디케이터 만드는 함수
function makeIndicateBtn(index, identifier) {
  const firstSet = index === 0 ? `class="active" aria-current="true"` : '';
  return `
    <button type="button" data-bs-target="#carousel${identifier}" data-bs-slide-to="${index}" aria-label="Slide ${index+1}" ${firstSet}></button>
  `;
}

// 캐러셀 이미지 태그 만드는 함수
function makeImgTag(imagePath, className, index) {
  const path = (imagePath && imagePath.length !== 0) ? imagePath : '/assets/img/floating.jpg';
  return `
    <div class="carousel-item ${index === 0 ? 'active':''}">
      <img src="${path}" class="${className} d-block w-100" alt="image">
    </div>
    `;
}

// 캐러셀에 추가할 이미지 태그를 문자열로 반환하는 함수
// images: 이미지 배열
// className: img 태그의 클래스
// boardId: 글번호
// delimit: 캐러셀 구분자
// -> carousel + 구분자 + 글번호 형태로 중복 방지
export function renderCarousel(images, className, boardId, delimit) {
  let tagImg = '';
  let tagBtn = '';
  const identifier = delimit + boardId;
  console.log('렌더캐러셀: ', images);

  if (!images || images.length === 0) {
    // 이미지가 없는 경우
    tagImg = makeImgTag('/assets/img/floating.jpg', 'post-image one-pic', 0);
    tagBtn = makeIndicateBtn(0, identifier);

  } else if(images.length === 1) {
    // 이미지 1개인 경우
    tagImg = makeImgTag(images[0].imagePath, className + ' one-pic', 0);
    tagBtn = makeIndicateBtn(0, identifier);

  } else{
    // 개별 이미지 img 태그 추가
    images.forEach((el, index) => {
          tagImg += makeImgTag(el.imagePath, className, index);
          tagBtn += makeIndicateBtn(index, identifier);
        }
    );
  }
  return addToCarousel(tagBtn, tagImg, identifier);
}

// 캐러셀에 이미지 1장이면 <,>, 인디케이터 안보이게 설정
export function setOneImgStyle() {
  document.querySelectorAll('.one-pic').forEach((el) => {
    const hiddenTags = el.closest('.carousel').querySelectorAll('.carousel-one');
    hiddenTags.forEach(el => el.style.visibility="hidden");
  })
}
// imageFiles 배열을 초기화하는 함수
export function clearImageFiles() {
  imageFiles = [];
}

// preview 삭제
export function deletePreview(e, $box) {
  const index = +e.target.dataset.imageOrder;
  const imgFrame = e.target.closest('.image-frame');
  const imgSrc = imgFrame.firstElementChild.src;
  imageFiles.splice(index, 1);

  // url 해제
  URL.revokeObjectURL(imgSrc);
  // DataTransfer 에서 파일 제거
  dataTransfer.items.remove(index);
  console.log('미리보기삭제이벤 imageFiles: ', imageFiles);
  imgFrame?.remove();

  // 남아있는 모든 미리보기 프레임의 dataset.imageOrder 값 업데이트
  const remainingFrames = $box.querySelectorAll('.image-frame');
  remainingFrames.forEach((frame, i) => {
    frame.querySelector('.delete-prev-image').dataset.imageOrder = i;
  });
}