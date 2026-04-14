console.log("📅 date list loaded");

window.addEventListener("DOMContentLoaded", () => {

  const dotsContainer = document.querySelector(".dots");
  const indicator = document.getElementById("slideIndicator");

  let current = 0;

  function getSlides() {
    return Array.from(document.querySelectorAll(".slides > .slide"));
  }
  //리스트 기록//
  function buildDateList() {
    console.log("📅 date list loaded"); // ✅ 여기
  const list = document.getElementById("dateList");
  if (!list) return;

  list.innerHTML = "";

  const slides = getSlides();

  slides.forEach((slide, index) => {
    if (!slide.classList.contains("grid-slide")) return;

    const dateInput = slide.querySelector("input[type='date']");
    if (!dateInput || !dateInput.value) return;

    const item = document.createElement("div");
    item.className = "date-item";
    item.innerText = dateInput.value;

    item.onclick = () => {
      current = index;
      update();
    };

    list.appendChild(item);
  });

// 🔥 여기 추가 (맨 아래)
window.exportHTMLFile = function () {
  const slides = document.querySelector(".slides").innerHTML;

  const fullHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="./style.css">
</head>
<body>

<div class="slides">
${slides}
</div>

<script src="./script.js"></script>
</body>
</html>
`;

  const blob = new Blob([fullHTML], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "design-log.html";
  a.click();
};




}

  // =========================
  // 🔥 CELL 구조 생성 (텍스트 + 이미지)
  // =========================
  function upgradeCells() {
    document.querySelectorAll(".cell").forEach(cell => {

      if (cell.querySelector(".cell-text")) return;

      const old = cell.innerHTML;

      cell.innerHTML = `
        <div class="cell-text" contenteditable="true">${old}</div>
        <div class="cell-images"></div>
      `;
    });
  }

  // =========================
  // 🔥 저장 (전체 HTML)
  // =========================
  function saveAll() {
    const data = [];

    getSlides().forEach(slide => {
      data.push(slide.innerHTML);
    });

    localStorage.setItem("slidesHTML", JSON.stringify(data));
  }

  function loadAll() {
    const data = JSON.parse(localStorage.getItem("slidesHTML"));
    if (!data) return;

    const slides = getSlides();

    data.forEach((html, i) => {
      if (slides[i]) slides[i].innerHTML = html;
    });
  }

  // =========================
  // dots
  // =========================
  function buildDots() {
    const slides = getSlides();
    dotsContainer.innerHTML = "";

    slides.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = "dot";

      dot.onclick = () => {
        current = i;
        update();
      };

      dotsContainer.appendChild(dot);
    });
  }

  // =========================
  // update
  // =========================
  function update() {
    const slides = getSlides();

    if (!slides.length) return;

    if (current >= slides.length) current = slides.length - 1;
    if (current < 0) current = 0;

    slides.forEach((s, i) => {
      s.classList.remove("active", "prev");

      if (i === current) s.classList.add("active");
      else if (i < current) s.classList.add("prev");
    });

    document.querySelectorAll(".dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });

    indicator.innerText = `${current + 1} / ${slides.length}`;
  }

  // =========================
  // 🔥 텍스트 자동 저장
  // =========================
 ["input", "keyup", "blur"].forEach(evt => {
  document.addEventListener(evt, saveAll);
});

  // 날짜
document.addEventListener("change", (e) => {
  if (e.target.type === "date") {

   // 🔥 이거 추가 (핵심)
    e.target.setAttribute("value", e.target.value);

    saveAll();
    buildDateList(); // 🔥 추가
  }
});

  // =========================
  // 🔥 이미지 기능
  // =========================
  function attachImage(cell) {

    cell.addEventListener("dragover", e => e.preventDefault());

    cell.addEventListener("drop", e => {
      e.preventDefault();

      // 기존 이미지 이동
      if (window.draggedImg) {
        cell.querySelector(".cell-images").appendChild(window.draggedImg);
        window.draggedImg = null;
        saveAll();
        return;
      }

      // 새 이미지 추가
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith("image")) return;

      const reader = new FileReader();

      reader.onload = ev => {
        const img = document.createElement("img");
        img.src = ev.target.result;
        img.style.width = "100%";

        // 이동
        img.draggable = true;
        img.addEventListener("dragstart", () => {
          window.draggedImg = img;
        });

        // 삭제
        img.addEventListener("dblclick", () => {
          img.remove();
          saveAll();
        });

        // 크기 조절
        img.addEventListener("wheel", e => {
          e.preventDefault();
          let w = img.width + (e.deltaY > 0 ? -10 : 10);
          img.style.width = w + "px";
          saveAll();
        });

        cell.querySelector(".cell-images").appendChild(img);
        saveAll();
      };

      reader.readAsDataURL(file);
    });
  }

  function initCells() {
    document.querySelectorAll(".cell").forEach(cell => {
      attachImage(cell);
    });
  }

  // =========================
  // 페이지 추가
  // =========================
  document.addEventListener("click", e => {
    if (!e.target.classList.contains("addSlideBtn")) return;

    const newSlide = document.createElement("section");
    newSlide.className = "slide grid-slide";

    newSlide.innerHTML = `
      <div class="grid-header">
        <span class="day-label">DAY ${getSlides().length}</span>
        <input type="date">
      </div>

      <div class="grid">
        ${Array(9).fill('<div class="cell"></div>').join("")}
      </div>

      <button class="addSlideBtn"> + 페이지 </button>
    `;

    document.querySelector(".slides").appendChild(newSlide);

    upgradeCells();
    initCells();

    current = getSlides().length - 1;

    saveAll();
    buildDots();
    buildDateList(); // 🔥 추가
    update();
  });

  // =========================
  // 페이지 이동
  // =========================
  document.addEventListener("wheel", e => {
    const slides = getSlides();

    if (e.deltaY > 0 && current < slides.length - 1) current++;
    else if (e.deltaY < 0 && current > 0) current--;

    update();
  });

  // =========================
  // 🔥 초기 실행
  // =========================
  upgradeCells();
  loadAll();

  // 🔥 여기 추가 (이 위치가 핵심)
document.querySelectorAll("input[type='date']").forEach(input => {
  if (input.getAttribute("value")) {
    input.value = input.getAttribute("value");
  }
});


  initCells();
  buildDots();
  buildDateList(); // 🔥 추가
  update();

});