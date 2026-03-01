import { Matches } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {
  AccessType,
  AnnouncementAudience,
  AnnouncementPriority,
  AssignmentType,
  AttendanceStatus,
  BatchStatus,
  ContentType,
  DifficultyLevel,
  EnrollmentFormStatus,
  EnrollmentStatus,
  ExpenseCategory,
  FileEntityType,
  FileType,
  GoalStatus,
  PaymentMethod,
  PaymentRecordStatus,
  PaymentStatus,
  SubmissionStatus,
  UserRole,
  UserStatus,
} from '../enums/core.enums';

@Entity('users')
@Unique('uq_users_email', ['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 191 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName!: string;

  @Column({ type: 'varchar', length: 20 })
  @Matches(/^(?:\+8801|01)[3-9]\d{8}$/)
  phone!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.GUEST })
  role!: UserRole;

  @Column({
    name: 'profile_photo',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  profilePhoto!: string | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ name: 'laptop_specs', type: 'text', nullable: true })
  laptopSpecs!: string | null;

  @Column({ name: 'internet_speed', type: 'text', nullable: true })
  internetSpeed!: string | null;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt!: Date | null;

  @OneToMany(() => CourseEntity, (course) => course.createdByUser)
  createdCourses!: CourseEntity[];

  @OneToMany(() => BatchEntity, (batch) => batch.instructor)
  instructedBatches!: BatchEntity[];
}

@Entity('courses')
@Unique('uq_courses_slug', ['slug'])
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 220 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'duration_months', type: 'int' })
  durationMonths!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price!: string;

  @Column({
    name: 'installment_plan',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  installmentPlan!: string | null;

  @Column({
    name: 'difficulty_level',
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.BEGINNER,
  })
  difficultyLevel!: DifficultyLevel;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail!: string | null;

  @Column({
    name: 'recorded_course_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  recordedCoursePrice!: string;

  @Column({ name: 'recorded_access_months', type: 'int', nullable: true })
  recordedAccessMonths!: number | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => UserEntity, (user) => user.createdCourses, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by' })
  createdByUser!: UserEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => CourseContentEntity, (content) => content.course)
  courseContents!: CourseContentEntity[];

  @OneToMany(() => BatchEntity, (batch) => batch.course)
  batches!: BatchEntity[];

  @OneToMany(() => CoursePrerequisiteEntity, (item) => item.course)
  prerequisiteLinks!: CoursePrerequisiteEntity[];

  @OneToMany(() => CoursePrerequisiteEntity, (item) => item.prerequisiteCourse)
  requiredForCourses!: CoursePrerequisiteEntity[];

  @OneToMany(() => CourseSkillEntity, (item) => item.course)
  skills!: CourseSkillEntity[];
}

@Entity('course_prerequisites')
@Unique('uq_course_prerequisite_pair', ['courseId', 'prerequisiteCourseId'])
export class CoursePrerequisiteEntity {
  @PrimaryColumn({ name: 'course_id', type: 'uuid' })
  courseId!: string;

  @PrimaryColumn({ name: 'prerequisite_course_id', type: 'uuid' })
  prerequisiteCourseId!: string;

  @ManyToOne(() => CourseEntity, (course) => course.prerequisiteLinks, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;

  @ManyToOne(() => CourseEntity, (course) => course.requiredForCourses, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'prerequisite_course_id' })
  prerequisiteCourse!: CourseEntity;
}

@Entity('course_skills')
@Unique('uq_course_skill', ['courseId', 'skill'])
export class CourseSkillEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId!: string;

  @Column({ type: 'varchar', length: 120 })
  skill!: string;

  @ManyToOne(() => CourseEntity, (course) => course.skills, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;
}

@Entity('course_contents')
@Index('idx_course_contents_course_order', [
  'courseId',
  'moduleNumber',
  'order',
])
export class CourseContentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => CourseEntity, (course) => course.courseContents, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;

  @Column({ name: 'module_number', type: 'int' })
  moduleNumber!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'content_type', type: 'enum', enum: ContentType })
  contentType!: ContentType;

  @Column({ name: 'content_url', type: 'varchar', length: 500 })
  contentUrl!: string;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes!: number | null;

  @Column({ name: 'order', type: 'int' })
  order!: number;

  @Column({ name: 'is_free_preview', type: 'boolean', default: false })
  isFreePreview!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}

