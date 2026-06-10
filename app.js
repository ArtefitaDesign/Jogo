// Default items list (includes syllable division and default enquadramento properties)
const DEFAULT_ITEMS = [
  { id: 1, category: 'Animais', name: 'Cão', syllables: 'Cão', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80', scale: 1, posX: 50, posY: 50 },
  { id: 2, category: 'Animais', name: 'Gato', syllables: 'Ga-to', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80', scale: 1.15, posX: 50, posY: 45 },
  { id: 3, category: 'Animais', name: 'Leão', syllables: 'Le-ão', image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=500&auto=format&fit=crop&q=80', scale: 1.2, posX: 50, posY: 30 },
  { id: 4, category: 'Frutas', name: 'Banana', syllables: 'Ba-na-na', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80', scale: 1, posX: 50, posY: 50 },
  { id: 5, category: 'Frutas', name: 'Maçã', syllables: 'Ma-çã', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80', scale: 1, posX: 50, posY: 50 },
  { id: 6, category: 'Veículos', name: 'Carro', syllables: 'Car-ro', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=80', scale: 1.1, posX: 50, posY: 55 },
  { id: 7, category: 'Veículos', name: 'Avião', syllables: 'A-vi-ão', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=80', scale: 1, posX: 50, posY: 50 },
  { id: 8, category: 'Objetos', name: 'Bola', syllables: 'Bo-la', image: 'https://images.unsplash.com/photo-1581373449483-37449f962b6c?w=500&auto=format&fit=crop&q=80', scale: 1, posX: 50, posY: 50 }
];

// App State
let items = JSON.parse(localStorage.getItem('baby_game_items')) || DEFAULT_ITEMS;

let currentTarget = null;
let currentOptions = [];
let editingItemId = null;
let audioContext = null;
let isCelebration = false;
let currentLevel = 1; // Level 1 = 2 cards, Level 2 = 4 cards
let correctStreak = 0; // Tracks consecutive correct answers to scale level
let celebrationEmojis = ['🎉', '🎈', '🌟', '🧸', '🍭', '🦁', '🐶', '🦄', '🌈', '👏'];
const CARD_COLORS = ['#ff5e7e', '#3ad3c9', '#ffd83b', '#a29bfe', '#ff7675', '#fdcb6e', '#00cec9', '#e84393'];

// DOM Elements
const gameScreen = document.getElementById('game-screen');
const managerScreen = document.getElementById('manager-screen');
const toggleScreenBtn = document.getElementById('toggle-screen-btn');
const levelBtn = document.getElementById('level-btn');
const logoBtn = document.getElementById('logo-btn');
const questionText = document.getElementById('question-text');
const cardsGrid = document.getElementById('cards-grid');
const celebrationOverlay = document.getElementById('celebration-overlay');
const celebrationEmoji = document.getElementById('celebration-emoji');
const syllablesDisplay = document.getElementById('syllables-display');
const addItemForm = document.getElementById('add-item-form');
const btnAddItem = document.getElementById('btn-add-item');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const itemsList = document.getElementById('items-list');

// Image adjustment form fields
const itemImage = document.getElementById('item-image');
const itemScale = document.getElementById('item-scale');
const itemPosX = document.getElementById('item-pos-x');
const itemPosY = document.getElementById('item-pos-y');
const previewImg = document.getElementById('preview-img');

// Canvas Setup for Interactive Particles
const canvas = document.getElementById('celebration-canvas');
const ctx = canvas.getContext('2d');
let celebrationParticles = [];
let animationFrameId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Web Audio Helpers (Cartoon Sound Effects)
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
    // Silent dummy buffer to activate sound hardware in iOS/Safari
    try {
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (e) {
      console.log("Erro ao desbloquear áudio no Safari:", e);
    }
  }
}

function playPopSound() {
  initAudio();
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
  
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.start(now);
  osc.stop(now + 0.08);
}

function playCelebrationSound() {
  initAudio();
  const now = audioContext.currentTime;
  
  const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51]; 
  melody.forEach((freq, idx) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);
    
    gain.gain.setValueAtTime(0.25, now + idx * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start(now + idx * 0.12);
    osc.stop(now + idx * 0.12 + 0.4);
  });
}

function playLevelUpSound() {
  initAudio();
  const now = audioContext.currentTime;
  
  // Happy rising cartoon chime
  const notes = [587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
  notes.forEach((freq, idx) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    gain.gain.setValueAtTime(0.2, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.3);
  });
}

function playErrorSound() {
  initAudio();
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(110, now + 0.25);
  
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.start(now);
  osc.stop(now + 0.25);
}

// Particle Classes
class Confetti {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.size = Math.random() * 10 + 6;
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.vx = Math.random() * 4 - 2;
    this.vy = Math.random() * 5 + 4;
    this.rotation = Math.random() * Math.PI;
    this.rotationSpeed = Math.random() * 0.1 - 0.05;
  }
  
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
    ctx.restore();
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
  }
}

// Syllable Balloon with Geometric Shapes
class Balloon {
  constructor(index, total, text) {
    this.r = 45;
    const sectionWidth = canvas.width / (total + 1);
    this.x = sectionWidth * (index + 1);
    this.y = canvas.height + this.r + 50 + (index * 30);
    this.speed = Math.random() * 0.6 + 0.8; // Balões sobem mais devagar para o bebé conseguir tocar
    this.color = CARD_COLORS[index % CARD_COLORS.length];
    this.wobble = Math.random() * 3;
    this.wobbleSpeed = Math.random() * 0.03 + 0.02;
    this.angle = Math.random() * Math.PI;
    this.text = text;
    
    // Choose a random geometric shape for learning
    const shapes = ['circle', 'heart', 'star', 'triangle', 'square'];
    this.shape = shapes[Math.floor(Math.random() * shapes.length)];
  }
  
  draw() {
    const actualX = this.x + Math.sin(this.angle) * 15;
    
    // String
    ctx.beginPath();
    ctx.moveTo(actualX, this.y + this.r);
    ctx.bezierCurveTo(actualX, this.y + this.r + 20, actualX - 10, this.y + this.r + 30, actualX, this.y + this.r + 50);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#a0aec0';
    ctx.stroke();
    
    // Draw geometric balloon shape
    ctx.beginPath();
    if (this.shape === 'circle') {
      ctx.ellipse(actualX, this.y, this.r, this.r * 1.2, 0, 0, Math.PI * 2);
    } else if (this.shape === 'square') {
      // Rounded square
      ctx.roundRect(actualX - this.r, this.y - this.r, this.r * 2, this.r * 2, 16);
    } else if (this.shape === 'triangle') {
      // Rounded triangle
      ctx.moveTo(actualX, this.y - this.r * 1.25);
      ctx.lineTo(actualX + this.r * 1.1, this.y + this.r);
      ctx.lineTo(actualX - this.r * 1.1, this.y + this.r);
      ctx.closePath();
    } else if (this.shape === 'heart') {
      // Desenha o balão de coração com escala ampliada (1.2x) para equilibrar visualmente com as outras formas
      const hr = this.r * 1.2;
      const topY = this.y - hr * 0.3;
      ctx.moveTo(actualX, topY + hr * 0.7);
      ctx.bezierCurveTo(actualX - hr * 1.2, topY - hr * 0.6, actualX - hr * 0.6, topY - hr * 1.2, actualX, topY - hr * 0.2);
      ctx.bezierCurveTo(actualX + hr * 0.6, topY - hr * 1.2, actualX + hr * 1.2, topY - hr * 0.6, actualX, topY + hr * 0.7);
      ctx.closePath();
    } else if (this.shape === 'star') {
      // 5 point star
      const spikes = 5;
      const outerRadius = this.r * 1.25;
      const innerRadius = this.r * 0.55;
      let rot = Math.PI / 2 * 3;
      let step = Math.PI / spikes;
      ctx.moveTo(actualX, this.y - outerRadius);
      for (let i = 0; i < spikes; i++) {
        let sx = actualX + Math.cos(rot) * outerRadius;
        let sy = this.y + Math.sin(rot) * outerRadius;
        ctx.lineTo(sx, sy);
        rot += step;
        
        sx = actualX + Math.cos(rot) * innerRadius;
        sy = this.y + Math.sin(rot) * innerRadius;
        ctx.lineTo(sx, sy);
        rot += step;
      }
      ctx.lineTo(actualX, this.y - outerRadius);
      ctx.closePath();
    }
    
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Draw Shape Highlight/Sheen (only for simple round/square)
    if (this.shape === 'circle' || this.shape === 'square') {
      ctx.beginPath();
      ctx.ellipse(actualX - this.r/2, this.y - this.r/2, this.r/4, this.r/3, Math.PI/4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
    }
    
    // Knot (balloon base tie)
    ctx.beginPath();
    ctx.moveTo(actualX, this.y + this.r);
    ctx.lineTo(actualX - 8, this.y + this.r + 10);
    ctx.lineTo(actualX + 8, this.y + this.r + 10);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();

    // Syllable text centered inside the shape
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 24px Fredoka';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    // Ajusta o alinhamento vertical para cada forma geométrica específica
    let textYOffset = 0;
    if (this.shape === 'triangle') {
      textYOffset = 12; // Desce um pouco para o triângulo
    } else if (this.shape === 'heart') {
      textYOffset = -15; // Sobe um pouco para o coração
    }
    ctx.fillText(this.text.toUpperCase(), actualX, this.y + textYOffset);
    ctx.shadowColor = 'transparent';
  }
  
  update() {
    this.y -= this.speed;
    this.angle += this.wobbleSpeed;
  }
  
  isHit(hx, hy) {
    const actualX = this.x + Math.sin(this.angle) * 15;
    const dx = actualX - hx;
    const dy = (this.y - hy) / 1.25;
    const dist = Math.hypot(dx, dy);
    return dist < this.r + 35;
  }
}

// Particle Engine Loop
function runParticleEngine() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (isCelebration) {
    celebrationParticles = celebrationParticles.filter(p => {
      p.update();
      p.draw();
      return !(p.y < -150 || p.y > canvas.height + 300);
    });
  }
  
  animationFrameId = requestAnimationFrame(runParticleEngine);
}

// Touch/Click interaction on Canvas to pop celebration balloons
window.addEventListener('pointerdown', (e) => {
  if (!isCelebration) return;

  const hx = e.clientX;
  const hy = e.clientY;
  
  let hitBalloon = false;
  
  for (let i = celebrationParticles.length - 1; i >= 0; i--) {
    const p = celebrationParticles[i];
    if (p instanceof Balloon && p.isHit(hx, hy)) {
      playPopSound();
      
      // Spawn small matching colored confetti burst
      for (let j = 0; j < 8; j++) {
        const burst = new Confetti();
        burst.x = hx;
        burst.y = hy;
        burst.color = p.color;
        burst.vy = Math.random() * 6 - 3;
        burst.vx = Math.random() * 6 - 3;
        celebrationParticles.push(burst);
      }
      celebrationParticles.splice(i, 1);
      hitBalloon = true;
      break; 
    }
  }

  // Count remaining balloons
  const remainingBalloons = celebrationParticles.filter(p => p instanceof Balloon).length;
  
  if (!hitBalloon) {
    celebrationOverlay.classList.remove('active');
    stopCelebration();
    initGame();
  } else if (remainingBalloons === 0) {
    canvas.style.pointerEvents = 'none';
    setTimeout(() => {
      celebrationOverlay.classList.remove('active');
      stopCelebration();
      initGame();
    }, 700);
  }
});

// Celebration Trigger with exact Syllable count
function startCelebration() {
  isCelebration = true;
  celebrationParticles = [];
  canvas.style.pointerEvents = 'auto';
  
  const sylInput = currentTarget.syllables || currentTarget.name;
  const syllables = sylInput.split('-');
  
  syllablesDisplay.textContent = syllables.join(' - ');
  
  syllables.forEach((sylText, index) => {
    celebrationParticles.push(new Balloon(index, syllables.length, sylText));
  });
  
  for (let i = 0; i < 40; i++) {
    celebrationParticles.push(new Confetti());
  }
}

function stopCelebration() {
  isCelebration = false;
  celebrationParticles = [];
  canvas.style.pointerEvents = 'none';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Game Logic
function initGame() {
  // Ensure we have enough items depending on Level
  const requiredCount = currentLevel === 1 ? 2 : 4;
  if (items.length < requiredCount) {
    questionText.textContent = `Adiciona pelo menos ${requiredCount} objetos na Gestão!`;
    cardsGrid.innerHTML = '';
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * items.length);
  currentTarget = items[randomIndex];
  
  const numOptions = requiredCount;
  
  let options = [currentTarget];
  const remaining = items.filter(item => item.id !== currentTarget.id);
  
  remaining.sort(() => Math.random() - 0.5);
  for (let i = 0; i < numOptions - 1; i++) {
    if (remaining[i]) {
      options.push(remaining[i]);
    }
  }
  
  currentOptions = options.sort(() => Math.random() - 0.5);
  renderGame();
  askQuestion();
}

function askQuestion() {
  if (!currentTarget) return;
  questionText.textContent = currentTarget.name;
}

function renderGame() {
  cardsGrid.innerHTML = '';
  
  // Set styling layout of the cards grid based on level
  if (currentLevel === 1) {
    cardsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    cardsGrid.style.gridTemplateRows = '1fr';
    cardsGrid.style.maxWidth = '550px';
  } else {
    cardsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    cardsGrid.style.gridTemplateRows = 'repeat(2, 1fr)';
    cardsGrid.style.maxWidth = '680px';
  }

  currentOptions.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'baby-card';
    card.dataset.id = item.id;
    
    const categoryLower = item.category.toLowerCase();
    if (categoryLower.includes('anim')) {
      card.classList.add('cat-animais');
    } else if (categoryLower.includes('frut')) {
      card.classList.add('cat-frutas');
    } else if (categoryLower.includes('veic')) {
      card.classList.add('cat-veiculos');
    } else if (categoryLower.includes('objet')) {
      card.classList.add('cat-objetos');
    }
    
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    
    img.style.transform = `scale(${item.scale || 1})`;
    img.style.objectPosition = `${item.posX ?? 50}% ${item.posY ?? 50}%`;
    
    img.onerror = () => {
      card.innerHTML = `<span style="font-size: 3rem;">${item.name}</span>`;
    };
    
    card.appendChild(img);
    card.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      handleCardSelect(item.id, card);
    });
    
    cardsGrid.appendChild(card);
  });
}

