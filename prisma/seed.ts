import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const QUESTIONS = [
  { text: "The lecturer explains concepts clearly and at an appropriate pace.", category: "Delivery", order: 1 },
  { text: "The lecturer uses relevant examples to illustrate key points.", category: "Delivery", order: 2 },
  { text: "The lecturer arrives on time and makes efficient use of class time.", category: "Punctuality", order: 3 },
  { text: "The lecturer follows the course schedule and covers all required topics.", category: "Punctuality", order: 4 },
  { text: "Assessments (tests, assignments, exams) reflect the course content taught.", category: "Assessment", order: 5 },
  { text: "Feedback on assignments and tests is provided in a timely manner.", category: "Assessment", order: 6 },
  { text: "The lecturer encourages student participation and questions.", category: "Interaction", order: 7 },
  { text: "The lecturer is approachable and available for consultation.", category: "Interaction", order: 8 },
  { text: "Course materials and resources provided are relevant and helpful.", category: "Resources", order: 9 },
  { text: "Overall, I am satisfied with the quality of teaching in this course.", category: "Overall", order: 10 },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.$transaction([
    prisma.evaluationResponse.deleteMany(),
    prisma.evaluationSubmission.deleteMany(),
    prisma.evaluationPeriodCourse.deleteMany(),
    prisma.evaluationPeriod.deleteMany(),
    prisma.courseEnrollment.deleteMany(),
    prisma.course.deleteMany(),
    prisma.hod.deleteMany(),
    prisma.qaOfficer.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.lecturer.deleteMany(),
    prisma.student.deleteMany(),
    prisma.evaluationQuestion.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.user.deleteMany(),
    prisma.department.deleteMany(),
  ]);

  const hash = (pwd: string) => bcrypt.hashSync(pwd, 12);
  const password = hash("Password123!");

  // Department
  const csDept = await prisma.department.create({
    data: { name: "Computer Science", code: "CS" },
  });

  const eeDept = await prisma.department.create({
    data: { name: "Electrical Engineering", code: "EE" },
  });

  // Admin
  await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@evaltrack.edu.ng",
      password,
      role: "ADMIN",
      staffId: "ADM001",
      admin: { create: {} },
    },
  });

  // QA Officer
  await prisma.user.create({
    data: {
      name: "Quality Assurance Officer",
      email: "qa@evaltrack.edu.ng",
      password,
      role: "QA_OFFICER",
      staffId: "QA001",
      qaOfficer: { create: {} },
    },
  });

  // HOD
  const hodUser = await prisma.user.create({
    data: {
      name: "Dr. Amaka Okonkwo",
      email: "hod.cs@evaltrack.edu.ng",
      password,
      role: "HOD",
      staffId: "HOD001",
      hod: { create: { departmentId: csDept.id } },
    },
  });
  void hodUser;

  // Lecturer
  const lecturerUser = await prisma.user.create({
    data: {
      name: "Dr. Emeka Chukwu",
      email: "lecturer@evaltrack.edu.ng",
      password,
      role: "LECTURER",
      staffId: "LEC001",
      lecturer: { create: { departmentId: csDept.id } },
    },
  });

  const lecturer = await prisma.lecturer.findUnique({ where: { userId: lecturerUser.id } });

  // Course
  const course = await prisma.course.create({
    data: {
      title: "Introduction to Programming",
      code: "CS101",
      unit: 3,
      departmentId: csDept.id,
      lecturerId: lecturer!.id,
      semester: 1,
      level: 100,
    },
  });

  // Student
  const studentUser = await prisma.user.create({
    data: {
      name: "Chidi Obiora",
      email: "student@evaltrack.edu.ng",
      password,
      role: "STUDENT",
      studentId: "STU001",
      student: { create: { departmentId: csDept.id, level: 100 } },
    },
  });

  const student = await prisma.student.findUnique({ where: { userId: studentUser.id } });

  // Enroll student
  await prisma.courseEnrollment.create({
    data: { studentId: student!.id, courseId: course.id },
  });

  // Questions
  await prisma.evaluationQuestion.createMany({ data: QUESTIONS });

  // Second lecturer for EE dept
  await prisma.user.create({
    data: {
      name: "Prof. Bello Abubakar",
      email: "lecturer2@evaltrack.edu.ng",
      password,
      role: "LECTURER",
      staffId: "LEC002",
      lecturer: { create: { departmentId: eeDept.id } },
    },
  });

  console.log("Seed complete!");
  console.log("Test credentials:");
  console.log("  Admin: admin@evaltrack.edu.ng / Password123!");
  console.log("  QA: qa@evaltrack.edu.ng / Password123!");
  console.log("  HOD: hod.cs@evaltrack.edu.ng / Password123!");
  console.log("  Lecturer: lecturer@evaltrack.edu.ng / Password123!");
  console.log("  Student: student@evaltrack.edu.ng / Password123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
