import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").toUpperCase(),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "LECTURER", "HOD", "QA_OFFICER", "ADMIN"]),
  departmentId: z.string().optional(),
  level: z.coerce.number().int().min(100).max(500).optional(),
  staffId: z.string().optional(),
  studentId: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["STUDENT", "LECTURER", "HOD", "QA_OFFICER", "ADMIN"]),
  departmentId: z.string().optional(),
  level: z.coerce.number().int().min(100).max(500).optional(),
  staffId: z.string().optional(),
  studentId: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const courseSchema = z.object({
  title: z.string().min(2, "Title is required"),
  code: z.string().min(2, "Code is required"),
  unit: z.coerce.number().int().min(1).max(6),
  departmentId: z.string().min(1, "Department is required"),
  lecturerId: z.string().min(1, "Lecturer is required"),
  semester: z.coerce.number().int().min(1).max(2),
  level: z.coerce.number().int().min(100).max(500),
});

export const periodSchema = z.object({
  title: z.string().min(2, "Title is required"),
  academicYear: z.string().min(4, "Academic year is required"),
  semester: z.coerce.number().int().min(1).max(2),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  courseIds: z.array(z.string()).min(1, "At least one course is required"),
});

export const questionSchema = z.object({
  text: z.string().min(5, "Question text is required"),
  category: z.string().min(2, "Category is required"),
  order: z.coerce.number().int().min(1),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type PeriodInput = z.infer<typeof periodSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
