# 🎓 Internship Eligibility Checker

A full-stack web-based application designed to help university students verify whether they meet the eligibility criteria of internships before applying, and to assist placement cells in automating application filtering, reducing manual verification overhead, and providing transparent feedback to candidates.

Built strictly according to the **Internship Eligibility Checker Project Abstract & Specification**.

---

## 📋 Table of Contents
1. [Abstract & Objectives](#-abstract--objectives)
2. [Key Modules & Features](#-key-modules--features)
3. [Eligibility Algorithm & Mathematical Formula](#-eligibility-algorithm--mathematical-formula)
4. [Technology Stack](#-technology-stack)
5. [Database Schema & Architecture](#-database-schema--architecture)
6. [Demo Accounts & Pre-Seeded Data](#-demo-accounts--pre-seeded-data)
7. [How to Run the Application](#-how-to-run-the-application)
8. [REST API Documentation](#-rest-api-documentation)

---

## 🎯 Abstract & Objectives

### 1. Abstract
Students often apply for internships without knowing the minimum CGPA, eligible branches, or required technical skills, resulting in high rejection rates and placing a heavy burden of manual application review on placement cells. 

The **Internship Eligibility Checker** provides a centralized platform where:
- Administrators store internship openings along with precise requirements (minimum CGPA, eligible branches, required skills, and minimum skill match threshold).
- Students register and maintain a profile with branch, year, CGPA, skills, certifications, and resume.
- When a student selects an internship and clicks **Check Eligibility**, the system evaluates academic criteria and calculates the skill match percentage.
- The system renders an immediate verdict: **Eligible** or **Not Eligible**, accompanied by clear failure reasons and actionable suggestions for improvement.
- If eligible, students apply in one click, while ineligible or duplicate applications are rejected automatically.
- Placement administrators update statuses through each milestone: `Applied`, `Shortlisted`, `Selected`, `Rejected`.

### 2. Core Objectives
- **Centralized Database:** Store internships, corporate requirements, and student academic credentials.
- **Reusable Student Profiles:** Store branch, year, CGPA, skills, certifications, phone, and resume link.
- **Automated Eligibility Checking:** Instant comparison before application submission.
- **Transparent Feedback:** Clear reasons and suggestions when a student is not eligible.
- **Application Tracking:** Real-time visibility into application status from submission to final selection.
- **Administrative Control:** Full CRUD control over internship postings, applicant reviews, and selection statuses.

---

## 🔄 Application Flow Diagram

```
                 START
                   ↓
          Registration / Login
                   ↓
   Student Profile (CGPA, Branch, Skills) 
                   ↕
   Internship Requirements (Added by Admin)
                   ↓
   Select Internship and Click "Check Eligibility"
                   ↓
   Compare Student Details with Internship Requirements
         (CGPA + Branch + Skill Match %)
                   ↓
           ELIGIBLE / NOT ELIGIBLE
                   ↓
   ┌──────────────────────────────────────────────┐
   │ If Eligible:   1-Click Apply for Internship  │
   │ If Ineligible: View Exact Reasons &          │
   │                Actionable Suggestions        │
   └──────────────────────────────────────────────┘
                   ↓
        Track Application Status
  (Applied → Shortlisted → Selected / Rejected)
                   ↓
                  END
```

---

## ⚙️ Eligibility Algorithm & Mathematical Formula

The eligibility evaluation compares three independent criteria:

### 1. Branch Match
Checks if the student's department belongs to the internship's eligible branches (supports exact match, token containment, department acronyms like CSE/IT/ECE/ME, or "All Branches").
$$\text{BranchEligible} = \text{studentBranch} \in \text{internshipEligibleBranches}$$

### 2. CGPA Cut-off
Checks if the student's cumulative grade point average meets or exceeds the required threshold:
$$\text{CgpaEligible} = (\text{studentCgpa} \ge \text{internshipMinimumCgpa})$$

### 3. Skill Match Percentage Calculation
Splits the comma-separated skill lists, normalizes technical aliases (e.g., `react.js` $\leftrightarrow$ `react`, `springboot` $\leftrightarrow$ `spring boot`, `mysql` $\leftrightarrow$ `sql`), and calculates:

$$\text{Skill Match } \% = \left( \frac{\text{Matched Skills Count}}{\text{Total Required Skills Count}} \right) \times 100$$

> **Example from Specification:**
> A student having **Java** and **MySQL** skills against an internship requiring **Java**, **MySQL**, and **Spring Boot**:
> $$\text{Skill Match } \% = \left( \frac{2}{3} \right) \times 100 = 66.67\%$$
> - If the internship requires a minimum 60.0% skill match $\rightarrow$ **Skill Match Passes (66.67% $\ge$ 60.0%)**.
> - Missing skill identified: **Spring Boot**.

### 4. Overall Decision
$$\text{OverallEligible} = \text{BranchEligible} \land \text{CgpaEligible} \land (\text{SkillMatch} \% \ge \text{MinSkillMatch} \%)$$

### 5. Reasons and Suggestions Engine
- If CGPA is below the minimum: shows exact difference and tips to focus on semester examinations.
- If branch is not eligible: displays department mismatch and suggests open-discipline postings.
- If skill match is below the threshold: lists all missing required skills and suggests targeted courses and mini-projects to bridge the gap.

---

## 💻 Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, JSX, Modern CSS | Full React 18 SPA with state hooks, reactive component tree, visual gauges, status badges, and "What-If" sandbox. |
| **Backend** | Java 21 / 26, Spring Boot | RESTful microservice architecture with Spring WebMVC & Global CORS filter. |
| **Data Layer** | Spring Data JPA, Hibernate | Object-Relational Mapping with repositories and transactions. |
| **Security** | Spring Security Crypto | BCrypt password hashing for encrypted credential storage. |
| **Database** | MySQL / Embedded H2 | Production-ready MySQL configuration (`schema-mysql.sql`) with zero-setup H2 fallback. |
| **Build Tool** | Apache Maven | Project build, dependency management, and packaging. |

---

## 🗄️ Database Schema & Architecture

The database includes 4 primary relational tables:

1. **`users`**:
   - `id` (BIGINT, PK, AUTO_INCREMENT)
   - `email` (VARCHAR(255), UNIQUE)
   - `password` (VARCHAR(255), BCrypt encrypted)
   - `name` (VARCHAR(255))
   - `role` (VARCHAR(50): `STUDENT`, `ADMIN`)
   - `created_at` (DATETIME)

2. **`student_profiles`**:
   - `id` (BIGINT, PK, AUTO_INCREMENT)
   - `user_id` (BIGINT, FK $\rightarrow$ `users.id`, UNIQUE)
   - `branch` (VARCHAR(255))
   - `study_year` (VARCHAR(100))
   - `cgpa` (DOUBLE)
   - `skills` (TEXT)
   - `certifications` (TEXT)
   - `phone` (VARCHAR(50))
   - `resume_link` (VARCHAR(500))
   - `updated_at` (DATETIME)

3. **`internships`**:
   - `id` (BIGINT, PK, AUTO_INCREMENT)
   - `title` (VARCHAR(255))
   - `company` (VARCHAR(255))
   - `location` (VARCHAR(255))
   - `duration` (VARCHAR(100))
   - `stipend` (VARCHAR(100))
   - `description` (TEXT)
   - `minimum_cgpa` (DOUBLE)
   - `eligible_branches` (TEXT)
   - `required_skills` (TEXT)
   - `minimum_skill_match` (DOUBLE)
   - `deadline` (VARCHAR(50))
   - `status` (VARCHAR(50): `ACTIVE`, `CLOSED`)
   - `created_at` (DATETIME)

4. **`applications`**:
   - `id` (BIGINT, PK, AUTO_INCREMENT)
   - `student_id` (BIGINT, FK $\rightarrow$ `student_profiles.id`)
   - `internship_id` (BIGINT, FK $\rightarrow$ `internships.id`)
   - `applied_at` (DATETIME)
   - `status` (VARCHAR(50): `Applied`, `Shortlisted`, `Selected`, `Rejected`)
   - `skill_match_percentage` (DOUBLE)
   - `matched_skills` (TEXT)
   - `missing_skills` (TEXT)
   - `admin_notes` (TEXT)
   - *Constraint:* `UNIQUE(student_id, internship_id)` to prevent duplicate applications.

---

## 👥 Demo Accounts & Pre-Seeded Data

The system initializes with realistic demo accounts:

### 1. Placement Administrator
- **Email:** `admin@checker.com`
- **Password:** `admin123`
- **Role:** `ADMIN`

### 2. Sample Students
| Name | Email | Password | Branch | CGPA | Skills |
|---|---|---|---|---|---|
| **Priya Sharma** | `priya@student.com` | `student123` | Computer Science | 8.60 | Java, Spring Boot, MySQL, Git, HTML, CSS |
| **Rahul Verma** | `rahul@student.com` | `student123` | Mechanical Engineering | 7.20 | Python, C++, AutoCAD, SolidWorks |
| **Ananya Patel** | `ananya@student.com` | `student123` | Information Technology | 7.90 | JavaScript, React, Node.js, MongoDB, HTML, CSS |

### 3. Pre-Seeded Internships
1. **Amazon** — *Backend Java Developer Intern* (Min CGPA: 7.5, Skills: Java, MySQL, Spring Boot, Min Match: 60%)
2. **Microsoft** — *Full Stack Web Developer Intern* (Min CGPA: 8.0, Skills: JavaScript, React, Node.js, MongoDB, Min Match: 75%)
3. **Google** — *Data Science & AI Intern* (Min CGPA: 8.5, Skills: Python, Machine Learning, SQL, Pandas, Min Match: 70%)
4. **Cisco Systems** — *Cloud & DevOps Intern* (Min CGPA: 7.0, Skills: Linux, Docker, AWS, Python, Git, Min Match: 50%)
5. **Flipkart** — *Frontend UI/UX Intern* (Min CGPA: 6.5, Skills: HTML, CSS, JavaScript, React, Figma, Min Match: 50%)
6. **Bosch** — *Embedded Systems & IoT Intern* (Min CGPA: 7.2, Skills: C, C++, Embedded Systems, Microcontrollers, Min Match: 60%)

---

## 📁 Project Directory Structure

```
internship-eligibility-checker/
├── backend/                  # Java 21+ Spring Boot REST API
│   ├── src/main/java/        # Controllers, Services, Repositories, DTOs, Entities
│   ├── src/main/resources/   # Application configs (H2, MySQL, Prod) & Static Bundle
│   ├── pom.xml               # Maven configuration & dependencies
│   ├── Dockerfile            # Multi-stage production container
│   └── .dockerignore
├── frontend/                 # Standalone React 18 + Vite SPA
│   ├── src/                  # React components, UI views, styling, API client
│   ├── package.json          # Node dependencies & Vite scripts
│   ├── vite.config.js        # Vite build & local proxy configuration
│   ├── vercel.json           # Vercel deployment configuration
│   └── netlify.toml          # Netlify deployment configuration
├── docker-compose.yml        # Multi-container orchestration (Backend + MySQL)
├── schema-mysql.sql          # Complete DDL schema & pre-seeded demo records
├── render.yaml               # Render Cloud Infrastructure Blueprint
├── Procfile                  # Cloud PaaS process definition
├── system.properties         # Java runtime declaration
├── run.bat                   # 1-Click Windows launcher
├── README.md                 # Project documentation & algorithm guide
└── DEPLOYMENT.md             # Multi-cloud deployment guide
```

---

## 🚀 How to Run the Application

### Option 1: 1-Click Windows Launcher (Recommended)
Simply double-click:
```cmd
run.bat
```
This automatically boots the Spring Boot server using the bundled executable JAR and opens on port `8080`.

### Option 2: Run Backend with Maven
```bash
cd backend
mvn spring-boot:run
```

### Option 3: Run Standalone React Frontend (Vite Dev Server)
```bash
cd frontend
npm install
npm run dev
```
The React frontend will start at `http://localhost:5173` with proxy configured to backend `http://localhost:8080`.

### Option 4: Run Backend with Local MySQL
1. Import the schema and initial data into your MySQL database:
   ```bash
   mysql -u root -p < schema-mysql.sql
   ```
2. Run the application with the MySQL profile activated:
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```
   *(Or edit `backend/src/main/resources/application-mysql.properties` with your database credentials).*

### Access the Web Application
Open your web browser and navigate to:
```
http://localhost:8080
```

H2 Database Console is also available at:
```
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:file:./data/internshipdb
User: sa
Password: (blank)
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a student or admin account with encrypted password.
- `POST /api/auth/login` — Sign in and receive user session token.
- `GET /api/auth/me?userId={id}` — Retrieve current user info.

### Student Profile (`/api/students`)
- `GET /api/students/profile/{userId}` — Retrieve student profile.
- `PUT /api/students/profile/{userId}` — Update branch, CGPA, skills, certifications, and resume.
- `GET /api/students/all` — Administrator directory of all registered students.

### Internships (`/api/internships`)
- `GET /api/internships` — List all internships (supports `?status=ACTIVE`).
- `GET /api/internships/{id}` — Get single internship details.
- `POST /api/internships` — Administrator creates a new internship.
- `PUT /api/internships/{id}` — Administrator updates an internship.
- `DELETE /api/internships/{id}` — Administrator deletes an internship.

### Eligibility Checker (`/api/eligibility`)
- `POST /api/eligibility/check` — Compares student credentials against internship requirements, calculates skill match %, and returns detailed reasons and suggestions. Supports "What-If" sandbox parameters (`customBranch`, `customCgpa`, `customSkills`).
- `GET /api/eligibility/check-all/{studentId}` — Evaluates a student profile across all active internships at once.

### Applications (`/api/applications`)
- `POST /api/applications/apply` — 1-Click apply. Verifies eligibility and blocks ineligible or duplicate submissions.
- `GET /api/applications/my/{studentId}` — Retrieve candidate's submitted applications.
- `GET /api/applications/all` — Administrator view of all applications with status filters.
- `PUT /api/applications/{id}/status` — Administrator updates application status (`Applied`, `Shortlisted`, `Selected`, `Rejected`) with notes.
- `GET /api/applications/stats` — Dashboard statistics counter.

---

## 🛡️ Key Validations & Safeguards
1. **Password Encryption:** All passwords stored using industry-standard `BCryptPasswordEncoder`.
2. **Strict Ineligible Application Guard:** Applications cannot be forged or submitted if criteria fail; backend validates eligibility on submission.
3. **Duplicate Prevention:** Unique constraint guarantees a student cannot apply twice to the same posting.
4. **Transparent Feedback:** Detailed reasons for any criteria gap with constructive learning recommendations.
