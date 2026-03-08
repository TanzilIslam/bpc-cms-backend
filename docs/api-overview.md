# API Contract Overview

This document summarizes the current API surface in `bpc-cms-backend`, covering:
- Endpoints (route + auth/role requirements)
- Request payload DTOs
- Response shapes and envelope behavior
- Enums, interfaces, and shared types

## 1) Global API Behavior

- **Global prefix:** `api/v1` (configurable via `API_PREFIX`).
- **Success response envelope:** every successful controller return is wrapped as:
  - `success: true`
  - `message: "Request processed successfully"`
  - `data: <controller/service result>`
  - `timestamp: <ISO datetime>`
- **Error response envelope:** all uncaught/HTTP exceptions are normalized as:
  - `success: false`
  - `message: <error message>`
  - `errors: <optional error details>`
  - `timestamp`, `path`, `method`

> Practical implication: endpoint-level "response" below describes the `data` payload unless noted otherwise.

---

## 2) Endpoints Overview

## Public endpoints

### Auth (`/api/v1/auth`)

- `POST /register`
  - Payload: `RegisterDto`
  - Response `data`: `{ user, accessToken, refreshToken }`
- `POST /login`
  - Payload: `LoginDto`
  - Response `data`: `{ user, accessToken, refreshToken }`
- `POST /logout`
  - Payload: `LogoutDto`
  - Response `data`: `{ message: "Logged out" }`
- `POST /refresh-token`
  - Payload: `RefreshTokenDto`
  - Response `data`: `{ user, accessToken, refreshToken }`
- `POST /forgot-password`
  - Payload: `ForgotPasswordDto`
  - Response `data`: `{ message: "Password reset token sent if account exists" }`
- `POST /reset-password`
  - Payload: `ResetPasswordDto`
  - Response `data`: `{ message: "Password has been reset" }`

### Courses (`/api/v1/courses`)

- `GET /`
  - Auth: none
  - Response `data`: published courses list with `skillsCovered: string[]`
- `GET /:slug`
  - Auth: none
  - Response `data`: published course detail with `skillsCovered: string[]`
- `GET /:id/content`
  - Auth: none
  - Response `data`: course content list for the given course ID

### Batches (`/api/v1/batches`)

- `GET /`
  - Auth: none
  - Response `data`: public batches list

### Projects (`/api/v1/projects`)

- `GET /`
  - Auth: none
  - Response `data`: public projects list enriched with:
    - `technologiesUsed: string[]`
    - `screenshots: string[]`

### Enrollment Forms (`/api/v1/enrollment-forms`)

- `POST /`
  - Auth: none
  - Payload: `CreateEnrollmentFormDto`
  - Response `data`: persisted enrollment form row (status set to `PENDING`)

### Certificates (`/api/v1/certificates`)

- `GET /verify/:code`
  - Auth: none
  - Response `data`:
    - `certificateCode`
    - `isVerified`
    - `issueDate`
    - `grade`
    - `skillsEarned: string[]`
    - `verificationLink`

---

## Protected endpoints

### Users (`/api/v1/users`) — any authenticated role

- `GET /me`
  - Response `data`: full user profile
- `PUT /me`
  - Payload: `UpdateMyProfileDto`
  - Response `data`: updated user profile
- `POST /me/avatar`
  - Content type: `multipart/form-data`
  - File field: `file` (image/jpeg, image/png, image/gif, image/webp — max 5MB)
  - Response `data`: `{ avatarPath: string }`

### Students (`/api/v1/students`) — role: `STUDENT`

- `GET /me`
  - Response `data`: student profile subset (id, contact, role/status, profile fields, login timestamps)
- `GET /me/enrollments`
  - Response `data`: enrollment list for current student
- `GET /me/enrollments/:id/progress`
  - Response `data`: progress detail for a specific enrollment
- `GET /me/assignments`
  - Response `data`: assignments mapped from enrolled courses
- `POST /me/assignments/:id/submit`
  - Payload: `SubmitAssignmentDto`
  - Response `data`: saved submission row
- `GET /me/progress`
  - Response `data`:
    - `overallProgress: number`
    - `courses: { enrollmentId, courseId, progressPercentage }[]`
- `GET /me/certificate`
  - Response `data`: student certificates list (note: path is singular, data is a list)
- `GET /me/payments`
  - Response `data`: payment records list for current student
