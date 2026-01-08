const CL_KEY = 'emerald_frontier_checklist_v1';

const checkboxes = document.querySelectorAll('.cl-list input[type="checkbox"]');
const clearBtn = document.getElementById('cl-clear');
const percentEl = document.getElementById('cl-percent');
const countEl = document.getElementById('cl-count');
const progressCircle = document.querySelector('.cl-progress-circle');

// mapa de gold -> silver
const GOLD_TO_SILVER = {
  gold_tower: 'silver_tower',
  gold_dome: 'silver_dome',
  gold_palace: 'silver_palace',
  gold_arena: 'silver_arena',
  gold_factory: 'silver_factory',
  gold_pike: 'silver_pike',
  gold_pyramid: 'silver_pyramid'
};

const TOTAL = checkboxes.length;

// cargar estado desde localStorage
function loadState() {
  try {
    const raw = localStorage.getItem(CL_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) || {};
    checkboxes.forEach(cb => {
      const key = cb.dataset.symbol;
      if (data[key]) cb.checked = true;
    });
  } catch {
    // ignorar errores
  }
}

// guardar estado en localStorage
function saveState() {
  const data = {};
  checkboxes.forEach(cb => {
    data[cb.dataset.symbol] = cb.checked;
  });
  localStorage.setItem(CL_KEY, JSON.stringify(data));
}

// actualizar porcentaje y círculo
function updateProgress() {
  let done = 0;
  checkboxes.forEach(cb => {
    if (cb.checked) done++;
  });

  const percent = Math.round((done / TOTAL) * 100);
  percentEl.textContent = `${percent}%`;
  countEl.textContent = `${done} de ${TOTAL} symbols completed`;

  const angle = (percent / 100) * 360;
  progressCircle.style.background =
    `conic-gradient(#22c55e 0deg, #22c55e ${angle}deg, #111827 ${angle}deg)`;
}

// listeners de los checkboxes
checkboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    const key = cb.dataset.symbol;

    // si marco un gold, marco también su silver
    if (cb.checked && key in GOLD_TO_SILVER) {
      const silverKey = GOLD_TO_SILVER[key];
      const silverCb = document.querySelector(
        `.cl-list input[data-symbol="${silverKey}"]`
      );
      if (silverCb && !silverCb.checked) {
        silverCb.checked = true;
      }
    }

    saveState();
    updateProgress();
  });
});

// botón reset
clearBtn.addEventListener('click', () => {
  if (!confirm('Reset all symbols?')) return;
  checkboxes.forEach(cb => cb.checked = false);
  saveState();
  updateProgress();
});

// init
loadState();
updateProgress();