function handleCardSelect(id, cardElement) {
  initAudio();
  
  if (cardElement.classList.contains('wrong') || cardElement.classList.contains('correct') || isCelebration) {
    return;
  }
  
  if (id === currentTarget.id) {
    cardElement.classList.add('correct');
    
    const emoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
    celebrationEmoji.textContent = emoji;
    celebrationOverlay.classList.add('active');
    
    // Increment streak
    correctStreak++;
    
    // Auto-progression: upgrade level if baby scores 3 correct answers in Level 1
    if (currentLevel === 1 && correctStreak >= 3) {
      setTimeout(() => {
        currentLevel = 2;
        correctStreak = 0;
        levelBtn.textContent = '👦 Nível 2 (4)';
        playLevelUpSound();
        // Speak or notify could go here, for now sound is enough
      }, 800);
    }
    
    playCelebrationSound();
    startCelebration();
  } else {
    cardElement.classList.add('wrong');
    // Reset streak on error to keep/return to ease
    correctStreak = 0;
    playErrorSound();
  }
}

function startEdit(item) {
  editingItemId = item.id;
  document.getElementById('item-category').value = item.category;
  document.getElementById('item-name').value = item.name;
  itemImage.value = item.image;
  document.getElementById('item-syllables').value = item.syllables || '';
  itemScale.value = item.scale || 1;
  itemPosX.value = item.posX ?? 50;
  itemPosY.value = item.posY ?? 50;
  updatePreview();
  
  btnAddItem.textContent = 'Guardar';
  btnCancelEdit.style.display = 'flex';
  
  addItemForm.scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  editingItemId = null;
  document.getElementById('item-category').value = 'Animais';
  document.getElementById('item-name').value = '';
  itemImage.value = '';
  document.getElementById('item-syllables').value = '';
  itemScale.value = 1;
  itemPosX.value = 50;
  itemPosY.value = 50;
  updatePreview();
  
  btnAddItem.textContent = 'Adicionar';
  btnCancelEdit.style.display = 'none';
}

