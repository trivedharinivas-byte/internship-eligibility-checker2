// ========================================================
// API Service for Internship Eligibility Checker
// ========================================================

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';
const API_BASE = `${BASE_URL}/api`;

const API = {
  // Authentication
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  // Student Profiles
  async getStudentProfile(userId) {
    const res = await fetch(`${API_BASE}/students/profile/${userId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Profile not found');
    }
    return res.json();
  },

  async updateStudentProfile(userId, profileData) {
    const res = await fetch(`${API_BASE}/students/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update profile');
    }
    return res.json();
  },

  async getAllStudents() {
    const res = await fetch(`${API_BASE}/students/all`);
    if (!res.ok) throw new Error('Failed to fetch students list');
    return res.json();
  },

  // Internships
  async getInternships(status = '') {
    const url = status ? `${API_BASE}/internships?status=${status}` : `${API_BASE}/internships`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load internships');
    return res.json();
  },

  async getInternship(id) {
    const res = await fetch(`${API_BASE}/internships/${id}`);
    if (!res.ok) throw new Error('Internship not found');
    return res.json();
  },

  async createInternship(internshipData) {
    const res = await fetch(`${API_BASE}/internships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(internshipData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create internship');
    }
    return res.json();
  },

  async updateInternship(id, internshipData) {
    const res = await fetch(`${API_BASE}/internships/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(internshipData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update internship');
    }
    return res.json();
  },

  async deleteInternship(id) {
    const res = await fetch(`${API_BASE}/internships/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete internship');
    }
    return res.json();
  },

  // Eligibility Checking
  async checkEligibility(params) {
    const res = await fetch(`${API_BASE}/eligibility/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Eligibility check failed');
    }
    return res.json();
  },

  async checkAllForStudent(studentId) {
    const res = await fetch(`${API_BASE}/eligibility/check-all/${studentId}`);
    if (!res.ok) throw new Error('Failed to check eligibility for all internships');
    return res.json();
  },

  // Applications
  async applyForInternship(studentId, internshipId) {
    const res = await fetch(`${API_BASE}/applications/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, internshipId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Application submission failed');
    }
    return res.json();
  },

  async getMyApplications(studentId) {
    const res = await fetch(`${API_BASE}/applications/my/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async getAllApplications(status = '') {
    const url = status ? `${API_BASE}/applications/all?status=${status}` : `${API_BASE}/applications/all`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async updateApplicationStatus(applicationId, status, adminNotes = '') {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update application status');
    }
    return res.json();
  },

  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/applications/stats`);
    if (!res.ok) throw new Error('Failed to load dashboard statistics');
    return res.json();
  }
};

export default API;
export { API };

