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

## 2) Endpoints Overview (Implemented)

## Public endpoints

### Auth (`/api/v1/auth`)
- `POST /register`
- `POST /login`
- `POST /logout`
- `POST /refresh-token`
- `POST /forgot-password`
- `POST /reset-password`

### Courses (`/api/v1/courses`)
- `GET /`
- `GET /:slug`
- `GET /:id/content`

### Projects (`/api/v1/projects`)
- `GET /`

### Batches (`/api/v1/batches`)
- `GET /`

### Enrollment Forms (`/api/v1/enrollment-forms`)
- `POST /`

### Certificates (`/api/v1/certificates`)
- `GET /verify/:code`

### Assignments (`/api/v1/assignments`)
- `GET /:id`

### Submissions (`/api/v1/submissions`)
- `GET /:id`

## Protected endpoints

### Users (`/api/v1/users`)
- `GET /me`
- `PUT /me`
- `POST /me/avatar`

### Enrollments (`/api/v1/enrollments`) — role: `STUDENT`
- `POST /`

### Students (`/api/v1/students`) — role: `STUDENT`
- `GET /me`
- `GET /me/enrollments`
- `GET /me/enrollments/:id/progress`
- `GET /me/assignments`
- `POST /me/assignments/:id/submit`
- `GET /me/progress`
- `GET /me/certificate`
- `GET /me/payments`
- `GET /me/attendance`

### TA (`/api/v1/ta`) — roles: `TA | ADMIN | SUPER_ADMIN`
- `GET /batches/:id/students`
- `POST /attendance`
- `POST /assignments/:id/grade`

### Files (`/api/v1/files`) — roles: `ADMIN | SUPER_ADMIN | TA | STUDENT`
- `POST /upload`
- `GET /:id`
- `DELETE /:id`

### Admin (`/api/v1/admin`) — roles: `ADMIN | SUPER_ADMIN`
- `GET /students`
- `POST /courses`
- `PUT /courses/:id`
- `DELETE /courses/:id`
- `POST /batches`
- `PUT /batches/:id`
- `GET /batches/:id/students`
- `POST /batches/:id/assign-ta`
- `POST /courses/content`
- `POST /payments`
- `GET /payments`
- `GET /payments/pending`
- `POST /payments/:id/reminder`
- `POST /assignments`
- `POST /submissions/:id/grade`
- `GET /batches/:id/attendance`
- `GET /financials`
- `GET /analytics/dashboard`
- `GET /analytics/revenue`
- `GET /analytics/students`
- `GET /analytics/courses`
- `GET /enrollment-forms`
- `PUT /enrollment-forms/:id/status`
- `GET /users/:id`
- `PUT /users/:id/role`
- `DELETE /users/:id`
- `POST /enrollments`
- `PUT /enrollments/:id/status`
- `POST /certificates/generate`

### Admin Users (`/api/v1/admin/users`) — roles: `ADMIN | SUPER_ADMIN`
- `GET /`

## 3) Payload DTOs (by module)

### Auth DTOs
- `RegisterDto`, `LoginDto`, `LogoutDto`, `RefreshTokenDto`, `ForgotPasswordDto`, `ResetPasswordDto`

### Users DTOs
- `UpdateMyProfileDto`

### Enrollment Form DTOs
- `CreateEnrollmentFormDto`
- `UpdateEnrollmentFormStatusDto`

### Course/Batch DTOs
- `CreateCourseDto`, `UpdateCourseDto`
- `CreateBatchDto`, `UpdateBatchDto`, `AssignTaDto`
- `CreateCourseContentDto`

### Enrollment DTOs
- `CreateEnrollmentDto` (student enrollments module)
- `CreateEnrollmentDto` (admin enrollments flow)
- `UpdateEnrollmentStatusDto`

### Payments/Certificates DTOs
- `RecordPaymentDto`, `GenerateCertificateDto`

### Assignments/Submissions/TA DTOs
- `CreateAssignmentDto`, `GradeSubmissionDto`
- `SubmitAssignmentDto`, `GradeAssignmentDto`, `MarkAttendanceDto`

### Files DTOs
- `UploadFileDto`

## 4) Enums

## Access and user
- `UserRole`: `SUPER_ADMIN | ADMIN | TA | STUDENT | GUEST | ALUMNI`
- `UserStatus`: `ACTIVE | INACTIVE | SUSPENDED`

## Course/content lifecycle
- `DifficultyLevel`: `BEGINNER | INTERMEDIATE | ADVANCED`
- `ContentType`: `VIDEO | PDF | TEXT | LINK`
- `BatchStatus`: `UPCOMING | ONGOING | COMPLETED | CANCELLED`
- `EnrollmentStatus`: `PENDING | ACTIVE | COMPLETED | DROPPED | SUSPENDED`
- `AccessType`: `LIVE | RECORDED | BOTH`

## Payment/finance
- `PaymentStatus`: `UNPAID | PARTIAL | FULL`
- `PaymentMethod`: `CASH | BKASH | NAGAD | BANK_TRANSFER`
- `PaymentRecordStatus`: `PENDING | CONFIRMED | FAILED | REFUNDED`
- `ExpenseCategory`: `INTERNET | ELECTRICITY | EQUIPMENT | MARKETING | TA_PAYMENT | OTHER`

## Assignment/attendance/files
- `AssignmentType`: `PROJECT | QUIZ | CODE | WRITTEN`
- `SubmissionStatus`: `SUBMITTED | GRADED | REVISION_NEEDED`
- `AttendanceStatus`: `PRESENT | ABSENT | LATE | EXCUSED`
- `FileType`: `IMAGE | VIDEO | PDF | ZIP | OTHER`
- `FileEntityType`: `PROFILE | ASSIGNMENT | PROJECT | COURSE | CERTIFICATE`

## Communication/planning
- `GoalStatus`: `ACTIVE | ACHIEVED | CANCELLED`
- `AnnouncementAudience`: `ALL | BATCH_SPECIFIC | COURSE_SPECIFIC`
- `AnnouncementPriority`: `LOW | MEDIUM | HIGH`
- `EnrollmentFormStatus`: `PENDING | CONTACTED | ENROLLED | REJECTED`

## 5) Interfaces & Shared Types

- `AuthUser`: `sub`, `email`, `role`
- `ApiResponse<T>`: `success`, `message`, optional `data`, optional `meta`, `timestamp`
- `PaginationMeta`: `page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPreviousPage`
- `PaginationQuery`: `page`, `limit`, `sortBy`, `sortOrder`
- `JwtPayload`: `sub`, `email`, `roles`, `permissions`, optional `iat`, `exp`
- `TokenResponse`: `accessToken`, `refreshToken`, `expiresIn`

## 6) Notes

- Swagger tags exist, but request/response schema annotation depth can still be improved.
- Some numeric-looking fields are persisted as strings in parts of the current service/entity flow.
