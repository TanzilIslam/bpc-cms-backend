Bhola Programming Club \- Backend Technical Specification  
📋 Document Overview

**Project:** Bhola Programming Club CMS Backend API  
 **Stack:** NestJS \+ TypeScript \+ MySQL \+ TypeORM  
 **Version:** 1.0  
 **Target Deployment:** VPS (Linux) \+ Docker  
 **Development Environment:** Windows (Docker)

---

🎯 Business Context (Quick Summary)

What is this?

A Course Management System (CMS) for a programming training center in Bhola, Bangladesh. The founder (Tanzil) will teach web development to local students, starting with 10 free students, then scaling to paid batches.

Revenue Model

* **Phase 1 (Month 1-3):** FREE beta with 10 students \- build reputation  
* **Phase 2 (Month 4-6):** Paid courses at 10,000 BDT/course (5k upfront \+ 5k after 1 month)  
* **Phase 3 (Month 6-12):** Sell recorded courses online, team projects, save for physical center

User Types

1. **SUPER\_ADMIN:** Founder (full access)  
2. **ADMIN:** Future staff (operational management)  
3. **TA (Teaching Assistant):** Senior students helping juniors (limited access)  
4. **STUDENT:** Enrolled learners (course access)  
5. **GUEST:** Public (browse only)  
6. **ALUMNI:** Graduates (extended access)

Core Workflows

1. **Student Journey:** Browse courses → Enroll → Pay (installments) → Learn → Submit assignments → Get graded → Receive certificate  
2. **Admin Workflow:** Create course → Create batch → Enroll students → Track payments → Grade assignments → Issue certificates → Generate financial reports  
3. **TA Workflow:** View assigned batch → Mark attendance → Grade assignments → Provide feedback

---

🏗️ Architecture Overview

Technology Stack  
Backend Framework:    NestJS (v10.x)  
Language:            TypeScript (v5.x)  
Database:            MySQL (v8.0)  
ORM:                 TypeORM (v0.3.x)  
Validation:          Zod (v3.x) \+ class-validator  
Authentication:      JWT (Passport.js)  
File Upload:         Multer (local storage)  
Security:            Helmet, CORS, Throttler  
Documentation:       Swagger/OpenAPI  
Containerization:    Docker \+ Docker Compose

Project Structure  
backend/  
├── src/  
│   ├── common/                 \# Shared utilities  
│   │   ├── decorators/        \# Custom decorators (@Roles, @CurrentUser)  
│   │   ├── guards/            \# Auth guards, Role guards  
│   │   ├── interceptors/      \# Response transformer, logging  
│   │   ├── pipes/             \# Zod validation pipe  
│   │   ├── filters/           \# Exception filters  
│   │   ├── validators/        \# Custom validators  
│   │   ├── constants/         \# Enums, constants  
│   │   └── interfaces/        \# Shared TypeScript interfaces  
│   │  
│   ├── config/                 \# Configuration  
│   │   ├── typeorm.config.ts  
│   │   ├── environment.validation.ts  
│   │   └── config.module.ts  
│   │  
│   ├── database/               \# Database management  
│   │   ├── migrations/        \# TypeORM migrations  
│   │   └── seeds/             \# Seed data (roles, permissions)  
│   │  
│   ├── modules/                \# Feature modules  
│   │   ├── auth/              \# Authentication & authorization  
│   │   ├── users/             \# User management  
│   │   ├── roles/             \# Role management  
│   │   ├── permissions/       \# Permission management  
│   │   ├── courses/           \# Course management  
│   │   ├── batches/           \# Batch management  
│   │   ├── enrollments/       \# Student enrollments  
│   │   ├── payments/          \# Payment tracking  
│   │   ├── assignments/       \# Assignment management  
│   │   ├── submissions/       \# Student submissions  
│   │   ├── attendance/        \# Attendance tracking  
│   │   ├── projects/          \# Portfolio projects  
│   │   ├── certificates/      \# Certificate generation  
│   │   ├── files/             \# File upload management  
│   │   ├── expenses/          \# Expense tracking  
│   │   ├── announcements/     \# Announcements  
│   │   ├── testimonials/      \# Reviews & testimonials  
│   │   ├── enrollment-forms/  \# Public enrollment forms  
│   │   └── analytics/         \# Reports & analytics  
│   │  
│   ├── app.module.ts  
│   └── main.ts  
│  
├── uploads/                    \# File storage  
├── docker/                     \# Docker configs  
├── .env  
├── docker-compose.dev.yml  
├── docker-compose.prod.yml  
└── package.json

---

🗄️ Database Schema

Core Tables (19 tables)

1\. users

Primary user table for all user types.

CREATE TABLE users (  
  id                 VARCHAR(36) PRIMARY KEY,  
  email              VARCHAR(255) UNIQUE NOT NULL,  
  password           VARCHAR(255) NOT NULL,  
  full\_name          VARCHAR(255) NOT NULL,  
  phone              VARCHAR(20) NOT NULL,  
  role               ENUM('SUPER\_ADMIN', 'ADMIN', 'TA', 'STUDENT', 'GUEST', 'ALUMNI') NOT NULL,  
  profile\_photo      VARCHAR(500),  
  date\_of\_birth      DATE,  
  address            TEXT,  
  laptop\_specs       TEXT,  
  internet\_speed     VARCHAR(100),  
  status             ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',  
  email\_verified     BOOLEAN DEFAULT FALSE,  
  created\_at         TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at         TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
  last\_login\_at      TIMESTAMP,  
    
  INDEX idx\_email (email),  
  INDEX idx\_role (role),  
  INDEX idx\_status (status)  
);

**Business Rules:**

* Email must be unique and valid  
* Password must be hashed with bcrypt (10 rounds)  
* Phone must be Bangladesh format (+880...)  
* Students must provide laptop\_specs and internet\_speed  
* Default role is STUDENT  
* SUPER\_ADMIN cannot be deleted (soft delete only)

