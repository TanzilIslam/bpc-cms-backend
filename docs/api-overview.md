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

## Protected endpoints

### Students (`/api/v1/students`) — role: `STUDENT`

- `GET /me`
  - Response `data`: student profile subset (id, contact, role/status, profile fields, login timestamps)
- `GET /me/enrollments`
  - Response `data`: enrollment list for current student
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
  - Response `data`: student certificates list

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

- `GET /students`
  - Response `data`: users filtered by `role = STUDENT`
- `POST /courses`
  - Payload: `CreateCourseDto`
  - Response `data`: saved course row
- `POST /batches`
  - Payload: `CreateBatchDto`
  - Response `data`: saved batch row
- `POST /courses/content`
  - Payload: `CreateCourseContentDto`
  - Response `data`: saved course-content row
- `POST /payments`
  - Payload: `RecordPaymentDto`
  - Response `data`: saved payment row (also updates enrollment `amountPaid`)
- `GET /financials`
  - Response `data`:
    - `totalRevenue`
    - `totalPayments`
    - `outstandingAmount`
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

## 3) Payload DTOs (by module)

### Auth DTOs
- `RegisterDto`: `email`, `password(min 8)`, `fullName`, `phone(BD regex)`, optional `address`
- `LoginDto`: `email`, `password(min 8)`
- `LogoutDto`: `refreshToken(min 10)`
- `RefreshTokenDto`: `refreshToken(min 10)`
- `ForgotPasswordDto`: `email`
- `ResetPasswordDto`: `token(min 10)`, `newPassword(min 8)`

### Enrollment form DTO
- `CreateEnrollmentFormDto`:
  - `fullName`, `email`, `phone(BD regex)`, `interestedCourse`
  - `hasLaptop`, optional `laptopSpecs`
  - `hasInternet`, optional `whyJoin`

### Student/TA/Admin/File DTOs
- `SubmitAssignmentDto`: `filePaths: string[]`, optional `githubLink`, `liveDemoLink`, `notes`
- `MarkAttendanceDto`: `batchId`, `classDate`, optional `classTopic`, `studentId`, `status(AttendanceStatus)`, optional `notes`
- `GradeAssignmentDto`: `studentId`, `score`, optional `feedback`, `status(SubmissionStatus)`
- `CreateCourseDto`: title/slug/description, duration, pricing, difficulty, publication flag, optional thumbnail
- `CreateBatchDto`: course/batch identifiers, date range, schedule, max student, status, instructor/TA mapping, meeting link, `isFree`
- `CreateCourseContentDto`: course/module/content metadata + ordering + preview flag
- `RecordPaymentDto`: enrollment+student+amount+payment metadata (+ optional status)
- `GenerateCertificateDto`: `enrollmentId`, optional `signatureName`, `signatureTitle`
- `UploadFileDto`: `entityType(FileEntityType)`, `entityId`, `isPublic`

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

## 6) Quick Notes / Gaps to Track

- Swagger decorators are present at controller/tag level, but DTO-level `@ApiProperty` response schemas are not fully described; runtime response contracts currently rely on code behavior.
- Some "numeric" domain values are persisted as strings in service/entity flows (`amount`, `price`, `score`, `fileSize`), so clients should avoid assuming strict numeric JSON types for these fields.
- `GET /students/me/certificate` path name is singular while data returns a list (`myCertificates`).
