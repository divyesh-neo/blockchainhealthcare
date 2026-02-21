

// Current User
let currentUser = null;
let currentRole = 'doctor';

// Set Role
function setRole(role) {
  currentRole = role;
  if (role === 'doctor') {
    document.getElementById('doctorRoleBtn').className = 'flex-1 py-2 rounded-lg bg-sky-600 text-white font-semibold text-sm';
    document.getElementById('patientRoleBtn').className = 'flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold text-sm';
  } else {
    document.getElementById('patientRoleBtn').className = 'flex-1 py-2 rounded-lg bg-sky-600 text-white font-semibold text-sm';
    document.getElementById('doctorRoleBtn').className = 'flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold text-sm';
  }
}

// Show Register/Login Forms
function showRegister() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
}
function showLogin() {
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

// Show Main App
function showApp() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  document.getElementById('roleTag').textContent = currentUser.role === 'doctor' ? 'Doctor' : 'Patient';
  if (currentUser.role === 'patient') {
    document.getElementById('btn-dashboard').classList.add('hidden');
    document.getElementById('btn-register').textContent = 'Book Appointment';
    showTab('register');
  } else {
    document.getElementById('btn-dashboard').classList.remove('hidden');
    document.getElementById('btn-register').textContent = 'Register';
    showTab('dashboard');
  }
  updateStatus2();
  loadPatients();
  loadStats();
}

// Register
async function register() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  if (!name || !email || !password) { showToast('Badha fields bharo!', 'yellow'); return; }
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: currentRole })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Registered! Login karo!', 'green');
      showLogin();
    } else {
      showToast('' + data.message, 'red');
    }
  } catch (err) {
    showToast('Registration failed!', 'red');
  }
}

// Login
async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { showToast('Email ane password bharo!', 'yellow'); return; }

  // Offline login
  if (!navigator.onLine) {
    const savedUser = localStorage.getItem('offlineUser') || localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.email === email.trim() && user.password === password.trim()) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showApp();
        showToast('Offline login!', 'green');
        return;
      } else {
        showToast('Email ya password galat che!', 'red');
        return;
      }
    }
    showToast('Pehla online login karelu hovu joie!', 'red');
    return;
  }

  // Online login
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.data;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('offlineUser', JSON.stringify(currentUser));
      showApp();
    } else {
      showToast('Invalid email or password!', 'red');
    }
  } catch (err) {
    showToast('Login failed!', 'red');
  }
}

// Logout
// function logout() {
//   if (!navigator.onLine) {
//     showToast('Offline ma logout nai thay!', 'yellow');
//     return;
//   }
//   currentUser = null;
//   //calStorage.removeItem('currentUser');
//  //ocalStorage.setItem('offlineUser', JSON.stringify({...currentUser}));
//  localStorage.setItem('offlineUser', localStorage.getItem('currentUser'));
//   document.getElementById('mainApp').classList.add('hidden');
//   document.getElementById('loginPage').classList.remove('hidden');
// }

function logout() {
  localStorage.setItem('offlineUser', localStorage.getItem('currentUser'));
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
}

// Auto Login
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
  currentUser = JSON.parse(savedUser);
  showApp();
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch(err => console.log('SW Error:', err));
}

// IndexedDB Setup
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('healthcareDB', 1);
    request.onupgradeneeded = e => {
      e.target.result.createObjectStore('offlinePatients', {
        keyPath: 'id', autoIncrement: true
      });
    };
    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e);
  });
}

async function saveOffline(patient) {
  const db = await openDB();
  const tx = db.transaction('offlinePatients', 'readwrite');
  tx.objectStore('offlinePatients').add(patient);
}

async function getOfflinePatients() {
  const db = await openDB();
  const tx = db.transaction('offlinePatients', 'readonly');
  return new Promise((resolve, reject) => {
    const request = tx.objectStore('offlinePatients').getAll();
    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e);
  });
}

async function clearOfflinePatients() {
  const db = await openDB();
  const tx = db.transaction('offlinePatients', 'readwrite');
  tx.objectStore('offlinePatients').clear();
}

// Load Stats
async function loadStats() {
  if (!navigator.onLine) {
    const cached = localStorage.getItem('cachedStats');
    if (cached) {
      const s = JSON.parse(cached);
      document.getElementById('totalPatients').textContent = s.total;
      document.getElementById('todayPatients').textContent = s.todayPatients;
      document.getElementById('pendingCount').textContent = s.pending;
      document.getElementById('doneCount').textContent = s.done;
      if (s.doctorStats) renderDoctorChart(s.doctorStats);
    }
    return;
  }
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    const s = data.data;
    localStorage.setItem('cachedStats', JSON.stringify(s));
    document.getElementById('totalPatients').textContent = s.total;
    document.getElementById('todayPatients').textContent = s.todayPatients;
    document.getElementById('pendingCount').textContent = s.pending;
    document.getElementById('doneCount').textContent = s.done;
    if (s.doctorStats) renderDoctorChart(s.doctorStats);
  } catch (err) {
    console.log('Stats error:', err);
  }
}

