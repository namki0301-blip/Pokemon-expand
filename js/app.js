let typeChart = {};

const typeKorean = {
  Normal: "노말", Fire: "불꽃", Water: "물", Grass: "풀",
  Electric: "전기", Flying: "비행", Fighting: "격투",
  Poison: "독", Ground: "땅", Rock: "바위",
  Bug: "벌레", Ghost: "고스트", Steel: "강철",
  Psychic: "에스퍼", Ice: "얼음", Dragon: "드래곤",
  Dark: "악", Fairy: "페어리"
};

const typeColors = {
  Fire: "#b84a2a", Water: "#2f5f99", Grass: "#3f7a2c",
  Electric: "#b38a12", Ground: "#6e532c", Poison: "#4a3470",
  Psychic: "#a94452", Steel: "#3f7a91", Flying: "#6d8fb8",
  Bug: "#6f7330", Dark: "#5a5a5a", Fighting: "#7a3b2f",
  Rock: "#6f6f6f", Fairy: "#9e7fa1", Dragon: "#8c7bb3",
  Normal: "#888888", Ghost: "#5a5a7a", Ice: "#7fa7b3"
};

const allTypes = Object.keys(typeKorean);

function init() {
  const container = document.getElementById("myTypeContainer");
  const resultDiv = document.getElementById("result");

  function renderTypeSelector() {
    container.innerHTML = allTypes.map(type => `
      <label class="type-select-card">
        <input type="checkbox" value="${type}">
        <div class="type-image" style="background-color:${typeColors[type]}">
          <img src="./type_image/${type}.svg" onerror="this.src='./type_image/default.png'">
          <div class="check-mark">✔</div>
        </div>
        <div class="type-name">${typeKorean[type]}</div>
      </label>
    `).join("");
  }

  function updateSelectionStyle() {
    document.querySelectorAll(".type-select-card").forEach(card => {
      const input = card.querySelector("input");
      card.classList.toggle("selected", input.checked);
    });
  }

  function calculate() {
    if (!typeChart || Object.keys(typeChart).length === 0) {
      resultDiv.innerHTML = "데이터 로딩 실패";
      return;
    }

    const checked = container.querySelectorAll("input:checked");
    if (checked.length === 0) {
      resultDiv.innerHTML = "";
      return;
    }

    const myTypes = Array.from(checked).map(cb => cb.value);
    let def = { 4: [], 2: [], 0.5: [], 0.25: [], 0: [] };

    allTypes.forEach(attacker => {
      let damage = 1;
      myTypes.forEach(type => {
        const effect = typeChart?.[attacker]?.[type] ?? 1;
        damage *= effect;
      });

      if (def[damage] !== undefined) def[damage].push(attacker);
    });

    const renderRows = (title, list) => list.length === 0 ? "" : `
      <h4>${title}</h4>
      <div class="type-row">${list.map(type => `
        <div class="type-card">
          <div class="type-image" style="background-color:${typeColors[type]}">
            <img src="./type_image/${type}.svg">
          </div>
          <div class="type-name">${typeKorean[type]}</div>
        </div>`).join("")}
      </div>`;

    resultDiv.innerHTML = `
      <h2>🛡️ 방어 상성</h2>
      ${renderRows("🔥 4배 약점", def[4])}
      ${renderRows("⚡ 2배 약점", def[2])}
      ${renderRows("🍃 0.5배 저항", def[0.5])}
      ${renderRows("❄️ 0.25배 저항", def[0.25])}
      ${renderRows("🚫 무효", def[0])}
    `;
  }

  container.addEventListener("change", (e) => {
    const checked = container.querySelectorAll("input:checked");

    if (checked.length > 2) {
      e.target.checked = false;
      alert("타입은 2개까지만 선택 가능합니다!");
      return;
    }

    updateSelectionStyle();
    calculate();
  });

  renderTypeSelector();

  fetch("./data/typeChart.json")
    .then(res => {
      if (!res.ok) throw new Error("파일 없음");
      return res.json();
    })
    .then(data => {
      typeChart = data;
      resultDiv.innerHTML = "타입을 선택하세요";
    })
    .catch(err => {
      console.error(err);
      resultDiv.innerHTML = "데이터 로딩 실패";
    });
}

document.addEventListener("DOMContentLoaded", init);