"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/services/auth.service";
import { PowerIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";

const Logout: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <>
      {/* Logout Button */}
      <button
        className="p-2 text-black rounded-lg transition-colors duration-200"
        onClick={() => setIsModalOpen(true)}
        title="Logout"
      >
        <PowerIcon  className="w-5 h-5" />
      </button>

      {/* Modal Portal - renders at document body level */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/2 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-gray-200 transform transition-all duration-300 scale-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <PowerIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Confirm Logout
              </h2>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to log out? You will need to sign in again to access your account.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Logout;