// Manager CRUD logic
function saveItems() {
  localStorage.setItem('baby_game_items', JSON.stringify(items));
  renderManager();
}

function renderManager() {
  itemsList.innerHTML = '';
  items.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card';
    
    itemCard.innerHTML = `
      <div class="baby-card" style="width: 65px; height: 65px; border-width: 4px; pointer-events: none; margin: 0; flex-shrink: 0;">
        <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${item.scale || 1}); object-position: ${item.posX ?? 50}% ${item.posY ?? 50}%;">
      </div>
      <div class="item-info" style="margin-left: 10px;">
        <div class="item-name">${item.name}</div>
        <div class="item-category">${item.category}</div>
        <div style="font-size: 0.9rem; color: var(--primary-color); font-weight: bold;">Sílaba: ${item.syllables || item.name}</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <button class="btn-edit" data-id="${item.id}" style="background: #e0f2fe; color: #0284c7; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.85rem;">Editar</button>
        <button class="btn-delete" data-id="${item.id}" style="padding: 6px 12px; border-radius: 8px; font-size: 0.85rem;">Apagar</button>
      </div>
    `;
    
    itemCard.querySelector('.btn-edit').addEventListener('click', () => {
      startEdit(item);
    });
    
    itemCard.querySelector('.btn-delete').addEventListener('click', () => {
      items = items.filter(i => i.id !== item.id);
      saveItems();
      if (editingItemId === item.id) {
        cancelEdit();
      }
    });
    
    itemsList.appendChild(itemCard);
  });
}

