/**
 * ElevateMind — Frontend Application (ES Modules style, no build tool needed)
 * Organized into: API, State, UI Utilities, Features, Init
 */

'use strict';

/* ══════════════════════════════════════════════
   1. API CLIENT
   ══════════════════════════════════════════════ */
const API = {
  BASE: '/api',

  async request(endpoint, options = {}) {
    const url = `${this.BASE}${endpoint}`;
    const defaultHeaders = { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg =
          data?.error?.message ||
          data?.errors?.map((e) => e.message).join(', ') ||
          `Request failed (${response.status})`;
        throw new Error(errMsg);
      }

      return data;
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error('Network error — please check your connection.');
      }
      throw err;
    }
  },

  get: (endpoint, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return API.request(`${endpoint}${qs ? '?' + qs : ''}`);
  },

  post: (endpoint, body) =>
    API.request(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  del: (endpoint) =>
    API.request(endpoint, { method: 'DELETE' }),
};

/* ══════════════════════════════════════════════
   2. APP STATE
   ══════════════════════════════════════════════ */
const State = {
  moods: [],
  bookings: [],
  breathInterval: null,
  breathCycles: 0,
  breathRunning: false,
  currentTab: 'dashboard',
};

/* ══════════════════════════════════════════════
   3. UI UTILITIES
   ══════════════════════════════════════════════ */

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type='info']
 * @param {number} [duration=3500]
 */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/**
 * Set a button to loading state.
 * @param {HTMLButtonElement} btn
 * @param {boolean} loading
 */
function setLoading(btn, loading) {
  const textSpan = btn.querySelector('span:not(.spinner)');
  const spinner = btn.querySelector('.spinner');
  btn.disabled = loading;
  if (loading) {
    spinner?.classList.remove('hidden');
    if (textSpan) textSpan.style.opacity = '0.5';
  } else {
    spinner?.classList.add('hidden');
    if (textSpan) textSpan.style.opacity = '1';
  }
}

/** Switch active tab */
function switchTab(targetId) {
  document.querySelectorAll('.tab-content').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach((b) => {
    b.classList.remove('active');
    b.removeAttribute('aria-current');
  });

  const target = document.getElementById(targetId);
  const btn = document.querySelector(`[data-target="${targetId}"]`);

  if (target) target.classList.add('active');
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-current', 'page');
  }

  State.currentTab = targetId;

  // Close sidebar on mobile
  closeMobileSidebar();

  // Scroll to top
  document.getElementById('main-content').scrollTo({ top: 0, behavior: 'smooth' });
}

/** Mobile sidebar helpers */
function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('active');
  document.getElementById('hamburger-btn').setAttribute('aria-expanded', 'true');
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');
  document.getElementById('hamburger-btn').setAttribute('aria-expanded', 'false');
}

/** Format a date string to readable format */
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/** Animate a counter from 0 to target */
function animateCounter(el, target, duration = 600) {
  const start = performance.now();
  const animate = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

/** Update dashboard stats */
function updateStats() {
  const moodEl = document.getElementById('stat-moods');
  const bookEl = document.getElementById('stat-bookings');
  animateCounter(moodEl, State.moods.length);
  animateCounter(bookEl, State.bookings.length);
}

/** Time-of-day greeting */
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = '🌙 Good Night!';
  if (hour >= 5 && hour < 12) greeting = '☀️ Good Morning!';
  else if (hour >= 12 && hour < 17) greeting = '🌤️ Good Afternoon!';
  else if (hour >= 17 && hour < 21) greeting = '🌆 Good Evening!';
  const badge = document.getElementById('greeting-badge');
  if (badge) badge.textContent = greeting;
}

/* ══════════════════════════════════════════════
   4. MOTIVATIONAL QUOTES
   ══════════════════════════════════════════════ */
