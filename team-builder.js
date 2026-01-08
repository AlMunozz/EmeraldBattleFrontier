/*** EQUIPOS CON LOCALSTORAGE ***/

const TEAMS_KEY = 'adv_teams_v1';

let teams = [];
let selectedTeamId = null;

const teamsListEl = document.getElementById('teams-list');
const newTeamBtn = document.getElementById('btn-new-team');
const addToTeamBtn = document.getElementById('tb-add-to-team');

const teamModalEl = document.getElementById('team-modal');
const teamModalTitleEl = document.getElementById('team-modal-title');
const teamModalBodyEl = document.getElementById('team-modal-body');
const teamModalCloseBtn = document.getElementById('team-modal-close');

/*** FORM Y PREVIEW ***/

// Inputs
const pokemonInput  = document.getElementById('tb-pokemon');
const itemInput     = document.getElementById('tb-item');
const abilityInput  = document.getElementById('tb-ability');
const natureInput   = document.getElementById('tb-nature');
const levelInput    = document.getElementById('tb-level');

const evHpInput  = document.getElementById('tb-ev-hp');
const evAtkInput = document.getElementById('tb-ev-atk');
const evDefInput = document.getElementById('tb-ev-def');
const evSpaInput = document.getElementById('tb-ev-spa');
const evSpdInput = document.getElementById('tb-ev-spd');
const evSpeInput = document.getElementById('tb-ev-spe');

const ivHpInput  = document.getElementById('tb-iv-hp');
const ivAtkInput = document.getElementById('tb-iv-atk');
const ivDefInput = document.getElementById('tb-iv-def');
const ivSpaInput = document.getElementById('tb-iv-spa');
const ivSpdInput = document.getElementById('tb-iv-spd');
const ivSpeInput = document.getElementById('tb-iv-spe');

// Limitar EVs 0–252
[evHpInput, evAtkInput, evDefInput, evSpaInput, evSpdInput, evSpeInput].forEach(input => {
  input.addEventListener('change', () => clampNumberInput(input, 0, 252));
  input.addEventListener('blur',   () => clampNumberInput(input, 0, 252));
});

// Limitar IVs 0–31
[ivHpInput, ivAtkInput, ivDefInput, ivSpaInput, ivSpdInput, ivSpeInput].forEach(input => {
  input.addEventListener('change', () => clampNumberInput(input, 0, 31));
  input.addEventListener('blur',   () => clampNumberInput(input, 0, 31));
});

const move1Input = document.getElementById('tb-move1');
const move2Input = document.getElementById('tb-move2');
const move3Input = document.getElementById('tb-move3');
const move4Input = document.getElementById('tb-move4');

const clearBtn   = document.getElementById('tb-clear');

// Preview elements
const pvNameEl    = document.getElementById('pv-name');
const pvNatureEl  = document.getElementById('pv-nature');
const pvItemEl    = document.getElementById('pv-item');
const pvAbilityEl = document.getElementById('pv-ability');
const pvLevelEl   = document.getElementById('pv-level');
const pvEvsEl     = document.getElementById('pv-evs');
const pvIvsEl     = document.getElementById('pv-ivs');
const pvMovesEl   = document.getElementById('pv-moves');