// Screen Toggles
let currentScreen = 'game';
function toggleScreen() {
  if (currentScreen === 'game') {
    currentScreen = 'manager';
    gameScreen.classList.remove('active');
    managerScreen.classList.add('active');
    toggleScreenBtn.innerHTML = '🎮';
    levelBtn.style.display = 'none'; // Hide level toggle during management
    renderManager();
  } else {
    currentScreen = 'game';
    managerScreen.classList.remove('active');
    gameScreen.classList.add('active');
    toggleScreenBtn.innerHTML = '⚙️';
    levelBtn.style.display = 'block';
    initGame();
  }
}

// Level Manual Toggle Handler
function toggleLevel() {
  initAudio();
  if (currentLevel === 1) {
    currentLevel = 2;
    levelBtn.textContent = '👦 Nível 2 (4)';
  } else {
    currentLevel = 1;
    levelBtn.textContent = '👶 Nível 1 (2)';
  }
  correctStreak = 0; // Reset streak on manual change
  initGame();
}

// Server Config Sync Checker (checks repository path for cards.json)
async function checkServerCards() {
  const syncStatus = document.getElementById('sync-status');
  try {
    const response = await fetch('./cards.json');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        items = data;
        localStorage.setItem('baby_game_items', JSON.stringify(items));
        if (syncStatus) {
          syncStatus.innerHTML = `<span style="color: #10b981;">🟢 Sincronizado com o repositório (cards.json carregado com ${items.length} itens)</span>`;
        }
        return;
      }
    }
  } catch (err) {
    console.error('Erro ao verificar cards.json no servidor:', err);
  }
  
  if (syncStatus) {
    syncStatus.innerHTML = `<span style="color: #f59e0b;">🟡 Local: cards.json não encontrado no servidor (a usar armazenamento local com ${items.length} itens)</span>`;
  }
}

