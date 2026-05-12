/**
 * Smart Baby Monitor - Main Application Logic
 */

// ==========================================
// STATE & CONFIG
// ==========================================
const CONFIG = {
  cryThreshold: 80,
  maxChartPoints: 60,
  apiEndpoint: '/api/control' // Simulated endpoint
};

let state = {
  isConnected: false,
  isRocking: false,
  isCameraOn: false,
  isLullabyPlaying: false,
  soundHistory: [],
  currentSound: 0
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const DOM = {
  // Auth
  authScreen: document.getElementById('auth-screen'),
  dashboard: document.getElementById('dashboard'),
  navUsername: document.getElementById('nav-username'),
  
  // Connection & Time
  connDot: document.getElementById('conn-dot'),
  connLabel: document.getElementById('conn-label'),
  navTime: document.getElementById('nav-time'),
  
  // Status
  statusCard: document.getElementById('status-card'),
  statusLabel: document.getElementById('status-label'),
  statusSublabel: document.getElementById('status-sublabel'),
  soundBadge: document.getElementById('sound-badge-value'),
  iconCalm: document.getElementById('icon-calm'),
  iconCry: document.getElementById('icon-cry'),
  
  // Camera
  video: document.getElementById('camera-video'),
  
  // Controls
  rockingBadge: document.getElementById('rocking-badge'),
  cradleVisual: document.getElementById('cradle-visual'),
  btnRockStart: document.getElementById('btn-rock-start'),
  btnRockStop: document.getElementById('btn-rock-stop'),
  speedSlider: document.getElementById('speed-slider'),
  speedValue: document.getElementById('speed-value'),
  sliderFill: document.getElementById('slider-fill'),
  
  // Audio
  lullabyAudio: document.getElementById('lullaby-audio'),
  lullabyPlayIcon: document.getElementById('lullaby-play-icon'),
  lullabyPauseIcon: document.getElementById('lullaby-pause-icon'),
  lullabyWave: document.getElementById('lullaby-wave'),
  lullabyStatus: document.getElementById('lullaby-status'),
  speakInput: document.getElementById('speak-message'),
  
  // Events & Chart
  eventsList: document.getElementById('events-list'),
  chartCanvas: document.getElementById('sound-chart'),
  statMax: document.getElementById('stat-max'),
  statAvg: document.getElementById('stat-avg'),
  statAlerts: document.getElementById('stat-alerts')
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initChart();
  
  // Check if already logged in
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    showDashboard(currentUser);
  }
});

// ==========================================
// AUTHENTICATION
// ==========================================
function switchTab(tab) {
  document.getElementById('form-login').classList.toggle('active', tab === 'login');
  document.getElementById('form-signup').classList.toggle('active', tab === 'signup');
}

function signup(e) {
  e.preventDefault();
  const user = document.getElementById('signup-user').value.trim();
  const pass = document.getElementById('signup-pass').value;
  const errorEl = document.getElementById('signup-error');
  
  if (user.length < 3) return errorEl.innerText = 'Username must be at least 3 chars';
  if (localStorage.getItem('user_' + user)) return errorEl.innerText = 'Username already exists';
  
  // Create account
  localStorage.setItem('user_' + user, pass);
  
  // Reset form and switch to login
  document.getElementById('form-signup').reset();
  switchTab('login');
  
  // Pre-fill the login username
  document.getElementById('login-user').value = user;
  
  return false;
}

function login(e) {
  e.preventDefault();
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  const errorEl = document.getElementById('login-error');
  
  if (localStorage.getItem('user_' + user) === pass) {
    localStorage.setItem('currentUser', user);
    showDashboard(user);
  } else {
    errorEl.innerText = 'Invalid username or password';
  }
  return false;
}

function logout() {
  localStorage.removeItem('currentUser');
  DOM.dashboard.classList.add('hidden');
  DOM.authScreen.classList.remove('hidden');
  DOM.authScreen.style.opacity = '1';
  if (state.isCameraOn) stopCamera();
}

function showDashboard(username) {
  DOM.navUsername.innerText = username;
  DOM.authScreen.style.opacity = '0';
  setTimeout(() => {
    DOM.authScreen.classList.add('hidden');
    DOM.dashboard.classList.remove('hidden');
    // Fade in dashboard
    DOM.dashboard.style.opacity = '0';
    requestAnimationFrame(() => {
      DOM.dashboard.style.transition = 'opacity 0.5s ease';
      DOM.dashboard.style.opacity = '1';
    });
    initSocket();
  }, 500);
}