// Doctor Chart
function renderDoctorChart(doctorStats) {
  const ctx = document.getElementById('doctorChart').getContext('2d');
  if (window.doctorChartInstance) window.doctorChartInstance.destroy();
  window.doctorChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: doctorStats.map(d => d._id),
      datasets: [{
        label: 'Patients',
        data: doctorStats.map(d => d.count),
        backgroundColor: ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

// Submit Patient
async function submitPatient(e) {
  e.preventDefault();
  const patient = {
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    phone: document.getElementById('phone').value,
    problem: document.getElementById('problem').value,
    doctor: document.getElementById('doctor').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    status: 'Pending',
    patientEmail: currentUser.email
  };

  if (navigator.onLine) {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Patient saved successfully!', 'green');
        loadPatients();
        loadStats();
      }
    } catch (err) {
      await saveOffline(patient);
      showToast('Saved offline!', 'yellow');
    }
  } else {
    await saveOffline(patient);
    showToast('No internet! Saved offline.', 'yellow');
  }
  document.getElementById('patientForm').reset();
}

// Search
async function searchPatients() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) { loadPatients(); return; }
  if (!navigator.onLine) {
    showToast('Search needs internet!', 'yellow');
    return;
  }
  try {
    const res = await fetch(`/api/search?q=${q}`);
    const data = await res.json();
    renderPatients(data.data, false);
  } catch (err) {
    console.log('Search error:', err);
  }
}

// Update Status
async function updateStatus(id, status) {
  try {
    await fetch(`/api/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast(`Status updated to ${status}!`, 'green');
    loadPatients();
    loadStats();
  } catch (err) {
    showToast('Update failed!', 'red');
  }
}

// Delete Patient
async function deletePatient(id) {
  if (!confirm('Are you sure you want to delete this patient?')) return;
  try {
    await fetch(`/api/patients/${id}`, { method: 'DELETE' });
    showToast('Patient deleted!', 'red');
    loadPatients();
    loadStats();
  } catch (err) {
    showToast('Delete failed!', 'red');
  }
}

// Add Prescription
async function addPrescription(id) {
  const prescription = prompt('Enter prescription:');
  if (!prescription) return;
  try {
    // Save to MongoDB
    const res = await fetch(`/api/patients/${id}/prescription`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prescription })
    });
    const data = await res.json();
    if (data.success) {
      // Save to Blockchain
      const patient = data.data;
      try {
        await fetch('/api/blockchain/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: patient._id,
            doctorName: currentUser.name,
            diagnosis: patient.problem || 'N/A',
            prescription: prescription
          })
        });
        showToast('Prescription added & saved to blockchain! ✓', 'green');
      } catch (err) {
        showToast('Prescription saved (blockchain sync failed)', 'yellow');
      }
      loadPatients();
    }
  } catch (err) {
    showToast('Failed!', 'red');
  }
}

// View Blockchain History
async function viewBlockchainHistory(patientId, patientName) {
  if (!navigator.onLine) {
    showToast('Need internet to view blockchain history!', 'yellow');
    return;
  }
  try {
    const res = await fetch(`/api/blockchain/history/${patientId}`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      let historyHTML = `<h3 class="font-bold text-lg mb-4">📋 ${patientName}'s Blockchain History</h3>`;
      historyHTML += '<div class="space-y-3">';
      data.data.forEach(record => {
        const date = new Date(record.timestamp * 1000).toLocaleString();
        historyHTML += `
          <div class="bg-gray-50 p-3 rounded-lg border-l-4 border-sky-400">
            <p class="font-semibold text-sm">Doctor: ${record.doctorName}</p>
            <p class="text-sm text-gray-700">Diagnosis: ${record.diagnosis}</p>
            <p class="text-sm text-purple-600">Rx: ${record.prescription}</p>
            <p class="text-xs text-gray-400 mt-1">📅 ${date}</p>
          </div>
        `;
      });
      historyHTML += '</div>';
      showModal('Blockchain History', historyHTML);
    } else {
      showToast('No blockchain records found!', 'yellow');
    }
  } catch (err) {
    showToast('Failed to fetch blockchain history!', 'red');
    console.log('Blockchain history error:', err);
  }
}

// Modal
function showModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold text-xl">${title}</h2>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
      </div>
      <div class="text-gray-700">${content}</div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Load Patients
async function loadPatients() {
  if (!navigator.onLine) {
    const cached = localStorage.getItem('cachedPatients');
    if (cached) renderPatients(JSON.parse(cached), false);
    else loadOfflinePatients();
    return;
  }
  try {
    const url = currentUser.role === 'patient'
      ? `/api/patients?email=${currentUser.email}`
      : '/api/patients';
    const res = await fetch(url);
    const data = await res.json();
    localStorage.setItem('cachedPatients', JSON.stringify(data.data));
    renderPatients(data.data, false);
  } catch (err) {
    const cached = localStorage.getItem('cachedPatients');
    if (cached) renderPatients(JSON.parse(cached), false);
    else loadOfflinePatients();
  }
}

