import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../api/api";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaFlask,
  FaChartLine,
  FaShieldAlt,
  FaCog,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaUserPlus,
  FaSignInAlt,
} from "react-icons/fa";

const AuthPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const switchForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setErrors({});
      setIsAnimating(false);
    }, 300);
  };

  // Login validation
  const validateLoginForm = () => {
    const newErrors = {};
    if (!loginForm.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!loginForm.password) {
      newErrors.password = "Password is required";
    } else if (loginForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  // Register validation
  const validateRegisterForm = () => {
    const newErrors = {};
    if (!registerForm.username.trim()) {
      newErrors.username = "Username is required";
    } else if (registerForm.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!registerForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!registerForm.password) {
      newErrors.password = "Password is required";
    } else if (registerForm.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  // Login handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const loginErrors = validateLoginForm();
    if (Object.keys(loginErrors).length > 0) {
      setErrors(loginErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(loginForm.username, loginForm.password);
      if (result.success) {
        navigate("/dashboard", { replace: true });
      } else {
        setErrors({ submit: result.error || "Login failed" });
      }
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Register handlers
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const registerErrors = validateRegisterForm();
    if (Object.keys(registerErrors).length > 0) {
      setErrors(registerErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminAPI.register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsLogin(true);
          setSuccess(false);
          setRegisterForm({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
        }, 2000);
      } else {
        setErrors({ submit: result.error || "Registration failed" });
      }
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Success message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Account Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your admin account has been created. You can now sign in to access
            the water monitoring dashboard.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-600 font-medium">
              Redirecting to login...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/20 animate-float`}
            style={{
              width: Math.random() * 60 + 20 + "px",
              height: Math.random() * 60 + 20 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animationDelay: Math.random() * 5 + "s",
              animationDuration: Math.random() * 10 + 10 + "s",
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left Panel - Form */}
            <div
              className={`lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center transition-all duration-500 ${
                isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <div className="mb-8">
                <div className="mt-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {isLogin
                      ? "Sign in to access your water monitoring dashboard"
                      : "Join our water monitoring system administration"}
                  </p>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}
                className="space-y-6"
              >
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <FaUser className="w-4 h-4 text-blue-600" />
                      <span>Username</span>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={
                        isLogin ? loginForm.username : registerForm.username
                      }
                      onChange={
                        isLogin ? handleLoginChange : handleRegisterChange
                      }
                      className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                        errors.username
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder={
                        isLogin ? "Enter your username" : "Choose a username"
                      }
                      disabled={isLoading}
                    />
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-2">
                      <FaExclamationTriangle className="w-4 h-4" />
                      <span>{errors.username}</span>
                    </p>
                  )}
                </div>

                {/* Email Field (Register only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="w-4 h-4 text-blue-600" />
                        <span>Email Address</span>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                          errors.email
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your email"
                        disabled={isLoading}
                      />
                      <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-2">
                        <FaExclamationTriangle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <FaLock className="w-4 h-4 text-blue-600" />
                      <span>Password</span>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={
                        isLogin ? loginForm.password : registerForm.password
                      }
                      onChange={
                        isLogin ? handleLoginChange : handleRegisterChange
                      }
                      className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                        errors.password
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder={
                        isLogin
                          ? "Enter your password"
                          : "Create a strong password"
                      }
                      disabled={isLoading}
                    />
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-2">
                      <FaExclamationTriangle className="w-4 h-4" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password Field (Register only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <FaShieldAlt className="w-4 h-4 text-blue-600" />
                        <span>Confirm Password</span>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterChange}
                        className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                          errors.confirmPassword
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Confirm your password"
                        disabled={isLoading}
                      />
                      <FaShieldAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-2">
                        <FaExclamationTriangle className="w-4 h-4" />
                        <span>{errors.confirmPassword}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 flex items-center space-x-2">
                      <FaExclamationTriangle className="w-5 h-5" />
                      <span>{errors.submit}</span>
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-cyan-700 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>
                        {isLogin ? "Signing In..." : "Creating Account..."}
                      </span>
                    </>
                  ) : (
                    <>
                      {isLogin ? (
                        <FaSignInAlt className="w-5 h-5" />
                      ) : (
                        <FaUserPlus className="w-5 h-5" />
                      )}
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <FaArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch Form */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    {isLogin
                      ? "Don't have an account?"
                      : "Already have an account?"}
                    <button
                      type="button"
                      onClick={switchForm}
                      disabled={isLoading || isAnimating}
                      className="ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300 disabled:opacity-50"
                    >
                      {isLogin ? "Create Account" : "Sign In"}
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Right Panel - Info */}
            <div
              className={`lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 p-8 lg:p-12 text-white flex flex-col justify-center transition-all duration-500 ${
                isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <div className="max-w-md mx-auto">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4">
                    {isLogin ? "Monitor Water Quality" : "Admin Access"}
                  </h3>
                  <p className="text-blue-100 mb-8">
                    {isLogin
                      ? "Access real-time water quality data, manage monitoring locations, and ensure safe water access for communities across Maasin, Southern Leyte."
                      : "Create an administrator account to manage water quality monitoring locations and ensure safe water access for communities."}
                  </p>
                </div>

                <div className="space-y-6">
                  {isLogin ? (
                    <>
                      <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <FaMapMarkerAlt className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Track Locations</h4>
                          <p className="text-sm text-blue-100">
                            Monitor multiple water sources
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <FaFlask className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Water Testing</h4>
                          <p className="text-sm text-blue-100">
                            Comprehensive quality analysis
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <FaChartLine className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Real-time Data</h4>
                          <p className="text-sm text-blue-100">
                            Live monitoring dashboard
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <FaShieldAlt className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Secure Access</h4>
                          <p className="text-sm text-blue-100">
                            Protected admin dashboard
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <FaChartLine className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Full Monitoring</h4>
                          <p className="text-sm text-blue-100">
                            Access all locations data
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <FaCog className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">System Control</h4>
                          <p className="text-sm text-blue-100">
                            Manage monitoring settings
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float infinite ease-in-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