2\. courses

Course catalog with pricing and metadata.

CREATE TABLE courses (  
  id                      VARCHAR(36) PRIMARY KEY,  
  title                   VARCHAR(255) NOT NULL,  
  slug                    VARCHAR(255) UNIQUE NOT NULL,  
  description             TEXT NOT NULL,  
  duration\_months         INT NOT NULL,  
  price                   DECIMAL(10, 2\) NOT NULL,  
  installment\_plan        VARCHAR(100),  
  difficulty\_level        ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL,  
  prerequisites           JSON,  
  skills\_covered          JSON NOT NULL,  
  is\_published            BOOLEAN DEFAULT FALSE,  
  thumbnail               VARCHAR(500),  
  recorded\_course\_price   DECIMAL(10, 2),  
  recorded\_access\_months  INT DEFAULT 6,  
  created\_by              VARCHAR(36) NOT NULL,  
  created\_at              TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at              TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (created\_by) REFERENCES users(id),  
  INDEX idx\_slug (slug),  
  INDEX idx\_is\_published (is\_published)  
);

**Business Rules:**

* Slug auto-generated from title (kebab-case)  
* Price in BDT (Bangladeshi Taka)  
* Default installment\_plan: "5000 x 2"  
* skills\_covered: \["HTML", "CSS", "JavaScript"\]  
* Only SUPER\_ADMIN/ADMIN can create/edit courses  
* Unpublished courses not visible to students

3\. course\_content

Modules and lessons within courses.

CREATE TABLE course\_content (  
  id                 VARCHAR(36) PRIMARY KEY,  
  course\_id          VARCHAR(36) NOT NULL,  
  module\_number      INT NOT NULL,  
  title              VARCHAR(255) NOT NULL,  
  description        TEXT,  
  content\_type       ENUM('VIDEO', 'PDF', 'TEXT', 'LINK') NOT NULL,  
  content\_url        VARCHAR(1000) NOT NULL,  
  duration\_minutes   INT,  
  order\_index        INT NOT NULL,  
  is\_free\_preview    BOOLEAN DEFAULT FALSE,  
  created\_at         TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at         TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (course\_id) REFERENCES courses(id) ON DELETE CASCADE,  
  INDEX idx\_course\_id (course\_id),  
  INDEX idx\_order (course\_id, order\_index)  
);

**Business Rules:**

* content\_url: YouTube link or file path (e.g., /uploads/videos/lesson1.mp4)  
* order\_index determines display sequence  
* is\_free\_preview allows public viewing for marketing  
* duration\_minutes required for VIDEO type

4\. batches

Course batches with scheduling.

CREATE TABLE batches (  
  id                  VARCHAR(36) PRIMARY KEY,  
  course\_id           VARCHAR(36) NOT NULL,  
  batch\_name          VARCHAR(255) NOT NULL,  
  batch\_code          VARCHAR(50) UNIQUE NOT NULL,  
  start\_date          DATE NOT NULL,  
  end\_date            DATE NOT NULL,  
  schedule            VARCHAR(255) NOT NULL,  
  max\_students        INT DEFAULT 10,  
  current\_enrollment  INT DEFAULT 0,  
  status              ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',  
  instructor\_id       VARCHAR(36) NOT NULL,  
  ta\_ids              JSON,  
  meeting\_link        VARCHAR(500),  
  is\_free             BOOLEAN DEFAULT FALSE,  
  created\_at          TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at          TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (course\_id) REFERENCES courses(id),  
  FOREIGN KEY (instructor\_id) REFERENCES users(id),  
  INDEX idx\_batch\_code (batch\_code),  
  INDEX idx\_status (status)  
);

**Business Rules:**

* batch\_code format: "BWD-JAN-2026" (course-month-year)  
* schedule example: "Sat-Sun 8-10 PM"  
* max\_students: 10 (business constraint)  
* current\_enrollment auto-incremented on enrollment  
* ta\_ids: array of user IDs with TA role  
* is\_free: true for Phase 1 beta batches

5\. enrollments

Student course enrollments.

CREATE TABLE enrollments (  
  id                  VARCHAR(36) PRIMARY KEY,  
  student\_id          VARCHAR(36) NOT NULL,  
  batch\_id            VARCHAR(36) NOT NULL,  
  course\_id           VARCHAR(36) NOT NULL,  
  enrollment\_date     TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  enrollment\_status   ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED') DEFAULT 'PENDING',  
  payment\_status      ENUM('UNPAID', 'PARTIAL', 'FULL') DEFAULT 'UNPAID',  
  total\_fee           DECIMAL(10, 2\) NOT NULL,  
  amount\_paid         DECIMAL(10, 2\) DEFAULT 0,  
  access\_type         ENUM('LIVE', 'RECORDED', 'BOTH') DEFAULT 'BOTH',  
  access\_expires\_at   TIMESTAMP,  
  progress\_percentage DECIMAL(5, 2\) DEFAULT 0,  
  final\_grade         VARCHAR(5),  
  certificate\_issued  BOOLEAN DEFAULT FALSE,  
  certificate\_id      VARCHAR(100),  
  completion\_date     TIMESTAMP,  
  created\_at          TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at          TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (student\_id) REFERENCES users(id),  
  FOREIGN KEY (batch\_id) REFERENCES batches(id),  
  FOREIGN KEY (course\_id) REFERENCES courses(id),  
  UNIQUE KEY unique\_enrollment (student\_id, batch\_id),  
  INDEX idx\_student (student\_id),  
  INDEX idx\_batch (batch\_id),  
  INDEX idx\_status (enrollment\_status)  
);

**Business Rules:**

* A student cannot enroll in same batch twice  
* total\_fee: 0 if batch is\_free, else course.price  
* payment\_status:  
  * UNPAID (0 paid)  
  * PARTIAL (5000 paid of 10000\)  
  * FULL (10000 paid)  