// ==========================================
// SOCKET.IO & REAL-TIME DATA
// ==========================================
let socket;
function initSocket() {
  if (socket) return;
  
  // Connect to Socket.IO (assuming same host)
  socket = io();
  
  socket.on('connect', () => {
    state.isConnected = true;
    updateConnectionUI(true);
    addEvent('System', 'Connected to Baby Monitor server');
  });
  
  socket.on('disconnect', () => {
    state.isConnected = false;
    updateConnectionUI(false);
    addEvent('System', 'Disconnected from server', true);
  });
  
  socket.on('update', (data) => {
    const val = parseInt(data.value, 10) || 0;
    processSoundData(val, data.time);
  });
}

function updateConnectionUI(connected) {
  DOM.connDot.className = 'conn-dot ' + (connected ? 'connected' : 'disconnected');
  DOM.connLabel.innerText = connected ? 'Connected' : 'Offline';
}

// ==========================================
// SOUND PROCESSING & STATUS
// ==========================================
let alertCount = 0;

function processSoundData(value, timeStr) {
  state.currentSound = value;
  DOM.soundBadge.innerText = value;
  
  // Update Chart
  const now = new Date();
  const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  updateChart(timeLabel, value);
  
  // Check Threshold
  if (value >= CONFIG.cryThreshold) {
    if (!DOM.statusCard.classList.contains('alert')) {
      // Transition to crying state
      DOM.statusCard.classList.add('alert');
      DOM.statusLabel.innerText = "Baby is Crying";
      DOM.statusSublabel.innerText = "Sound levels exceeded threshold 😢";
      DOM.iconCalm.classList.add('hidden');
      DOM.iconCry.classList.remove('hidden');
      addEvent('Alert', `High sound level detected: ${value}`, true);
      alertCount++;
      DOM.statAlerts.innerText = alertCount;
    }
  } else {
    if (DOM.statusCard.classList.contains('alert')) {
      // Transition to calm state
      DOM.statusCard.classList.remove('alert');
      DOM.statusLabel.innerText = "Baby is Calm";
      DOM.statusSublabel.innerText = "Everything looks peaceful 😴";
      DOM.iconCalm.classList.remove('hidden');
      DOM.iconCry.classList.add('hidden');
      addEvent('Info', 'Baby has calmed down');
    }
  }
}

// ==========================================
// CHART.JS VISUALIZATION
// ==========================================
let soundChart;
function initChart() {
  const ctx = DOM.chartCanvas.getContext('2d');
  
  // Gradient for fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(0, 113, 227, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 113, 227, 0.0)');
  
  soundChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(CONFIG.maxChartPoints).fill(''),
      datasets: [{
        label: 'Sound Level',
        data: Array(CONFIG.maxChartPoints).fill(0),
        borderColor: '#0071e3',
        backgroundColor: gradient,
        borderWidth: 2,
        fill: true,
        tension: 0.4, // Smooth curves
        pointRadius: 0,
        pointHitRadius: 10
      }, {
        label: 'Threshold',
        data: Array(CONFIG.maxChartPoints).fill(CONFIG.cryThreshold),
        borderColor: '#ff3b30',
        borderWidth: 1,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 }, // Disable animation for performance
      scales: {
        y: {
          min: 0,
          max: 120,
          grid: { color: 'rgba(0,0,0,0.05)' },
          border: { display: false }
        },
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}

function updateChart(label, data) {
  if (!soundChart) return;
  
  const dataset = soundChart.data.datasets[0].data;
  const labels = soundChart.data.labels;
  
  dataset.push(data);
  labels.push(label);
  
  if (dataset.length > CONFIG.maxChartPoints) {
    dataset.shift();
    labels.shift();
  }
  
  soundChart.update();
  
  // Update Stats
  const validData = dataset.filter(val => val > 0);
  if (validData.length > 0) {
    const max = Math.max(...validData);
    const avg = Math.round(validData.reduce((a, b) => a + b, 0) / validData.length);
    DOM.statMax.innerText = max;
    DOM.statAvg.innerText = avg;
  }
}

// ==========================================
// CAMERA FEED
// ==========================================
function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        DOM.video.srcObject = stream;
        state.isCameraOn = true;
        addEvent('System', 'Camera feed started');
      })
      .catch(err => {
        console.error("Camera error:", err);
        alert("Could not access camera. Please check permissions.");
      });
  } else {
    alert("Camera API not supported in this browser.");
  }
}

