import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoreSchema1760000000000 implements MigrationInterface {
  name = 'CreateCoreSchema1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id CHAR(36) NOT NULL PRIMARY KEY,
        email VARCHAR(191) NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role ENUM('SUPER_ADMIN','ADMIN','TA','STUDENT','GUEST','ALUMNI') NOT NULL DEFAULT 'GUEST',
        profile_photo VARCHAR(255) NULL,
        date_of_birth DATE NULL,
        address TEXT NULL,
        laptop_specs TEXT NULL,
        internet_speed TEXT NULL,
        status ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
        email_verified TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP NULL,
        CONSTRAINT uq_users_email UNIQUE (email),
        CONSTRAINT chk_users_phone_bd CHECK (phone REGEXP '^(\\\\+8801|01)[3-9][0-9]{8}$')
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE courses (
        id CHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(220) NOT NULL,
        description TEXT NULL,
        duration_months INT NOT NULL,
        price DECIMAL(12,2) NOT NULL DEFAULT 0,
        installment_plan VARCHAR(120) NULL,
        difficulty_level ENUM('BEGINNER','INTERMEDIATE','ADVANCED') NOT NULL DEFAULT 'BEGINNER',
        is_published TINYINT(1) NOT NULL DEFAULT 0,
        thumbnail VARCHAR(255) NULL,
        recorded_course_price DECIMAL(12,2) NOT NULL DEFAULT 0,
        recorded_access_months INT NULL,
        created_by CHAR(36) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT uq_courses_slug UNIQUE (slug),
        CONSTRAINT fk_courses_created_by FOREIGN KEY (created_by) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE course_prerequisites (
        course_id CHAR(36) NOT NULL,
        prerequisite_course_id CHAR(36) NOT NULL,
        PRIMARY KEY (course_id, prerequisite_course_id),
        CONSTRAINT fk_course_prereq_course FOREIGN KEY (course_id) REFERENCES courses(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_course_prereq_prerequisite FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE course_skills (
        id CHAR(36) NOT NULL PRIMARY KEY,
        course_id CHAR(36) NOT NULL,
        skill VARCHAR(120) NOT NULL,
        CONSTRAINT uq_course_skill UNIQUE (course_id, skill),
        CONSTRAINT fk_course_skills_course FOREIGN KEY (course_id) REFERENCES courses(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE course_contents (
        id CHAR(36) NOT NULL PRIMARY KEY,
        course_id CHAR(36) NOT NULL,
        module_number INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NULL,
        content_type ENUM('VIDEO','PDF','TEXT','LINK') NOT NULL,
        content_url VARCHAR(500) NOT NULL,
        duration_minutes INT NULL,
        \`order\` INT NOT NULL,
        is_free_preview TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_course_contents_course_order (course_id, module_number, \`order\`),
        CONSTRAINT fk_course_contents_course FOREIGN KEY (course_id) REFERENCES courses(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE batches (
        id CHAR(36) NOT NULL PRIMARY KEY,
        course_id CHAR(36) NOT NULL,
        batch_name VARCHAR(180) NOT NULL,
        batch_code VARCHAR(80) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NULL,
        schedule VARCHAR(160) NULL,
        max_students INT NOT NULL DEFAULT 10,
        current_enrollment INT NOT NULL DEFAULT 0,
        status ENUM('UPCOMING','ONGOING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'UPCOMING',
        instructor_id CHAR(36) NOT NULL,
        meeting_link VARCHAR(500) NULL,
        is_free TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT uq_batches_batch_code UNIQUE (batch_code),
        CONSTRAINT fk_batches_course FOREIGN KEY (course_id) REFERENCES courses(id)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_batches_instructor FOREIGN KEY (instructor_id) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE batch_tas (
        batch_id CHAR(36) NOT NULL,
        ta_id CHAR(36) NOT NULL,
        PRIMARY KEY (batch_id, ta_id),
        CONSTRAINT fk_batch_tas_batch FOREIGN KEY (batch_id) REFERENCES batches(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_batch_tas_ta FOREIGN KEY (ta_id) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE enrollments (
        id CHAR(36) NOT NULL PRIMARY KEY,
        student_id CHAR(36) NOT NULL,
        batch_id CHAR(36) NOT NULL,
        course_id CHAR(36) NOT NULL,
        enrollment_date DATE NOT NULL,
        enrollment_status ENUM('PENDING','ACTIVE','COMPLETED','DROPPED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
        payment_status ENUM('UNPAID','PARTIAL','FULL') NOT NULL DEFAULT 'UNPAID',
        total_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
        amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
        access_type ENUM('LIVE','RECORDED','BOTH') NOT NULL DEFAULT 'LIVE',
        access_expires_at TIMESTAMP NULL,
        progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
        final_grade VARCHAR(4) NULL,
        certificate_issued TINYINT(1) NOT NULL DEFAULT 0,
        certificate_id VARCHAR(80) NULL,
        completion_date DATE NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT uq_enrollments_certificate_id UNIQUE (certificate_id),
        CONSTRAINT uq_enrollments_student_batch UNIQUE (student_id, batch_id),
        CONSTRAINT chk_enrollments_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_enrollments_batch FOREIGN KEY (batch_id) REFERENCES batches(id)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE payments (
        id CHAR(36) NOT NULL PRIMARY KEY,
        enrollment_id CHAR(36) NOT NULL,
        student_id CHAR(36) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        installment_number INT NULL,
        payment_method ENUM('CASH','BKASH','NAGAD','BANK_TRANSFER') NOT NULL,
        transaction_id VARCHAR(150) NULL,
        payment_date DATE NOT NULL,
        received_by CHAR(36) NULL,
        notes TEXT NULL,
        status ENUM('PENDING','CONFIRMED','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_payments_enrollment (enrollment_id),
        CONSTRAINT fk_payments_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_payments_student FOREIGN KEY (student_id) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_payments_received_by FOREIGN KEY (received_by) REFERENCES users(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE assignments (
        id CHAR(36) NOT NULL PRIMARY KEY,
        course_content_id CHAR(36) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NULL,
        assignment_type ENUM('PROJECT','QUIZ','CODE','WRITTEN') NOT NULL,
        max_score INT NOT NULL DEFAULT 100,
        due_date TIMESTAMP NULL,
        submission_instructions TEXT NULL,
        created_by CHAR(36) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_assignments_course_content FOREIGN KEY (course_content_id) REFERENCES course_contents(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_assignments_creator FOREIGN KEY (created_by) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE assignment_required_files (
        id CHAR(36) NOT NULL PRIMARY KEY,
        assignment_id CHAR(36) NOT NULL,
        file_extension VARCHAR(40) NOT NULL,
        CONSTRAINT uq_assignment_required_file UNIQUE (assignment_id, file_extension),
        CONSTRAINT fk_assignment_required_files_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE submissions (
        id CHAR(36) NOT NULL PRIMARY KEY,
        assignment_id CHAR(36) NOT NULL,
        student_id CHAR(36) NOT NULL,
        enrollment_id CHAR(36) NOT NULL,
        submission_date TIMESTAMP NOT NULL,
        github_link VARCHAR(500) NULL,
        live_demo_link VARCHAR(500) NULL,
        notes TEXT NULL,
        status ENUM('SUBMITTED','GRADED','REVISION_NEEDED') NOT NULL DEFAULT 'SUBMITTED',
        score DECIMAL(5,2) NULL,
        feedback TEXT NULL,
        graded_by CHAR(36) NULL,
        graded_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT uq_submissions_assignment_student UNIQUE (assignment_id, student_id),
        CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_submissions_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_submissions_graded_by FOREIGN KEY (graded_by) REFERENCES users(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE submission_files (
        id CHAR(36) NOT NULL PRIMARY KEY,
        submission_id CHAR(36) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        CONSTRAINT uq_submission_file_path UNIQUE (submission_id, file_path),
        CONSTRAINT fk_submission_files_submission FOREIGN KEY (submission_id) REFERENCES submissions(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE attendance (
        id CHAR(36) NOT NULL PRIMARY KEY,
        batch_id CHAR(36) NOT NULL,
        class_date DATE NOT NULL,
        class_topic VARCHAR(200) NULL,
        student_id CHAR(36) NOT NULL,
        status ENUM('PRESENT','ABSENT','LATE','EXCUSED') NOT NULL DEFAULT 'PRESENT',
        marked_by CHAR(36) NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_attendance_batch_date_student UNIQUE (batch_id, class_date, student_id),
        CONSTRAINT fk_attendance_batch FOREIGN KEY (batch_id) REFERENCES batches(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES users(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_attendance_marked_by FOREIGN KEY (marked_by) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE projects (
        id CHAR(36) NOT NULL PRIMARY KEY,
        student_id CHAR(36) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NULL,
        thumbnail VARCHAR(255) NULL,
        github_link VARCHAR(500) NULL,
        live_demo_link VARCHAR(500) NULL,
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        is_public TINYINT(1) NOT NULL DEFAULT 1,
        likes_count INT NOT NULL DEFAULT 0,
        views_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_projects_student FOREIGN KEY (student_id) REFERENCES users(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE project_technologies (
        id CHAR(36) NOT NULL PRIMARY KEY,
        project_id CHAR(36) NOT NULL,
        technology VARCHAR(120) NOT NULL,
        CONSTRAINT uq_project_technology UNIQUE (project_id, technology),
        CONSTRAINT fk_project_technologies_project FOREIGN KEY (project_id) REFERENCES projects(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE project_screenshots (
        id CHAR(36) NOT NULL PRIMARY KEY,
        project_id CHAR(36) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        CONSTRAINT uq_project_screenshot_path UNIQUE (project_id, file_path),
        CONSTRAINT fk_project_screenshots_project FOREIGN KEY (project_id) REFERENCES projects(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE certificates (
        id CHAR(36) NOT NULL PRIMARY KEY,
        certificate_code VARCHAR(80) NOT NULL,
        student_id CHAR(36) NOT NULL,
        enrollment_id CHAR(36) NOT NULL,
        course_id CHAR(36) NOT NULL,
        issue_date DATE NOT NULL,
        grade VARCHAR(4) NULL,
        signature_name VARCHAR(150) NULL,
        signature_title VARCHAR(180) NULL,
        pdf_path VARCHAR(500) NULL,
        is_verified TINYINT(1) NOT NULL DEFAULT 1,
        verification_link VARCHAR(500) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_certificates_code UNIQUE (certificate_code),
        CONSTRAINT uq_certificates_enrollment UNIQUE (enrollment_id),
        CONSTRAINT fk_certificates_student FOREIGN KEY (student_id) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT fk_certificates_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_certificates_course FOREIGN KEY (course_id) REFERENCES courses(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE certificate_skills (
        id CHAR(36) NOT NULL PRIMARY KEY,
        certificate_id CHAR(36) NOT NULL,
        skill VARCHAR(120) NOT NULL,
        CONSTRAINT uq_certificate_skill UNIQUE (certificate_id, skill),
        CONSTRAINT fk_certificate_skills_certificate FOREIGN KEY (certificate_id) REFERENCES certificates(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE files (
        id CHAR(36) NOT NULL PRIMARY KEY,
        uploaded_by CHAR(36) NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type ENUM('IMAGE','VIDEO','PDF','ZIP','OTHER') NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(120) NOT NULL,
        entity_type ENUM('PROFILE','ASSIGNMENT','PROJECT','COURSE','CERTIFICATE') NOT NULL,
        entity_id CHAR(36) NOT NULL,
        is_public TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_files_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE expenses (
        id CHAR(36) NOT NULL PRIMARY KEY,
        expense_date DATE NOT NULL,
        category ENUM('INTERNET','ELECTRICITY','EQUIPMENT','MARKETING','TA_PAYMENT','OTHER') NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        description TEXT NULL,
        receipt_file VARCHAR(500) NULL,
        paid_by CHAR(36) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_expenses_paid_by FOREIGN KEY (paid_by) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE financial_goals (
        id CHAR(36) NOT NULL PRIMARY KEY,
        goal_name VARCHAR(180) NOT NULL,
        target_amount DECIMAL(12,2) NOT NULL,
        current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        deadline DATE NULL,
        status ENUM('ACTIVE','ACHIEVED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE announcements (
        id CHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(220) NOT NULL,
        content LONGTEXT NOT NULL,
        target_audience ENUM('ALL','BATCH_SPECIFIC','COURSE_SPECIFIC') NOT NULL DEFAULT 'ALL',
        batch_id CHAR(36) NULL,
        course_id CHAR(36) NULL,
        priority ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
        is_published TINYINT(1) NOT NULL DEFAULT 0,
        publish_date TIMESTAMP NULL,
        created_by CHAR(36) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_announcements_batch FOREIGN KEY (batch_id) REFERENCES batches(id)
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT fk_announcements_course FOREIGN KEY (course_id) REFERENCES courses(id)
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT fk_announcements_created_by FOREIGN KEY (created_by) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE testimonials (
        id CHAR(36) NOT NULL PRIMARY KEY,
        student_id CHAR(36) NOT NULL,
        course_id CHAR(36) NOT NULL,
        rating TINYINT NOT NULL,
        review TEXT NULL,
        is_approved TINYINT(1) NOT NULL DEFAULT 0,
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL,
        approved_by CHAR(36) NULL,
        CONSTRAINT uq_testimonials_student_course UNIQUE (student_id, course_id),
        CONSTRAINT fk_testimonials_student FOREIGN KEY (student_id) REFERENCES users(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_testimonials_course FOREIGN KEY (course_id) REFERENCES courses(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_testimonials_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT chk_testimonials_rating CHECK (rating >= 1 AND rating <= 5)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE enrollment_forms (
        id CHAR(36) NOT NULL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        interested_course VARCHAR(180) NOT NULL,
        has_laptop TINYINT(1) NOT NULL DEFAULT 0,
        laptop_specs TEXT NULL,
        has_internet TINYINT(1) NOT NULL DEFAULT 0,
        why_join TEXT NULL,
        status ENUM('PENDING','CONTACTED','ENROLLED','REJECTED') NOT NULL DEFAULT 'PENDING',
        notes TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT chk_enrollment_forms_phone_bd CHECK (phone REGEXP '^(\\\\+8801|01)[3-9][0-9]{8}$')
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS enrollment_forms;`);
    await queryRunner.query(`DROP TABLE IF EXISTS testimonials;`);
    await queryRunner.query(`DROP TABLE IF EXISTS announcements;`);
    await queryRunner.query(`DROP TABLE IF EXISTS financial_goals;`);
    await queryRunner.query(`DROP TABLE IF EXISTS expenses;`);
    await queryRunner.query(`DROP TABLE IF EXISTS files;`);
    await queryRunner.query(`DROP TABLE IF EXISTS certificate_skills;`);
    await queryRunner.query(`DROP TABLE IF EXISTS certificates;`);
    await queryRunner.query(`DROP TABLE IF EXISTS project_screenshots;`);
    await queryRunner.query(`DROP TABLE IF EXISTS project_technologies;`);
    await queryRunner.query(`DROP TABLE IF EXISTS projects;`);
    await queryRunner.query(`DROP TABLE IF EXISTS attendance;`);
    await queryRunner.query(`DROP TABLE IF EXISTS submission_files;`);
    await queryRunner.query(`DROP TABLE IF EXISTS submissions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS assignment_required_files;`);
    await queryRunner.query(`DROP TABLE IF EXISTS assignments;`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments;`);
    await queryRunner.query(`DROP TABLE IF EXISTS enrollments;`);
    await queryRunner.query(`DROP TABLE IF EXISTS batch_tas;`);
    await queryRunner.query(`DROP TABLE IF EXISTS batches;`);
    await queryRunner.query(`DROP TABLE IF EXISTS course_contents;`);
    await queryRunner.query(`DROP TABLE IF EXISTS course_skills;`);
    await queryRunner.query(`DROP TABLE IF EXISTS course_prerequisites;`);
    await queryRunner.query(`DROP TABLE IF EXISTS courses;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
