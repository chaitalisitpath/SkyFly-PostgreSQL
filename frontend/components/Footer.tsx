// app/components/Footer.tsx
"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo / Brand */}
        <div className="text-2xl font-bold">
          SkyFly Airlines
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-lg">
          <Link href="#services" className="hover:text-gray-300 transition">
            Services
          </Link>
          <Link href="#destinations" className="hover:text-gray-300 transition">
            Destinations
          </Link>
          <Link href="#reviews" className="hover:text-gray-300 transition">
            Reviews
          </Link>
          <Link href="#contact" className="hover:text-gray-300 transition">
            Contact
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm md:text-base">
          © 2025 SkyFly Airlines — All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