* enrollment\_status changes:  
  * PENDING → ACTIVE (after first payment or if free)  
  * ACTIVE → COMPLETED (after course end \+ certificate)  
  * ACTIVE → DROPPED (student leaves)  
* access\_expires\_at: for recorded-only access (6 months)  
* progress\_percentage: auto-calculated from completed assignments  
* final\_grade: A+, A, B, C, F (set by admin at end)

6\. payments

Payment transaction records.

CREATE TABLE payments (  
  id                   VARCHAR(36) PRIMARY KEY,  
  enrollment\_id        VARCHAR(36) NOT NULL,  
  student\_id           VARCHAR(36) NOT NULL,  
  amount               DECIMAL(10, 2\) NOT NULL,  
  installment\_number   INT NOT NULL,  
  payment\_method       ENUM('CASH', 'BKASH', 'NAGAD', 'BANK\_TRANSFER') NOT NULL,  
  transaction\_id       VARCHAR(100),  
  payment\_date         TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  received\_by          VARCHAR(36) NOT NULL,  
  notes                TEXT,  
  status               ENUM('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED') DEFAULT 'CONFIRMED',  
  created\_at           TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at           TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (enrollment\_id) REFERENCES enrollments(id),  
  FOREIGN KEY (student\_id) REFERENCES users(id),  
  FOREIGN KEY (received\_by) REFERENCES users(id),  
  INDEX idx\_enrollment (enrollment\_id),  
  INDEX idx\_student (student\_id),  
  INDEX idx\_payment\_date (payment\_date)  
);

**Business Rules:**

* installment\_number: 1 (first 5k), 2 (second 5k)  
* transaction\_id: from mobile banking (bKash/Nagad)  
* received\_by: admin who recorded the payment  
* On payment creation → update enrollment.amount\_paid  
* On payment creation → update enrollment.payment\_status  
* REFUNDED status → decrease enrollment.amount\_paid

7\. assignments

Course assignments.

CREATE TABLE assignments (  
  id                        VARCHAR(36) PRIMARY KEY,  
  course\_content\_id         VARCHAR(36) NOT NULL,  
  title                     VARCHAR(255) NOT NULL,  
  description               TEXT NOT NULL,  
  assignment\_type           ENUM('PROJECT', 'QUIZ', 'CODE', 'WRITTEN') NOT NULL,  
  max\_score                 INT DEFAULT 100,  
  due\_date                  TIMESTAMP,  
  required\_files            JSON,  
  submission\_instructions   TEXT,  
  created\_by                VARCHAR(36) NOT NULL,  
  created\_at                TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at                TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (course\_content\_id) REFERENCES course\_content(id) ON DELETE CASCADE,  
  FOREIGN KEY (created\_by) REFERENCES users(id),  
  INDEX idx\_course\_content (course\_content\_id)  
);

**Business Rules:**

* required\_files: \["HTML", "CSS"\] or \["ZIP"\]  
* max\_score: typically 100  
* due\_date: optional (can be NULL for practice assignments)

8\. submissions

Student assignment submissions.

CREATE TABLE submissions (  
  id              VARCHAR(36) PRIMARY KEY,  
  assignment\_id   VARCHAR(36) NOT NULL,  
  student\_id      VARCHAR(36) NOT NULL,  
  enrollment\_id   VARCHAR(36) NOT NULL,  
  submission\_date TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  file\_paths      JSON,  
  github\_link     VARCHAR(500),  
  live\_demo\_link  VARCHAR(500),  
  notes           TEXT,  
  status          ENUM('SUBMITTED', 'GRADED', 'REVISION\_NEEDED') DEFAULT 'SUBMITTED',  
  score           INT,  
  feedback        TEXT,  
  graded\_by       VARCHAR(36),  
  graded\_at       TIMESTAMP,  
  created\_at      TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at      TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (assignment\_id) REFERENCES assignments(id),  
  FOREIGN KEY (student\_id) REFERENCES users(id),  
  FOREIGN KEY (enrollment\_id) REFERENCES enrollments(id),  
  FOREIGN KEY (graded\_by) REFERENCES users(id),  
  UNIQUE KEY unique\_submission (assignment\_id, student\_id),  
  INDEX idx\_assignment (assignment\_id),  
  INDEX idx\_student (student\_id),  
  INDEX idx\_status (status)  
);

**Business Rules:**

* Student can submit once per assignment (edit allowed before grading)  
* file\_paths: array of uploaded file paths  
* On grade → status changes to GRADED  
* On grade → update enrollment.progress\_percentage  
* graded\_by can be TA or ADMIN

9\. attendance

Class attendance records.

CREATE TABLE attendance (  
  id          VARCHAR(36) PRIMARY KEY,  
  batch\_id    VARCHAR(36) NOT NULL,  
  class\_date  DATE NOT NULL,  
  class\_topic VARCHAR(255) NOT NULL,  
  student\_id  VARCHAR(36) NOT NULL,  
  status      ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') NOT NULL,  
  marked\_by   VARCHAR(36) NOT NULL,  
  notes       TEXT,  
  created\_at  TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (batch\_id) REFERENCES batches(id),  
  FOREIGN KEY (student\_id) REFERENCES users(id),  
  FOREIGN KEY (marked\_by) REFERENCES users(id),  
  UNIQUE KEY unique\_attendance (batch\_id, class\_date, student\_id),  
  INDEX idx\_batch\_date (batch\_id, class\_date),  
  INDEX idx\_student (student\_id)  
);

**Business Rules:**

* One attendance record per student per class  
* marked\_by: instructor or TA  
* Attendance percentage calculated for enrollment progress

10\. projects

Student portfolio projects.