@Entity('batches')
@Unique('uq_batches_batch_code', ['batchCode'])
export class BatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => CourseEntity, (course) => course.batches, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;

  @Column({ name: 'batch_name', type: 'varchar', length: 180 })
  batchName!: string;

  @Column({ name: 'batch_code', type: 'varchar', length: 80 })
  batchCode!: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  schedule!: string | null;

  @Column({ name: 'max_students', type: 'int', default: 10 })
  maxStudents!: number;

  @Column({ name: 'current_enrollment', type: 'int', default: 0 })
  currentEnrollment!: number;

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.UPCOMING })
  status!: BatchStatus;

  @Column({ name: 'instructor_id', type: 'uuid' })
  instructorId!: string;

  @ManyToOne(() => UserEntity, (user) => user.instructedBatches, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'instructor_id' })
  instructor!: UserEntity;

  @Column({
    name: 'meeting_link',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  meetingLink!: string | null;

  @Column({ name: 'is_free', type: 'boolean', default: false })
  isFree!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => BatchTaEntity, (item) => item.batch)
  tas!: BatchTaEntity[];
}

@Entity('batch_tas')
@Unique('uq_batch_ta_pair', ['batchId', 'taId'])
export class BatchTaEntity {
  @PrimaryColumn({ name: 'batch_id', type: 'uuid' })
  batchId!: string;

  @PrimaryColumn({ name: 'ta_id', type: 'uuid' })
  taId!: string;

  @ManyToOne(() => BatchEntity, (batch) => batch.tas, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ta_id' })
  ta!: UserEntity;
}

@Entity('enrollments')
@Unique('uq_enrollments_certificate_id', ['certificateId'])
@Unique('uq_enrollments_student_batch', ['studentId', 'batchId'])
export class EnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: UserEntity;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId!: string;

  @ManyToOne(() => BatchEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => CourseEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;

  @Column({ name: 'enrollment_date', type: 'date' })
  enrollmentDate!: string;

  @Column({
    name: 'enrollment_status',
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  enrollmentStatus!: EnrollmentStatus;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus!: PaymentStatus;

  @Column({
    name: 'total_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalFee!: string;

  @Column({
    name: 'amount_paid',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  amountPaid!: string;

  @Column({
    name: 'access_type',
    type: 'enum',
    enum: AccessType,
    default: AccessType.LIVE,
  })
  accessType!: AccessType;

  @Column({ name: 'access_expires_at', type: 'timestamp', nullable: true })
  accessExpiresAt!: Date | null;

  @Column({
    name: 'progress_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  progressPercentage!: string;

  @Column({ name: 'final_grade', type: 'varchar', length: 4, nullable: true })
  finalGrade!: string | null;

  @Column({ name: 'certificate_issued', type: 'boolean', default: false })
  certificateIssued!: boolean;

  @Column({
    name: 'certificate_id',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  certificateId!: string | null;

  @Column({ name: 'completion_date', type: 'date', nullable: true })
  completionDate!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}

@Entity('payments')
@Index('idx_payments_enrollment', ['enrollmentId'])
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId!: string;

  @ManyToOne(() => EnrollmentEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: EnrollmentEntity;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: UserEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ name: 'installment_number', type: 'int', nullable: true })
  installmentNumber!: number | null;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  transactionId!: string | null;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate!: string;

  @Column({ name: 'received_by', type: 'uuid', nullable: true })
  receivedBy!: string | null;

  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'received_by' })
  receiver!: UserEntity | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({
    type: 'enum',
    enum: PaymentRecordStatus,
    default: PaymentRecordStatus.PENDING,
  })
  status!: PaymentRecordStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}

@Entity('assignments')
export class AssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_content_id', type: 'uuid' })
  courseContentId!: string;

  @ManyToOne(() => CourseContentEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'course_content_id' })
  courseContent!: CourseContentEntity;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'assignment_type', type: 'enum', enum: AssignmentType })
  assignmentType!: AssignmentType;

  @Column({ name: 'max_score', type: 'int', default: 100 })
  maxScore!: number;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate!: Date | null;

  @Column({ name: 'submission_instructions', type: 'text', nullable: true })
  submissionInstructions!: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by' })
  creator!: UserEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => AssignmentRequiredFileEntity, (item) => item.assignment)
  requiredFiles!: AssignmentRequiredFileEntity[];
}

@Entity('assignment_required_files')
@Unique('uq_assignment_required_file', ['assignmentId', 'fileExtension'])
export class AssignmentRequiredFileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'assignment_id', type: 'uuid' })
  assignmentId!: string;

  @ManyToOne(() => AssignmentEntity, (assignment) => assignment.requiredFiles, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'assignment_id' })
  assignment!: AssignmentEntity;

  @Column({ name: 'file_extension', type: 'varchar', length: 40 })
  fileExtension!: string;
}

