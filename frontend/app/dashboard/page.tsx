"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token"); // or check cookies

        if (!token) {
            router.push("/login"); // redirect if not authenticated
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <>
            <button
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/login");
                }}
            >
                Logout
            </button>
            <div className="min-h-screen p-8 bg-gray-50">
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                <p>Welcome to your private dashboard! Only logged-in users can see this.</p>
            </div>

        </>

    );
}
