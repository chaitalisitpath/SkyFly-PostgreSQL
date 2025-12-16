"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-200 to-white flex items-center justify-center">

            {/* ☁️ Cloud 1 – Top Left */}
            <motion.svg
                width="160"
                height="90"
                viewBox="0 0 64 32"
                className="absolute top-20 left-10 opacity-80"
                animate={{ x: [0, 150, 0] }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            >
                <path
                    d="M20 26h22a8 8 0 0 0 0-16 12 12 0 0 0-23-2A7 7 0 0 0 20 26z"
                    fill="white"
                />
            </motion.svg>

            {/* ☁️ Cloud 2 – Top Right (Far) */}
            <motion.svg
                width="140"
                height="80"
                viewBox="0 0 64 32"
                className="absolute top-32 right-16 opacity-60"
                animate={{ x: [0, -180, 0] }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            >
                <path
                    d="M20 26h22a8 8 0 0 0 0-16 12 12 0 0 0-23-2A7 7 0 0 0 20 26z"
                    fill="white"
                />
            </motion.svg>
            
            {/* ✈️ Airplane */}
            <motion.div
                className="z-10 text-4xl"
                initial={{ x: -300, y: 50 }}
                animate={{ x: 300, y: -30 }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                }}
            >
                ✈️
            </motion.div>

            {/* 📄 Content */}
            <div className="z-20 text-center px-6">
                <h1 className="text-7xl font-extrabold text-sky-700">404</h1>
                <p className="mt-4 text-xl text-gray-700">
                    Oops! This flight doesn’t exist 🚫
                </p>
                <p className="mt-2 text-gray-500">
                    Looks like your plane went off the radar.
                </p>

                <Link
                    href="/"
                    className="inline-block mt-8 px-6 py-3 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 transition"
                >
                    Back to Home 🏠
                </Link>
            </div>

            {/* 🛬 Runway */}
            <div className="absolute bottom-0 w-full h-20 bg-gray-800">
                <div className="flex justify-center items-center h-full gap-4">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="w-8 h-1 bg-yellow-400" />
                    ))}
                </div>
            </div>

        </div>
    );
}
