import React, { useState, useEffect, useMemo, useCallback } from 'react';
import API from './api/api.js';

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  
  // Data State
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalInternships: 0,
    totalStudents: 0,
    totalApplications: 0,
    shortlistedCount: 0,
    selectedCount: 0,
    rejectedCount: 0
  });

  // Checker State
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isWhatIfMode, setIsWhatIfMode] = useState(false);
  const [sandboxBranch, setSandboxBranch] = useState('');
  const [sandboxCgpa, setSandboxCgpa] = useState('');
  const [sandboxSkills, setSandboxSkills] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Modals & Forms State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [internshipModalOpen, setInternshipModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedAppForStatus, setSelectedAppForStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('Applied');
  const [adminNotes, setAdminNotes] = useState('');

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Initial Load
  useEffect(() => {
    const saved = localStorage.getItem('iec_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setCurrentUser(u);
      } catch (e) {
        localStorage.removeItem('iec_user');
      }
    } else {
      quickLogin('priya@student.com', 'student123', false);
    }

    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [ints, stus, st] = await Promise.all([
        API.getInternships(),
        API.getAllStudents(),
        API.getDashboardStats()
      ]);
      setInternships(ints);
      setStudents(stus);
      setStats(st);

      if (ints.length > 0 && !selectedInternshipId) {
        setSelectedInternshipId(ints[0].id.toString());
      }
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'STUDENT') {
      API.getStudentProfile(currentUser.id)
        .then(prof => {
          setCurrentProfile(prof);
          if (!selectedStudentId) {
            setSelectedStudentId(prof.id.toString());
          }
        })
        .catch(console.error);
    } else if (currentUser && currentUser.role === 'ADMIN') {
      setCurrentProfile(null);
    }
  }, [currentUser]);

  const quickLogin = async (email, password, notify = true) => {
    try {
      const res = await API.login(email, password);
      setCurrentUser(res);
      localStorage.setItem('iec_user', JSON.stringify(res));
      setAuthModalOpen(false);
      if (notify) showToast(`Welcome back, ${res.name}! (${res.role})`, 'success');
      refreshData();
    } catch (err) {
      if (notify) showToast(err.message, 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentProfile(null);
    localStorage.removeItem('iec_user');
    showToast('Signed out successfully', 'info');
    setActiveTab('home');
  };

  const handleCheckEligibility = async () => {
    const intId = parseInt(selectedInternshipId);
    if (!intId) {
      showToast('Please choose an internship to evaluate', 'error');
      return;
    }

    setIsChecking(true);
    const stuId = selectedStudentId ? parseInt(selectedStudentId) : (currentUser ? currentUser.studentProfileId : null);
    const payload = {
      internshipId: intId,
      studentId: stuId
    };

    if (isWhatIfMode) {
      if (sandboxBranch) payload.customBranch = sandboxBranch;
      if (sandboxCgpa) payload.customCgpa = parseFloat(sandboxCgpa);
      if (sandboxSkills) payload.customSkills = sandboxSkills;
    }

    try {
      const result = await API.checkEligibility(payload);
      setEligibilityResult(result);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleApply = async (internshipId) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const studentId = currentUser.studentProfileId || (currentProfile ? currentProfile.id : null);
    if (!studentId) {
      showToast('Please complete your student profile first', 'error');
      return;
    }

    try {
      await API.applyForInternship(studentId, internshipId);
      showToast('Application successfully submitted! Placement cell has received your record.', 'success');
      refreshData();
      if (eligibilityResult && eligibilityResult.internshipId === internshipId) {
        handleCheckEligibility();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const navigateToCheckerWithInternship = (id) => {
    setSelectedInternshipId(id.toString());
    setActiveTab('checker');
    setTimeout(() => {
      const payload = {
        internshipId: id,
        studentId: selectedStudentId ? parseInt(selectedStudentId) : (currentUser ? currentUser.studentProfileId : null)
      };
      API.checkEligibility(payload).then(setEligibilityResult).catch(console.error);
    }, 100);
  };

  return (
    <div>
      <header className="navbar">
        <div className="nav-container">
          <div className="logo-area" onClick={() => setActiveTab('home')}>
            <div className="logo-icon">🎓</div>
            <div className="logo-text">
              <h1>Internship Checker</h1>
              <span>React Placement & Eligibility Engine</span>
            </div>
          </div>

          <nav>
            <ul className="nav-links">
              <li>
                <a className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                  Home
                </a>
              </li>
              <li>
                <a className={`nav-link ${activeTab === 'internships' ? 'active' : ''}`} onClick={() => setActiveTab('internships')}>
                  Internships
                </a>
              </li>
              <li>
                <a className={`nav-link ${activeTab === 'checker' ? 'active' : ''}`} onClick={() => setActiveTab('checker')}>
                  Check Eligibility
                </a>
              </li>
              {currentUser && currentUser.role === 'STUDENT' && (
                <>
                  <li>
                    <a className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                      My Profile
                    </a>
                  </li>
                  <li>
                    <a className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
                      My Applications
                    </a>
                  </li>
                </>
              )}
              {currentUser && currentUser.role === 'ADMIN' && (
                <li>
                  <a className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
                    Admin Dashboard
                  </a>
                </li>
              )}
            </ul>
          </nav>

          <div className="nav-auth">
            {currentUser ? (
              <>
                <div className="user-badge">
                  <span>{currentUser.name}</span>
                  <span className={`role-pill ${currentUser.role.toLowerCase()}`}>{currentUser.role}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sign Out</button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setAuthModalOpen(true)}>Login / Register</button>
            )}
          </div>
        </div>
      </header>

      <main className="main-wrapper">
        {activeTab === 'home' && (
          <HomeView
            stats={stats}
            internships={internships}
            onCheckInternship={navigateToCheckerWithInternship}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'internships' && (
          <InternshipsView
            internships={internships}
            onCheckInternship={navigateToCheckerWithInternship}
            onApply={handleApply}
          />
        )}

        {activeTab === 'checker' && (
          <EligibilityCheckerView
            internships={internships}
            students={students}
            currentUser={currentUser}
            currentProfile={currentProfile}
            selectedInternshipId={selectedInternshipId}
            setSelectedInternshipId={setSelectedInternshipId}
            selectedStudentId={selectedStudentId}
            setSelectedStudentId={setSelectedStudentId}
            isWhatIfMode={isWhatIfMode}
            setIsWhatIfMode={setIsWhatIfMode}
            sandboxBranch={sandboxBranch}
            setSandboxBranch={setSandboxBranch}
            sandboxCgpa={sandboxCgpa}
            setSandboxCgpa={setSandboxCgpa}
            sandboxSkills={sandboxSkills}
            setSandboxSkills={setSandboxSkills}
            eligibilityResult={eligibilityResult}
            isChecking={isChecking}
            onCheck={handleCheckEligibility}
            onApply={handleApply}
          />
        )}

        {activeTab === 'profile' && currentUser && currentUser.role === 'STUDENT' && (
          <ProfileView
            currentUser={currentUser}
            currentProfile={currentProfile}
            showToast={showToast}
            onProfileUpdated={(updated) => {
              setCurrentProfile(updated);
              refreshData();
            }}
          />
        )}

        {activeTab === 'applications' && currentUser && currentUser.role === 'STUDENT' && (
          <ApplicationsView currentUser={currentUser} />
        )}

        {activeTab === 'admin' && currentUser && currentUser.role === 'ADMIN' && (
          <AdminDashboardView
            stats={stats}
            internships={internships}
            students={students}
            onRefresh={refreshData}
            showToast={showToast}
            onOpenAddInternship={() => {
              setEditingInternship(null);
              setInternshipModalOpen(true);
            }}
            onOpenEditInternship={(item) => {
              setEditingInternship(item);
              setInternshipModalOpen(true);
            }}
            onOpenStatusModal={(app) => {
              setSelectedAppForStatus(app);
              setNewStatus(app.status);
              setAdminNotes(app.adminNotes || '');
              setStatusModalOpen(true);
            }}
          />
        )}
      </main>

      {authModalOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            localStorage.setItem('iec_user', JSON.stringify(user));
            setAuthModalOpen(false);
            showToast(`Signed in as ${user.name}!`, 'success');
            refreshData();
          }}
          onQuickLogin={quickLogin}
          showToast={showToast}
        />
      )}

      {internshipModalOpen && (
        <InternshipModal
          internship={editingInternship}
          onClose={() => setInternshipModalOpen(false)}
          onSave={async (data) => {
            try {
              if (editingInternship) {
                await API.updateInternship(editingInternship.id, data);
                showToast('Internship updated successfully', 'success');
              } else {
                await API.createInternship(data);
                showToast('New internship added successfully', 'success');
              }
              setInternshipModalOpen(false);
              refreshData();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }}
        />
      )}

      {statusModalOpen && selectedAppForStatus && (
        <StatusModal
          app={selectedAppForStatus}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          adminNotes={adminNotes}
          setAdminNotes={setAdminNotes}
          onClose={() => setStatusModalOpen(false)}
          onSave={async () => {
            try {
              await API.updateApplicationStatus(selectedAppForStatus.id, newStatus, adminNotes);
              showToast(`Status updated to ${newStatus}`, 'success');
              setStatusModalOpen(false);
              refreshData();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }}
        />
      )}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
            <div>{t.message}</div>
          </div>
        ))}
      </div>

      <footer className="footer">
        <p><strong>Internship Eligibility Checker</strong> — React 18 Application</p>
        <p style={{ marginTop: '0.25rem' }}>Powered by Spring Boot REST API, Spring Data JPA, and MySQL</p>
      </footer>
    </div>
  );
}

function HomeView({ stats, internships, onCheckInternship, onNavigate }) {
  return (
    <section className="view-section active">
      <div className="hero-card">
        <div className="hero-badge">⚡ React-Powered Verification Engine</div>
        <h2 className="hero-title">Know Before You Apply: Check Internship Eligibility Instantly</h2>
        <p className="hero-desc">
          Compare your CGPA, branch, and technical skills against real internship requirements. 
          Get instant calculated skill match percentages, transparent pass/fail criteria, and actionable suggestions to improve your qualifications.
        </p>
        <div className="hero-actions">
          <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('checker')}>
            ⚡ Run Eligibility Check
          </button>
          <button 
            className="btn btn-primary btn-lg" 
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}
            onClick={() => onNavigate('internships')}
          >
            🔍 Browse Open Internships
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-label">Active Internships</div>
          <div className="stat-card-value">{stats.totalInternships}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Registered Students</div>
          <div className="stat-card-value">{stats.totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Applications Processed</div>
          <div className="stat-card-value">{stats.totalApplications}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Algorithm Accuracy</div>
          <div className="stat-card-value">100%</div>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-box">
          <div className="feature-icon blue">📊</div>
          <h3>Skill Match Calculation</h3>
          <p>Calculates the exact match percentage between your technical skills and company requirements with smart synonym handling.</p>
        </div>
        <div className="feature-box">
          <div className="feature-icon green">🎯</div>
          <h3>Branch & CGPA Verification</h3>
          <p>Instant verification of branch eligibility and academic score cut-offs, avoiding blind applications and rejection frustration.</p>
        </div>
        <div className="feature-box">
          <div className="feature-icon amber">💡</div>
          <h3>Reasons & Suggestions</h3>
          <p>If not eligible, receive transparent reasons for the gap and personalized learning suggestions for missing skills.</p>
        </div>
        <div className="feature-box">
          <div className="feature-icon purple">🚀</div>
          <h3>1-Click Verified Applications</h3>
          <p>Eligible candidates can apply in one click, while duplicate and unqualified attempts are automatically rejected.</p>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: '2rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '1.35rem' }}>Featured Internship Openings</h2>
          <p className="page-subtitle">Top opportunities currently accepting applications</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('internships')}>
          View All Internships →
        </button>
      </div>

      <div className="internships-grid">
        {internships.slice(0, 3).map(item => (
          <InternshipCard 
            key={item.id} 
            item={item} 
            onCheck={() => onCheckInternship(item.id)}
            onApply={() => onCheckInternship(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

function InternshipsView({ internships, onCheckInternship, onApply }) {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [cgpaFilter, setCgpaFilter] = useState('0');

  const filtered = useMemo(() => {
    return internships.filter(i => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        i.title.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q) ||
        i.requiredSkills.toLowerCase().includes(q);

      const matchBranch = !branchFilter ||
        i.eligibleBranches.toLowerCase().includes(branchFilter.toLowerCase()) ||
        i.eligibleBranches.toLowerCase().includes('all');

      const maxCgpa = parseFloat(cgpaFilter) || 0;
      const matchCgpa = !maxCgpa || i.minimumCgpa <= maxCgpa;

      return matchSearch && matchBranch && matchCgpa;
    });
  }, [internships, search, branchFilter, cgpaFilter]);

  return (
    <section className="view-section active">
      <div className="page-header">
        <div>
          <h2 className="page-title">Explore Internships</h2>
          <p className="page-subtitle">Browse available internship openings, criteria, and requirements</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by role, company, or required skills..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <select className="select-input" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="AI & Data Science">AI & Data Science</option>
          </select>

          <select className="select-input" value={cgpaFilter} onChange={(e) => setCgpaFilter(e.target.value)}>
            <option value="0">All CGPA Cutoffs</option>
            <option value="7.0">Max Cutoff: 7.0</option>
            <option value="7.5">Max Cutoff: 7.5</option>
            <option value="8.0">Max Cutoff: 8.0</option>
          </select>
        </div>
      </div>

      <div className="internships-grid">
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">🔎</div>
            <h3>No matching internships found</h3>
            <p>Try modifying your search or filter options.</p>
          </div>
        ) : (
          filtered.map(item => (
            <InternshipCard 
              key={item.id} 
              item={item} 
              onCheck={() => onCheckInternship(item.id)}
              onApply={() => onApply(item.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function InternshipCard({ item, onCheck, onApply }) {
  const skills = item.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="internship-card">
      <div className="internship-card-header">
        <div className="company-badge-box">
          <div className="company-logo-avatar">{item.company.charAt(0)}</div>
          <div className="company-meta">
            <h3>{item.title}</h3>
            <span>{item.company}</span>
          </div>
        </div>
      </div>

      <div className="internship-tags">
        <span className="tag stipend">💰 {item.stipend}</span>
        <span className="tag cgpa">📊 Min CGPA: {item.minimumCgpa}</span>
        <span className="tag">📍 {item.location}</span>
        <span className="tag">⏱️ {item.duration}</span>
      </div>

      <p className="internship-desc">{item.description || 'Join this exciting internship program to accelerate your tech career.'}</p>

      <div className="internship-req-section">
        <div className="req-row">
          <span className="req-label">Eligible Branches:</span>
          <span className="req-value">{item.eligibleBranches}</span>
        </div>
        <div className="req-row">
          <span className="req-label">Required Skills:</span>
          <span className="req-value">{skills.join(', ')}</span>
        </div>
        <div className="req-row">
          <span className="req-label">Minimum Skill Match:</span>
          <span className="req-value" style={{ color: 'var(--primary)' }}>{item.minimumSkillMatch}%</span>
        </div>
      </div>

      <div className="internship-card-footer">
        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={onCheck}>
          ⚡ Check Eligibility
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onApply}>
          Apply Now
        </button>
      </div>
    </div>
  );
}

function EligibilityCheckerView({
  internships,
  students,
  selectedInternshipId,
  setSelectedInternshipId,
  selectedStudentId,
  setSelectedStudentId,
  isWhatIfMode,
  setIsWhatIfMode,
  sandboxBranch,
  setSandboxBranch,
  sandboxCgpa,
  setSandboxCgpa,
  sandboxSkills,
  setSandboxSkills,
  eligibilityResult,
  isChecking,
  onCheck,
  onApply
}) {
  return (
    <section className="view-section active">
      <div className="page-header">
        <div>
          <h2 className="page-title">Automated Eligibility Checker</h2>
          <p className="page-subtitle">Compare your profile against requirements with real-time feedback</p>
        </div>
      </div>

      <div className="checker-layout">
        <div className="checker-control-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>Eligibility Input Parameters</h3>

          <div className="form-group">
            <label className="form-label">Target Internship</label>
            <select 
              className="form-control" 
              value={selectedInternshipId} 
              onChange={(e) => setSelectedInternshipId(e.target.value)}
            >
              <option value="">Select an internship...</option>
              {internships.map(i => (
                <option key={i.id} value={i.id}>
                  {i.title} - {i.company} (Min CGPA: {i.minimumCgpa})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Student Profile</label>
            <select 
              className="form-control" 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Select a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.user.name} ({s.branch}, CGPA: {s.cgpa})
                </option>
              ))}
            </select>
            <div className="form-hint">Evaluates academic records and skill sets against company prerequisites.</div>
          </div>

          <div style={{ background: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isWhatIfMode} 
                onChange={(e) => setIsWhatIfMode(e.target.checked)} 
              />
              Enable "What-If" Sandbox (Simulate Scenarios)
            </label>
            <div className="form-hint" style={{ marginTop: '0.25rem' }}>
              Test how boosting your CGPA or acquiring new skills affects your qualification!
            </div>
          </div>

          {isWhatIfMode && (
            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Simulated Branch</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={sandboxBranch} 
                  onChange={(e) => setSandboxBranch(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Simulated CGPA</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="10" 
                  className="form-control" 
                  value={sandboxCgpa} 
                  onChange={(e) => setSandboxCgpa(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Simulated Skills (comma-separated)</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  value={sandboxSkills} 
                  onChange={(e) => setSandboxSkills(e.target.value)} 
                />
              </div>
            </div>
          )}

          <button 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%' }} 
            onClick={onCheck}
            disabled={isChecking}
          >
            {isChecking ? 'Evaluating...' : '⚡ Check Eligibility Now'}
          </button>
        </div>

        <div className="result-card">
          {!eligibilityResult ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <h3>Ready to Verify Eligibility</h3>
              <p>Choose an internship and candidate profile on the left, then click "Check Eligibility Now".</p>
            </div>
          ) : (
            <div>
              <div className={`verdict-banner ${eligibilityResult.eligible ? 'eligible' : 'ineligible'}`}>
                <div className="verdict-text">
                  <h2>{eligibilityResult.eligible ? '✅ ELIGIBLE TO APPLY' : '❌ NOT ELIGIBLE'}</h2>
                  <p>
                    {eligibilityResult.eligible
                      ? 'Congratulations! Your academic qualifications and technical skills meet this company’s criteria.'
                      : 'Your profile does not meet one or more prerequisites for this internship position.'}
                  </p>
                </div>
                <div className="verdict-badge-big">{eligibilityResult.eligible ? '🎉' : '⚠️'}</div>
              </div>

              <div className="breakdown-grid" style={{ marginTop: '1.25rem' }}>
                <div className={`breakdown-card ${eligibilityResult.cgpaEligible ? 'pass' : 'fail'}`}>
                  <div className="breakdown-title">
                    <span>CGPA Cutoff</span>
                    <span>{eligibilityResult.cgpaEligible ? '✓ Pass' : '✗ Failed'}</span>
                  </div>
                  <div className="breakdown-metric">{eligibilityResult.studentCgpa.toFixed(2)}</div>
                  <div className="breakdown-note">Required: ≥ {eligibilityResult.minimumCgpa.toFixed(2)}</div>
                </div>

                <div className={`breakdown-card ${eligibilityResult.branchEligible ? 'pass' : 'fail'}`}>
                  <div className="breakdown-title">
                    <span>Branch Match</span>
                    <span>{eligibilityResult.branchEligible ? '✓ Pass' : '✗ Failed'}</span>
                  </div>
                  <div className="breakdown-metric" style={{ fontSize: '0.95rem' }}>
                    {eligibilityResult.studentBranch}
                  </div>
                  <div className="breakdown-note">Allowed: {eligibilityResult.eligibleBranches}</div>
                </div>

                <div className={`breakdown-card ${eligibilityResult.skillEligible ? 'pass' : 'fail'}`}>
                  <div className="breakdown-title">
                    <span>Skill Match</span>
                    <span>{eligibilityResult.skillEligible ? '✓ Pass' : '✗ Failed'}</span>
                  </div>
                  <div className="breakdown-metric">{eligibilityResult.skillMatchPercentage}%</div>
                  <div className="breakdown-note">Required: ≥ {eligibilityResult.minimumSkillMatch}%</div>
                  <div className="skill-progress-container">
                    <div className="skill-progress-bar">
                      <div 
                        className="skill-progress-fill" 
                        style={{ 
                          width: `${Math.min(eligibilityResult.skillMatchPercentage, 100)}%`,
                          background: eligibilityResult.skillEligible ? 'var(--success)' : 'var(--danger)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Skills Analysis ({eligibilityResult.matchedSkills.length} of {eligibilityResult.requiredSkills.length} matched)
                </div>
                <div className="skill-chips">
                  {eligibilityResult.matchedSkills.map(s => (
                    <span key={s} className="skill-chip matched">✓ {s}</span>
                  ))}
                  {eligibilityResult.missingSkills.map(s => (
                    <span key={s} className="skill-chip missing">✗ {s} (Missing)</span>
                  ))}
                </div>
              </div>

              <div className="advice-box" style={{ marginTop: '1.25rem' }}>
                <div className="advice-title">
                  <span>📋 Assessment Summary & Reasons</span>
                </div>
                <ul className={`advice-list reasons ${eligibilityResult.eligible ? 'success' : ''}`}>
                  {eligibilityResult.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="advice-box" style={{ background: '#fffbeb', border: '1px solid #fde68a', marginTop: '1rem' }}>
                <div className="advice-title" style={{ color: '#92400e' }}>
                  <span>💡 Recommendations for Improvement</span>
                </div>
                <ul className="advice-list suggestions">
                  {eligibilityResult.suggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {eligibilityResult.alreadyApplied && (
                    <span className={`status-badge ${eligibilityResult.applicationStatus?.toLowerCase()}`}>
                      Application Status: {eligibilityResult.applicationStatus}
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  disabled={!eligibilityResult.eligible || eligibilityResult.alreadyApplied}
                  onClick={() => onApply(eligibilityResult.internshipId)}
                >
                  {eligibilityResult.alreadyApplied ? 'Already Applied' : eligibilityResult.eligible ? '🚀 1-Click Apply for Internship' : 'Ineligible to Apply'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProfileView({ currentUser, currentProfile, showToast, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    branch: currentProfile?.branch || 'Computer Science and Engineering',
    year: currentProfile?.year || '3rd Year',
    cgpa: currentProfile?.cgpa || 7.5,
    phone: currentProfile?.phone || '',
    skills: currentProfile?.skills || '',
    certifications: currentProfile?.certifications || '',
    resumeLink: currentProfile?.resumeLink || ''
  });

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        name: currentUser.name || '',
        branch: currentProfile.branch || 'Computer Science and Engineering',
        year: currentProfile.year || '3rd Year',
        cgpa: currentProfile.cgpa || 7.5,
        phone: currentProfile.phone || '',
        skills: currentProfile.skills || '',
        certifications: currentProfile.certifications || '',
        resumeLink: currentProfile.resumeLink || ''
      });
    }
  }, [currentProfile, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        cgpa: parseFloat(formData.cgpa)
      };
      const updated = await API.updateStudentProfile(currentUser.id, payload);
      showToast('Profile updated successfully! All future eligibility checks will reflect these changes.', 'success');
      onProfileUpdated(updated);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <section className="view-section active">
      <div className="page-header">
        <div>
          <h2 className="page-title">Student Profile Management</h2>
          <p className="page-subtitle">Your credentials are automatically reused across all internship eligibility checks</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '800px', margin: '0 auto', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" value={currentUser?.email || ''} disabled />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Branch / Specialization</label>
              <select 
                className="form-control" 
                value={formData.branch} 
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })} 
                required
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering (CSE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="AI & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <select 
                className="form-control" 
                value={formData.year} 
                onChange={(e) => setFormData({ ...formData, year: e.target.value })} 
                required
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year (Final Year)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Cumulative CGPA (0.00 - 10.00)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0" 
                max="10" 
                className="form-control" 
                value={formData.cgpa} 
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Skills (comma-separated)</label>
            <textarea 
              className="form-control" 
              rows="3" 
              value={formData.skills} 
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })} 
            />
            <div className="form-hint">Enter your proficient skills. The system calculates matching percentages against internship requirements.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Certifications & Achievements</label>
            <textarea 
              className="form-control" 
              rows="2" 
              value={formData.certifications} 
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Resume Link (URL)</label>
            <input 
              type="url" 
              className="form-control" 
              value={formData.resumeLink} 
              onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary btn-lg">💾 Save Profile Details</button>
          </div>
        </form>
      </div>
    </section>
  );
}

function ApplicationsView({ currentUser }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const studentId = currentUser.studentProfileId || currentUser.id;
      API.getMyApplications(studentId)
        .then(setApplications)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  return (
    <section className="view-section active">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Internship Applications</h2>
          <p className="page-subtitle">Track your submitted applications and selection status in real time</p>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company & Role</th>
              <th>Date Applied</th>
              <th>Skill Match %</th>
              <th>Matched Skills</th>
              <th>Status</th>
              <th>Admin Feedback</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading applications...</td></tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <div className="empty-state-icon">📄</div>
                    <h3>No applications submitted yet</h3>
                    <p>Explore internships and verify your eligibility to apply.</p>
                  </div>
                </td>
              </tr>
            ) : (
              applications.map(app => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.internship.title}</strong><br />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {app.internship.company} ({app.internship.location})
                    </span>
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td><strong>{app.skillMatchPercentage}%</strong></td>
                  <td><span style={{ fontSize: '0.8rem' }}>{app.matchedSkills || 'None'}</span></td>
                  <td><span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span></td>
                  <td><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.adminNotes || 'Under initial review'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminDashboardView({
  stats,
  internships,
  students,
  onRefresh,
  showToast,
  onOpenAddInternship,
  onOpenEditInternship,
  onOpenStatusModal
}) {
  const [subtab, setSubtab] = useState('apps');
  const [apps, setApps] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const loadApps = useCallback(async () => {
    try {
      const data = await API.getAllApplications(statusFilter);
      setApps(data);
    } catch (e) {
      console.error(e);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const handleDeleteInternship = async (id) => {
    if (!confirm('Are you sure you want to delete this internship posting?')) return;
    try {
      await API.deleteInternship(id);
      showToast('Internship deleted successfully', 'info');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <section className="view-section active">
      <div className="page-header">
        <div>
          <h2 className="page-title">Placement Administrator Dashboard</h2>
          <p className="page-subtitle">Manage corporate postings, evaluate candidate applications, and update hiring statuses</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenAddInternship}>➕ Add New Internship</button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-label">Total Internships</div>
          <div className="stat-card-value">{stats.totalInternships}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Students</div>
          <div className="stat-card-value">{stats.totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Applications</div>
          <div className="stat-card-value">{stats.totalApplications}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Shortlisted Candidates</div>
          <div className="stat-card-value" style={{ color: 'var(--warning)' }}>{stats.shortlistedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Selected Candidates</div>
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>{stats.selectedCount}</div>
        </div>
      </div>

      <div className="modal-tabs" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`modal-tab-btn ${subtab === 'apps' ? 'active' : ''}`} 
          onClick={() => setSubtab('apps')}
        >
          Student Applications
        </button>
        <button 
          className={`modal-tab-btn ${subtab === 'internships' ? 'active' : ''}`} 
          onClick={() => setSubtab('internships')}
        >
          Manage Internships
        </button>
        <button 
          className={`modal-tab-btn ${subtab === 'students' ? 'active' : ''}`} 
          onClick={() => setSubtab('students')}
        >
          Student Directory
        </button>
      </div>

      {subtab === 'apps' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Candidate Applications Review</h3>
            <select className="select-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Branch & CGPA</th>
                  <th>Internship Role</th>
                  <th>Skill Match %</th>
                  <th>Resume</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No applications found.</td></tr>
                ) : (
                  apps.map(app => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.student.user.name}</strong><br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.student.user.email}</span>
                      </td>
                      <td>
                        {app.student.branch}<br />
                        <span className="tag cgpa">CGPA: {app.student.cgpa}</span>
                      </td>
                      <td>
                        <strong>{app.internship.title}</strong><br />
                        <span style={{ fontSize: '0.8rem' }}>{app.internship.company}</span>
                      </td>
                      <td><strong>{app.skillMatchPercentage}%</strong></td>
                      <td>
                        {app.student.resumeLink ? (
                          <a href={app.student.resumeLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
                            📄 View CV
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>
                      <td><span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => onOpenStatusModal(app)}>
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subtab === 'internships' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role & Company</th>
                <th>Location & Stipend</th>
                <th>Min CGPA</th>
                <th>Eligible Branches</th>
                <th>Required Skills (Min Match %)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {internships.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.title}</strong><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{i.company}</span></td>
                  <td>{i.location}<br /><span className="tag stipend">{i.stipend}</span></td>
                  <td><strong>{i.minimumCgpa}</strong></td>
                  <td><span style={{ fontSize: '0.8rem' }}>{i.eligibleBranches}</span></td>
                  <td><span style={{ fontSize: '0.8rem' }}>{i.requiredSkills}</span> ({i.minimumSkillMatch}%)</td>
                  <td><span className={`status-badge ${i.status === 'ACTIVE' ? 'selected' : 'rejected'}`}>{i.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => onOpenEditInternship(i)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteInternship(i.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subtab === 'students' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Branch</th>
                <th>Year</th>
                <th>CGPA</th>
                <th>Skills</th>
                <th>Certifications</th>
                <th>Resume</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.user.name}</strong><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.user.email}</span></td>
                  <td>{s.branch}</td>
                  <td>{s.year}</td>
                  <td><strong>{s.cgpa}</strong></td>
                  <td><span style={{ fontSize: '0.8rem' }}>{s.skills || 'None'}</span></td>
                  <td><span style={{ fontSize: '0.8rem' }}>{s.certifications || 'None'}</span></td>
                  <td>
                    {s.resumeLink ? (
                      <a href={s.resumeLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>📄 CV</a>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AuthModal({ mode, setMode, onClose, onSuccess, onQuickLogin, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [branch, setBranch] = useState('Computer Science and Engineering');
  const [cgpa, setCgpa] = useState('8.0');
  const [skills, setSkills] = useState('Java, MySQL, Spring Boot');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.login(email, password);
      onSuccess(res);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email,
        password,
        role,
        branch,
        cgpa: parseFloat(cgpa) || 7.0,
        skills
      };
      const res = await API.register(payload);
      onSuccess(res);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{mode === 'login' ? 'Sign In to Account' : 'Register New Student Profile'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button className={`modal-tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
          <button className={`modal-tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register New Student</button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="e.g. priya@student.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>Sign In</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Rahul Verma" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="e.g. rahul@student.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create password" />
            </div>
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Placement Administrator</option>
              </select>
            </div>
            {role === 'STUDENT' && (
              <>
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <input type="text" className="form-control" value={branch} onChange={(e) => setBranch(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cumulative CGPA</label>
                  <input type="number" step="0.01" min="0" max="10" className="form-control" value={cgpa} onChange={(e) => setCgpa(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Skills (comma-separated)</label>
                  <input type="text" className="form-control" value={skills} onChange={(e) => setSkills(e.target.value)} />
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>Create Account</button>
          </form>
        )}

        <div className="demo-logins">
          <div className="demo-title">⚡ Instant 1-Click Demo Profiles</div>
          <div className="demo-buttons-grid">
            <button className="btn btn-secondary btn-sm" onClick={() => onQuickLogin('admin@checker.com', 'admin123')}>🔑 Admin Portal</button>
            <button className="btn btn-secondary btn-sm" onClick={() => onQuickLogin('priya@student.com', 'student123')}>👩 Priya (CS, 8.6 CGPA)</button>
            <button className="btn btn-secondary btn-sm" onClick={() => onQuickLogin('rahul@student.com', 'student123')}>👨 Rahul (Mech, 7.2 CGPA)</button>
            <button className="btn btn-secondary btn-sm" onClick={() => onQuickLogin('ananya@student.com', 'student123')}>👩 Ananya (IT, 7.9 CGPA)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InternshipModal({ internship, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: internship?.title || '',
    company: internship?.company || '',
    location: internship?.location || '',
    duration: internship?.duration || '6 Months',
    stipend: internship?.stipend || '₹40,000 / month',
    minimumCgpa: internship?.minimumCgpa || 7.5,
    eligibleBranches: internship?.eligibleBranches || 'Computer Science, Information Technology',
    requiredSkills: internship?.requiredSkills || 'Java, MySQL, Spring Boot',
    minimumSkillMatch: internship?.minimumSkillMatch || 60,
    description: internship?.description || '',
    deadline: internship?.deadline || '2026-12-31',
    status: internship?.status || 'ACTIVE'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      minimumCgpa: parseFloat(formData.minimumCgpa),
      minimumSkillMatch: parseFloat(formData.minimumSkillMatch)
    });
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{internship ? 'Edit Internship Posting' : 'Add New Internship'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Role Title</label>
              <input type="text" className="form-control" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-control" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-control" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input type="text" className="form-control" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Stipend</label>
              <input type="text" className="form-control" value={formData.stipend} onChange={(e) => setFormData({ ...formData, stipend: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Minimum Required CGPA</label>
              <input type="number" step="0.01" min="0" max="10" className="form-control" value={formData.minimumCgpa} onChange={(e) => setFormData({ ...formData, minimumCgpa: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Eligible Branches (comma-separated)</label>
            <input type="text" className="form-control" value={formData.eligibleBranches} onChange={(e) => setFormData({ ...formData, eligibleBranches: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Required Skills (comma-separated)</label>
              <input type="text" className="form-control" value={formData.requiredSkills} onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Min Skill Match %</label>
              <input type="number" step="1" min="0" max="100" className="form-control" value={formData.minimumSkillMatch} onChange={(e) => setFormData({ ...formData, minimumSkillMatch: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role Description</label>
            <textarea className="form-control" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input type="date" className="form-control" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Internship</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusModal({ app, newStatus, setNewStatus, adminNotes, setAdminNotes, onClose, onSave }) {
  return (
    <div className="modal-overlay active">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Update Application Status</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div className="form-group">
            <label className="form-label">Candidate Name</label>
            <input type="text" className="form-control" value={app.student.user.name} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Application Status</label>
            <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Placement Cell Remarks / Feedback</label>
            <textarea 
              className="form-control" 
              rows="3" 
              value={adminNotes} 
              onChange={(e) => setAdminNotes(e.target.value)} 
              placeholder="e.g. Cleared technical interview round with top marks." 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Status</button>
          </div>
        </form>
      </div>
    </div>
  );
}
