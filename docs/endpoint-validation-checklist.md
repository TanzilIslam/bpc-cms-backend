# Endpoint Validation Checklist

This document lists every API endpoint and its current validation coverage.

## Validation Rules Applied
- **Body validation**: DTO classes with `class-validator`, enforced by global `ValidationPipe`.
- **Path param validation**: `ParseUUIDPipe` for UUID-based `:id` parameters.
- **Special params**: Non-UUID params (like slug/code) are treated as business identifiers.

## Endpoint Inventory

| Method | Endpoint | Validation | Status |
|---|---|---|---|
| GET | `/` | No input payload | OK |
| GET | `/health` | No input payload | OK |
| POST | `/auth/register` | `RegisterDto` | OK |
| POST | `/auth/login` | `LoginDto` | OK |
| POST | `/auth/logout` | `LogoutDto` | OK |
| POST | `/auth/refresh-token` | `RefreshTokenDto` | OK |
| POST | `/auth/forgot-password` | `ForgotPasswordDto` | OK |
| POST | `/auth/reset-password` | `ResetPasswordDto` | OK |
| GET | `/courses` | No input payload | OK |
| GET | `/courses/:slug` | Slug string (business identifier) | OK |
| GET | `/courses/:id/content` | `ParseUUIDPipe` on `id` | OK |
| GET | `/projects` | No input payload | OK |
| GET | `/projects/me` | Auth user only | OK |
| POST | `/enrollment-forms` | `CreateEnrollmentFormDto` | OK |
| GET | `/certificates/verify/:code` | Certificate code string | OK |
| GET | `/certificates/me` | Auth user only | OK |
| GET | `/batches` | No input payload | OK |
| GET | `/announcements` | No input payload | OK |
| GET | `/testimonials` | No input payload | OK |
| GET | `/assignments/:id` | `ParseUUIDPipe` on `id` | OK |
| GET | `/submissions/:id` | `ParseUUIDPipe` on `id` | OK |
| POST | `/enrollments` | `CreateEnrollmentDto` | OK |
| POST | `/files/upload` | `UploadFileDto` + multer limits/filter | OK |
| GET | `/files/:id` | `ParseUUIDPipe` on `id` | OK |
| DELETE | `/files/:id` | `ParseUUIDPipe` on `id` | OK |
| GET | `/users/me` | Auth user only | OK |
| PUT | `/users/me` | `UpdateMyProfileDto` | OK |
| POST | `/users/me/avatar` | Multipart file presence/type/size check | OK |
| GET | `/payments/me` | Auth user only | OK |
| GET | `/admin/users` | Auth + role guard | OK |
| GET | `/students/me` | Auth + role guard | OK |
| GET | `/students/me/enrollments` | Auth + role guard | OK |
| GET | `/students/me/enrollments/:id/progress` | `ParseUUIDPipe` on `id` | OK |
| GET | `/students/me/assignments` | Auth + role guard | OK |
| POST | `/students/me/assignments/:id/submit` | `ParseUUIDPipe` on `id` + `SubmitAssignmentDto` | OK |
| GET | `/students/me/progress` | Auth + role guard | OK |
| GET | `/students/me/certificate` | Auth + role guard | OK |
| GET | `/students/me/payments` | Auth + role guard | OK |
| GET | `/students/me/attendance` | Auth + role guard | OK |
| GET | `/students/me/projects` | Auth + role guard | OK |
| POST | `/students/me/projects` | `CreateProjectDto` | OK |
| PUT | `/students/me/projects/:id` | `ParseUUIDPipe` on `id` + `CreateProjectDto` | OK |
| DELETE | `/students/me/projects/:id` | `ParseUUIDPipe` on `id` | OK |
| GET | `/ta/batches` | Auth + role guard | OK |
| GET | `/ta/batches/:id/students` | `ParseUUIDPipe` on `id` | OK |
| GET | `/ta/submissions` | Auth + role guard | OK |
| POST | `/ta/attendance` | `MarkAttendanceDto` | OK |
| POST | `/ta/assignments/:id/grade` | `ParseUUIDPipe` on `id` + `GradeAssignmentDto` | OK |
| GET | `/admin/students` | Auth + role guard | OK |
| POST | `/admin/courses` | `CreateCourseDto` | OK |
| PUT | `/admin/courses/:id` | `ParseUUIDPipe` + `UpdateCourseDto` | OK |
| DELETE | `/admin/courses/:id` | `ParseUUIDPipe` | OK |
| POST | `/admin/batches` | `CreateBatchDto` | OK |
| PUT | `/admin/batches/:id` | `ParseUUIDPipe` + `UpdateBatchDto` | OK |
| GET | `/admin/batches/:id/students` | `ParseUUIDPipe` | OK |
| POST | `/admin/batches/:id/assign-ta` | `ParseUUIDPipe` + `AssignTaDto` | OK |
| POST | `/admin/courses/content` | `CreateCourseContentDto` | OK |
| POST | `/admin/payments` | `RecordPaymentDto` | OK |
| GET | `/admin/payments` | No input payload | OK |
| GET | `/admin/payments/pending` | No input payload | OK |
| POST | `/admin/payments/:id/reminder` | `ParseUUIDPipe` | OK |
| POST | `/admin/assignments` | `CreateAssignmentDto` | OK |
| POST | `/admin/submissions/:id/grade` | `ParseUUIDPipe` + `GradeSubmissionDto` | OK |
| GET | `/admin/batches/:id/attendance` | `ParseUUIDPipe` | OK |
| GET | `/admin/financials` | No input payload | OK |
| GET | `/admin/analytics/dashboard` | No input payload | OK |
| GET | `/admin/analytics/revenue` | No input payload | OK |
| GET | `/admin/analytics/students` | No input payload | OK |
| GET | `/admin/analytics/courses` | No input payload | OK |
| GET | `/admin/enrollment-forms` | No input payload | OK |
| GET | `/admin/users/:id` | `ParseUUIDPipe` | OK |
| PUT | `/admin/users/:id/role` | `ParseUUIDPipe` + `UpdateUserRoleDto` | OK |
| DELETE | `/admin/users/:id` | `ParseUUIDPipe` | OK |
| POST | `/admin/enrollments` | `CreateEnrollmentDto` | OK |
| PUT | `/admin/enrollments/:id/status` | `ParseUUIDPipe` + `UpdateEnrollmentStatusDto` | OK |
| PUT | `/admin/enrollment-forms/:id/status` | `ParseUUIDPipe` + `UpdateEnrollmentFormStatusDto` | OK |
| POST | `/admin/certificates/generate` | `GenerateCertificateDto` | OK |
| GET | `/admin/courses` | No input payload | OK |
| GET | `/admin/batches` | No input payload | OK |
| GET | `/admin/enrollments` | No input payload | OK |
| GET | `/admin/certificates` | No input payload | OK |
| GET | `/admin/submissions` | No input payload | OK |
| POST | `/admin/attendance` | `MarkAttendanceDto` | OK |
| GET | `/admin/expenses` | No input payload | OK |
| POST | `/admin/expenses` | `CreateExpenseDto` | OK |
| GET | `/admin/financial-goals` | No input payload | OK |
| POST | `/admin/financial-goals` | `CreateFinancialGoalDto` | OK |
| PUT | `/admin/financial-goals/:id` | `ParseUUIDPipe` + `UpdateFinancialGoalDto` | OK |
| GET | `/admin/announcements` | No input payload | OK |
| POST | `/admin/announcements` | `CreateAnnouncementDto` | OK |
| PUT | `/admin/announcements/:id` | `ParseUUIDPipe` + `UpdateAnnouncementDto` | OK |
| GET | `/admin/testimonials` | No input payload | OK |
| PUT | `/admin/testimonials/:id` | `ParseUUIDPipe` + `UpdateTestimonialDto` | OK |

## Notes
- UUID route parameters now fail fast with `400 Bad Request` when invalid.
- Body schema validation remains centralized via global `ValidationPipe` in `main.ts`.