- `GET /me/attendance`
  - Response `data`: attendance records list for current student

### Enrollments (`/api/v1/enrollments`) — role: `STUDENT`

- `POST /`
  - Payload: `StudentCreateEnrollmentDto`
  - Response `data`: saved enrollment row

### Assignments (`/api/v1/assignments`) — any authenticated role

- `GET /:id`
  - Response `data`: assignment detail (access-controlled by role)

### Submissions (`/api/v1/submissions`) — any authenticated role

- `GET /:id`
  - Response `data`: submission detail (access-controlled by role)

### TA (`/api/v1/ta`) — roles: `TA | ADMIN | SUPER_ADMIN`

- `GET /batches/:id/students`
  - Response `data`: list of students in a batch (enrollment + student + status/payment summary)
- `POST /attendance`
  - Payload: `MarkAttendanceDto`
  - Response `data`: saved attendance row
- `POST /assignments/:id/grade`
  - Payload: `GradeAssignmentDto`
  - Response `data`: updated submission row with grade/feedback/status/gradedBy

### Admin (`/api/v1/admin`) — roles: `ADMIN | SUPER_ADMIN`

#### Students & Users
- `GET /students`
  - Response `data`: users filtered by `role = STUDENT`
- `GET /users/:id`
  - Response `data`: user record by ID
- `PUT /users/:id/role`
  - Payload: `UpdateUserRoleDto`
  - Response `data`: updated user record
- `DELETE /users/:id`
  - Response `data`: confirmation message

#### Courses
- `POST /courses`
  - Payload: `CreateCourseDto`
  - Response `data`: saved course row
- `PUT /courses/:id`
  - Payload: `UpdateCourseDto`
  - Response `data`: updated course row
- `DELETE /courses/:id`
  - Response `data`: confirmation message
- `POST /courses/content`
  - Payload: `CreateCourseContentDto`
  - Response `data`: saved course-content row

#### Batches
- `POST /batches`
  - Payload: `CreateBatchDto`
  - Response `data`: saved batch row
- `PUT /batches/:id`
  - Payload: `UpdateBatchDto`
  - Response `data`: updated batch row
- `GET /batches/:id/students`
  - Response `data`: students enrolled in the batch
- `POST /batches/:id/assign-ta`
  - Payload: `AssignTaDto`
  - Response `data`: updated batch with TA assignments
- `GET /batches/:id/attendance`
  - Response `data`: attendance records for the batch

#### Enrollments
- `POST /enrollments`
  - Payload: `AdminCreateEnrollmentDto`
  - Response `data`: saved enrollment row
- `PUT /enrollments/:id/status`
  - Payload: `UpdateEnrollmentStatusDto`
  - Response `data`: updated enrollment row

#### Enrollment Forms
- `GET /enrollment-forms`
  - Response `data`: list of all enrollment form submissions
- `PUT /enrollment-forms/:id/status`
  - Payload: `UpdateEnrollmentFormStatusDto`
  - Response `data`: updated enrollment form row

#### Assignments & Grading
- `POST /assignments`
  - Payload: `CreateAssignmentDto`
  - Response `data`: saved assignment row
- `POST /submissions/:id/grade`
  - Payload: `GradeSubmissionDto`
  - Response `data`: updated submission row with grade/feedback/status

#### Payments
- `POST /payments`
  - Payload: `RecordPaymentDto`
  - Response `data`: saved payment row (also updates enrollment `amountPaid`)
- `GET /payments`
  - Response `data`: list of all payment records
- `GET /payments/pending`
  - Response `data`: list of payment records with status `PENDING`
- `POST /payments/:id/reminder`
  - Response `data`: confirmation that reminder was sent

#### Financials & Analytics
- `GET /financials`
  - Response `data`:
    - `totalRevenue`
    - `totalPayments`
    - `outstandingAmount`
- `GET /analytics/dashboard`
  - Response `data`: overview metrics (student count, revenue, enrollments, etc.)
- `GET /analytics/revenue`
  - Response `data`: revenue breakdown data
- `GET /analytics/students`
  - Response `data`: student analytics data
- `GET /analytics/courses`
  - Response `data`: course analytics data

#### Certificates
- `POST /certificates/generate`
  - Payload: `GenerateCertificateDto`
  - Response `data`: generated (or existing) certificate row