@Entity('submissions')
@Unique('uq_submissions_assignment_student', ['assignmentId', 'studentId'])
export class SubmissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'assignment_id', type: 'uuid' })
  assignmentId!: string;

  @ManyToOne(() => AssignmentEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'assignment_id' })
  assignment!: AssignmentEntity;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: UserEntity;

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId!: string;

  @ManyToOne(() => EnrollmentEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: EnrollmentEntity;

  @Column({ name: 'submission_date', type: 'timestamp' })
  submissionDate!: Date;

  @Column({ name: 'github_link', type: 'varchar', length: 500, nullable: true })
  githubLink!: string | null;

  @Column({
    name: 'live_demo_link',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  liveDemoLink!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.SUBMITTED,
  })
  status!: SubmissionStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score!: string | null;

  @Column({ type: 'text', nullable: true })
  feedback!: string | null;

  @Column({ name: 'graded_by', type: 'uuid', nullable: true })
  gradedBy!: string | null;

  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'graded_by' })
  grader!: UserEntity | null;

  @Column({ name: 'graded_at', type: 'timestamp', nullable: true })
  gradedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => SubmissionFileEntity, (file) => file.submission)
  files!: SubmissionFileEntity[];
}

@Entity('submission_files')
@Unique('uq_submission_file_path', ['submissionId', 'filePath'])
export class SubmissionFileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'submission_id', type: 'uuid' })
  submissionId!: string;

  @ManyToOne(() => SubmissionEntity, (submission) => submission.files, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'submission_id' })
  submission!: SubmissionEntity;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath!: string;
}

@Entity('attendance')
@Unique('uq_attendance_batch_date_student', [
  'batchId',
  'classDate',
  'studentId',
])
export class AttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId!: string;

  @ManyToOne(() => BatchEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity;

  @Column({ name: 'class_date', type: 'date' })
  classDate!: string;

  @Column({ name: 'class_topic', type: 'varchar', length: 200, nullable: true })
  classTopic!: string | null;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: UserEntity;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status!: AttendanceStatus;

  @Column({ name: 'marked_by', type: 'uuid' })
  markedBy!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'marked_by' })
  marker!: UserEntity;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: UserEntity;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail!: string | null;

  @Column({ name: 'github_link', type: 'varchar', length: 500, nullable: true })
  githubLink!: string | null;

  @Column({
    name: 'live_demo_link',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  liveDemoLink!: string | null;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic!: boolean;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount!: number;

  @Column({ name: 'views_count', type: 'int', default: 0 })
  viewsCount!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => ProjectTechnologyEntity, (item) => item.project)
  technologies!: ProjectTechnologyEntity[];

  @OneToMany(() => ProjectScreenshotEntity, (item) => item.project)
  screenshots!: ProjectScreenshotEntity[];
}

@Entity('project_technologies')
@Unique('uq_project_technology', ['projectId', 'technology'])
export class ProjectTechnologyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => ProjectEntity, (project) => project.technologies, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project!: ProjectEntity;

  @Column({ type: 'varchar', length: 120 })
  technology!: string;
}

@Entity('project_screenshots')
@Unique('uq_project_screenshot_path', ['projectId', 'filePath'])
export class ProjectScreenshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => ProjectEntity, (project) => project.screenshots, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project!: ProjectEntity;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath!: string;
}

