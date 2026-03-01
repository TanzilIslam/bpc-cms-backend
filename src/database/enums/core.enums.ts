export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TA = 'TA',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST',
  ALUMNI = 'ALUMNI',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum ContentType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  TEXT = 'TEXT',
  LINK = 'LINK',
}

export enum BatchStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  SUSPENDED = 'SUSPENDED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
}

export enum AccessType {
  LIVE = 'LIVE',
  RECORDED = 'RECORDED',
  BOTH = 'BOTH',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentRecordStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum AssignmentType {
  PROJECT = 'PROJECT',
  QUIZ = 'QUIZ',
  CODE = 'CODE',
  WRITTEN = 'WRITTEN',
}

export enum SubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  REVISION_NEEDED = 'REVISION_NEEDED',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export enum FileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  ZIP = 'ZIP',
  OTHER = 'OTHER',
}

export enum FileEntityType {
  PROFILE = 'PROFILE',
  ASSIGNMENT = 'ASSIGNMENT',
  PROJECT = 'PROJECT',
  COURSE = 'COURSE',
  CERTIFICATE = 'CERTIFICATE',
}

export enum ExpenseCategory {
  INTERNET = 'INTERNET',
  ELECTRICITY = 'ELECTRICITY',
  EQUIPMENT = 'EQUIPMENT',
  MARKETING = 'MARKETING',
  TA_PAYMENT = 'TA_PAYMENT',
  OTHER = 'OTHER',
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  ACHIEVED = 'ACHIEVED',
  CANCELLED = 'CANCELLED',
}

export enum AnnouncementAudience {
  ALL = 'ALL',
  BATCH_SPECIFIC = 'BATCH_SPECIFIC',
  COURSE_SPECIFIC = 'COURSE_SPECIFIC',
}

export enum AnnouncementPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum EnrollmentFormStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  ENROLLED = 'ENROLLED',
  REJECTED = 'REJECTED',
}
