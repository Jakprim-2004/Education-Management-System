-- ============================================
-- ระบบจัดการการศึกษา (Education Management System)
-- Database Schema Design
-- ============================================

-- ===================== 1. USERS =====================
-- ตารางผู้ใช้หลัก (ใช้ร่วมกันทุก role)
CREATE TABLE users (
    user_id         INT PRIMARY KEY AUTO_INCREMENT,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('student', 'teacher', 'admin') NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===================== 2. OTP VERIFICATION =====================
-- สำหรับรีเซ็ตรหัสผ่าน / ยืนยันตัวตน
CREATE TABLE otp_verifications (
    otp_id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,
    otp_code        VARCHAR(6) NOT NULL,
    purpose         ENUM('reset_password', 'register') NOT NULL,
    expires_at      DATETIME NOT NULL,
    is_used         BOOLEAN DEFAULT FALSE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ===================== 3. FACULTIES & DEPARTMENTS =====================
CREATE TABLE faculties (
    faculty_id      INT PRIMARY KEY AUTO_INCREMENT,
    faculty_name    VARCHAR(200) NOT NULL,
    faculty_code    VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE departments (
    department_id   INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id      INT NOT NULL,
    department_name VARCHAR(200) NOT NULL,
    department_code VARCHAR(10) NOT NULL UNIQUE,
    FOREIGN KEY (faculty_id) REFERENCES faculties(faculty_id)
);

-- ===================== 4. STUDENTS =====================
CREATE TABLE students (
    student_id      INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL UNIQUE,
    student_code    VARCHAR(20) NOT NULL UNIQUE,
    department_id   INT NOT NULL,
    admission_year  INT NOT NULL,
    status          ENUM('active', 'graduated', 'suspended', 'retired') DEFAULT 'active',
    advisor_id      INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (advisor_id) REFERENCES teachers(teacher_id)
);

-- ===================== 5. TEACHERS =====================
CREATE TABLE teachers (
    teacher_id      INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL UNIQUE,
    teacher_code    VARCHAR(20) NOT NULL UNIQUE,
    department_id   INT NOT NULL,
    position        VARCHAR(100),
    specialization  VARCHAR(300),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- ===================== 6. CURRICULUM =====================
CREATE TABLE curriculums (
    curriculum_id   INT PRIMARY KEY AUTO_INCREMENT,
    curriculum_name VARCHAR(300) NOT NULL,
    department_id   INT NOT NULL,
    year            INT NOT NULL,
    total_credits   INT NOT NULL,
    status          ENUM('active', 'inactive') DEFAULT 'active',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- ===================== 7. COURSES =====================
CREATE TABLE courses (
    course_id       INT PRIMARY KEY AUTO_INCREMENT,
    course_code     VARCHAR(20) NOT NULL UNIQUE,
    course_name     VARCHAR(300) NOT NULL,
    credits         INT NOT NULL,
    course_type     ENUM('required', 'elective', 'general') NOT NULL,
    department_id   INT,
    description     TEXT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- หมวดวิชาในหลักสูตร
CREATE TABLE curriculum_courses (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    curriculum_id   INT NOT NULL,
    course_id       INT NOT NULL,
    semester        INT,
    year_level      INT,
    FOREIGN KEY (curriculum_id) REFERENCES curriculums(curriculum_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE (curriculum_id, course_id)
);

-- ===================== 8. SEMESTERS =====================
CREATE TABLE semesters (
    semester_id     INT PRIMARY KEY AUTO_INCREMENT,
    semester_name   VARCHAR(50) NOT NULL,
    academic_year   INT NOT NULL,
    semester_number INT NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    is_current      BOOLEAN DEFAULT FALSE
);

-- ===================== 9. COURSE SECTIONS =====================
-- กลุ่มเรียน (Section) ของแต่ละวิชาในแต่ละเทอม
CREATE TABLE course_sections (
    section_id      INT PRIMARY KEY AUTO_INCREMENT,
    course_id       INT NOT NULL,
    semester_id     INT NOT NULL,
    section_number  VARCHAR(10) NOT NULL,
    teacher_id      INT NOT NULL,
    max_students    INT DEFAULT 50,
    current_students INT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
);

-- ===================== 10. SCHEDULES =====================
-- ตารางเรียนของแต่ละ section
CREATE TABLE schedules (
    schedule_id     INT PRIMARY KEY AUTO_INCREMENT,
    section_id      INT NOT NULL,
    day_of_week     ENUM('MON','TUE','WED','THU','FRI','SAT','SUN') NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    room            VARCHAR(50),
    building        VARCHAR(100),
    FOREIGN KEY (section_id) REFERENCES course_sections(section_id) ON DELETE CASCADE
);

-- ===================== 11. ENROLLMENTS =====================
-- การลงทะเบียนเรียน
CREATE TABLE enrollments (
    enrollment_id   INT PRIMARY KEY AUTO_INCREMENT,
    student_id      INT NOT NULL,
    section_id      INT NOT NULL,
    status          ENUM('enrolled', 'dropped', 'withdrawn') DEFAULT 'enrolled',
    grade           VARCHAR(5),
    enrolled_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (section_id) REFERENCES course_sections(section_id),
    UNIQUE (student_id, section_id)
);

-- ===================== 12. COURSE PLANNER =====================
-- แผนการเรียนส่วนตัวของนิสิต
CREATE TABLE course_plans (
    plan_id         INT PRIMARY KEY AUTO_INCREMENT,
    student_id      INT NOT NULL,
    course_id       INT NOT NULL,
    planned_semester INT NOT NULL,
    planned_year    INT NOT NULL,
    status          ENUM('planned', 'completed', 'skipped') DEFAULT 'planned',
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- ===================== 13. MAKEUP CLASSES =====================
-- การเรียนชดเชย
CREATE TABLE makeup_classes (
    makeup_id       INT PRIMARY KEY AUTO_INCREMENT,
    section_id      INT NOT NULL,
    original_date   DATE NOT NULL,
    makeup_date     DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    room            VARCHAR(50),
    reason          TEXT,
    status          ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_by      INT NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES course_sections(section_id),
    FOREIGN KEY (created_by) REFERENCES teachers(teacher_id)
);

-- ===================== 14. ANNOUNCEMENTS =====================
CREATE TABLE announcements (
    announcement_id INT PRIMARY KEY AUTO_INCREMENT,
    title           VARCHAR(300) NOT NULL,
    content         TEXT NOT NULL,
    target_role     ENUM('all', 'student', 'teacher') DEFAULT 'all',
    is_pinned       BOOLEAN DEFAULT FALSE,
    created_by      INT NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ===================== 15. NOTIFICATIONS =====================
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,
    title           VARCHAR(300) NOT NULL,
    message         TEXT,
    type            ENUM('schedule', 'enrollment', 'announcement', 'makeup', 'system') NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ===================== 16. IMPORT LOGS =====================
-- บันทึกการนำเข้าข้อมูล (CSV) โดย Admin
CREATE TABLE import_logs (
    import_id       INT PRIMARY KEY AUTO_INCREMENT,
    imported_by     INT NOT NULL,
    file_name       VARCHAR(300) NOT NULL,
    import_type     ENUM('students', 'courses', 'enrollments', 'teachers') NOT NULL,
    total_rows      INT DEFAULT 0,
    success_rows    INT DEFAULT 0,
    error_rows      INT DEFAULT 0,
    status          ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (imported_by) REFERENCES users(user_id)
);