// Live Image Preview Handler
function updatePreview() {
  const url = itemImage.value.trim();
  previewImg.src = url || 'https://placehold.co/120?text=Inserir+URL';
  previewImg.style.transform = `scale(${itemScale.value})`;
  previewImg.style.objectPosition = `${itemPosX.value}% ${itemPosY.value}%`;
}

itemImage.addEventListener('input', updatePreview);
itemScale.addEventListener('input', updatePreview);
itemPosX.addEventListener('input', updatePreview);
itemPosY.addEventListener('input', updatePreview);

// Listeners
toggleScreenBtn.addEventListener('click', toggleScreen);
levelBtn.addEventListener('click', toggleLevel);
logoBtn.addEventListener('click', () => {
  if (currentScreen !== 'game') toggleScreen();
});
btnCancelEdit.addEventListener('click', cancelEdit);

// Backup & Import/Export Listeners
const btnExportJson = document.getElementById('btn-export-json');
const btnImportJson = document.getElementById('btn-import-json');
const importFileInput = document.getElementById('import-file-input');

btnExportJson.addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "cards.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

btnImportJson.addEventListener('click', () => {
  importFileInput.click();
});

importFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (Array.isArray(importedData)) {
        items = importedData;
        saveItems();
        initGame();
        alert('Itens importados com sucesso!');
      } else {
        alert('O ficheiro JSON deve ser uma lista válida de itens.');
      }
    } catch (err) {
      alert('Erro ao ler o ficheiro JSON. Verifique a sua formatação.');
    }
  };
  reader.readAsText(file);
});

addItemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const category = document.getElementById('item-category').value;
  const name = document.getElementById('item-name').value.trim();
  const image = itemImage.value.trim();
  const syllables = document.getElementById('item-syllables').value.trim();
  const scale = parseFloat(itemScale.value) || 1;
  const posX = parseInt(itemPosX.value) ?? 50;
  const posY = parseInt(itemPosY.value) ?? 50;
  
  if (name && image && syllables) {
    if (editingItemId !== null) {
      // Update existing item
      items = items.map(item => {
        if (item.id === editingItemId) {
          return { ...item, category, name, image, syllables, scale, posX, posY };
        }
        return item;
      });
      saveItems();
      cancelEdit();
    } else {
      // Add new item
      const newItem = {
        id: Date.now(),
        category,
        name,
        image,
        syllables,
        scale,
        posX,
        posY
      };
      
      items.push(newItem);
      saveItems();
      
      document.getElementById('item-name').value = '';
      itemImage.value = '';
      document.getElementById('item-syllables').value = '';
      
      itemScale.value = 1;
      itemPosX.value = 50;
      itemPosY.value = 50;
      updatePreview();
    }
  }
});

// Initialize on Load
runParticleEngine();
checkServerCards().then(() => {
  initGame();
  renderManager();
});