### Files (`/api/v1/files`) — roles: `ADMIN | SUPER_ADMIN | TA | STUDENT`

- `POST /upload`
  - Content type: `multipart/form-data`
  - File field: `file`
  - Additional payload fields: `UploadFileDto`
  - Max file size: `10MB`
  - Allowed MIME types:
    - `image/jpeg`
    - `image/png`
    - `image/gif`
    - `application/pdf`
    - `text/plain`
    - `application/zip`
    - `video/mp4`
  - Response `data`: saved file metadata row
- `GET /:id`
  - Response `data`: file metadata (access-controlled — owners and admins only)
- `DELETE /:id`
  - Response `data`: confirmation message (access-controlled — owners and admins only)

### Admin Users (`/api/v1/admin/users`) — roles: `ADMIN | SUPER_ADMIN`

> Note: This is a separate controller exposed under the same admin path.

- `GET /`
  - Response `data`: list of all users (filtered by caller's role — SUPER_ADMIN sees all)

---

## 3) Payload DTOs (by module)

### Auth DTOs
- `RegisterDto`: `email`, `password(min 8)`, `fullName`, `phone(BD regex)`, optional `address`
- `LoginDto`: `email`, `password(min 8)`
- `LogoutDto`: `refreshToken(min 10)`
- `RefreshTokenDto`: `refreshToken(min 10)`
- `ForgotPasswordDto`: `email`
- `ResetPasswordDto`: `token(min 10)`, `newPassword(min 8)`

### User DTOs
- `UpdateMyProfileDto`: optional `fullName`, `phone(BD regex)`, `address`, `laptopSpecs`, `internetSpeed`, `dateOfBirth`

### Enrollment form DTO
- `CreateEnrollmentFormDto`:
  - `fullName`, `email`, `phone(BD regex)`, `interestedCourse`
  - `hasLaptop`, optional `laptopSpecs`
  - `hasInternet`, optional `whyJoin`

### Student DTOs
- `SubmitAssignmentDto`: `filePaths: string[]`, optional `githubLink`, `liveDemoLink`, `notes`
- `StudentCreateEnrollmentDto`: `batchId`

### TA DTOs
- `MarkAttendanceDto`: `batchId`, `classDate`, optional `classTopic`, `studentId`, `status(AttendanceStatus)`, optional `notes`
- `GradeAssignmentDto`: `studentId`, `score`, optional `feedback`, `status(SubmissionStatus)`

### Admin DTOs
- `CreateCourseDto`: `title`, `slug`, `description`, `durationMonths`, `price`, `difficultyLevel(DifficultyLevel)`, `isPublished`, optional `installmentPlan`, `thumbnail`
- `UpdateCourseDto`: all fields from `CreateCourseDto` but all optional
- `CreateBatchDto`: `courseId`, `batchName`, `batchCode`, `startDate`, `endDate`, `schedule`, `maxStudents`, `status(BatchStatus)`, optional `instructorId`, `taIds[]`, `meetingLink`, `isFree`
- `UpdateBatchDto`: all fields from `CreateBatchDto` but all optional
- `AssignTaDto`: `taIds: string[]`
- `CreateCourseContentDto`: course/module/content metadata + ordering + preview flag
- `AdminCreateEnrollmentDto`: `studentId`, `batchId`, `courseId`, optional `totalFee`, `paymentStatus(PaymentStatus)`, `enrollmentStatus(EnrollmentStatus)`, `accessType(AccessType)`
- `UpdateEnrollmentStatusDto`: `enrollmentStatus(EnrollmentStatus)`, optional `finalGrade`
- `UpdateEnrollmentFormStatusDto`: `status(EnrollmentFormStatus)`, optional `notes`
- `CreateAssignmentDto`: `courseContentId`, `title`, `assignmentType(AssignmentType)`, optional `description`, `maxScore`, `dueDate`, `requiredFiles[]`, `submissionInstructions`
- `GradeSubmissionDto`: optional `score`, optional `feedback`, `status(SubmissionStatus)`
- `RecordPaymentDto`: enrollment + student + amount + payment metadata (+ optional status)
- `GenerateCertificateDto`: `enrollmentId`, optional `signatureName`, `signatureTitle`
- `UpdateUserRoleDto`: `role(UserRole)`
- `UploadFileDto`: `entityType(FileEntityType)`, `entityId`, `isPublic`

---

## 4) Enums

### Access and user
- `UserRole`: `SUPER_ADMIN | ADMIN | TA | STUDENT | GUEST | ALUMNI`
- `UserStatus`: `ACTIVE | INACTIVE | SUSPENDED`

### Course/content lifecycle
- `DifficultyLevel`: `BEGINNER | INTERMEDIATE | ADVANCED`
- `ContentType`: `VIDEO | PDF | TEXT | LINK`
- `BatchStatus`: `UPCOMING | ONGOING | COMPLETED | CANCELLED`
- `EnrollmentStatus`: `PENDING | ACTIVE | COMPLETED | DROPPED | SUSPENDED`
- `AccessType`: `LIVE | RECORDED | BOTH`

### Payment/finance
- `PaymentStatus`: `UNPAID | PARTIAL | FULL`
- `PaymentMethod`: `CASH | BKASH | NAGAD | BANK_TRANSFER`
- `PaymentRecordStatus`: `PENDING | CONFIRMED | FAILED | REFUNDED`
- `ExpenseCategory`: `INTERNET | ELECTRICITY | EQUIPMENT | MARKETING | TA_PAYMENT | OTHER`

### Assignment/attendance/files
- `AssignmentType`: `PROJECT | QUIZ | CODE | WRITTEN`
- `SubmissionStatus`: `SUBMITTED | GRADED | REVISION_NEEDED`
- `AttendanceStatus`: `PRESENT | ABSENT | LATE | EXCUSED`
- `FileType`: `IMAGE | VIDEO | PDF | ZIP | OTHER`
- `FileEntityType`: `PROFILE | ASSIGNMENT | PROJECT | COURSE | CERTIFICATE`

### Communication/planning
- `GoalStatus`: `ACTIVE | ACHIEVED | CANCELLED`
- `AnnouncementAudience`: `ALL | BATCH_SPECIFIC | COURSE_SPECIFIC`
- `AnnouncementPriority`: `LOW | MEDIUM | HIGH`
- `EnrollmentFormStatus`: `PENDING | CONTACTED | ENROLLED | REJECTED`

---

## 5) Interfaces & Shared Types

- `AuthUser`
  - `sub: string`
  - `email: string`
  - `role: UserRole`
  - Used in JWT strategy validation, role guard checks, and `@CurrentUser()` decorator consumers.

- `ApiResponse<T>`
  - `success`, `message`, optional `data`, optional `meta`, `timestamp`
  - Implemented by the global `TransformInterceptor` as default success envelope.

- `PaginationMeta`
  - `page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPreviousPage`

- `PaginationQuery`
  - `page`, `limit`, `sortBy`, `sortOrder('ASC'|'DESC')`

- `JwtPayload`
  - `sub`, `email`, `roles`, `permissions`, optional `iat`, `exp`
  - Note: actual JWT strategy currently validates against `AuthUser` shape (`role` singular).

- `TokenResponse`
  - `accessToken`, `refreshToken`, `expiresIn`
  - Note: current auth service returns token pair + embedded user object.

---

## 6) Notes & Known Quirks

- **Swagger docs** are present at controller/tag level, but DTO-level `@ApiProperty` response schemas are not fully described; runtime response contracts currently rely on code behavior.
- **Numeric fields as strings:** some domain values are persisted and returned as strings (`amount`, `price`, `score`, `fileSize`) — clients should not assume strict numeric JSON types for these fields.
- **`GET /students/me/certificate`** path is singular but the response returns a list.
- **Two enrollment creation endpoints exist with different payloads:**
  - `POST /api/v1/enrollments` — student self-enrollment, only requires `batchId`
  - `POST /api/v1/admin/enrollments` — admin-initiated enrollment, requires full student/batch/course/fee details
- **Two grading workflows exist:**
  - `POST /api/v1/ta/assignments/:id/grade` — TA grades by assignment ID, requires `studentId` + `score`
  - `POST /api/v1/admin/submissions/:id/grade` — admin grades by submission ID, `score` is optional
- **`GET /admin/users` vs `GET /admin/users/:id`:** the list endpoint is on a separate controller (`AdminUsersController`) under the same path prefix.
- **Avatar upload** (`POST /users/me/avatar`) only accepts images (jpeg/png/gif/webp), max 5MB — separate from the general `/files/upload` endpoint.
