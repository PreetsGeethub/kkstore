"use client";

import { useAuth } from "@/components/Auth";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="border border-[#E8D8C5] bg-white p-6">
      <h2 className="mb-5 font-[var(--font-playfair)] text-lg text-[#2A1E17]">
        Profile Details
      </h2>

      <div className="space-y-4 font-sans text-sm">
        <div className="flex justify-between border-b border-[#E8D8C5] pb-3">
          <span className="text-[#4A4A4A]">Name</span>
          <span className="text-[#2A1E17]">{user.firstName} {user.lastName}</span>
        </div>
        <div className="flex justify-between border-b border-[#E8D8C5] pb-3">
          <span className="text-[#4A4A4A]">Email</span>
          <span className="text-[#2A1E17]">{user.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4A4A4A]">Phone</span>
          <span className="text-[#2A1E17]">{user.phone}</span>
        </div>
      </div>
    </div>
  );
}