function stopCamera() {
  const stream = DOM.video.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    DOM.video.srcObject = null;
  }
  state.isCameraOn = false;
}

// ==========================================
// HARDWARE CONTROLS (SIMULATED API)
// ==========================================
async function sendCommand(command, payload = {}) {
  try {
    const response = await fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, ...payload })
    });
    console.log(`Sent command ${command}`, payload);
    return true; // Simulate success even if endpoint 404s
  } catch (err) {
    console.error('API Error:', err);
    return true; // Simulate success for frontend demo
  }
}

function startRock() {
  if (state.isRocking) return;
  state.isRocking = true;
  
  sendCommand('ROCK_START', { speed: DOM.speedSlider.value });
  
  DOM.cradleVisual.classList.add('is-rocking');
  DOM.rockingBadge.innerText = 'Rocking';
  DOM.rockingBadge.style.color = '#34c759';
  DOM.rockingBadge.style.background = 'rgba(52,199,89,0.1)';
  
  DOM.btnRockStart.disabled = true;
  DOM.btnRockStop.disabled = false;
  
  addEvent('Action', 'Started cradle rocking');
}

function stopRock() {
  if (!state.isRocking) return;
  state.isRocking = false;
  
  sendCommand('ROCK_STOP');
  
  DOM.cradleVisual.classList.remove('is-rocking');
  DOM.rockingBadge.innerText = 'Stopped';
  DOM.rockingBadge.style.color = '';
  DOM.rockingBadge.style.background = '';
  
  DOM.btnRockStart.disabled = false;
  DOM.btnRockStop.disabled = true;
  
  addEvent('Action', 'Stopped cradle rocking');
}

function onSpeedChange(val) {
  DOM.speedValue.innerText = val + '%';
  DOM.sliderFill.style.width = val + '%';
  if (state.isRocking) {
    sendCommand('SET_SPEED', { speed: val });
  }
}

// ==========================================
// AUDIO FEATURES
// ==========================================
function toggleLullaby() {
  if (state.isLullabyPlaying) {
    DOM.lullabyAudio.pause();
    DOM.lullabyPlayIcon.classList.remove('hidden');
    DOM.lullabyPauseIcon.classList.add('hidden');
    DOM.lullabyWave.classList.remove('playing');
    DOM.lullabyStatus.innerText = 'Tap to play';
    addEvent('Action', 'Stopped lullaby');
  } else {
    DOM.lullabyAudio.play().catch(e => console.error("Audio play failed:", e));
    DOM.lullabyPlayIcon.classList.add('hidden');
    DOM.lullabyPauseIcon.classList.remove('hidden');
    DOM.lullabyWave.classList.add('playing');
    DOM.lullabyStatus.innerText = 'Playing...';
    addEvent('Action', 'Started lullaby');
  }
  state.isLullabyPlaying = !state.isLullabyPlaying;
}

function speak() {
  const text = DOM.speakInput.value.trim() || "Baby, it's okay, go to sleep.";
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.pitch = 1.2; // Soothing pitch
    msg.rate = 0.9;  // Slightly slower
    window.speechSynthesis.speak(msg);
    addEvent('Action', `Spoke: "${text}"`);
    
    // Simulate API call for backend speaker if needed
    sendCommand('SPEAK', { message: text });
  } else {
    alert("Speech Synthesis not supported in your browser.");
  }
}

// ==========================================
// UTILITIES (Events & Clock)
// ==========================================
function addEvent(type, message, isAlert = false) {
  // Remove empty state message if exists
  const emptyState = DOM.eventsList.querySelector('.events-empty');
  if (emptyState) emptyState.remove();
  
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  const div = document.createElement('div');
  div.className = `event-item ${isAlert ? 'alert-event' : ''}`;
  div.innerHTML = `
    <span class="time">${timeStr}</span>
    <span class="msg"><strong>${type}:</strong> ${message}</span>
  `;
  
  DOM.eventsList.prepend(div);
  
  // Keep only last 20 events
  if (DOM.eventsList.children.length > 20) {
    DOM.eventsList.lastElementChild.remove();
  }
}

function clearEvents() {
  DOM.eventsList.innerHTML = `
    <div class="events-empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
      <p>Waiting for events…</p>
    </div>
  `;
}

function initClock() {
  setInterval(() => {
    const now = new Date();
    DOM.navTime.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Also update camera timestamp if recording
    const hudTime = document.getElementById('hud-timestamp');
    if (hudTime && state.isCameraOn) {
      hudTime.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }, 1000);
}
