// ========================================================
// Main Application Logic for Internship Eligibility Checker
// ========================================================

let currentUser = null;
let currentProfile = null;
let allInternships = [];
let allStudents = [];
let lastEligibilityResult = null;

document.addEventListener('DOMContentLoaded', async () => {
  initAuth();
  await loadInternships();
  await loadStudentsForChecker();
  await updateStats();
});

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <div>${message}</div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Navigation between views
function navigate(tabName) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  const targetSec = document.getElementById(`view-${tabName}`);
  if (targetSec) targetSec.classList.add('active');

  const targetLink = document.querySelector(`.nav-link[data-tab="${tabName}"]`);
  if (targetLink) targetLink.classList.add('active');

  // Tab specific refreshes
  if (tabName === 'internships') {
    renderInternshipCards();
  } else if (tabName === 'profile' && currentUser) {
    loadProfile();
  } else if (tabName === 'applications' && currentUser) {
    loadStudentApplications();
  } else if (tabName === 'admin' && currentUser && currentUser.role === 'ADMIN') {
    loadAdminDashboard();
  }
}

// Authentication handling
function initAuth() {
  const saved = localStorage.getItem('iec_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      updateAuthUI();
    } catch (e) {
      localStorage.removeItem('iec_user');
    }
  } else {
    // Default: auto-login as Priya (sample student) for instant pleasant experience
    quickLogin('priya@student.com', 'student123', false);
  }
}

function updateAuthUI() {
  const infoBadge = document.getElementById('user-info-badge');
  const nameDisp = document.getElementById('user-name-display');
  const roleDisp = document.getElementById('user-role-display');
  const authBtn = document.getElementById('auth-btn');

  const navProfile = document.getElementById('nav-profile-li');
  const navApps = document.getElementById('nav-applications-li');
  const navAdmin = document.getElementById('nav-admin-li');

  if (currentUser) {
    infoBadge.style.display = 'flex';
    nameDisp.textContent = currentUser.name;
    roleDisp.textContent = currentUser.role;
    roleDisp.className = `role-pill ${currentUser.role.toLowerCase()}`;

    authBtn.textContent = 'Sign Out';
    authBtn.onclick = logout;
    authBtn.className = 'btn btn-secondary btn-sm';

    if (currentUser.role === 'ADMIN') {
      navAdmin.style.display = 'block';
      navProfile.style.display = 'none';
      navApps.style.display = 'none';
    } else {
      navAdmin.style.display = 'none';
      navProfile.style.display = 'block';
      navApps.style.display = 'block';
      loadProfileDataSilently();
    }
  } else {
    infoBadge.style.display = 'none';
    navAdmin.style.display = 'none';
    navProfile.style.display = 'none';
    navApps.style.display = 'none';

    authBtn.textContent = 'Login / Register';
    authBtn.onclick = openAuthModal;
    authBtn.className = 'btn btn-primary btn-sm';
  }
}

async function loadProfileDataSilently() {
  if (!currentUser || currentUser.role !== 'STUDENT') return;
  try {
    currentProfile = await API.getStudentProfile(currentUser.id);
  } catch (e) {
    console.error('Profile fetch error:', e);
  }
}

function logout() {
  currentUser = null;
  currentProfile = null;
  localStorage.removeItem('iec_user');
  updateAuthUI();
  showToast('Logged out successfully', 'info');
  navigate('home');
}

