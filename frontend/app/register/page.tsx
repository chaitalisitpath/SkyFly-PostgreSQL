"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../services/auth.service";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, googleLogin } from "../../services/auth.service";

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  dob?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return "Full name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return undefined;
  };

  const validatePhone = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Phone number is required";
    }
    // Loose client-side check; backend enforces region format
    const phoneRegex = /^[+0-9]{10,15}$/;
    if (!phoneRegex.test(value.replace(/\s|-/g, ""))) {
      return "Enter a valid phone (e.g., +919876543210)";
    }
    return undefined;
  };

  const validateDob = (value: string): string | undefined => {
    if (!value) {
      return "Date of birth is required";
    }
    // Basic age check: at least 12 years old
    const dobDate = new Date(value);
    if (isNaN(dobDate.getTime())) {
      return "Enter a valid date";
    }
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
    if (dobDate > minDate) {
      return "You must be at least 12 years old";
    }
    return undefined;
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const phoneError = validatePhone(phone);
    const dobError = validateDob(dob);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    if (phoneError) errors.phone = phoneError;
    if (dobError) errors.dob = dobError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation handlers
  const handleNameChange = (value: string) => {
    setName(value);
    if (validationErrors.name) {
      const nameError = validateName(value);
      setValidationErrors(prev => ({
        ...prev,
        name: nameError
      }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (validationErrors.email) {
      const emailError = validateEmail(value);
      setValidationErrors(prev => ({
        ...prev,
        email: emailError
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (validationErrors.password) {
      const passwordError = validatePassword(value);
      setValidationErrors(prev => ({
        ...prev,
        password: passwordError
      }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (validationErrors.phone) {
      const phoneError = validatePhone(value);
      setValidationErrors(prev => ({
        ...prev,
        phone: phoneError
      }));
    }
  };

  const handleDobChange = (value: string) => {
    setDob(value);
    if (validationErrors.dob) {
      const dobError = validateDob(value);
      setValidationErrors(prev => ({
        ...prev,
        dob: dobError
      }));
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser(name, email, password, phone, dob);

      // Save access token
      localStorage.setItem("token", data.access_token);

      // Save user info (optional)
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google login handler
  const handleGoogleLogin = async (credentialResponse: any) => {
    setError("");
    setLoading(true);

    try {
      const data = await googleLogin(credentialResponse.credential);

      // Save access token
      localStorage.setItem("token", data.access_token);

      // Save user info (optional)
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Link href="/" className="absolute top-4 left-4 text-blue-900 hover:text-blue-700 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      </Link>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

        {/* LEFT IMAGE SECTION */}
        <div
          className="hidden md:flex bg-cover bg-center"
          style={{
            backgroundImage: "url('/travel.jpg')",
          }}
        >
          <div className="bg-black/40 w-full h-full flex items-end p-10">
            <h2 className="text-white text-3xl font-light">
              Book <span className="font-semibold">SkyFly Airways</span>
            </h2>
          </div>
        </div>

        {/* RIGHT REGISTER SECTION */}
        <div className="flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md px-6">

            {/* Logo */}
            <h1 className="text-2xl font-semibold text-blue-900 mb-2">
              SkyFly
            </h1>
            <p className="text-gray-600 mb-8 text-sm">
              Create your account to start your journey
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full border px-4 py-2 focus:outline-none ${validationErrors.name
                      ? "border-red-500 focus:border-red-700"
                      : "border-gray-300 focus:border-blue-700"
                    }`}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className={`w-full border px-4 py-2 focus:outline-none ${validationErrors.email
                      ? "border-red-500 focus:border-red-700"
                      : "border-gray-300 focus:border-blue-700"
                    }`}
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="e.g., +919876543210"
                  className={`w-full border px-4 py-2 focus:outline-none ${validationErrors.phone
                      ? "border-red-500 focus:border-red-700"
                      : "border-gray-300 focus:border-blue-700"
                    }`}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`w-full border px-4 py-2 focus:outline-none ${validationErrors.dob
                      ? "border-red-500 focus:border-red-700"
                      : "border-gray-300 focus:border-blue-700"
                    }`}
                  value={dob}
                  onChange={(e) => handleDobChange(e.target.value)}
                  required
                />
                {validationErrors.dob && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.dob}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full border px-4 py-2 pr-10 focus:outline-none ${validationErrors.password
                        ? "border-red-500 focus:border-red-700"
                        : "border-gray-300 focus:border-blue-700"
                      }`}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !name.trim() ||
                  !email.trim() ||
                  !password ||
                  !phone.trim() ||
                  !dob
                }
                className="w-full bg-blue-900 text-white py-2 font-medium hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 border-t text-center relative">
              <span className="text-xs bg-gray-50 px-2 text-gray-400 absolute left-1/2 -translate-x-1/2 -top-2">
                OR
              </span>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google login failed. Please try again.")}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account ?{" "}
              <a
                href="/login"
                className="text-blue-800 font-semibold hover:underline"
              >
                Login here
              </a>
            </p>

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-8">
              © SkyFly Airways. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
