"use client";

import { useState } from "react";
import Link from "next/link";
import { isAuthenticated, isAdmin, getCurrentUser } from "@/lib/auth";
import Logout from "../components/Logout";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const authenticated = isAuthenticated();
  const dashboardHref = authenticated ? (isAdmin() ? '/admin/dashboard' : '/user/dashboard') : '';
  const user = getCurrentUser();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "#", label: "Flight Status" }
  ];

  const navLinkClass = "relative px-3 py-2 font-large text-gray-700 hover:text-indigo-600 transition-colors duration-200 group";
  const navUnderline = "absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300";

  return (
    <nav className="sticky top-0 z-50 bg-slate-100 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✈</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 hidden sm:inline">SkyFly</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass}
              >
                {link.label}
                <span className={navUnderline}></span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-6">
            {authenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-indigo-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">{user?.name}</span>
                </div>
                <Link
                  href={dashboardHref}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Logout />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* <Link
                  href="/login"
                  className="px-4 py-2 text-md font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Login
                </Link> */}
                <Link
                  href="/login"
                  className="px-4 py-2 text-md font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors duration-200"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-gray-50">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-200 my-2 pt-2">
              {authenticated ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-gray-600">
                    Welcome, {user?.name}
                  </div>
                  <Link
                    href={dashboardHref}
                    className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="px-3 py-2">
                    <Logout />
                  </div>
                </>
              ) : (
                <div className="space-y-2 px-3 py-2">
                  <Link
                    href="/login"
                    className="block w-full text-center px-3 py-2 text-base font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center px-3 py-2 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
