"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const StudentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState<any>();
  const [serverError, setServerError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, formAction] = useFormState(
    type === "create" ? createStudent : updateStudent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    setServerError("");
    setIsSubmitting(true);
    formAction({ ...data, img: img?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      setIsSubmitting(false);
      const msg = (state as any).message ?? "";
      if (msg.includes("email") || msg.includes("Email")) {
        setServerError("This email is already in use. Please use a different email address.");
      } else if (msg.includes("username") || msg.includes("Username")) {
        setServerError("This username is already taken. Please choose a different username.");
      } else if (msg.includes("phone") || msg.includes("Phone")) {
        setServerError("This phone number is already registered. Please use a different number.");
      } else if (msg.includes("capacity")) {
        setServerError("This class is full. Please select a different class.");
      } else {
        setServerError("Something went wrong! Please check all fields and try again.");
      }
    }
  }, [state, router, type, setOpen]);

  const { grades, classes } = relatedData;

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Fixed Header */}
      <div className="px-1 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create a new student" : "Update the student"}
        </h1>
      </div>

      {/* Scrollable Form Body */}
      <div className="overflow-y-auto flex-1 py-4 pr-1">
        <form className="flex flex-col gap-6" onSubmit={onSubmit} id="student-form">

          {/* Info notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-600 font-medium">
              📧 Login credentials will be sent via email
            </p>
            <ul className="text-xs text-blue-500 mt-1 list-disc list-inside space-y-0.5">
              <li>Student will receive an email invite to set their own password</li>
              <li>Use student's real email address</li>
              <li>Select grade and class carefully</li>
            </ul>
          </div>

          {/* Photo preview avatar */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200 bg-gray-200 flex items-center justify-center flex-shrink-0">
              {img ? (
                <Image
                  src={img.secure_url}
                  alt="Student photo"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl text-gray-400">👤</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-600">
                {img ? "✓ Photo uploaded successfully" : "No photo uploaded yet"}
              </p>
              <p className="text-xs text-gray-400">
                {img ? "Click 'Upload a photo' below to change it" : "Photo is optional but recommended"}
              </p>
            </div>
          </div>

          {/* Authentication Information */}
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Authentication Information
            </span>
            <div className="flex justify-between flex-wrap gap-4 mt-3">
              <InputField
                label="Username *"
                name="username"
                defaultValue={data?.username}
                register={register}
                error={errors?.username}
              />
              <InputField
                label="Email * (invite will be sent here)"
                name="email"
                defaultValue={data?.email}
                register={register}
                error={errors?.email}
              />
              {/* Password only shown on update */}
              {type === "update" && (
                <InputField
                  label="New Password (leave blank to keep current)"
                  name="password"
                  type="password"
                  defaultValue=""
                  register={register}
                  error={errors?.password}
                />
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Personal Information
            </span>
            <div className="flex justify-between flex-wrap gap-4 mt-3">
              <InputField
                label="First Name *"
                name="name"
                defaultValue={data?.name}
                register={register}
                error={errors.name}
              />
              <InputField
                label="Last Name *"
                name="surname"
                defaultValue={data?.surname}
                register={register}
                error={errors.surname}
              />
              <InputField
                label="Phone *"
                name="phone"
                defaultValue={data?.phone}
                register={register}
                error={errors.phone}
              />
              <InputField
                label="Address *"
                name="address"
                defaultValue={data?.address}
                register={register}
                error={errors.address}
              />
              <InputField
                label="Blood Type *"
                name="bloodType"
                defaultValue={data?.bloodType}
                register={register}
                error={errors.bloodType}
              />
              <InputField
                label="Birthday *"
                name="birthday"
                defaultValue={data?.birthday?.toISOString().split("T")[0]}
                register={register}
                error={errors.birthday}
                type="date"
              />
              <InputField
                label="Parent Id *"
                name="parentId"
                defaultValue={data?.parentId}
                register={register}
                error={errors.parentId}
              />
              {data && (
                <InputField
                  label="Id"
                  name="id"
                  defaultValue={data?.id}
                  register={register}
                  error={errors?.id}
                  hidden
                />
              )}

              {/* Sex */}
              <div className="flex flex-col gap-2 w-full md:w-1/4">
                <label className="text-xs text-gray-500">Sex *</label>
                <select
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("sex")}
                  defaultValue={data?.sex}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
                {errors.sex?.message && (
                  <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>
                )}
              </div>

              {/* Grade */}
              <div className="flex flex-col gap-2 w-full md:w-1/4">
                <label className="text-xs text-gray-500">Grade *</label>
                <select
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("gradeId")}
                  defaultValue={data?.gradeId}
                >
                  {grades.map((grade: { id: number; level: number }) => (
                    <option value={grade.id} key={grade.id}>
                      Grade {grade.level}
                    </option>
                  ))}
                </select>
                {errors.gradeId?.message && (
                  <p className="text-xs text-red-400">{errors.gradeId.message.toString()}</p>
                )}
              </div>

              {/* Class */}
              <div className="flex flex-col gap-2 w-full md:w-1/4">
                <label className="text-xs text-gray-500">Class *</label>
                <select
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("classId")}
                  defaultValue={data?.classId}
                >
                  {classes.map(
                    (classItem: {
                      id: number;
                      name: string;
                      capacity: number;
                      _count: { students: number };
                    }) => (
                      <option value={classItem.id} key={classItem.id}>
                        {classItem.name} — {classItem._count.students}/{classItem.capacity} students
                      </option>
                    )
                  )}
                </select>
                {errors.classId?.message && (
                  <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
                )}
              </div>

              {/* Photo Upload */}
              <CldUploadWidget
                uploadPreset="school"
                onSuccess={(result, { widget }) => {
                  setImg(result.info);
                  widget.close();
                }}
              >
                {({ open }) => (
                  <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Photo (optional)</label>
                    <div
                      className={`text-xs flex items-center gap-2 cursor-pointer ring-[1.5px] p-2 rounded-md transition-colors ${
                        img
                          ? "ring-green-300 bg-green-50 text-green-600"
                          : "ring-gray-300 text-gray-500 hover:ring-blue-300 hover:bg-blue-50"
                      }`}
                      onClick={() => open()}
                    >
                      <Image src="/upload.png" alt="" width={28} height={28} />
                      <span>{img ? "✓ Photo uploaded — click to change" : "Upload a photo"}</span>
                    </div>
                  </div>
                )}
              </CldUploadWidget>
            </div>
          </div>

          {/* Server error message */}
          {state.error && serverError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600 font-medium">⚠ Error</p>
              <p className="text-xs text-red-500 mt-1">{serverError}</p>
            </div>
          )}
        </form>
      </div>

      {/* Fixed Footer with Submit Button */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="submit"
          form="student-form"
          disabled={isSubmitting}
          className={`w-full p-2 rounded-md text-white font-medium transition-all flex items-center justify-center gap-2 ${
            isSubmitting
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-400 hover:bg-blue-500 active:scale-95"
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              {type === "create" ? "Creating Student..." : "Updating Student..."}
            </>
          ) : (
            type === "create" ? "Create Student" : "Update Student"
          )}
        </button>
      </div>
    </div>
  );
};

export default StudentForm;