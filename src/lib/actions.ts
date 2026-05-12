"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import {Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

type CurrentState = { success: boolean; error: boolean; message?: string };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({ data });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: { id: data.id },
      data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const tempPassword = data.password && data.password.trim() !== ""
  ? data.password
  : Math.random().toString(36).slice(-12) + "Aa1";
    
    // Step 1: Create the Clerk user
    const user = await clerkClient.users.createUser({
      username: data.username,
      emailAddress: [data.email!],
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
      skipPasswordChecks: true,
      password: tempPassword,
    });

    // Step 2: Save to DB
    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // Step 3: Send ONE welcome email via Resend with the temp password
    await resend.emails.send({
      from: "SchooLama <onboarding@golfestatee.in>",
      to: data.email!,
      subject: "Welcome to SchooLama - Your Login Details",
      html: `
        <h2>Welcome to SchooLama, ${data.name}!</h2>
        <p>Your account has been created. Here are your login details:</p>
        <p><strong>Username:</strong> ${data.username}</p>
        <p><strong>Login URL:</strong> <a href="https://golfestatee.in">https://golfestatee.in</a></p>
        <p>your temporary password is: ${tempPassword}</p>
      `,
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: "Teacher ID is missing." };
  }
  try {
    await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: { id: data.id },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);
    await prisma.teacher.delete({
      where: { id: id },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true, message: "Class capacity is full." };
    }

    // Create Clerk user with email
    const user = await clerkClient.users.createUser({
      username: data.username,
      emailAddress: [data.email!],
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
      skipPasswordChecks: true,
      password: Math.random().toString(36).slice(-12) + "Aa1!", // temp random password
    });

    // Send invitation email - user will set their own password
    try {
      await clerkClient.invitations.createInvitation({
        emailAddress: data.email!,
        publicMetadata: { role: "student" },
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://golfestatee.in"}/`,
        ignoreExisting: true,
      });
    } catch (inviteErr) {
      console.log("Invite email error (non-critical):", inviteErr);
    }

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: "Student ID is missing." };
  }
  try {
    await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: { id: data.id },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);
    await prisma.student.delete({
      where: { id: id },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.exam.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};
export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
      },
    });
    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
      },
    });
    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.event.delete({
      where: { id: parseInt(id) },
    });
    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: (err as any)?.message ?? "" };
  }
};