"use client";

import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { Eye, EyeClosed } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token, adminUser } = useAdminAuth();

  useEffect(() => {
    if (!adminUser) return;
    setRole(adminUser?.role);
    setEmail(adminUser?.email);
    setName(adminUser?.name);
    setPhone(adminUser?.phone);
  }, [adminUser]);

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!name || !email || !phone || !role) {
      setIsLoading(false);
      return toast.error("Missing fields required!");
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/req/updateProfile`;
      const method = "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, name, phone }),
      });
      const res = await response.json();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log("Error updating name:", error);
      toast.error("An error occurred!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword)
      return toast.error("Please fill all password fields.");
    if (newPassword !== confirmNewPassword)
      return toast.error("New passwords do not match.");
    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters.");

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/req/updateMyPassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, currentPassword, newPassword }),
        }
      );
      const res = await response.json();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Password update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-14">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Profile Settings
      </h1>

      <form className="space-y-6">
        {/* Profile Details */}
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-md w-full">
          <h2 className="text-lg font-semibold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">
            My Profile Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2 mt-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2 md:col-span-2 mt-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2 md:col-span-2 mt-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <h3 className="text-green-600 dark:text-green-400 text-lg capitalize">
              {role}
            </h3>
          </div>

          <div onClick={handleSubmit} className="flex justify-start mt-3">
            <button
              type="button"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-md w-full">
          <h2 className="text-lg font-semibold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-200">
            Change Password
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mt-5 flex flex-col gap-2">
              <label className="text-gray-700 dark:text-gray-300">New Password</label>
              <div className="flex relative items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div
                  className="absolute right-4 cursor-pointer text-gray-600 dark:text-gray-300"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <Eye /> : <EyeClosed />}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <label className="text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <label className="text-gray-700 dark:text-gray-300">Current Password</label>
              <div className="flex relative items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div onClick={handleUpdatePassword} className="flex justify-start mt-3">
            <button
              type="button"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