const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "Success is not final, failure is not fatal. It is the courage to continue that counts. — Churchill",
  "Mental health is not a destination, but a process. — Noam Shpancer",
  "Your mental health is a priority. Your happiness is essential. — Anonymous",
  "You are enough, a thousand times enough. — Atticus",
  "Take care of your body. It's the only place you have to live. — Jim Rohn",
  "In the middle of difficulty lies opportunity. — Albert Einstein",
  "Hardships often prepare ordinary people for an extraordinary destiny. — C.S. Lewis",
];

let quoteIndex = Math.floor(Math.random() * QUOTES.length);

function showQuote() {
  const el = document.getElementById('daily-quote');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = `"${QUOTES[quoteIndex]}"`;
    el.style.transition = 'opacity 0.4s';
    el.style.opacity = '1';
    quoteIndex = (quoteIndex + 1) % QUOTES.length;
  }, 200);
}

/* ══════════════════════════════════════════════
   5. MOOD TRACKER
   ══════════════════════════════════════════════ */
const MOOD_EMOJIS = {
  Energized: '😄', Happy: '😊', Calm: '🙂', Focused: '🎯',
  Stressed: '😟', Anxious: '😰', Overwhelmed: '😣', Sad: '😢',
};

function renderMoodList() {
  const ul = document.getElementById('mood-list');
  ul.innerHTML = '';

  if (!State.moods.length) {
    ul.innerHTML = '<li style="text-align:center;color:var(--text-muted)">No mood logs yet. Start your journey! 🌱</li>';
    return;
  }

  State.moods.forEach((log) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${MOOD_EMOJIS[log.mood] || ''} ${log.mood}</strong>
        ${log.note ? `<p style="margin-top:0.25rem;color:var(--text-muted)">${log.note}</p>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.3rem">
        <span class="log-meta">${formatDate(log.created_at)}</span>
        <button class="log-delete-btn" data-id="${log.id}" title="Delete entry" aria-label="Delete mood log">🗑</button>
      </div>
    `;
    ul.appendChild(li);
  });

  // Delete event delegation
  ul.querySelectorAll('.log-delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteMood(btn.dataset.id));
  });
}

async function loadMoods() {
  try {
    const { data } = await API.get('/moods');
    State.moods = data;
    renderMoodList();
    updateStats();
  } catch (err) {
    showToast(`Failed to load moods: ${err.message}`, 'error');
  }
}

async function deleteMood(id) {
  try {
    await API.del(`/moods/${id}`);
    State.moods = State.moods.filter((m) => m.id !== id);
    renderMoodList();
    updateStats();
    showToast('Mood log deleted.', 'success');
  } catch (err) {
    showToast(`Could not delete: ${err.message}`, 'error');
  }
}

