// ===== 타입 데이터 =====
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

// ===== JSON 로드 =====
fetch("data/typeChart.json")
  .then(res => res.json())
  .then(data => {
    typeChart = data;
  });

// ===== 상성 함수 =====
function getEffect(attacker, defender) {
  if (typeChart[attacker] && typeChart[attacker][defender] !== undefined) {
    return typeChart[attacker][defender];
  }
  return 1;
}

// ===== 타입 리스트 (드래그 가능) =====
function renderTypeList() {
  const container = document.getElementById("typeList");

  container.innerHTML = allTypes.map(type => `
    <div class="type-draggable"
         draggable="true"
         data-type="${type}"
         style="background:${typeColors[type]}">
      <img src="type_image/${type}.svg" width="30">
    </div>
  `).join("");
}

// ===== 포켓몬 슬롯 6개 =====
function renderPartySlots() {
  const container = document.getElementById("partyContainer");

  let html = "";

  for (let i = 0; i < 6; i++) {
    html += `
      <div class="pokemon-slot">
        <h3>포켓몬 ${i + 1}</h3>

        <div class="drop-zone">
          <div class="type-box"></div>
          <div class="type-box"></div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

renderTypeList();
renderPartySlots();

// ===== 드래그 처리 =====
let draggedType = null;

// 드래그 시작
document.addEventListener("dragstart", (e) => {

  const target = e.target.closest(".type-draggable");

  if (!target) return;

  draggedType = target.dataset.type;
});

// 드롭 허용
document.addEventListener("dragover", (e) => {
  if (e.target.classList.contains("type-box")) {
    e.preventDefault();
  }
});

// 드롭 처리 (핵심)
document.addEventListener("drop", (e) => {
  if (!e.target.classList.contains("type-box")) return;

  e.preventDefault();

  // 이미 있으면 막기
  if (e.target.dataset.type) return;

  const type = draggedType;

  e.target.dataset.type = type;

  e.target.innerHTML = `
    <div class="type-filled" style="background:${typeColors[type]}">
      <img src="type_image/${type}.svg" width="30">
    </div>
  `;

  updatePartyAnalysis();
});

// ===== 클릭하면 제거 =====
document.addEventListener("click", (e) => {
  if (e.target.closest(".type-box")) {
    const box = e.target.closest(".type-box");

    box.innerHTML = "";
    delete box.dataset.type;

    updatePartyAnalysis();
  }
});

// ===== 파티 데이터 =====
function getPartyData() {
  const slots = document.querySelectorAll(".pokemon-slot");

  let party = [];

  slots.forEach(slot => {
    const boxes = slot.querySelectorAll(".type-box");

    let types = [];

    boxes.forEach(box => {
      if (box.dataset.type) {
        types.push(box.dataset.type);
      }
    });

    if (types.length > 0) {
      party.push(types);
    }
  });

  return party;
}

/* ===== 분석 =====
function analyzePartyTypes(party) {

  let def4x = new Set();
  let def2x = new Set();
  let defHalf = new Set();
  let defQuarter = new Set();
  let defImmune = new Set();

  allTypes.forEach(attacker => {

    party.forEach(pokemon => {
      let damage = 1;

      pokemon.forEach(type => {
        damage *= getEffect(attacker, type);
      });

      if (damage === 4) def4x.add(attacker);
      else if (damage === 2) def2x.add(attacker);
      else if (damage === 0.5) defHalf.add(attacker);
      else if (damage === 0.25) defQuarter.add(attacker);
      else if (damage === 0) defImmune.add(attacker);
    });

  });

  return {
    def4x: [...def4x],
    def2x: [...def2x],
    defHalf: [...defHalf],
    defQuarter: [...defQuarter],
    defImmune: [...defImmune]
  };
}
*/
// ===== 분석 (개별 포켓몬 기준) =====
function analyzeSinglePokemon(types) {

  let def4x = [];
  let def2x = [];
  let defHalf = [];
  let defQuarter = [];
  let defImmune = [];

  allTypes.forEach(attacker => {
    let damage = 1;

    types.forEach(type => {
      damage *= getEffect(attacker, type);
    });

    if (damage === 4) def4x.push(attacker);
    else if (damage === 2) def2x.push(attacker);
    else if (damage === 0.5) defHalf.push(attacker);
    else if (damage === 0.25) defQuarter.push(attacker);
    else if (damage === 0) defImmune.push(attacker);
  });

  return {
    def4x,
    def2x,
    defHalf,
    defQuarter,
    defImmune
  };
}

// ===== 렌더 =====
function renderTypes(arr) {
  return arr.map(type => `
    <div class="type-card small">
      <div style="background:${typeColors[type]}; padding:5px;">
        <img src="type_image/${type}.svg" width="30">
      </div>
      <div>${typeKorean[type]}</div>
    </div>
  `).join("");
}

/*
function renderPartyResult(result) {
  document.getElementById("result").innerHTML = `
    <h2>🛡️ 파티 방어 상성</h2>

    <h4>4배 약점</h4>
    <div class="type-row">${renderTypes(result.def4x)}</div>

    <h4>2배 약점</h4>
    <div class="type-row">${renderTypes(result.def2x)}</div>

    <h4>0.5배 저항</h4>
    <div class="type-row">${renderTypes(result.defHalf)}</div>

    <h4>0.25배 저항</h4>
    <div class="type-row">${renderTypes(result.defQuarter)}</div>

    <h4>무효</h4>
    <div class="type-row">${renderTypes(result.defImmune)}</div>
  `;
}
  */
// ===== 렌더 (개별 포켓몬 기준) =====
function renderPartyResult(party) {   


  let html = `
    <h2>🛡️ 파티 상성 요약</h2>

    <div class="result-grid header">
      <div>포켓몬</div>
      <div>4배</div>
      <div>2배</div>
      <div>0.5배</div>
      <div>무효</div>
    </div>
  `;

  party.forEach((pokemon, index) => {
    const result = analyzeSinglePokemon(pokemon);

    html += `
      <div class="result-grid">

        <div class="pokemon-label">
          ${index + 1}
        </div>

        <div class="type-row small">
          ${renderTypes(result.def4x)}
        </div>

        <div class="type-row small">
          ${renderTypes(result.def2x)}
        </div>

        <div class="type-row small">
          ${renderTypes(result.defHalf)}
        </div>

        <div class="type-row small">
          ${renderTypes(result.defImmune)}
        </div>

      </div>
    `;
  });

  const summary = analyzeSummary(party);

  html += `
    <h2>⚠️ 주의해야 할 기술</h2>

    <div class="summary-box">

      <div class="summary-group">
        <h4>🔥 4배 약점</h4>
        <div class="type-row types-wrap4 danger">
          ${renderTypes(summary.four)}
        </div>
      </div>
  `;

  summary.topGroups.forEach((group, index) => {

    html += `
      <div class="summary-group">
        <h4>⚡ ${index + 1}순위 (${group.count}마리)</h4>
        <div class="type-row types-wrap4">
          ${renderTypes(group.types)}
        </div>
      </div>
    `;
  });

  html += `</div>`;

  document.getElementById("result").innerHTML = html;
}

function analyzeSummary(party) {

  let countMap = {};   // 2배 카운트
  let fourSet = new Set(); // 4배 모음

  allTypes.forEach(type => {
    countMap[type] = 0;
  });

  party.forEach(pokemon => {

    allTypes.forEach(attacker => {
      let damage = 1;

      pokemon.forEach(type => {
        damage *= getEffect(attacker, type);
      });

      if (damage === 4) {
        fourSet.add(attacker);
      }

      if (damage === 2) {
        countMap[attacker]++;
      }
    });

  });

  // ===== 2배 정렬 =====
  const sorted = Object.entries(countMap)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  // ===== TOP3 그룹 만들기 (동점 처리) =====
  let topGroups = [];
  let currentRank = 0;
  let lastCount = null;

  for (let [type, count] of sorted) {

    if (count !== lastCount) {
      currentRank++;
      if (currentRank > 3) break;
      topGroups.push({ count, types: [] });
      lastCount = count;
    }

    topGroups[topGroups.length - 1].types.push(type);
  }

  return {
    four: [...fourSet],
    topGroups
  };
}

// ===== 분석 실행 =====
function updatePartyAnalysis() {
  const party = getPartyData();
  renderPartyResult(party);
}