CREATE TABLE projects (  
  id                  VARCHAR(36) PRIMARY KEY,  
  student\_id          VARCHAR(36) NOT NULL,  
  title               VARCHAR(255) NOT NULL,  
  description         TEXT NOT NULL,  
  thumbnail           VARCHAR(500),  
  technologies\_used   JSON NOT NULL,  
  github\_link         VARCHAR(500),  
  live\_demo\_link      VARCHAR(500),  
  screenshots         JSON,  
  is\_featured         BOOLEAN DEFAULT FALSE,  
  is\_public           BOOLEAN DEFAULT TRUE,  
  likes\_count         INT DEFAULT 0,  
  views\_count         INT DEFAULT 0,  
  created\_at          TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at          TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (student\_id) REFERENCES users(id),  
  INDEX idx\_student (student\_id),  
  INDEX idx\_featured (is\_featured),  
  INDEX idx\_public (is\_public)  
);

**Business Rules:**

* technologies\_used: \["React", "Node.js", "MongoDB"\]  
* is\_featured: admin can feature best projects on homepage  
* is\_public: students can make projects private  
* screenshots: array of image paths

11\. certificates

Generated certificates.

CREATE TABLE certificates (  
  id                VARCHAR(36) PRIMARY KEY,  
  certificate\_code  VARCHAR(100) UNIQUE NOT NULL,  
  student\_id        VARCHAR(36) NOT NULL,  
  enrollment\_id     VARCHAR(36) NOT NULL,  
  course\_id         VARCHAR(36) NOT NULL,  
  issue\_date        DATE NOT NULL,  
  grade             VARCHAR(5) NOT NULL,  
  skills\_earned     JSON NOT NULL,  
  signature\_name    VARCHAR(255) NOT NULL,  
  signature\_title   VARCHAR(255) NOT NULL,  
  pdf\_path          VARCHAR(500),  
  is\_verified       BOOLEAN DEFAULT TRUE,  
  verification\_link VARCHAR(500),  
  created\_at        TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (student\_id) REFERENCES users(id),  
  FOREIGN KEY (enrollment\_id) REFERENCES enrollments(id),  
  FOREIGN KEY (course\_id) REFERENCES courses(id),  
  UNIQUE KEY unique\_certificate (enrollment\_id),  
  INDEX idx\_certificate\_code (certificate\_code),  
  INDEX idx\_student (student\_id)  
);

**Business Rules:**

* certificate\_code format: "BPC-BWD-2026-001"  
* Auto-generated PDF with student name, course, grade, skills  
* verification\_link: public URL to verify authenticity  
* Only issued when enrollment\_status \= COMPLETED

12\. files

File upload management.

CREATE TABLE files (  
  id            VARCHAR(36) PRIMARY KEY,  
  uploaded\_by   VARCHAR(36) NOT NULL,  
  file\_name     VARCHAR(255) NOT NULL,  
  file\_path     VARCHAR(500) NOT NULL,  
  file\_type     ENUM('IMAGE', 'VIDEO', 'PDF', 'ZIP', 'OTHER') NOT NULL,  
  file\_size     BIGINT NOT NULL,  
  mime\_type     VARCHAR(100) NOT NULL,  
  entity\_type   ENUM('PROFILE', 'ASSIGNMENT', 'PROJECT', 'COURSE', 'CERTIFICATE') NOT NULL,  
  entity\_id     VARCHAR(36),  
  is\_public     BOOLEAN DEFAULT FALSE,  
  created\_at    TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (uploaded\_by) REFERENCES users(id),  
  INDEX idx\_entity (entity\_type, entity\_id),  
  INDEX idx\_uploaded\_by (uploaded\_by)  
);

**Business Rules:**

* Max file size: 10MB (configurable)  
* Allowed types: images, PDFs, videos, ZIPs  
* file\_path: relative path from uploads/ directory  
* entity\_type \+ entity\_id: polymorphic reference

13\. expenses

Financial expense tracking.

CREATE TABLE expenses (  
  id             VARCHAR(36) PRIMARY KEY,  
  expense\_date   DATE NOT NULL,  
  category       ENUM('INTERNET', 'ELECTRICITY', 'EQUIPMENT', 'MARKETING', 'TA\_PAYMENT', 'OTHER') NOT NULL,  
  amount         DECIMAL(10, 2\) NOT NULL,  
  description    TEXT NOT NULL,  
  receipt\_file   VARCHAR(500),  
  paid\_by        VARCHAR(36) NOT NULL,  
  created\_at     TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (paid\_by) REFERENCES users(id),  
  INDEX idx\_expense\_date (expense\_date),  
  INDEX idx\_category (category)  
);

**Business Rules:**

* Only SUPER\_ADMIN can add expenses  
* Used for profit/loss calculation  
* receipt\_file: optional scanned receipt

14\. financial\_goals

Savings goals (e.g., for physical center).

CREATE TABLE financial\_goals (  
  id              VARCHAR(36) PRIMARY KEY,  
  goal\_name       VARCHAR(255) NOT NULL,  
  target\_amount   DECIMAL(10, 2\) NOT NULL,  
  current\_amount  DECIMAL(10, 2\) DEFAULT 0,  
  deadline        DATE,  
  status          ENUM('ACTIVE', 'ACHIEVED', 'CANCELLED') DEFAULT 'ACTIVE',  
  created\_at      TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at      TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  INDEX idx\_status (status)  
);

**Business Rules:**

* current\_amount updated manually by SUPER\_ADMIN  
* Status auto-changes to ACHIEVED when current \>= target

15\. recorded\_course\_sales

Sales of recorded courses (Phase 3).

CREATE TABLE recorded\_course\_sales (  
  id                 VARCHAR(36) PRIMARY KEY,  
  course\_id          VARCHAR(36) NOT NULL,  
  buyer\_id           VARCHAR(36) NOT NULL,  
  purchase\_date      TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  amount             DECIMAL(10, 2\) NOT NULL,  
  payment\_method     ENUM('BKASH', 'NAGAD', 'BANK\_TRANSFER', 'SSL\_COMMERZ') NOT NULL,  
  transaction\_id     VARCHAR(100) NOT NULL,  
  access\_expires\_at  TIMESTAMP NOT NULL,  
  status             ENUM('ACTIVE', 'EXPIRED', 'REFUNDED') DEFAULT 'ACTIVE',  
  created\_at         TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (course\_id) REFERENCES courses(id),  
  FOREIGN KEY (buyer\_id) REFERENCES users(id),  
  INDEX idx\_buyer (buyer\_id),  
  INDEX idx\_status (status)  
);

