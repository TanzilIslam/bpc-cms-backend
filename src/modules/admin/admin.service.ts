import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AnnouncementEntity,
  AssignmentEntity,
  AssignmentRequiredFileEntity,
  AttendanceEntity,
  BatchEntity,
  BatchTaEntity,
  CertificateEntity,
  CourseContentEntity,
  CourseEntity,
  EnrollmentEntity,
  EnrollmentFormEntity,
  ExpenseEntity,
  FinancialGoalEntity,
  PaymentEntity,
  SubmissionEntity,
  TestimonialEntity,
  UserEntity,
} from '../../database/entities';
import {
  AccessType,
  AnnouncementAudience,
  AnnouncementPriority,
  EnrollmentStatus,
  GoalStatus,
  PaymentStatus,
  PaymentRecordStatus,
  UserRole,
  UserStatus,
} from '../../database/enums/core.enums';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { AuthUser } from '../../common/auth/auth-user.interface';
import { CertificatesService } from '../certificates/certificates.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { CreateCourseContentDto } from './dto/create-course-content.dto';
import { UpdateEnrollmentFormStatusDto } from './dto/update-enrollment-form-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { AssignTaDto } from './dto/assign-ta.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { MarkAttendanceDto } from '../ta/dto/mark-attendance.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(CourseContentEntity)
    private readonly courseContentRepo: Repository<CourseContentEntity>,
    @InjectRepository(BatchEntity)
    private readonly batchRepo: Repository<BatchEntity>,
    @InjectRepository(BatchTaEntity)
    private readonly batchTaRepo: Repository<BatchTaEntity>,
    @InjectRepository(AssignmentEntity)
    private readonly assignmentRepo: Repository<AssignmentEntity>,
    @InjectRepository(AssignmentRequiredFileEntity)
    private readonly assignmentRequiredFileRepo: Repository<AssignmentRequiredFileEntity>,
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepo: Repository<SubmissionEntity>,
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepo: Repository<AttendanceEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
    @InjectRepository(ExpenseEntity)
    private readonly expenseRepo: Repository<ExpenseEntity>,
    @InjectRepository(EnrollmentFormEntity)
    private readonly enrollmentFormRepo: Repository<EnrollmentFormEntity>,
    @InjectRepository(CertificateEntity)
    private readonly certificateRepo: Repository<CertificateEntity>,
    @InjectRepository(FinancialGoalEntity)
    private readonly financialGoalRepo: Repository<FinancialGoalEntity>,
    @InjectRepository(AnnouncementEntity)
    private readonly announcementRepo: Repository<AnnouncementEntity>,
    @InjectRepository(TestimonialEntity)
    private readonly testimonialRepo: Repository<TestimonialEntity>,
    private readonly certificatesService: CertificatesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  listStudents() {
    return this.userRepo.find({
      where: { role: UserRole.STUDENT },
      order: { createdAt: 'DESC' },
    });
  }

  async adminGetUserById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      profilePhoto: user.profilePhoto,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      laptopSpecs: user.laptopSpecs,
      internetSpeed: user.internetSpeed,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async adminUpdateUserRole(
    id: string,
    dto: UpdateUserRoleDto,
    actor: AuthUser,
  ) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      (user.role === UserRole.SUPER_ADMIN ||
        dto.role === UserRole.SUPER_ADMIN) &&
      actor.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can assign or modify SUPER_ADMIN role',
      );
    }

    user.role = dto.role;
    return this.userRepo.save(user);
  }

  async adminDeleteUser(id: string, actor: AuthUser) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('SUPER_ADMIN cannot be soft-deleted');
    }

    if (user.role === UserRole.ADMIN && actor.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can delete ADMIN users');
    }

    user.status = UserStatus.INACTIVE;
    await this.userRepo.save(user);

    return { message: 'User soft-deleted successfully', id: user.id };
  }

  createCourse(dto: CreateCourseDto, actor: AuthUser) {
    return this.courseRepo.save(
      this.courseRepo.create({
        title: dto.title,
        slug: dto.slug,
        description: dto.description || null,
        durationMonths: dto.durationMonths,
        price: dto.price,
        installmentPlan: dto.installmentPlan || null,
        difficultyLevel: dto.difficultyLevel,
        isPublished: dto.isPublished,
        thumbnail: dto.thumbnail || null,
        recordedCoursePrice: '0',
        recordedAccessMonths: null,
        createdBy: actor.sub,
      }),
    );
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    course.title = dto.title ?? course.title;
    course.slug = dto.slug ?? course.slug;
    course.description = dto.description ?? course.description;
    course.durationMonths = dto.durationMonths ?? course.durationMonths;
    course.price = dto.price ?? course.price;
    course.installmentPlan = dto.installmentPlan ?? course.installmentPlan;
    course.difficultyLevel = dto.difficultyLevel ?? course.difficultyLevel;
    course.isPublished = dto.isPublished ?? course.isPublished;
    course.thumbnail = dto.thumbnail ?? course.thumbnail;

    return this.courseRepo.save(course);
  }

  async deleteCourse(id: string) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.courseRepo.delete({ id: course.id });
    return { message: 'Course deleted successfully', id: course.id };
  }

  async createBatch(dto: CreateBatchDto) {
    const batch = await this.batchRepo.save(
      this.batchRepo.create({
        courseId: dto.courseId,
        batchName: dto.batchName,
        batchCode: dto.batchCode,
        startDate: dto.startDate,
        endDate: dto.endDate || null,
        schedule: dto.schedule || null,
        maxStudents: dto.maxStudents,
        status: dto.status,
        instructorId: dto.instructorId,
        meetingLink: dto.meetingLink || null,
        isFree: dto.isFree,
      }),
    );

    if (dto.taIds.length > 0) {
      await this.batchTaRepo.save(
        dto.taIds.map((taId) =>
          this.batchTaRepo.create({
            batchId: batch.id,
            taId,
          }),
        ),
      );
    }
    return batch;
  }

  async updateBatch(id: string, dto: UpdateBatchDto) {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    batch.batchName = dto.batchName ?? batch.batchName;
    batch.batchCode = dto.batchCode ?? batch.batchCode;
    batch.startDate = dto.startDate ?? batch.startDate;
    batch.endDate = dto.endDate ?? batch.endDate;
    batch.schedule = dto.schedule ?? batch.schedule;
    batch.maxStudents = dto.maxStudents ?? batch.maxStudents;
    batch.status = dto.status ?? batch.status;
    batch.instructorId = dto.instructorId ?? batch.instructorId;
    batch.meetingLink = dto.meetingLink ?? batch.meetingLink;
    batch.isFree = dto.isFree ?? batch.isFree;

    const saved = await this.batchRepo.save(batch);
    if (dto.taIds) {
      await this.batchTaRepo.delete({ batchId: batch.id });
      if (dto.taIds.length > 0) {
        await this.batchTaRepo.save(
          dto.taIds.map((taId) =>
            this.batchTaRepo.create({
              batchId: batch.id,
              taId,
            }),
          ),
        );
      }
    }

    return saved;
  }

  async batchStudents(batchId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { batchId },
      relations: { student: true },
      order: { createdAt: 'ASC' },
    });
    return enrollments.map((item) => ({
      enrollmentId: item.id,
      studentId: item.studentId,
      fullName: item.student.fullName,
      email: item.student.email,
      enrollmentStatus: item.enrollmentStatus,
      paymentStatus: item.paymentStatus,
    }));
  }

  async assignTa(batchId: string, dto: AssignTaDto) {
    const batch = await this.batchRepo.findOne({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    await this.batchTaRepo.delete({ batchId });
    if (dto.taIds.length > 0) {
      await this.batchTaRepo.save(
        dto.taIds.map((taId) =>
          this.batchTaRepo.create({
            batchId,
            taId,
          }),
        ),
      );
    }

    return { batchId, taIds: dto.taIds };
  }

  async createEnrollment(dto: CreateEnrollmentDto) {
    const batch = await this.batchRepo.findOne({ where: { id: dto.batchId } });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    if (batch.courseId !== dto.courseId) {
      throw new BadRequestException('Course does not match selected batch');
    }

    const existing = await this.enrollmentRepo.findOne({
      where: { studentId: dto.studentId, batchId: dto.batchId },
    });
    if (existing) {
      return existing;
    }

    const enrollment = this.enrollmentRepo.create({
      studentId: dto.studentId,
      batchId: dto.batchId,
      courseId: dto.courseId,
      enrollmentDate: new Date().toISOString().slice(0, 10),
      enrollmentStatus: dto.enrollmentStatus || EnrollmentStatus.PENDING,
      paymentStatus: dto.paymentStatus || PaymentStatus.UNPAID,
      totalFee: dto.totalFee || (batch.isFree ? '0' : '10000'),
      amountPaid: '0',
      accessType: dto.accessType || AccessType.BOTH,
      accessExpiresAt: null,
      progressPercentage: '0',
      finalGrade: null,
      certificateIssued: false,
      certificateId: null,
      completionDate: null,
    });

    const saved = await this.enrollmentRepo.save(enrollment);
    batch.currentEnrollment += 1;
    await this.batchRepo.save(batch);
    return saved;
  }

  async updateEnrollmentStatus(id: string, dto: UpdateEnrollmentStatusDto) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id } });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.enrollmentStatus = dto.enrollmentStatus;
    if (dto.finalGrade !== undefined) {
      enrollment.finalGrade = dto.finalGrade;
    }
    return this.enrollmentRepo.save(enrollment);
  }

  createCourseContent(dto: CreateCourseContentDto) {
    return this.courseContentRepo.save(
      this.courseContentRepo.create({
        courseId: dto.courseId,
        moduleNumber: dto.moduleNumber,
        title: dto.title,
        description: dto.description || null,
        contentType: dto.contentType,
        contentUrl: dto.contentUrl,
        durationMinutes: dto.durationMinutes || null,
        order: dto.order,
        isFreePreview: dto.isFreePreview,
      }),
    );
  }

  async recordPayment(dto: RecordPaymentDto, actor: AuthUser) {
    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        enrollmentId: dto.enrollmentId,
        studentId: dto.studentId,
        amount: dto.amount,
        installmentNumber: dto.installmentNumber || null,
        paymentMethod: dto.paymentMethod,
        transactionId: dto.transactionId || null,
        paymentDate: dto.paymentDate,
        receivedBy: actor.sub,
        notes: dto.notes || null,
        status: dto.status || undefined,
      }),
    );

    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: dto.enrollmentId },
    });
    if (enrollment) {
      const newAmount = Number(enrollment.amountPaid) + Number(dto.amount);
      enrollment.amountPaid = `${newAmount}`;
      await this.enrollmentRepo.save(enrollment);
    }
    return payment;
  }

  listPayments() {
    return this.paymentRepo.find({ order: { createdAt: 'DESC' } });
  }

  listPendingPayments() {
    return this.paymentRepo.find({
      where: { status: PaymentRecordStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  async sendPaymentReminder(paymentId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const student = await this.userRepo.findOne({
      where: { id: payment.studentId },
    });
    if (!student) {
      throw new NotFoundException('Student not found for payment reminder');
    }

    await this.notificationsService.sendEmail(
      student.email,
      'Payment reminder',
      `Payment reminder for payment ${paymentId}. Please complete outstanding dues if applicable.`,
    );

    return {
      message: 'Payment reminder sent',
      paymentId,
      studentId: payment.studentId,
    };
  }

  async createAssignment(dto: CreateAssignmentDto, actor: AuthUser) {
    const assignment = await this.assignmentRepo.save(
      this.assignmentRepo.create({
        courseContentId: dto.courseContentId,
        title: dto.title,
        description: dto.description || null,
        assignmentType: dto.assignmentType,
        maxScore: dto.maxScore || 100,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        submissionInstructions: dto.submissionInstructions || null,
        createdBy: actor.sub,
      }),
    );

    if (dto.requiredFiles && dto.requiredFiles.length > 0) {
      await this.assignmentRequiredFileRepo.save(
        dto.requiredFiles.map((ext) =>
          this.assignmentRequiredFileRepo.create({
            assignmentId: assignment.id,
            fileExtension: ext,
          }),
        ),
      );
    }

    return assignment;
  }

  async gradeSubmission(
    submissionId: string,
    dto: GradeSubmissionDto,
    actorId: string,
  ) {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    submission.score = dto.score ?? submission.score;
    submission.feedback = dto.feedback ?? submission.feedback;
    submission.status = dto.status;
    submission.gradedBy = actorId;
    submission.gradedAt = new Date();
    return this.submissionRepo.save(submission);
  }

  batchAttendance(batchId: string) {
    return this.attendanceRepo.find({
      where: { batchId },
      order: { classDate: 'DESC' },
    });
  }

  async financialDashboard() {
    const payments = await this.paymentRepo.find();
    const enrollments = await this.enrollmentRepo.find();
    const totalRevenue = payments.reduce(
      (sum, curr) => sum + Number(curr.amount),
      0,
    );
    const outstanding = enrollments.reduce(
      (sum, curr) => sum + (Number(curr.totalFee) - Number(curr.amountPaid)),
      0,
    );

    return {
      totalRevenue,
      totalPayments: payments.length,
      outstandingAmount: outstanding,
    };
  }

  async analyticsDashboard() {
    const [students, courses, enrollments] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.STUDENT } }),
      this.courseRepo.count(),
      this.enrollmentRepo.count(),
    ]);
    const revenue = await this.getConfirmedRevenue();

    return {
      totalStudents: students,
      totalCourses: courses,
      totalEnrollments: enrollments,
      totalRevenue: revenue,
    };
  }

  async analyticsRevenue() {
    const [payments, expenses] = await Promise.all([
      this.paymentRepo.find(),
      this.expenseRepo.find(),
    ]);

    const confirmedRevenue = payments
      .filter((payment) => payment.status === PaymentRecordStatus.CONFIRMED)
      .reduce((sum, curr) => sum + Number(curr.amount), 0);

    const totalExpenses = expenses.reduce(
      (sum, curr) => sum + Number(curr.amount),
      0,
    );

    return {
      revenue: confirmedRevenue,
      expenses: totalExpenses,
      profit: confirmedRevenue - totalExpenses,
    };
  }

  async analyticsStudents() {
    const [totalStudents, activeStudents, alumniStudents] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.STUDENT } }),
      this.userRepo.count({
        where: { role: UserRole.STUDENT, status: UserStatus.ACTIVE },
      }),
      this.userRepo.count({ where: { role: UserRole.ALUMNI } }),
    ]);

    return {
      totalStudents,
      activeStudents,
      alumniStudents,
      inactiveStudents: totalStudents - activeStudents,
    };
  }

  async analyticsCourses() {
    const [totalCourses, publishedCourses, totalContents] = await Promise.all([
      this.courseRepo.count(),
      this.courseRepo.count({ where: { isPublished: true } }),
      this.courseContentRepo.count(),
    ]);

    return {
      totalCourses,
      publishedCourses,
      unpublishedCourses: totalCourses - publishedCourses,
      totalContents,
    };
  }

  listEnrollmentForms() {
    return this.enrollmentFormRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateEnrollmentFormStatus(
    id: string,
    dto: UpdateEnrollmentFormStatusDto,
  ) {
    const form = await this.enrollmentFormRepo.findOne({ where: { id } });
    if (!form) {
      throw new NotFoundException('Enrollment form not found');
    }

    form.status = dto.status;
    form.notes = dto.notes ?? form.notes;

    return this.enrollmentFormRepo.save(form);
  }

  generateCertificate(dto: GenerateCertificateDto) {
    return this.certificatesService.generateForEnrollment(
      dto.enrollmentId,
      dto.signatureName || 'Founder',
      dto.signatureTitle || 'Lead Instructor',
    );
  }

  listCourses() {
    return this.courseRepo.find({ order: { createdAt: 'DESC' } });
  }

  listBatches() {
    return this.batchRepo.find({
      relations: { course: true },
      order: { createdAt: 'DESC' },
    });
  }

  listEnrollments() {
    return this.enrollmentRepo.find({ order: { createdAt: 'DESC' } });
  }

  listCertificates() {
    return this.certificateRepo.find({ order: { createdAt: 'DESC' } });
  }

  listSubmissions() {
    return this.submissionRepo.find({ order: { createdAt: 'DESC' } });
  }

  markAttendance(actorId: string, dto: MarkAttendanceDto) {
    return this.attendanceRepo.save(
      this.attendanceRepo.create({
        batchId: dto.batchId,
        classDate: dto.classDate,
        classTopic: dto.classTopic || null,
        studentId: dto.studentId,
        status: dto.status,
        markedBy: actorId,
        notes: dto.notes || null,
      }),
    );
  }

  listExpenses() {
    return this.expenseRepo.find({ order: { expenseDate: 'DESC' } });
  }

  createExpense(dto: CreateExpenseDto, actorId: string) {
    return this.expenseRepo.save(
      this.expenseRepo.create({
        expenseDate: dto.expenseDate,
        category: dto.category,
        amount: `${dto.amount}`,
        description: dto.description || null,
        paidBy: actorId,
      }),
    );
  }

  listFinancialGoals() {
    return this.financialGoalRepo.find({ order: { createdAt: 'DESC' } });
  }

  createFinancialGoal(dto: CreateFinancialGoalDto) {
    return this.financialGoalRepo.save(
      this.financialGoalRepo.create({
        goalName: dto.goalName,
        targetAmount: `${dto.targetAmount}`,
        currentAmount: dto.currentAmount ? `${dto.currentAmount}` : '0',
        deadline: dto.deadline || null,
        status: GoalStatus.ACTIVE,
      }),
    );
  }

  async updateFinancialGoal(id: string, dto: UpdateFinancialGoalDto) {
    const goal = await this.financialGoalRepo.findOne({ where: { id } });
    if (!goal) {
      throw new NotFoundException('Financial goal not found');
    }
    goal.goalName = dto.goalName ?? goal.goalName;
    goal.targetAmount =
      dto.targetAmount !== undefined ? `${dto.targetAmount}` : goal.targetAmount;
    goal.currentAmount =
      dto.currentAmount !== undefined
        ? `${dto.currentAmount}`
        : goal.currentAmount;
    goal.deadline = dto.deadline ?? goal.deadline;
    goal.status = dto.status ?? goal.status;
    return this.financialGoalRepo.save(goal);
  }

  listAnnouncements() {
    return this.announcementRepo.find({ order: { createdAt: 'DESC' } });
  }

  createAnnouncement(dto: CreateAnnouncementDto, actorId: string) {
    return this.announcementRepo.save(
      this.announcementRepo.create({
        title: dto.title,
        content: dto.content,
        targetAudience: dto.targetAudience || AnnouncementAudience.ALL,
        batchId: dto.batchId || null,
        courseId: dto.courseId || null,
        priority: dto.priority || AnnouncementPriority.MEDIUM,
        isPublished: dto.isPublished ?? false,
        publishDate: dto.publishDate ? new Date(dto.publishDate) : null,
        createdBy: actorId,
      }),
    );
  }

  async updateAnnouncement(id: string, dto: UpdateAnnouncementDto) {
    const announcement = await this.announcementRepo.findOne({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    announcement.title = dto.title ?? announcement.title;
    announcement.content = dto.content ?? announcement.content;
    announcement.targetAudience =
      dto.targetAudience ?? announcement.targetAudience;
    announcement.batchId = dto.batchId ?? announcement.batchId;
    announcement.courseId = dto.courseId ?? announcement.courseId;
    announcement.priority = dto.priority ?? announcement.priority;
    announcement.isPublished = dto.isPublished ?? announcement.isPublished;
    announcement.publishDate = dto.publishDate
      ? new Date(dto.publishDate)
      : announcement.publishDate;
    return this.announcementRepo.save(announcement);
  }

  listTestimonials() {
    return this.testimonialRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateTestimonial(
    id: string,
    dto: UpdateTestimonialDto,
    actorId: string,
  ) {
    const testimonial = await this.testimonialRepo.findOne({ where: { id } });
    if (!testimonial) {
      throw new NotFoundException('Testimonial not found');
    }
    if (dto.isApproved !== undefined) {
      testimonial.isApproved = dto.isApproved;
      testimonial.approvedBy = dto.isApproved ? actorId : null;
      testimonial.approvedAt = dto.isApproved ? new Date() : null;
    }
    if (dto.isFeatured !== undefined) {
      testimonial.isFeatured = dto.isFeatured;
    }
    return this.testimonialRepo.save(testimonial);
  }

  private async getConfirmedRevenue(): Promise<number> {
    const payments = await this.paymentRepo.find({
      where: { status: PaymentRecordStatus.CONFIRMED },
    });

    return payments.reduce((sum, curr) => sum + Number(curr.amount), 0);
  }
}