async function loadOfflinePatients() {
  const patients = await getOfflinePatients();
  renderPatients(patients, true);
}

// Render Patients
function renderPatients(patients, isOffline) {
  const list = document.getElementById('patientList');
  if (patients.length === 0) {
    list.innerHTML = '<p class="text-gray-400 text-center col-span-2">No patients found</p>';
    return;
  }
  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Confirmed': 'bg-blue-100 text-blue-700',
    'Done': 'bg-green-100 text-green-700'
  };
  list.innerHTML = patients.map(p => `
    <div class="bg-white rounded-xl p-4 shadow border-l-4 ${isOffline ? 'border-yellow-400' : 'border-sky-400'}">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold text-gray-800 text-lg">${p.name}</h3>
        <span class="text-xs px-2 py-1 rounded-full ${isOffline ? 'bg-yellow-100 text-yellow-700' : (statusColors[p.status] || 'bg-gray-100 text-gray-700')}">
          ${isOffline ? 'Offline' : p.status}
        </span>
      </div>
      <p class="text-gray-500 text-sm">Age: ${p.age} | ${p.phone}</p>
      <p class="text-gray-600 mt-1">${p.problem}</p>
      <p class="text-gray-600"> ${p.doctor}</p>
      <p class="text-gray-400 text-xs mt-2">${p.date} at ${p.time}</p>
      ${p.prescription ? `<p class="text-purple-600 text-xs mt-1">${p.prescription}</p>` : ''}
      ${!isOffline && currentUser.role === 'doctor' ? `
      <div class="flex gap-2 mt-3 flex-wrap">
        <button onclick="updateStatus('${p._id}', 'Confirmed')"
          class="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-lg">
          Confirm
        </button>
        <button onclick="updateStatus('${p._id}', 'Done')"
          class="flex-1 text-xs bg-green-500 hover:bg-green-600 text-white py-1 rounded-lg">
          Done
        </button>
        <button onclick="addPrescription('${p._id}')"
          class="flex-1 text-xs bg-purple-500 hover:bg-purple-600 text-white py-1 rounded-lg">
          Rx
        </button>
        <button onclick="viewBlockchainHistory('${p._id}', '${p.name}')"
          class="flex-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white py-1 rounded-lg">
          Chain
        </button>
        <button onclick="deletePatient('${p._id}')"
          class="flex-1 text-xs bg-red-500 hover:bg-red-600 text-white py-1 rounded-lg">
          Del
        </button>
      </div>` : ''}
    </div>
  `).join('');
}

// Auto Sync
window.addEventListener('online', async () => {
  updateStatus2();
  showToast('Back online! Syncing...', 'blue');
  const offlinePatients = await getOfflinePatients();
  if (offlinePatients.length > 0) {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patients: offlinePatients })
      });
      const data = await res.json();
      if (data.success) {
        await clearOfflinePatients();
        showToast(`${data.synced} patients synced!`, 'green');
        loadPatients();
        loadStats();
      }
    } catch (err) {
      console.log('Sync failed:', err);
    }
  }
});

window.addEventListener('offline', () => {
  updateStatus2();
  showToast('Gone offline! Saving locally.', 'yellow');
});

function updateStatus2() {
  const indicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  if (navigator.onLine) {
    indicator.className = 'w-3 h-3 rounded-full bg-green-400';
    statusText.textContent = 'Online';
    statusText.className = 'text-green-300 font-semibold text-sm';
  } else {
    indicator.className = 'w-3 h-3 rounded-full bg-yellow-400';
    statusText.textContent = 'Offline';
    statusText.className = 'text-yellow-300 font-semibold text-sm';
  }
}

// Toast
function showToast(message, color) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500'
  };
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 ${colors[color]} text-white px-6 py-3 rounded-xl shadow-lg z-50`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Dark Mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const btn = document.getElementById('darkModeBtn');
  btn.textContent = document.documentElement.classList.contains('dark') ? '' : '';
}

// Tab Switch
function showTab(tab) {
  document.getElementById('dashboardTab').classList.add('hidden');
  document.getElementById('registerTab').classList.add('hidden');
  document.getElementById('patientsTab').classList.add('hidden');
  document.getElementById(tab + 'Tab').classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-sky-600', 'text-white');
    btn.classList.add('text-gray-600');
  });
  document.getElementById('btn-' + tab).classList.add('bg-sky-600', 'text-white');
  document.getElementById('btn-' + tab).classList.remove('text-gray-600');
}

// Init
document.getElementById('patientForm').addEventListener('submit', submitPatient);
document.getElementById('searchInput').addEventListener('input', searchPatients);
updateStatus2();
loadPatients();
loadStats();