// Modal open/close
function openAuthModal() {
  document.getElementById('auth-modal').classList.add('active');
}
function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const loginTabBtn = document.getElementById('auth-tab-login');
  const regTabBtn = document.getElementById('auth-tab-register');
  const modalTitle = document.getElementById('auth-modal-title');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
    loginTabBtn.classList.add('active');
    regTabBtn.classList.remove('active');
    modalTitle.textContent = 'Sign In to Account';
  } else {
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
    loginTabBtn.classList.remove('active');
    regTabBtn.classList.add('active');
    modalTitle.textContent = 'Register New Student Profile';
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await API.login(email, password);
    currentUser = res;
    localStorage.setItem('iec_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    showToast(`Welcome back, ${currentUser.name}!`, 'success');
    if (currentUser.role === 'ADMIN') {
      navigate('admin');
    } else {
      navigate('internships');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('reg-name').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value,
    role: document.getElementById('reg-role').value,
    branch: document.getElementById('reg-branch').value,
    cgpa: parseFloat(document.getElementById('reg-cgpa').value) || 7.0,
    skills: document.getElementById('reg-skills').value
  };

  try {
    const res = await API.register(data);
    currentUser = res;
    localStorage.setItem('iec_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    showToast('Registration successful! Profile initialized.', 'success');
    await loadStudentsForChecker();
    navigate(currentUser.role === 'ADMIN' ? 'admin' : 'profile');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function quickLogin(email, password, showNotification = true) {
  try {
    const res = await API.login(email, password);
    currentUser = res;
    localStorage.setItem('iec_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    if (showNotification) {
      showToast(`Logged in as ${currentUser.name} (${currentUser.role})`, 'success');
    }
    await loadStudentsForChecker();
  } catch (err) {
    if (showNotification) showToast(err.message, 'error');
  }
}

// ---------------- Internships Management ----------------
async function loadInternships() {
  try {
    allInternships = await API.getInternships();
    renderFeaturedInternships();
    renderInternshipCards();
    populateCheckerDropdowns();
  } catch (err) {
    console.error('Failed to load internships:', err);
  }
}

function renderFeaturedInternships() {
  const container = document.getElementById('home-featured-grid');
  if (!container) return;
  const featured = allInternships.slice(0, 3);
  container.innerHTML = featured.map(i => createInternshipCardHtml(i)).join('');
}

function renderInternshipCards() {
  const container = document.getElementById('internships-cards-container');
  if (!container) return;
  filterInternships();
}

function filterInternships() {
  const container = document.getElementById('internships-cards-container');
  if (!container) return;

  const search = (document.getElementById('internship-search')?.value || '').toLowerCase();
  const branch = document.getElementById('branch-filter')?.value || '';
  const maxCgpa = parseFloat(document.getElementById('cgpa-filter')?.value) || 0;

  const filtered = allInternships.filter(i => {
    const matchesSearch = !search ||
      i.title.toLowerCase().includes(search) ||
      i.company.toLowerCase().includes(search) ||
      i.requiredSkills.toLowerCase().includes(search);

    const matchesBranch = !branch ||
      i.eligibleBranches.toLowerCase().includes(branch.toLowerCase()) ||
      i.eligibleBranches.toLowerCase().includes('all');

    const matchesCgpa = !maxCgpa || i.minimumCgpa <= maxCgpa;

    return matchesSearch && matchesBranch && matchesCgpa;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔎</div>
        <h3>No matching internships found</h3>
        <p>Try adjusting your search criteria or filter options.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(i => createInternshipCardHtml(i)).join('');
}

function createInternshipCardHtml(item) {
  const skills = item.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
  const companyInitial = item.company.charAt(0);

  return `
    <div class="internship-card">
      <div class="internship-card-header">
        <div class="company-badge-box">
          <div class="company-logo-avatar">${companyInitial}</div>
          <div class="company-meta">
            <h3>${item.title}</h3>
            <span>${item.company}</span>
          </div>
        </div>
      </div>

      <div class="internship-tags">
        <span class="tag stipend">💰 ${item.stipend}</span>
        <span class="tag cgpa">📊 Min CGPA: ${item.minimumCgpa}</span>
        <span class="tag">📍 ${item.location}</span>
        <span class="tag">⏱️ ${item.duration}</span>
      </div>

      <p class="internship-desc">${item.description || 'Join this exciting internship program to accelerate your tech career.'}</p>

      <div class="internship-req-section">
        <div class="req-row">
          <span class="req-label">Eligible Branches:</span>
          <span class="req-value">${item.eligibleBranches}</span>
        </div>
        <div class="req-row">
          <span class="req-label">Required Skills:</span>
          <span class="req-value">${skills.join(', ')}</span>
        </div>
        <div class="req-row">
          <span class="req-label">Minimum Skill Match:</span>
          <span class="req-value" style="color: var(--primary);">${item.minimumSkillMatch}%</span>
        </div>
      </div>

      <div class="internship-card-footer">
        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="checkSpecificInternship(${item.id})">
          ⚡ Check Eligibility
        </button>
        <button class="btn btn-secondary btn-sm" onclick="quickApply(${item.id})">
          Apply Now
        </button>
      </div>
    </div>
  `;
}

// ---------------- Eligibility Checker ----------------
async function loadStudentsForChecker() {
  try {
    allStudents = await API.getAllStudents();
    populateCheckerDropdowns();
  } catch (e) {
    console.error('Failed to load students:', e);
  }
}

function populateCheckerDropdowns() {
  const intSelect = document.getElementById('checker-internship-select');
  const stuSelect = document.getElementById('checker-student-select');

  if (intSelect) {
    intSelect.innerHTML = allInternships.map(i => `
      <option value="${i.id}">${i.title} - ${i.company} (Min CGPA: ${i.minimumCgpa})</option>
    `).join('');
  }

  if (stuSelect) {
    stuSelect.innerHTML = allStudents.map(s => {
      const isSelected = currentUser && currentUser.studentProfileId === s.id ? 'selected' : '';
      return `<option value="${s.id}" ${isSelected}>${s.user.name} (${s.branch}, CGPA: ${s.cgpa})</option>`;
    }).join('');
  }
}

function checkSpecificInternship(internshipId) {
  navigate('checker');
  const select = document.getElementById('checker-internship-select');
  if (select) {
    select.value = internshipId;
    runEligibilityCheck();
  }
}

function toggleWhatIfMode() {
  const checked = document.getElementById('what-if-toggle').checked;
  const fields = document.getElementById('what-if-fields');
  fields.style.display = checked ? 'block' : 'none';

  if (checked) {
    // Pre-populate sandbox with selected student's values
    const stuId = parseInt(document.getElementById('checker-student-select').value);
    const stu = allStudents.find(s => s.id === stuId);
    if (stu) {
      document.getElementById('sandbox-branch').value = stu.branch;
      document.getElementById('sandbox-cgpa').value = stu.cgpa;
      document.getElementById('sandbox-skills').value = stu.skills;
    }
  }
}

function onCheckerStudentChange() {
  if (document.getElementById('what-if-toggle').checked) {
    toggleWhatIfMode();
  }
}

function onCheckerInternshipChange() {
  // auto-run check on internship selection
  runEligibilityCheck();
}

async function runEligibilityCheck() {
  const internshipId = parseInt(document.getElementById('checker-internship-select')?.value);
  const studentId = parseInt(document.getElementById('checker-student-select')?.value);

  if (!internshipId) {
    showToast('Please select an internship', 'error');
    return;
  }

  const isWhatIf = document.getElementById('what-if-toggle')?.checked;
  const params = { internshipId, studentId };

  if (isWhatIf) {
    params.customBranch = document.getElementById('sandbox-branch').value;
    params.customCgpa = parseFloat(document.getElementById('sandbox-cgpa').value);
    params.customSkills = document.getElementById('sandbox-skills').value;
  }

  try {
    const result = await API.checkEligibility(params);
    lastEligibilityResult = result;
    renderEligibilityResult(result);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderEligibilityResult(res) {
  const container = document.getElementById('checker-result-container');
  if (!container) return;

  const isEligible = res.eligible;
  const bannerClass = isEligible ? 'eligible' : 'ineligible';
  const bannerTitle = isEligible ? '✅ ELIGIBLE TO APPLY' : '❌ NOT ELIGIBLE';
  const bannerSub = isEligible
    ? 'Congratulations! Your academic qualifications and technical skills meet this company’s criteria.'
    : 'Your profile does not meet one or more prerequisites for this internship.';

  // Progress color
  const progressColor = res.skillMatchPercentage >= res.minimumSkillMatch ? 'var(--success)' : 'var(--danger)';

  // Build HTML
  container.innerHTML = `
    <!-- Top Verdict Banner -->
    <div class="verdict-banner ${bannerClass}">
      <div class="verdict-text">
        <h2>${bannerTitle}</h2>
        <p>${bannerSub}</p>
      </div>
      <div class="verdict-badge-big">${isEligible ? '🎉' : '⚠️'}</div>
    </div>

    <!-- Match Breakdown Grid -->
    <div class="breakdown-grid">
      <!-- CGPA Card -->
      <div class="breakdown-card ${res.cgpaEligible ? 'pass' : 'fail'}">
        <div class="breakdown-title">
          <span>CGPA Cutoff</span>
          <span>${res.cgpaEligible ? '✓ Pass' : '✗ Failed'}</span>
        </div>
        <div class="breakdown-metric">${res.studentCgpa.toFixed(2)}</div>
        <div class="breakdown-note">Required: ≥ ${res.minimumCgpa.toFixed(2)}</div>
      </div>

      <!-- Branch Card -->
      <div class="breakdown-card ${res.branchEligible ? 'pass' : 'fail'}">
        <div class="breakdown-title">
          <span>Branch Match</span>
          <span>${res.branchEligible ? '✓ Pass' : '✗ Failed'}</span>
        </div>
        <div class="breakdown-metric" style="font-size: 0.95rem; font-weight: 700;">
          ${res.studentBranch}
        </div>
        <div class="breakdown-note">Allowed: ${res.eligibleBranches}</div>
      </div>

      <!-- Skill Match Card -->
      <div class="breakdown-card ${res.skillEligible ? 'pass' : 'fail'}">
        <div class="breakdown-title">
          <span>Skill Match</span>
          <span>${res.skillEligible ? '✓ Pass' : '✗ Failed'}</span>
        </div>
        <div class="breakdown-metric">${res.skillMatchPercentage}%</div>
        <div class="breakdown-note">Required: ≥ ${res.minimumSkillMatch}%</div>
        <div class="skill-progress-container">
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" style="width: ${Math.min(res.skillMatchPercentage, 100)}%; background: ${progressColor};"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skills Breakdown -->
    <div style="background: var(--bg-muted); padding: 1rem; border-radius: var(--radius-md);">
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">
        Skills Analysis (${res.matchedSkills.length} of ${res.requiredSkills.length} matched)
      </div>
      <div class="skill-chips">
        ${res.matchedSkills.map(s => `<span class="skill-chip matched">✓ ${s}</span>`).join('')}
        ${res.missingSkills.map(s => `<span class="skill-chip missing">✗ ${s} (Missing)</span>`).join('')}
      </div>
    </div>

    <!-- Reasons Breakdown -->
    <div class="advice-box">
      <div class="advice-title">
        <span>📋 Assessment Summary & Reasons</span>
      </div>
      <ul class="advice-list reasons ${isEligible ? 'success' : ''}">
        ${res.reasons.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <!-- Actionable Suggestions -->
    <div class="advice-box" style="background: #fffbeb; border: 1px solid #fde68a;">
      <div class="advice-title" style="color: #92400e;">
        <span>💡 Recommendations for Improvement</span>
      </div>
      <ul class="advice-list suggestions">
        ${res.suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    <!-- Application Action Button -->
    <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
      <div>
        ${res.alreadyApplied ? `<span class="status-badge ${res.applicationStatus?.toLowerCase()}">Application Status: ${res.applicationStatus}</span>` : ''}
      </div>
      <button 
        id="apply-from-checker-btn" 
        class="btn btn-primary btn-lg" 
        ${!isEligible || res.alreadyApplied ? 'disabled' : ''} 
        onclick="applyFromChecker(${res.internshipId})">
        ${res.alreadyApplied ? 'Already Applied' : isEligible ? '🚀 1-Click Apply for Internship' : 'Ineligible to Apply'}
      </button>
    </div>
  `;
}

async function applyFromChecker(internshipId) {
  if (!currentUser) {
    openAuthModal();
    return;
  }
  const studentId = currentUser.studentProfileId || currentUser.id;
  try {
    await API.applyForInternship(studentId, internshipId);
    showToast('Application successfully submitted! Placement cell has received your profile.', 'success');
    runEligibilityCheck(); // Refresh state
    updateStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function quickApply(internshipId) {
  if (!currentUser) {
    openAuthModal();
    return;
  }
  const studentId = currentUser.studentProfileId || currentUser.id;
  try {
    await API.applyForInternship(studentId, internshipId);
    showToast('Application successfully submitted!', 'success');
    updateStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ---------------- Student Profile Management ----------------
async function loadProfile() {
  if (!currentUser) return;
  try {
    const profile = await API.getStudentProfile(currentUser.id);
    currentProfile = profile;

    document.getElementById('profile-name').value = currentUser.name || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-branch').value = profile.branch || 'Computer Science and Engineering';
    document.getElementById('profile-year').value = profile.year || '3rd Year';
    document.getElementById('profile-cgpa').value = profile.cgpa || 7.0;
    document.getElementById('profile-phone').value = profile.phone || '';
    document.getElementById('profile-skills').value = profile.skills || '';
    document.getElementById('profile-certifications').value = profile.certifications || '';
    document.getElementById('profile-resume').value = profile.resumeLink || '';
  } catch (err) {
    showToast('Failed to load profile details', 'error');
  }
}

async function handleProfileSubmit(e) {
  e.preventDefault();
  if (!currentUser) return;

  const data = {
    name: document.getElementById('profile-name').value,
    branch: document.getElementById('profile-branch').value,
    year: document.getElementById('profile-year').value,
    cgpa: parseFloat(document.getElementById('profile-cgpa').value),
    phone: document.getElementById('profile-phone').value,
    skills: document.getElementById('profile-skills').value,
    certifications: document.getElementById('profile-certifications').value,
    resumeLink: document.getElementById('profile-resume').value
  };

  try {
    await API.updateStudentProfile(currentUser.id, data);
    currentUser.name = data.name;
    localStorage.setItem('iec_user', JSON.stringify(currentUser));
    updateAuthUI();
    showToast('Profile updated successfully! All future eligibility checks will reflect these changes.', 'success');
    await loadStudentsForChecker();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ---------------- Student Applications Tracking ----------------
async function loadStudentApplications() {
  if (!currentUser) return;
  const tbody = document.getElementById('student-applications-tbody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading applications...</td></tr>';

  try {
    const studentId = currentUser.studentProfileId || currentUser.id;
    const apps = await API.getMyApplications(studentId);

    if (apps.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon">📄</div>
              <h3>No applications submitted yet</h3>
              <p>Explore internships and verify your eligibility to apply.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = apps.map(app => {
      const date = new Date(app.appliedAt).toLocaleDateString();
      const statusClass = app.status.toLowerCase();
      return `
        <tr>
          <td>
            <strong>${app.internship.title}</strong><br>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${app.internship.company} (${app.internship.location})</span>
          </td>
          <td>${date}</td>
          <td><strong>${app.skillMatchPercentage}%</strong></td>
          <td><span style="font-size: 0.8rem;">${app.matchedSkills || 'None'}</span></td>
          <td><span class="status-badge ${statusClass}">${app.status}</span></td>
          <td><span style="font-size: 0.85rem; color: var(--text-muted);">${app.adminNotes || 'Under initial review'}</span></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color: var(--danger);">Error: ${err.message}</td></tr>`;
  }
}

// ---------------- Admin Dashboard ----------------
async function loadAdminDashboard() {
  await updateStats();
  await loadAdminApplications();
  await loadAdminInternships();
  await loadAdminStudents();
}

function switchAdminSubtab(tab) {
  document.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`admin-subtab-${tab}`).classList.add('active');

  document.getElementById('admin-panel-apps').style.display = tab === 'apps' ? 'block' : 'none';
  document.getElementById('admin-panel-internships').style.display = tab === 'internships' ? 'block' : 'none';
  document.getElementById('admin-panel-students').style.display = tab === 'students' ? 'block' : 'none';
}

async function loadAdminApplications() {
  const tbody = document.getElementById('admin-applications-tbody');
  const filter = document.getElementById('admin-app-filter')?.value || '';
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading applications...</td></tr>';

  try {
    const apps = await API.getAllApplications(filter);
    if (apps.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No applications found.</td></tr>';
      return;
    }

    tbody.innerHTML = apps.map(app => {
      const resumeLink = app.student.resumeLink
        ? `<a href="${app.student.resumeLink}" target="_blank" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem;">📄 View CV</a>`
        : '<span style="color: var(--text-muted); font-size: 0.8rem;">None</span>';

      return `
        <tr>
          <td>
            <strong>${app.student.user.name}</strong><br>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${app.student.user.email}</span>
          </td>
          <td>${app.student.branch}<br><span class="tag cgpa">CGPA: ${app.student.cgpa}</span></td>
          <td><strong>${app.internship.title}</strong><br><span style="font-size: 0.8rem;">${app.internship.company}</span></td>
          <td><strong>${app.skillMatchPercentage}%</strong></td>
          <td>${resumeLink}</td>
          <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="openStatusModal(${app.id}, '${app.status}', '${(app.adminNotes || '').replace(/'/g, "\\'")}')">
              Update Status
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: var(--danger);">Error: ${err.message}</td></tr>`;
  }
}

async function loadAdminInternships() {
  const tbody = document.getElementById('admin-internships-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading internships...</td></tr>';

  try {
    allInternships = await API.getInternships();
    tbody.innerHTML = allInternships.map(i => `
      <tr>
        <td><strong>${i.title}</strong><br><span style="font-size: 0.8rem; color: var(--text-muted);">${i.company}</span></td>
        <td>${i.location}<br><span class="tag stipend">${i.stipend}</span></td>
        <td><strong>${i.minimumCgpa}</strong></td>
        <td><span style="font-size: 0.8rem;">${i.eligibleBranches}</span></td>
        <td><span style="font-size: 0.8rem;">${i.requiredSkills}</span> (${i.minimumSkillMatch}%)</td>
        <td><span class="status-badge ${i.status === 'ACTIVE' ? 'selected' : 'rejected'}">${i.status}</span></td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm" onclick="openEditInternshipModal(${i.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteInternship(${i.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: var(--danger);">Error: ${err.message}</td></tr>`;
  }
}

async function loadAdminStudents() {
  const tbody = document.getElementById('admin-students-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading students directory...</td></tr>';

  try {
    allStudents = await API.getAllStudents();
    tbody.innerHTML = allStudents.map(s => {
      const resumeLink = s.resumeLink
        ? `<a href="${s.resumeLink}" target="_blank" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem;">📄 CV</a>`
        : '-';

      return `
        <tr>
          <td><strong>${s.user.name}</strong><br><span style="font-size: 0.8rem; color: var(--text-muted);">${s.user.email}</span></td>
          <td>${s.branch}</td>
          <td>${s.year}</td>
          <td><strong>${s.cgpa}</strong></td>
          <td><span style="font-size: 0.8rem;">${s.skills || 'None'}</span></td>
          <td><span style="font-size: 0.8rem;">${s.certifications || 'None'}</span></td>
          <td>${resumeLink}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: var(--danger);">Error: ${err.message}</td></tr>`;
  }
}

async function updateStats() {
  try {
    const stats = await API.getDashboardStats();
    // Admin stats
    const setElem = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setElem('admin-stat-internships', stats.totalInternships);
    setElem('admin-stat-students', stats.totalStudents);
    setElem('admin-stat-applications', stats.totalApplications);
    setElem('admin-stat-shortlisted', stats.shortlistedCount);
    setElem('admin-stat-selected', stats.selectedCount);

    // Home stats
    setElem('home-stat-internships', stats.totalInternships);
    setElem('home-stat-students', stats.totalStudents);
    setElem('home-stat-applications', stats.totalApplications);
  } catch (e) {
    console.error('Stats error:', e);
  }
}

// Admin Status Modal
function openStatusModal(appId, currentStatus, currentNotes) {
  document.getElementById('status-app-id').value = appId;
  document.getElementById('update-status-select').value = currentStatus;
  document.getElementById('update-admin-notes').value = currentNotes || '';
  document.getElementById('status-modal').classList.add('active');
}

function closeStatusModal() {
  document.getElementById('status-modal').classList.remove('active');
}

async function handleStatusSubmit(e) {
  e.preventDefault();
  const appId = document.getElementById('status-app-id').value;
  const status = document.getElementById('update-status-select').value;
  const adminNotes = document.getElementById('update-admin-notes').value;

  try {
    await API.updateApplicationStatus(appId, status, adminNotes);
    showToast(`Application status updated to '${status}'`, 'success');
    closeStatusModal();
    loadAdminApplications();
    updateStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Add / Edit Internship Modal
function openAddInternshipModal() {
  document.getElementById('internship-id').value = '';
  document.getElementById('internship-modal-title').textContent = 'Add New Internship';
  document.getElementById('internship-form').reset();
  document.getElementById('internship-modal').classList.add('active');
}

function openEditInternshipModal(id) {
  const item = allInternships.find(i => i.id === id);
  if (!item) return;

  document.getElementById('internship-id').value = item.id;
  document.getElementById('internship-modal-title').textContent = 'Edit Internship Posting';
  document.getElementById('int-title').value = item.title;
  document.getElementById('int-company').value = item.company;
  document.getElementById('int-location').value = item.location;
  document.getElementById('int-duration').value = item.duration;
  document.getElementById('int-stipend').value = item.stipend;
  document.getElementById('int-min-cgpa').value = item.minimumCgpa;
  document.getElementById('int-branches').value = item.eligibleBranches;
  document.getElementById('int-skills').value = item.requiredSkills;
  document.getElementById('int-min-match').value = item.minimumSkillMatch;
  document.getElementById('int-desc').value = item.description || '';
  document.getElementById('int-deadline').value = item.deadline || '';
  document.getElementById('int-status').value = item.status || 'ACTIVE';

  document.getElementById('internship-modal').classList.add('active');
}

function closeInternshipModal() {
  document.getElementById('internship-modal').classList.remove('active');
}

async function handleInternshipSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('internship-id').value;
  const data = {
    title: document.getElementById('int-title').value,
    company: document.getElementById('int-company').value,
    location: document.getElementById('int-location').value,
    duration: document.getElementById('int-duration').value,
    stipend: document.getElementById('int-stipend').value,
    minimumCgpa: parseFloat(document.getElementById('int-min-cgpa').value),
    eligibleBranches: document.getElementById('int-branches').value,
    requiredSkills: document.getElementById('int-skills').value,
    minimumSkillMatch: parseFloat(document.getElementById('int-min-match').value),
    description: document.getElementById('int-desc').value,
    deadline: document.getElementById('int-deadline').value,
    status: document.getElementById('int-status').value
  };

  try {
    if (id) {
      await API.updateInternship(id, data);
      showToast('Internship updated successfully', 'success');
    } else {
      await API.createInternship(data);
      showToast('Internship created successfully', 'success');
    }
    closeInternshipModal();
    await loadInternships();
    await loadAdminInternships();
    await updateStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteInternship(id) {
  if (!confirm('Are you sure you want to delete this internship posting?')) return;
  try {
    await API.deleteInternship(id);
    showToast('Internship deleted', 'info');
    await loadInternships();
    await loadAdminInternships();
    await updateStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
