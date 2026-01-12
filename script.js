let pokemonData = {};
let currentBuild = null;
let pokemonList = [];

// SOLO NÚMERO ROJO
function formatEV(value) {
    if (value > 10) {
        return `<span style="color: #ef4444; font-weight: 700;">${value}</span>`;
    }
    return value;
}

// extraer número de set por si acaso viniera como string
function getSetNumber(poke) {
    return typeof poke.set === 'number'
        ? poke.set
        : parseInt(poke.set, 10) || 9999;
}

// Referencias a elementos
const els = {
    search: document.getElementById('search'),
    results: document.getElementById('results'),
    detail: document.getElementById('detail'),
    speciesName: document.getElementById('species-name'),
    type: document.getElementById('type'),
    set: document.getElementById('set'),
    nature: document.getElementById('nature'),
    item: document.getElementById('item'),
    ability: document.getElementById('ability'),
    speed: document.getElementById('speed'),
    evHp: document.getElementById('ev-hp'),
    evAtk: document.getElementById('ev-atk'),
    evDef: document.getElementById('ev-def'),
    evSpa: document.getElementById('ev-spa'),
    evSpd: document.getElementById('ev-spd'),
    evSpe: document.getElementById('ev-spe'),
    movesList: document.getElementById('moves-list')
};

// Debounce suave
function debounce(fn, delay = 100) {
    let id;
    return (...args) => {
        clearTimeout(id);
        id = setTimeout(() => fn(...args), delay);
    };
}

// Cargar datos
fetch('pokemon.json')
    .then(r => r.json())
    .then(data => {
        pokemonData = data;

        // Precomputar lista y nombre en minúsculas para búsquedas rápidas
        pokemonList = Object.values(pokemonData).map(p => ({
            ...p,
            _nameLower: p.species.toLowerCase()
        }));

        console.log(pokemonList.length, 'builds loaded');

        // Al cargar, no mostramos nada todavía
        els.results.innerHTML = '';
    })
    .catch(e => {
        console.error('pokemon.json not found:', e);
        alert('ERROR: pokemon.json not found');
    });

// Búsqueda
els.search.addEventListener('input', debounce(onSearchInput, 100));

function onSearchInput(e) {
    const query = e.target.value.toLowerCase().trim();

    // Nueva búsqueda: cerrar detalle
    els.detail.classList.add('hidden');
    currentBuild = null;

    // Menos de 2 letras -> mensaje, sin resultados
    if (query.length < 2) {
        els.results.innerHTML = '<div class="message">Type at least 2 letters.</div>';
        return;
    }

    // Si aún no se ha cargado el JSON
    if (!pokemonList || pokemonList.length === 0) {
        els.results.innerHTML = '<div class="message">Fetching data...</div>';
        return;
    }

    // BÚSQUEDA ESTRICTA POR PREFIJO
    const results = pokemonList
        .filter(poke => poke._nameLower.startsWith(query));

    // ordenar SIEMPRE por número de set
    results.sort((a, b) => getSetNumber(a) - getSetNumber(b));

    // limitar a 20 después de ordenar
    const limited = results.slice(0, 20);

    // Sin resultados
    if (!limited.length) {
        els.results.innerHTML = '<div class="message">Couldn´t find any Pokemon with that name.</div>';
        return;
    }

    // Con resultados -> solo tarjetas, sin texto extra
    els.results.innerHTML = limited.map(poke => `
        <div class="result" data-key="${poke.species}-${poke.set}">
            <strong>${poke.species} - Set ${poke.set}</strong>
            <div class="nature-item">${poke.nature} | ${poke.item}</div>
            <div class="moves-preview">
                ${poke.moves.slice(0, 2).join(', ')}${poke.moves.length > 2 ? '...' : ''}
            </div>
            <div class="evs-preview">
                HP:${poke.evs.HP} Atk:${poke.evs.Atk} SpA:${poke.evs.SpA}
            </div>
        </div>
    `).join('');
}

// Click en resultados (toggle detalle)
els.results.addEventListener('click', e => {
    const card = e.target.closest('.result');
    if (!card) return;

    const key = card.dataset.key;

    // Si ya está abierto este mismo build, cerrar
    if (currentBuild && `${currentBuild.species}-${currentBuild.set}` === key) {
        els.detail.classList.add('hidden');
        currentBuild = null;
        return;
    }

    // Si es otro, mostrar detalle
    showDetail(key);
});

// Mostrar detalle
function showDetail(key) {
    currentBuild = pokemonList.find(poke =>
        `${poke.species}-${poke.set}` === key || poke.species === key
    );

    if (!currentBuild) {
        alert('Build not found');
        return;
    }

    console.log('Build selected:', currentBuild.species);

    els.speciesName.innerHTML =
        `${currentBuild.species} <small>(Set ${currentBuild.set})</small>`;

    els.type.textContent = currentBuild.type || 'Electric';
    els.set.textContent = `Set ${currentBuild.set}`;
    els.nature.textContent = currentBuild.nature;
    els.item.textContent = currentBuild.item;
    els.ability.textContent = currentBuild.ability || 'Levitate';
    els.speed.textContent = currentBuild.speed_tier || 'Unknown';

    els.evHp.innerHTML = formatEV(currentBuild.evs?.HP || 0);
    els.evAtk.innerHTML = formatEV(currentBuild.evs?.Atk || 0);
    els.evDef.innerHTML = formatEV(currentBuild.evs?.Def || 0);
    els.evSpa.innerHTML = formatEV(currentBuild.evs?.SpA || 0);
    els.evSpd.innerHTML = formatEV(currentBuild.evs?.SpD || 0);
    els.evSpe.innerHTML = formatEV(currentBuild.evs?.Spe || 0);

    els.movesList.innerHTML = currentBuild.moves
        .map((move, i) => `<li><strong>${i + 1}.</strong> ${move}</li>`)
        .join('');

    els.detail.classList.remove('hidden');

    // 👇 Añadir scroll suave al detalle
    els.detail.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
}
