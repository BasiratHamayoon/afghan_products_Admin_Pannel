"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, UserPlus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import UserForm from "@/components/users/UserForm";
import { createUser } from "@/store/actions/usersActions";
import toast from "react-hot-toast";

export default function AddUserPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await dispatch(createUser(data));
      if (res?.success) {
        toast.success("User created successfully!");
        router.push("/users-sellers");
      } else {
        toast.error("Failed to create user");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader
        title="Add New User"
        description="Create a new user account on the platform"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/users-sellers")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </motion.button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(15,105,176,0.1)" }}
          >
            <UserPlus className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">User Information</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Fill in the details to create a new user account
            </p>
          </div>
        </div>

        <UserForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/users-sellers")}
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
}