"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, googleLogin } from "../../services/auth.service";

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Email validation function
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

  // Password validation function
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return undefined;
  };

  // Validate form function
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle real-time validation
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
      const data = await loginUser(email, password);

      // Save access token
      localStorage.setItem("token", data.access_token);

      // Save user info (optional)
      localStorage.setItem("user", JSON.stringify(data.user));

      // Check for booking intent in session storage
      const bookingIntent = sessionStorage.getItem('bookingIntent');
      console.log('Checking booking intent on Google login:', bookingIntent);
      if (bookingIntent) {
        try {
          const { flightId } = JSON.parse(bookingIntent);
          console.log('Found booking intent, redirecting to flight:', flightId);
          sessionStorage.removeItem('bookingIntent');
          router.push(`/user/book?flightId=${encodeURIComponent(flightId)}`);
          return;
        } catch (err) {
          console.error('Failed to parse booking intent:', err);
        }
      }

      // Redirect based on role
      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
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

      // Check for booking intent in session storage
      const bookingIntent = sessionStorage.getItem('bookingIntent');
      console.log('Checking booking intent on login:', bookingIntent);
      if (bookingIntent) {
        try {
          const { flightId } = JSON.parse(bookingIntent);
          console.log('Found booking intent, redirecting to flight:', flightId);
          sessionStorage.removeItem('bookingIntent');
          router.push(`/user/book?flightId=${encodeURIComponent(flightId)}`);
          return;
        } catch (err) {
          console.error('Failed to parse booking intent:', err);
        }
      }

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
  backgroundImage: "url('/planeimage.jpg')",
}}
      >
        <div className="bg-black/40 w-full h-full flex items-end p-10">
          <h2 className="text-white text-3xl font-light">
            Welcome to <span className="font-semibold">SkyFly Airways</span>
          </h2>
        </div>
      </div>

      {/* RIGHT LOGIN SECTION */}
      <div className="flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-6">
          
          {/* Logo */}
          <h1 className="text-3xl font-semibold text-blue-900 mb-2">
            SkyFly
          </h1>
          <p className="text-gray-600 mb-8 text-sm">
            Log in to manage your bookings and flights
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`w-full border px-4 py-2 focus:outline-none ${
                  validationErrors.email
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

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full border px-4 py-2 pr-10 focus:outline-none ${
                    validationErrors.password
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

            <div className="flex justify-between text-sm">
              <a className="text-blue-800 hover:underline cursor-pointer">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full bg-blue-900 text-white py-2 font-medium hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? "Logging in..." : "Log in"}
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
            Not have an account ?{" "}
            <a
              href="/register"
              className="text-blue-800 font-semibold hover:underline"
            >
              Register here
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