// Construir objeto Pokémon actual a partir del formulario
function getCurrentPokemonData() {
  const name = pokemonInput.value.trim();
  if (!name) {
    return { ok: false, error: 'name' };
  }

  const evs = {
    hp:  Number(evHpInput.value)  || 0,
    atk: Number(evAtkInput.value) || 0,
    def: Number(evDefInput.value) || 0,
    spa: Number(evSpaInput.value) || 0,
    spd: Number(evSpdInput.value) || 0,
    spe: Number(evSpeInput.value) || 0,
  };

  const ivs = {
    hp:  Number(ivHpInput.value)  || 0,
    atk: Number(ivAtkInput.value) || 0,
    def: Number(ivDefInput.value) || 0,
    spa: Number(ivSpaInput.value) || 0,
    spd: Number(ivSpdInput.value) || 0,
    spe: Number(ivSpeInput.value) || 0,
  };

  const moves = [
    move1Input.value.trim(),
    move2Input.value.trim(),
    move3Input.value.trim(),
    move4Input.value.trim(),
  ].filter(m => m);

  const totalEVs = evs.hp + evs.atk + evs.def + evs.spa + evs.spd + evs.spe;
  if (totalEVs > 510) {
    return { ok: false, error: 'evs' };
  }

  return {
    ok: true,
    pokemon: name,
    item: itemInput.value.trim(),
    ability: abilityInput.value.trim(),
    nature: natureInput.value.trim(),
    level: Number(levelInput.value) || 50,
    evs,
    ivs,
    moves,
  };
}

function clampNumberInput(input, min, max) {
  let value = parseInt(input.value, 10);
  if (isNaN(value)) {
    input.value = min;
    return;
  }
  if (value < min) value = min;
  if (value > max) value = max;
  input.value = value;
}

function loadTeams() {
  try {
    const raw = localStorage.getItem(TEAMS_KEY);
    if (!raw) {
      teams = [];
      return;
    }
    teams = JSON.parse(raw) || [];
  } catch {
    teams = [];
  }
}

function saveTeams() {
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
}

function createNewTeam() {
  const id = 'team-' + Date.now();
  const name = `Team ${teams.length + 1}`;

  const newTeam = { id, name, members: [] };
  teams.push(newTeam);
  selectedTeamId = id;
  saveTeams();
  renderTeams();
}

function deleteTeam(id) {
  teams = teams.filter(t => t.id !== id);
  if (selectedTeamId === id) {
    selectedTeamId = teams[0]?.id || null;
  }
  saveTeams();
  renderTeams();
}

function renameTeam(id, newName) {
  const team = teams.find(t => t.id === id);
  if (team) {
    team.name = newName;
    saveTeams();  // Guarda en localStorage
    renderTeams(); // Actualiza la lista
  }
}

function addCurrentPokemonToSelectedTeam() {
  const result = getCurrentPokemonData();

  if (!result || !result.ok) {
    if (result && result.error === 'evs') {
      alert('The total EVs cannot exceed 510.');
    } else {
      alert('Input Pokemon´s name.');
    }
    return;
  }

  const data = result; // aquí ya es el objeto válido

  if (!selectedTeamId) {
    createNewTeam();
  }

  const team = teams.find(t => t.id === selectedTeamId);
  if (!team) {
    alert('Could not find selected team.');
    return;
  }

  if (team.members.length >= 3) {
    alert('This team already has 3 Pokemons.');
    return;
  }

  team.members.push(data);
  saveTeams();
  renderTeams();
}

// mover equipo arriba/abajo
function moveTeam(id, direction) {
  const index = teams.findIndex(t => t.id === id);
  if (index === -1) return;

  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= teams.length) return;

  const [team] = teams.splice(index, 1);
  teams.splice(newIndex, 0, team);
  saveTeams();
  renderTeams();
}

