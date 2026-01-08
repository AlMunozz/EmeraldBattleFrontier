const NOTES_KEY = 'adv_notes_v1';

let notes = [];
let selectedId = null;

const notesListEl = document.getElementById('notes-list');
const newNoteBtn = document.getElementById('btn-new-note');
const saveNoteBtn = document.getElementById('btn-save-note');
const titleInput = document.getElementById('note-title');
const bodyInput = document.getElementById('note-body');

const noteModalEl = document.getElementById('note-modal');
const noteModalTitleEl = document.getElementById('note-modal-title');
const noteModalBodyEl = document.getElementById('note-modal-body');
const noteModalCloseBtn = document.getElementById('note-modal-close');

// cargar / guardar
function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    notes = raw ? JSON.parse(raw) : [];
  } catch {
    notes = [];
  }
}

function saveNotes() {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// pintar lista con botón Del
function renderNotesList() {
  notesListEl.innerHTML = '';

  if (!notes.length) {
    notesListEl.innerHTML =
      '<li style="font-size:0.85rem;color:#9ca3af;">No notes yet.</li>';
    return;
  }

  notes.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item';
    if (note.id === selectedId) li.classList.add('active');
    li.dataset.id = note.id;

    const titleSpan = document.createElement('span');
    titleSpan.className = 'note-item-title';
    titleSpan.textContent = note.title || 'Sin título';

    const delBtn = document.createElement('button');
    delBtn.className = 'note-item-delete';
    delBtn.textContent = 'Del';
    delBtn.dataset.id = note.id;

    li.appendChild(titleSpan);
    li.appendChild(delBtn);
    notesListEl.appendChild(li);
  });
}

// cargar nota en el editor
function loadNoteIntoEditor(note) {
  if (!note) {
    titleInput.value = '';
    bodyInput.value = '';
    return;
  }
  titleInput.value = note.title;
  bodyInput.value = note.body;
}

// crear nota vacía y seleccionarla
function createEmptyNote() {
  const id = 'note-' + Date.now();
  const newNote = {
    id,
    title: 'No title',
    body: ''
  };

  notes.unshift(newNote);
  selectedId = id;
  saveNotes();
  renderNotesList();
  loadNoteIntoEditor(newNote);
}

// guardar contenido actual en la nota seleccionada
function saveCurrentNote() {
  if (!selectedId) {
    createEmptyNote();
  }
  const note = notes.find(n => n.id === selectedId);
  if (!note) return;

  note.title = titleInput.value.trim() || 'No title';
  note.body = bodyInput.value;
  saveNotes();
  renderNotesList();

  // limpiar editor después de guardar
  titleInput.value = '';
  bodyInput.value = '';
}

// eliminar por id
function deleteCurrentNoteById(id) {
  notes = notes.filter(n => n.id !== id);
  if (selectedId === id) selectedId = null;
  saveNotes();
  renderNotesList();
  loadNoteIntoEditor(null);
}

// modal
function openNoteModal(note) {
  if (!note) return;
  noteModalTitleEl.textContent = note.title || 'No title';
  noteModalBodyEl.textContent = note.body || '';
  noteModalEl.classList.remove('hidden');
}

function closeNoteModal() {
  noteModalEl.classList.add('hidden');
}

// eventos
newNoteBtn.addEventListener('click', () => {
  createEmptyNote();
});

saveNoteBtn.addEventListener('click', saveCurrentNote);

// click en lista: Del o abrir modal
notesListEl.addEventListener('click', e => {
  const delBtn = e.target.closest('.note-item-delete');
  if (delBtn) {
    const id = delBtn.dataset.id;
    if (confirm('¿Delete this note?')) {
      deleteCurrentNoteById(id);
    }
    return;
  }

  const li = e.target.closest('.note-item');
  if (!li || !li.dataset.id) return;

  selectedId = li.dataset.id;
  const note = notes.find(n => n.id === selectedId);
  openNoteModal(note);
  renderNotesList();
});

noteModalCloseBtn.addEventListener('click', closeNoteModal);
noteModalEl.addEventListener('click', e => {
  if (e.target === noteModalEl || e.target.classList.contains('note-modal-backdrop')) {
    closeNoteModal();
  }
});

// init
loadNotes();
renderNotesList();
loadNoteIntoEditor(null);
