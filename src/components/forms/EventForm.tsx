"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createEvent, updateEvent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const EventForm = ({
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
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((formData) => {
    setServerError("");
    setIsSubmitting(true);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      setIsSubmitting(false);
      setServerError((state as any).message ?? "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  const { classes } = relatedData || {};

  // Helper to format datetime-local input default value
  const toDateTimeLocal = (date?: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="px-1 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-semibold">
          {type === "create" ? "Create a new event" : "Update the event"}
        </h1>
      </div>

      {/* Scrollable Body */}
      <div className="overflow-y-auto flex-1 py-4 pr-1">
        <form className="flex flex-col gap-6" onSubmit={onSubmit} id="event-form">

          {/* Hidden id on update */}
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

          {/* Event Details */}
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Event Details
            </span>
            <div className="flex justify-between flex-wrap gap-4 mt-3">

              {/* Title */}
              <InputField
                label="Title *"
                name="title"
                defaultValue={data?.title}
                register={register}
                error={errors.title}
              />

              {/* Description */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs text-gray-500">Description *</label>
                <textarea
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[80px] resize-none"
                  {...register("description")}
                  defaultValue={data?.description}
                  placeholder="Enter event description..."
                />
                {errors.description?.message && (
                  <p className="text-xs text-red-400">
                    {errors.description.message.toString()}
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div className="flex flex-col gap-2 w-full md:w-[48%]">
                <label className="text-xs text-gray-500">Start Time *</label>
                <input
                  type="datetime-local"
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("startTime")}
                  defaultValue={toDateTimeLocal(data?.startTime)}
                />
                {errors.startTime?.message && (
                  <p className="text-xs text-red-400">
                    {errors.startTime.message.toString()}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div className="flex flex-col gap-2 w-full md:w-[48%]">
                <label className="text-xs text-gray-500">End Time *</label>
                <input
                  type="datetime-local"
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("endTime")}
                  defaultValue={toDateTimeLocal(data?.endTime)}
                />
                {errors.endTime?.message && (
                  <p className="text-xs text-red-400">
                    {errors.endTime.message.toString()}
                  </p>
                )}
              </div>

              {/* Class (optional) */}
              <div className="flex flex-col gap-2 w-full md:w-[48%]">
                <label className="text-xs text-gray-500">
                  Class{" "}
                  <span className="text-gray-400">(optional — leave blank for all classes)</span>
                </label>
                <select
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("classId")}
                  defaultValue={data?.classId ?? ""}
                >
                  <option value="">All Classes</option>
                  {classes?.map((cls: { id: number; name: string }) => (
                    <option value={cls.id} key={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                {errors.classId?.message && (
                  <p className="text-xs text-red-400">
                    {errors.classId.message.toString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Server Error */}
          {state.error && serverError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600 font-medium">⚠ Error</p>
              <p className="text-xs text-red-500 mt-1">{serverError}</p>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="submit"
          form="event-form"
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
              {type === "create" ? "Creating Event..." : "Updating Event..."}
            </>
          ) : (
            type === "create" ? "Create Event" : "Update Event"
          )}
        </button>
      </div>
    </div>
  );
};

export default EventForm;