function initMoodForm() {
  const form = document.getElementById('mood-form');
  const noteEl = document.getElementById('mood-note');
  const charCount = document.getElementById('note-char');
  const submitBtn = document.getElementById('mood-submit-btn');

  noteEl.addEventListener('input', () => {
    charCount.textContent = noteEl.value.length;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const moodInput = form.querySelector('input[name="mood"]:checked');
    if (!moodInput) {
      showToast('Please select your mood first! 😊', 'warning');
      return;
    }

    setLoading(submitBtn, true);
    try {
      const { data } = await API.post('/moods', {
        mood: moodInput.value,
        note: noteEl.value.trim(),
      });
      State.moods.unshift(data);
      renderMoodList();
      updateStats();
      form.reset();
      charCount.textContent = '0';
      showToast(`Mood logged: ${MOOD_EMOJIS[data.mood]} ${data.mood}`, 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* ══════════════════════════════════════════════
   6. BREATHING EXERCISE
   ══════════════════════════════════════════════ */
function initBreathing() {
  const circle = document.getElementById('breath-circle');
  const btn = document.getElementById('breath-btn');
  const phaseEl = document.getElementById('breath-phase');
  const countEl = document.getElementById('breath-count');

  const phases = [
    { name: 'Inhale…',    duration: 4000, class: 'inhale', text: 'Breathe in slowly…' },
    { name: 'Hold…',      duration: 2000, class: 'hold',   text: 'Hold your breath…' },
    { name: 'Exhale…',    duration: 6000, class: 'exhale', text: 'Breathe out slowly…' },
    { name: 'Rest…',      duration: 2000, class: '',        text: 'Rest…' },
  ];

  let phaseIdx = 0;
  let timeoutId = null;

  function runPhase() {
    if (!State.breathRunning) return;
    const phase = phases[phaseIdx];

    circle.className = 'breathing-circle' + (phase.class ? ` ${phase.class}` : '');
    circle.textContent = phase.name;
    phaseEl.textContent = phase.text;

    phaseIdx = (phaseIdx + 1) % phases.length;

    // Count completed cycles
    if (phaseIdx === 0) {
      State.breathCycles++;
      countEl.textContent = State.breathCycles;
    }

    timeoutId = setTimeout(runPhase, phase.duration);
  }

  btn.addEventListener('click', () => {
    State.breathRunning = !State.breathRunning;

    if (State.breathRunning) {
      btn.textContent = 'Stop Exercise';
      phaseIdx = 0;
      State.breathCycles = 0;
      countEl.textContent = '0';
      runPhase();
    } else {
      btn.textContent = 'Start Exercise';
      clearTimeout(timeoutId);
      circle.className = 'breathing-circle';
      circle.textContent = 'Ready';
      phaseEl.textContent = '';
    }
  });
}

/* ══════════════════════════════════════════════
   7. CAREER ASSESSMENT
   ══════════════════════════════════════════════ */
function initCareerForm() {
  const form = document.getElementById('career-form');
  const resultEl = document.getElementById('career-result');
  const submitBtn = document.getElementById('career-submit-btn');
  const progressBar = document.getElementById('career-progress');
  const totalQuestions = 5;

  // Update progress bar as user answers
  form.addEventListener('change', () => {
    const answered = form.querySelectorAll('input[type="radio"]:checked').length;
    progressBar.style.width = `${(answered / totalQuestions) * 100}%`;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const answers = [];
    let allAnswered = true;

    for (let i = 1; i <= totalQuestions; i++) {
      const sel = form.querySelector(`input[name="q${i}"]:checked`);
      if (!sel) { allAnswered = false; break; }
      answers.push(sel.value);
    }

    if (!allAnswered) {
      showToast('Please answer all questions before submitting! 🎯', 'warning');
      return;
    }

    setLoading(submitBtn, true);
    resultEl.classList.add('hidden');

    try {
      const { data } = await API.post('/career-assessment', { answers });

      resultEl.innerHTML = `
        <div class="result-title">${data.emoji || ''} Your Career Path: ${data.title}</div>
        <p style="color:var(--text-muted);margin-bottom:0.5rem">Based on your answers</p>
        <div class="role-tags">
          ${data.roles.map((r) => `<span class="role-tag">${r}</span>`).join('')}
        </div>
        <p style="margin:1rem 0">${data.advice}</p>
        <div class="resource-links">
          <strong style="width:100%;display:block;margin-bottom:0.4rem;font-size:0.85rem">📚 Recommended Resources:</strong>
          ${data.resources.map((r) => `<a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.name} ↗</a>`).join('')}
        </div>
      `;
      resultEl.classList.remove('hidden');
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showToast(`Great match found: ${data.title}! 🎉`, 'success');
    } catch (err) {
      showToast(`Assessment error: ${err.message}`, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* ══════════════════════════════════════════════
   8. SESSION BOOKING
   ══════════════════════════════════════════════ */
function renderBookingList() {
  const ul = document.getElementById('booking-list');
  const noMsg = document.getElementById('no-bookings-msg');

  ul.innerHTML = '';
  const active = State.bookings.filter((b) => b.status !== 'cancelled');

  if (!active.length) {
    noMsg?.classList.remove('hidden');
    return;
  }

  noMsg?.classList.add('hidden');

  active.forEach((booking) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${booking.type}</strong>
        <p style="color:var(--text-muted);font-size:0.8rem">${booking.name} · ${booking.email}</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.3rem">
        <span class="log-meta">📅 ${formatDate(booking.date + 'T00:00:00')}</span>
        <button class="log-delete-btn" data-id="${booking.id}" title="Cancel booking" aria-label="Cancel booking">Cancel</button>
      </div>
    `;
    ul.appendChild(li);
  });

  ul.querySelectorAll('.log-delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => cancelBooking(btn.dataset.id));
  });
}

async function loadBookings() {
  try {
    const { data } = await API.get('/bookings');
    State.bookings = data;
    renderBookingList();
    updateStats();
  } catch (err) {
    showToast(`Failed to load bookings: ${err.message}`, 'error');
  }
}

async function cancelBooking(id) {
  try {
    await API.del(`/bookings/${id}`);
    const booking = State.bookings.find((b) => b.id === id);
    if (booking) booking.status = 'cancelled';
    renderBookingList();
    updateStats();
    showToast('Booking cancelled.', 'warning');
  } catch (err) {
    showToast(`Could not cancel: ${err.message}`, 'error');
  }
}

function validateBookingForm() {
  const fields = {
    name:  { el: document.getElementById('book-name'),  err: document.getElementById('err-name') },
    email: { el: document.getElementById('book-email'), err: document.getElementById('err-email') },
    type:  { el: document.getElementById('book-type'),  err: document.getElementById('err-type') },
    date:  { el: document.getElementById('book-date'),  err: document.getElementById('err-date') },
  };

  let valid = true;

  // Reset
  Object.values(fields).forEach(({ el, err }) => {
    el.classList.remove('invalid');
    err.textContent = '';
  });

  if (!fields.name.el.value.trim()) {
    fields.name.err.textContent = 'Full name is required.';
    fields.name.el.classList.add('invalid');
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(fields.email.el.value)) {
    fields.email.err.textContent = 'Please enter a valid email.';
    fields.email.el.classList.add('invalid');
    valid = false;
  }

  if (!fields.type.el.value) {
    fields.type.err.textContent = 'Please select a session type.';
    fields.type.el.classList.add('invalid');
    valid = false;
  }

  const today = new Date().toISOString().split('T')[0];
  if (!fields.date.el.value || fields.date.el.value < today) {
    fields.date.err.textContent = 'Please select a future date.';
    fields.date.el.classList.add('invalid');
    valid = false;
  }

  return valid;
}

function initBookingForm() {
  const form = document.getElementById('booking-form');
  const submitBtn = document.getElementById('booking-submit-btn');
  const dateEl = document.getElementById('book-date');

  // Set minimum date to today
  dateEl.min = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateBookingForm()) return;

    setLoading(submitBtn, true);
    try {
      const { data } = await API.post('/bookings', {
        name:  document.getElementById('book-name').value.trim(),
        email: document.getElementById('book-email').value.trim(),
        type:  document.getElementById('book-type').value,
        date:  document.getElementById('book-date').value,
      });

      State.bookings.unshift(data);
      renderBookingList();
      updateStats();
      form.reset();
      showToast(`Session booked for ${formatDate(data.date + 'T00:00:00')}! 🎉`, 'success', 5000);
    } catch (err) {
      showToast(`Booking failed: ${err.message}`, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* ══════════════════════════════════════════════
   9. INITIALIZATION
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  // Mobile sidebar
  document.getElementById('hamburger-btn').addEventListener('click', () => {
    const isOpen = document.getElementById('sidebar').classList.contains('open');
    isOpen ? closeMobileSidebar() : openMobileSidebar();
  });
  document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar);

  // Quote
  showQuote();
  document.getElementById('new-quote-btn')?.addEventListener('click', showQuote);

  // Greeting
  setGreeting();

  // Feature inits
  initMoodForm();
  initBreathing();
  initCareerForm();
  initBookingForm();

  // Load data
  await Promise.allSettled([loadMoods(), loadBookings()]);
});