**Business Rules:**

* access\_expires\_at: purchase\_date \+ 6 months  
* Status auto-changes to EXPIRED after expiry  
* Buyer gets RECORDED access to course content

16\. team\_projects

Client projects for alumni (Phase 3).

CREATE TABLE team\_projects (  
  id                      VARCHAR(36) PRIMARY KEY,  
  project\_name            VARCHAR(255) NOT NULL,  
  client\_name             VARCHAR(255),  
  client\_budget           DECIMAL(10, 2\) NOT NULL,  
  start\_date              DATE NOT NULL,  
  deadline                DATE NOT NULL,  
  status                  ENUM('BIDDING', 'IN\_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'BIDDING',  
  team\_members            JSON NOT NULL,  
  revenue\_share\_percentage VARCHAR(50) NOT NULL,  
  total\_paid              DECIMAL(10, 2\) DEFAULT 0,  
  created\_at              TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at              TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  INDEX idx\_status (status)  
);

**Business Rules:**

* team\_members: array of alumni user IDs  
* revenue\_share\_percentage: e.g., "40% admin, 60% team"  
* Only ALUMNI role can join projects

17\. announcements

System-wide or batch-specific announcements.

CREATE TABLE announcements (  
  id               VARCHAR(36) PRIMARY KEY,  
  title            VARCHAR(255) NOT NULL,  
  content          TEXT NOT NULL,  
  target\_audience  ENUM('ALL', 'BATCH\_SPECIFIC', 'COURSE\_SPECIFIC') NOT NULL,  
  batch\_id         VARCHAR(36),  
  course\_id        VARCHAR(36),  
  priority         ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',  
  is\_published     BOOLEAN DEFAULT FALSE,  
  publish\_date     TIMESTAMP,  
  created\_by       VARCHAR(36) NOT NULL,  
  created\_at       TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at       TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  FOREIGN KEY (batch\_id) REFERENCES batches(id),  
  FOREIGN KEY (course\_id) REFERENCES courses(id),  
  FOREIGN KEY (created\_by) REFERENCES users(id),  
  INDEX idx\_target (target\_audience, batch\_id, course\_id),  
  INDEX idx\_published (is\_published, publish\_date)  
);

**Business Rules:**

* If target\_audience \= BATCH\_SPECIFIC, batch\_id required  
* If target\_audience \= COURSE\_SPECIFIC, course\_id required  
* is\_published: false for drafts

18\. testimonials

Student reviews and feedback.

CREATE TABLE testimonials (  
  id           VARCHAR(36) PRIMARY KEY,  
  student\_id   VARCHAR(36) NOT NULL,  
  course\_id    VARCHAR(36) NOT NULL,  
  rating       INT NOT NULL CHECK (rating \>= 1 AND rating \<= 5),  
  review       TEXT NOT NULL,  
  is\_approved  BOOLEAN DEFAULT FALSE,  
  is\_featured  BOOLEAN DEFAULT FALSE,  
  created\_at   TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  approved\_at  TIMESTAMP,  
  approved\_by  VARCHAR(36),  
    
  FOREIGN KEY (student\_id) REFERENCES users(id),  
  FOREIGN KEY (course\_id) REFERENCES courses(id),  
  FOREIGN KEY (approved\_by) REFERENCES users(id),  
  INDEX idx\_course (course\_id),  
  INDEX idx\_approved (is\_approved),  
  INDEX idx\_featured (is\_featured)  
);

**Business Rules:**

* Students can only review courses they completed  
* Admin must approve before showing publicly  
* is\_featured: show on homepage

19\. enrollment\_forms

Public enrollment form submissions.

CREATE TABLE enrollment\_forms (  
  id                VARCHAR(36) PRIMARY KEY,  
  full\_name         VARCHAR(255) NOT NULL,  
  email             VARCHAR(255) NOT NULL,  
  phone             VARCHAR(20) NOT NULL,  
  interested\_course VARCHAR(255) NOT NULL,  
  has\_laptop        BOOLEAN NOT NULL,  
  laptop\_specs      TEXT,  
  has\_internet      BOOLEAN NOT NULL,  
  why\_join          TEXT NOT NULL,  
  status            ENUM('PENDING', 'CONTACTED', 'ENROLLED', 'REJECTED') DEFAULT 'PENDING',  
  notes             TEXT,  
  created\_at        TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
  updated\_at        TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,  
    
  INDEX idx\_status (status),  
  INDEX idx\_email (email)  
);

**Business Rules:**

* Public form (no authentication required)  
* Admin reviews and contacts applicants  
* Status changes: PENDING → CONTACTED → ENROLLED  
* When status \= ENROLLED, create user account

---

🔐 Authentication & Authorization

JWT Token Strategy

**Access Token:**

* Expiry: 7 days  
* Payload: { sub: userId, email, roles: \[role\], permissions: \[permissions\] }  
* Used for API authentication

**Refresh Token:**

* Expiry: 30 days  
* Stored in HTTP-only cookie (production) or response body (dev)  
* Used to get new access token

Role-Based Access Control (RBAC)  
// Role hierarchy  
SUPER\_ADMIN \> ADMIN \> TA \> STUDENT \> GUEST

// Permission matrix  
SUPER\_ADMIN: ALL permissions  
ADMIN: Manage courses, batches, students, payments (no system settings)  
TA: View batch, grade assignments, mark attendance (read-only for students)  
STUDENT: View own courses, submit assignments, view grades  
GUEST: Public endpoints only  
ALUMNI: Student permissions \+ join team projects

Guard Implementation  
// @Roles() decorator  
@Roles(UserRole.ADMIN, UserRole.SUPER\_ADMIN)  
@Get('admin/students')  
async getAllStudents() { ... }

// @Permissions() decorator (future \- granular control)  
@Permissions(Permission.USER\_DELETE)  
@Delete('users/:id')  
async deleteUser() { ... }

---

📡 API Endpoints Specification

Naming Convention

* Base URL: /api/v1  
* RESTful: Plural nouns (users, courses, batches)  
* Nested resources: /batches/:id/students

Response Format

**Success Response:**

{  
  "success": true,  
  "message": "Request processed successfully",  
  "data": { ... },  
  "meta": {  
    "page": 1,  
    "limit": 10,  
    "total": 50,  
    "totalPages": 5  
  },  
  "timestamp": "2026-01-31T12:00:00.000Z"  
}

**Error Response:**

{  
  "success": false,  
  "message": "Validation failed",  
  "errors": \[  
    {  
      "field": "email",  
      "message": "Invalid email format"  
    }  
  \],  
  "timestamp": "2026-01-31T12:00:00.000Z",  
  "path": "/api/v1/auth/register",  
  "method": "POST"  
}

Endpoint List (Summary)

Auth Module

* POST /auth/register \- Student signup  
* POST /auth/login \- Login  
* POST /auth/logout \- Logout  
* POST /auth/refresh \- Refresh token  
* POST /auth/forgot-password \- Request reset  
* POST /auth/reset-password \- Reset password

Users Module

* GET /users/me \- Current user profile  
* PUT /users/me \- Update profile  
* POST /users/me/avatar \- Upload profile photo  
* GET /admin/users \- List all users (admin)  
* GET /admin/users/:id \- Get user details (admin)  
* PUT /admin/users/:id/role \- Change user role (super admin)  
* DELETE /admin/users/:id \- Soft delete user (admin)

Courses Module

* GET /courses \- Public course list  
* GET /courses/:slug \- Course details  
* POST /admin/courses \- Create course (admin)  
* PUT /admin/courses/:id \- Update course (admin)  
* DELETE /admin/courses/:id \- Delete course (admin)  
* POST /admin/courses/:id/content \- Add course content (admin)  
* GET /courses/:id/content \- Get course content (enrolled students)

Batches Module

* GET /batches \- Public batch list  
* POST /admin/batches \- Create batch (admin)  
* PUT /admin/batches/:id \- Update batch (admin)  
* GET /admin/batches/:id/students \- Batch students (admin/TA)  
* POST /admin/batches/:id/assign-ta \- Assign TA (admin)

Enrollments Module

* POST /enrollments \- Enroll in course (student)  
* GET /students/me/enrollments \- My enrollments  
* GET /students/me/enrollments/:id/progress \- Course progress  
* POST /admin/enrollments \- Manual enrollment (admin)  
* PUT /admin/enrollments/:id/status \- Update status (admin)

Payments Module

* POST /admin/payments \- Record payment (admin)  
* GET /students/me/payments \- My payment history  
* GET /admin/payments \- All payments (admin)  
* GET /admin/payments/pending \- Pending payments (admin)  
* POST /admin/payments/:id/reminder \- Send reminder (admin)

Assignments Module

* GET /assignments \- Student's assignments  
* POST /admin/assignments \- Create assignment (admin)  
* GET /assignments/:id \- Assignment details  
* POST /assignments/:id/submit \- Submit assignment (student)  
* GET /submissions/:id \- Submission details  
* POST /admin/submissions/:id/grade \- Grade submission (admin/TA)

Attendance Module

* POST /admin/attendance \- Mark attendance (admin/TA)  
* GET /students/me/attendance \- My attendance  
* GET /admin/batches/:id/attendance \- Batch attendance (admin/TA)

Projects Module

* GET /projects \- Public project showcase  
* GET /students/me/projects \- My projects  
* POST /students/me/projects \- Upload project (student)  
* PUT /students/me/projects/:id \- Update project (student)  
* DELETE /students/me/projects/:id \- Delete project (student)  
* PUT /admin/projects/:id/feature \- Feature project (admin)

Certificates Module

* GET /students/me/certificate \- My certificate  
* GET /certificates/verify/:code \- Public verification  
* POST /admin/certificates/generate \- Generate certificate (admin)  
* GET /admin/certificates \- All certificates (admin)

Files Module

* POST /files/upload \- Upload file (authenticated)  
* GET /files/:id \- Get file (auth check based on entity)  
* DELETE /files/:id \- Delete file (owner or admin)

Analytics Module (Admin)

* GET /admin/analytics/dashboard \- Overview stats  
* GET /admin/analytics/revenue \- Revenue report  
* GET /admin/analytics/students \- Student stats  
* GET /admin/analytics/courses \- Course performance

Enrollment Forms (Public)

* POST /enrollment-forms \- Submit form  
* GET /admin/enrollment-forms \- View forms (admin)  
* PUT /admin/enrollment-forms/:id/status \- Update status (admin)

---

✅ Validation Rules (Zod Schemas)

User Registration  
const registerSchema \= z.object({  
  email: z.string().email(),  
  password: z.string().min(8).regex(/^(?=.\*\[a-z\])(?=.\*\[A-Z\])(?=.\*\\d)/),  
  full\_name: z.string().min(3).max(255),  
  phone: z.string().regex(/^(?:\\+88)?01\[3-9\]\\d{8}$/), // Bangladesh  
  laptop\_specs: z.string().optional(),  
  internet\_speed: z.string().optional(),  
});

Course Creation  
const createCourseSchema \= z.object({  
  title: z.string().min(5).max(255),  
  description: z.string().min(50),  
  duration\_months: z.number().min(1).max(12),  
  price: z.number().min(0),  
  difficulty\_level: z.enum(\['BEGINNER', 'INTERMEDIATE', 'ADVANCED'\]),  
  skills\_covered: z.array(z.string()).min(1),  
  prerequisites: z.array(z.string().uuid()).optional(),  
});

Payment Recording  
const recordPaymentSchema \= z.object({  
  enrollment\_id: z.string().uuid(),  
  amount: z.number().min(0),  
  installment\_number: z.number().min(1).max(2),  
  payment\_method: z.enum(\['CASH', 'BKASH', 'NAGAD', 'BANK\_TRANSFER'\]),  
  transaction\_id: z.string().optional(),  
  notes: z.string().optional(),  
});

---

📁 File Upload Specifications

Storage Location  
uploads/  
├── profiles/           \# User profile photos  
├── courses/           \# Course thumbnails  
├── assignments/       \# Assignment files  
├── submissions/       \# Student submissions  
├── projects/          \# Project screenshots  
└── certificates/      \# Generated PDFs

Validation Rules

* **Max file size:** 10MB (configurable via env)  
* **Allowed types:**  
  * Images: JPG, PNG, GIF, WEBP  
  * Documents: PDF, DOCX  
  * Archives: ZIP  
  * Videos: MP4 (for future \- currently YouTube links)  
* **Naming:** UUID \+ timestamp \+ original extension  
* **Security:** Validate MIME type, scan for malware (future)

Upload Endpoint  
@Post('upload')  
@UseInterceptors(FileInterceptor('file'))  
@UsePipes(new FileSizeValidationPipe())  
async uploadFile(  
  @UploadedFile() file: Express.Multer.File,  
  @Body() dto: UploadFileDto,  
  @CurrentUser() user: User,  
) {  
  // Save file metadata to database  
  // Return file URL  
}

---

🔔 Notifications & Emails

Email Events (Using Nodemailer)

1. **Welcome Email** \- On registration  
2. **Enrollment Confirmation** \- On course enrollment  
3. **Payment Receipt** \- On payment confirmation  
4. **Payment Reminder** \- 3 days before due date  
5. **Assignment Due** \- 1 day before deadline  
6. **Grade Notification** \- When assignment graded  
7. **Certificate Issued** \- With PDF attachment  
8. **Batch Start Reminder** \- 1 day before batch starts

Email Templates

* Use EJS or Handlebars  
* Responsive HTML templates  
* Plain text fallback

Future: SMS Integration

* Use BulkSMSBD or similar Bangladeshi provider  
* Send payment reminders, class reminders

---

📊 Business Logic & Calculations

Progress Calculation  
// Enrollment progress percentage  
const calculateProgress \= (enrollment: Enrollment) \=\> {  
  const totalAssignments \= await Assignment.count({ course\_id });  
  const completedAssignments \= await Submission.count({   
    enrollment\_id,  
    status: 'GRADED'  
  });  
    
  const assignmentProgress \= (completedAssignments / totalAssignments) \* 70;  
  const attendanceProgress \= (attendance\_percentage) \* 30;  
    
  return assignmentProgress \+ attendanceProgress;  
};

Payment Status Update  
// On payment creation  
const onPaymentCreated \= async (payment: Payment) \=\> {  
  const enrollment \= await Enrollment.findOne({ id: payment.enrollment\_id });  
    
  enrollment.amount\_paid \+= payment.amount;  
    
  if (enrollment.amount\_paid \=== 0\) {  
    enrollment.payment\_status \= 'UNPAID';  
  } else if (enrollment.amount\_paid \< enrollment.total\_fee) {  
    enrollment.payment\_status \= 'PARTIAL';  
  } else {  
    enrollment.payment\_status \= 'FULL';  
    enrollment.enrollment\_status \= 'ACTIVE';  
  }  
    
  await enrollment.save();  
};

Certificate Generation  
// When admin clicks "Generate Certificate"  
const generateCertificate \= async (enrollmentId: string) \=\> {  
  const enrollment \= await Enrollment.findOne({   
    id: enrollmentId,  
    enrollment\_status: 'COMPLETED'  
  });  
    
  if (\!enrollment) throw new Error('Not eligible');  
    
  const code \= \`BPC-${courseCode}-${year}-${sequence}\`;  
  const pdf \= await createCertificatePDF({  
    student\_name: enrollment.student.full\_name,  
    course\_name: enrollment.course.title,  
    grade: enrollment.final\_grade,  
    skills: enrollment.course.skills\_covered,  
    issue\_date: new Date(),  
    signature: 'Tanzil',  
    title: 'Founder & Lead Instructor',  
  });  
    
  const certificate \= await Certificate.create({  
    certificate\_code: code,  
    student\_id: enrollment.student\_id,  
    enrollment\_id: enrollment.id,  
    course\_id: enrollment.course\_id,  
    pdf\_path: pdf.path,  
    // ...  
  });  
    
  enrollment.certificate\_issued \= true;  
  enrollment.certificate\_id \= code;  
  await enrollment.save();  
    
  // Send email with PDF  
  await sendCertificateEmail(enrollment.student.email, pdf.path);  
    
  return certificate;  
};

Financial Report  
const getFinancialReport \= async (month: string, year: number) \=\> {  
  const revenue \= await Payment.sum('amount', {  
    where: {  
      payment\_date: Between(startDate, endDate),  
      status: 'CONFIRMED'  
    }  
  });  
    
  const expenses \= await Expense.sum('amount', {  
    where: {  
      expense\_date: Between(startDate, endDate)  
    }  
  });  
    
  const profit \= revenue \- expenses;  
    
  return { revenue, expenses, profit };  
};

---

🧪 Testing Requirements

Unit Tests

* Service methods (business logic)  
* Validation schemas (Zod)  
* Utility functions  
* Target: 80% coverage

Integration Tests

* API endpoints  
* Database operations  
* File uploads  
* Target: 70% coverage

E2E Tests (Critical flows)

1. Student enrollment → payment → course access  
2. Assignment submission → grading → progress update  
3. Course completion → certificate generation

---

🚀 Deployment Specifications

Environment Variables (.env)  
\# Application  
NODE\_ENV=production  
PORT=3000  
API\_PREFIX=api/v1

\# Database  
DB\_HOST=mysql  
DB\_PORT=3306  
DB\_USERNAME=cms\_user  
DB\_PASSWORD=\<strong-password\>  
DB\_DATABASE=programming\_club\_cms

\# JWT  
JWT\_SECRET=\<64-char-random-string\>  
JWT\_EXPIRATION=7d  
JWT\_REFRESH\_SECRET=\<64-char-random-string\>  
JWT\_REFRESH\_EXPIRATION=30d

\# File Upload  
UPLOAD\_DIR=./uploads  
MAX\_FILE\_SIZE=10485760

\# Security  
THROTTLE\_TTL=60000  
THROTTLE\_LIMIT=10

\# CORS  
CORS\_ORIGIN=https://bholaprogrammingclub.com

\# Email (Future)  
SMTP\_HOST=smtp.gmail.com  
SMTP\_PORT=587  
SMTP\_USER=noreply@bpc.com  
SMTP\_PASS=\<app-password\>

Docker Commands

**Development:**

docker-compose \-f docker-compose.dev.yml up \--build

**Production:**

docker-compose \-f docker-compose.prod.yml up \-d \--build

Database Migrations

**Generate migration:**

npm run migration:generate \-- src/database/migrations/CreateUserTable

**Run migrations:**

npm run migration:run

**Revert migration:**

npm run migration:revert

Backup Strategy (Production)

* Daily MySQL dump at 3 AM (cron job)  
* Store backups for 30 days  
* Weekly full backup to external storage

---

📋 Development Phases

Phase 1 (Week 1-2): Foundation

* \[ \] Database entities & migrations  
* \[ \] User authentication (JWT)  
* \[ \] Role-based guards  
* \[ \] File upload module

Phase 2 (Week 3-4): Core Features

* \[ \] Courses module (CRUD)  
* \[ \] Batches module  
* \[ \] Enrollments module  
* \[ \] Assignments & submissions

Phase 3 (Week 5-6): Student Features

* \[ \] Progress tracking  
* \[ \] Attendance  
* \[ \] Projects showcase  
* \[ \] Certificate generation

Phase 4 (Week 7-8): Admin & Polish

* \[ \] Payment management  
* \[ \] Financial analytics  
* \[ \] Email notifications  
* \[ \] Testing & deployment

---

🐛 Error Handling

HTTP Status Codes

* 200: Success  
* 201: Created  
* 400: Bad request (validation failed)  
* 401: Unauthorized (not logged in)  
* 403: Forbidden (insufficient permissions)  
* 404: Not found  
* 409: Conflict (duplicate entry)  
* 500: Internal server error

Custom Error Classes  
class EnrollmentNotEligibleError extends HttpException {  
  constructor() {  
    super('Student not eligible for enrollment', HttpStatus.FORBIDDEN);  
  }  
}

class PaymentAlreadyFullError extends HttpException {  
  constructor() {  
    super('Course fee already paid in full', HttpStatus.CONFLICT);  
  }  
}

---

📖 API Documentation

Swagger/OpenAPI

* Auto-generated from decorators  
* Available at /api/docs  
* Includes request/response examples  
* JWT authentication support

Example Swagger Decorators  
@ApiTags('courses')  
@ApiBearerAuth()  
@Controller('courses')  
export class CoursesController {  
    
  @ApiOperation({ summary: 'Get all courses' })  
  @ApiResponse({ status: 200, description: 'List of courses' })  
  @ApiQuery({ name: 'page', required: false, type: Number })  
  @ApiQuery({ name: 'limit', required: false, type: Number })  
  @Get()  
  async findAll(@Query() query: PaginationDto) {  
    // ...  
  }  
}

---

🔒 Security Checklist

* \[x\] Password hashing (bcrypt)  
* \[x\] JWT token validation  
* \[x\] Role-based access control  
* \[x\] SQL injection prevention (TypeORM)  
* \[x\] XSS protection (Helmet)  
* \[x\] CSRF protection  
* \[x\] Rate limiting (Throttler)  
* \[x\] File upload validation  
* \[x\] Input validation (Zod)  
* \[ \] HTTPS in production  
* \[ \] Security headers (Helmet config)  
* \[ \] API key for admin operations (future)

---

📞 Communication

Daily Standup (If team)

* What did you complete?  
* What are you working on?  
* Any blockers?

Code Review Requirements

* All PRs require review  
* Follow TypeScript best practices  
* Write tests for new features  
* Update API documentation

Git Workflow  
main (production)  
  ├── develop (staging)  
      ├── feature/user-auth  
      ├── feature/course-management  
      └── feature/payment-tracking

---

📚 Additional Resources

NestJS Documentation

* https://docs.nestjs.com

TypeORM Documentation

* https://typeorm.io

Zod Documentation

* https://zod.dev

JWT Best Practices

* https://jwt.io/introduction

---

🎯 Success Criteria

Backend is ready when:

1. ✅ All 19 database tables created with migrations  
2. ✅ User authentication working (register, login, refresh)  
3. ✅ RBAC implemented (all 5 roles functional)  
4. ✅ Core modules complete (courses, batches, enrollments, payments)  
5. ✅ File upload working  
6. ✅ Email notifications configured  
7. ✅ Swagger documentation complete  
8. ✅ Docker deployment tested  
9. ✅ All unit tests passing (80% coverage)  
10. ✅ API integration tested with Postman/Thunder Client

---

**Document Version:** 1.0  
 **Last Updated:** January 31, 2026  
 **Status:** Ready for Implementation  
 **Estimated Timeline:** 8 weeks (solo), 4 weeks (team of 2\)

---

Next Steps

1. Review this document thoroughly  
2. Set up development environment  
3. Create database migrations (Step 5\)  
4. Implement auth module (Step 6\)  
5. Build core modules incrementally

**Let's build an amazing CMS\! 🚀**