function renderTeams() {
  teamsListEl.innerHTML = '';

  if (!teams.length) {
    teamsListEl.innerHTML =
      '<li class="team-card"><span style="font-size:0.85rem;color:#9ca3af;">No teams yet. Create a new one.</span></li>';
    return;
  }

  teams.forEach((team, index) => {
    const li = document.createElement('li');
    li.className = 'team-card';

    const headerRow = document.createElement('div');
    headerRow.className = 'team-header-row';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'team-name';
    nameSpan.textContent = team.name;

    // doble clic para renombrar
    nameSpan.addEventListener('dblclick', () => {
      const nuevo = prompt('New team´s name:', team.name);
      if (nuevo && nuevo.trim()) {
        renameTeam(team.id, nuevo.trim());
      }
    });

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'team-actions';

    // botones ordenar
    const upBtn = document.createElement('button');
    upBtn.className = 'btn-move-team';
    upBtn.textContent = '▲';
    upBtn.disabled = (index === 0);
    upBtn.addEventListener('click', () => moveTeam(team.id, 'up'));

    const downBtn = document.createElement('button');
    downBtn.className = 'btn-move-team';
    downBtn.textContent = '▼';
    downBtn.disabled = (index === teams.length - 1);
    downBtn.addEventListener('click', () => moveTeam(team.id, 'down'));

    // VIEW: abre modal
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn-select-team';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => {
      openTeamModal(team);
    });

    // EDIT: seleccionar equipo para añadir pokes
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-select-team';
    if (team.id === selectedTeamId) editBtn.classList.add('active');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      selectedTeamId = team.id;
      renderTeams();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete-team';
    deleteBtn.textContent = 'Del';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Remove ${team.name}?`)) {
        deleteTeam(team.id);
      }
    });

    actionsDiv.appendChild(upBtn);
    actionsDiv.appendChild(downBtn);
    actionsDiv.appendChild(viewBtn);
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    headerRow.appendChild(nameSpan);
    headerRow.appendChild(actionsDiv);

    const membersUl = document.createElement('ul');
    membersUl.className = 'team-members';

    if (!team.members.length) {
      const emptyLi = document.createElement('li');
      emptyLi.textContent = '— empty —';
      membersUl.appendChild(emptyLi);
    } else {
      team.members.forEach((m, idx) => {
        const mLi = document.createElement('li');
        mLi.textContent = `${idx + 1}. ${m.pokemon} @ ${m.item || '—'}`;
        membersUl.appendChild(mLi);
      });
    }

    li.appendChild(headerRow);
    li.appendChild(membersUl);
    teamsListEl.appendChild(li);
  });
}

/*** MODAL DETALLE EQUIPO ***/

function openTeamModal(team) {
  if (!team) return;

  teamModalTitleEl.textContent = team.name;

  if (!team.members.length) {
    teamModalBodyEl.innerHTML =
      '<p style="font-size:0.9rem;color:#9ca3af;">This team is empty. Add a new Pokemon.</p>';
  } else {
    let html = '';
    for (let i = 0; i < team.members.length; i++) {
      const m = team.members[i];
      html +=
        '<div class="team-modal-poke" data-index="' + i + '">' +
          '<div class="team-modal-poke-header">' +
            '<strong>' + (i + 1) + '. ' + m.pokemon + ' @ ' + (m.item || '—') + '</strong>' +
            '<button class="btn-remove-member" data-index="' + i + '">Remove</button>' +
          '</div>' +
          '<div>Nature: ' + (m.nature || '—') +
          ' | Ability: ' + (m.ability || '—') +
          ' | Level: ' + m.level + '</div>' +
          '<div>EVs: HP ' + m.evs.hp +
          ' / Atk ' + m.evs.atk +
          ' / Def ' + m.evs.def +
          ' / SpA ' + m.evs.spa +
          ' / SpD ' + m.evs.spd +
          ' / Spe ' + m.evs.spe + '</div>' +
          '<div>IVs: HP ' + m.ivs.hp +
          ' / Atk ' + m.ivs.atk +
          ' / Def ' + m.ivs.def +
          ' / SpA ' + m.ivs.spa +
          ' / SpD ' + m.ivs.spd +
          ' / Spe ' + m.ivs.spe + '</div>' +
          '<div>Moves: ' + (m.moves && m.moves.length ? m.moves.join(' / ') : '—') + '</div>' +
        '</div>';
    }
    teamModalBodyEl.innerHTML = html;
  }

  teamModalEl.classList.remove('hidden');
}

function closeTeamModal() {
  teamModalEl.classList.add('hidden');
}

teamModalCloseBtn.addEventListener('click', closeTeamModal);

teamModalEl.addEventListener('click', (e) => {
  if (e.target === teamModalEl || e.target.classList.contains('team-modal-backdrop')) {
    closeTeamModal();
  }
});

// eliminar miembro desde el modal
teamModalBodyEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-remove-member');
  if (!btn) return;

  const index = parseInt(btn.dataset.index, 10);
  const team = teams.find(t => t.id === selectedTeamId);
  if (!team) return;

  if (!confirm('¿Delete the whole team?')) return;

  team.members.splice(index, 1);
  saveTeams();
  renderTeams();
  openTeamModal(team);
});

// Eventos de botones de equipos
newTeamBtn.addEventListener('click', createNewTeam);
addToTeamBtn.addEventListener('click', addCurrentPokemonToSelectedTeam);

// Inicializar equipos desde localStorage
loadTeams();
if (teams.length) {
  selectedTeamId = teams[0].id;
}
renderTeams();

const importTextArea = document.getElementById('tb-import-text');
const importBtn      = document.getElementById('tb-import-btn');

importBtn.addEventListener('click', () => {
  const text = importTextArea.value.trim();
  if (!text) {
    alert('Paste a Showdown team first.');
    return;
  }

  const parsed = parseShowdownTeam(text);
  if (!parsed.length) {
    alert('Wrong format. Could not detect any Pokemon on the text.');
    return;
  }

  const id = 'team-' + Date.now();
  const name = `Imported ${teams.length + 1}`;

  const newTeam = {
    id,
    name,
    members: parsed,
  };

  teams.push(newTeam);
  selectedTeamId = id;
  saveTeams();
  renderTeams();
  importTextArea.value = '';      // limpia el cuadro
  alert('Team correctly imported.');
});

function parseShowdownTeam(text) {
  const blocks = text.split(/\n{2,}/); // separa por líneas en blanco
  const result = [];

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    // 1ª línea: "Pikachu @ Light Ball" o "Pikachu"
    const first = lines[0];
    const atIndex = first.indexOf('@');
    let pokemon = first;
    let item = '';

    if (atIndex !== -1) {
      pokemon = first.slice(0, atIndex).trim();
      item = first.slice(atIndex + 1).trim();
    }

    let ability = '';
    let nature = '';
    let level = 50;
    const evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    const moves = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('Ability:')) {
        ability = line.replace('Ability:', '').trim();
      } else if (line.startsWith('EVs:')) {
        const parts = line.replace('EVs:', '').split('/').map(p => p.trim());
        parts.forEach(p => {
          const [valStr, stat] = p.split(' ');
          const val = parseInt(valStr, 10) || 0;
          if (/^HP$/i.test(stat)) evs.hp = val;
          else if (/^Atk$/i.test(stat)) evs.atk = val;
          else if (/^Def$/i.test(stat)) evs.def = val;
          else if (/^SpA$/i.test(stat)) evs.spa = val;
          else if (/^SpD$/i.test(stat)) evs.spd = val;
          else if (/^Spe$/i.test(stat)) evs.spe = val;
        });
      } else if (line.startsWith('IVs:')) {
        const parts = line.replace('IVs:', '').split('/').map(p => p.trim());
        parts.forEach(p => {
          const [valStr, stat] = p.split(' ');
          const val = parseInt(valStr, 10) || 0;
          if (/^HP$/i.test(stat)) ivs.hp = val;
          else if (/^Atk$/i.test(stat)) ivs.atk = val;
          else if (/^Def$/i.test(stat)) ivs.def = val;
          else if (/^SpA$/i.test(stat)) ivs.spa = val;
          else if (/^SpD$/i.test(stat)) ivs.spd = val;
          else if (/^Spe$/i.test(stat)) ivs.spe = val;
        });
      } else if (/Nature$/.test(line)) {
        nature = line.replace('Nature', '').trim();
      } else if (line.startsWith('Level:')) {
        level = parseInt(line.replace('Level:', ''), 10) || 50;
      } else if (line.startsWith('- ')) {
        moves.push(line.replace('- ', '').trim());
      }
    }

    result.push({ pokemon, item, ability, nature, level, evs, ivs, moves });
  }

  return result;
}