@Entity('certificates')
@Unique('uq_certificates_code', ['certificateCode'])
@Unique('uq_certificates_enrollment', ['enrollmentId'])
export class CertificateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'certificate_code', type: 'varchar', length: 80 })
  certificateCode!: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: UserEntity;

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId!: string;

  @ManyToOne(() => EnrollmentEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: EnrollmentEntity;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => CourseEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  grade!: string | null;

  @Column({
    name: 'signature_name',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  signatureName!: string | null;

  @Column({
    name: 'signature_title',
    type: 'varchar',
    length: 180,
    nullable: true,
  })
  signatureTitle!: string | null;

  @Column({ name: 'pdf_path', type: 'varchar', length: 500, nullable: true })
  pdfPath!: string | null;

  @Column({ name: 'is_verified', type: 'boolean', default: true })
  isVerified!: boolean;

  @Column({
    name: 'verification_link',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  verificationLink!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @OneToMany(() => CertificateSkillEntity, (item) => item.certificate)
  skills!: CertificateSkillEntity[];
}

@Entity('certificate_skills')
@Unique('uq_certificate_skill', ['certificateId', 'skill'])
export class CertificateSkillEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'certificate_id', type: 'uuid' })
  certificateId!: string;

  @ManyToOne(() => CertificateEntity, (certificate) => certificate.skills, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'certificate_id' })
  certificate!: CertificateEntity;

  @Column({ type: 'varchar', length: 120 })
  skill!: string;
}

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'uploaded_by' })
  uploader!: UserEntity | null;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath!: string;

  @Column({ name: 'file_type', type: 'enum', enum: FileType })
  fileType!: FileType;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 120 })
  mimeType!: string;

  @Column({ name: 'entity_type', type: 'enum', enum: FileEntityType })
  entityType!: FileEntityType;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}

@Entity('expenses')
export class ExpenseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'expense_date', type: 'date' })
  expenseDate!: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category!: ExpenseCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'receipt_file',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  receiptFile!: string | null;

  @Column({ name: 'paid_by', type: 'uuid' })
  paidBy!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'paid_by' })
  payer!: UserEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}

@Entity('financial_goals')
export class FinancialGoalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'goal_name', type: 'varchar', length: 180 })
  goalName!: string;

  @Column({ name: 'target_amount', type: 'decimal', precision: 12, scale: 2 })
  targetAmount!: string;

  @Column({
    name: 'current_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  currentAmount!: string;

  @Column({ type: 'date', nullable: true })
  deadline!: string | null;

  @Column({ type: 'enum', enum: GoalStatus, default: GoalStatus.ACTIVE })
  status!: GoalStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}

@Entity('announcements')
export class AnnouncementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 220 })
  title!: string;

  @Column({ type: 'longtext' })
  content!: string;

  @Column({
    name: 'target_audience',
    type: 'enum',
    enum: AnnouncementAudience,
    default: AnnouncementAudience.ALL,
  })
  targetAudience!: AnnouncementAudience;

  @Column({ name: 'batch_id', type: 'uuid', nullable: true })
  batchId!: string | null;

  @ManyToOne(() => BatchEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'batch_id' })
  batch!: BatchEntity | null;

  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId!: string | null;

  @ManyToOne(() => CourseEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity | null;

  @Column({
    type: 'enum',
    enum: AnnouncementPriority,
    default: AnnouncementPriority.MEDIUM,
  })
  priority!: AnnouncementPriority;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ name: 'publish_date', type: 'timestamp', nullable: true })
  publishDate!: Date | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by' })
  creator!: UserEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}

@Entity('testimonials')
@Unique('uq_testimonials_student_course', ['studentId', 'courseId'])
export class TestimonialEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: UserEntity;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => CourseEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;

  @Column({ type: 'tinyint' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  review!: string | null;

  @Column({ name: 'is_approved', type: 'boolean', default: false })
  isApproved!: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'approved_by' })
  approver!: UserEntity | null;
}

@Entity('enrollment_forms')
export class EnrollmentFormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName!: string;

  @Column({ type: 'varchar', length: 191 })
  email!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ name: 'interested_course', type: 'varchar', length: 180 })
  interestedCourse!: string;

  @Column({ name: 'has_laptop', type: 'boolean', default: false })
  hasLaptop!: boolean;

  @Column({ name: 'laptop_specs', type: 'text', nullable: true })
  laptopSpecs!: string | null;

  @Column({ name: 'has_internet', type: 'boolean', default: false })
  hasInternet!: boolean;

  @Column({ name: 'why_join', type: 'text', nullable: true })
  whyJoin!: string | null;

  @Column({
    type: 'enum',
    enum: EnrollmentFormStatus,
    default: EnrollmentFormStatus.PENDING,
  })
  status!: EnrollmentFormStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
