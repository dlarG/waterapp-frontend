import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../api/api";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
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
  FaUserPlus,
  FaSignInAlt,
  FaArrowLeft,
  FaIdCard,
} from "react-icons/fa";

const AuthPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Form states
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
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

  const switchToLogin = () => {
    setDirection(-1);
    setIsLogin(true);
    setErrors({});
  };

  const switchToRegister = () => {
    setDirection(1);
    setIsLogin(false);
    setErrors({});
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

    if (!registerForm.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (registerForm.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s.,'-]+$/.test(registerForm.fullName.trim())) {
      newErrors.fullName = "Full name contains invalid characters";
    }

    if (!registerForm.username.trim()) {
      newErrors.username = "Username is required";
    } else if (registerForm.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
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
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerForm.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
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
        fullName: registerForm.fullName.trim(),
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          switchToLogin();
          setSuccess(false);
          setRegisterForm({
            fullName: "",
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

  // Animation variants
  const formVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    }),
  };

  const contentVariants = {
    enter: (direction) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.1,
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      transition: {
        duration: 0.4,
      },
    }),
  };

  // Success message
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FaCheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-3"
          >
            Account Created Successfully!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-6"
          >
            Your admin account has been created. Please wait for approval from
            the system administrator.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-3"
          >
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-600 font-medium">
              Redirecting to login...
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.2, 1],
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/20"
            style={{
              width: Math.random() * 60 + 20 + "px",
              height: Math.random() * 60 + 20 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="flex flex-col lg:flex-row min-h-[600px] relative">
            <div className="lg:w-1/2 relative overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login"
                    custom={direction}
                    variants={formVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-8 lg:p-12 flex flex-col justify-center min-h-[600px]"
                  >
                    <div className="mb-8 mt-12">
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl font-bold text-gray-900"
                      >
                        Welcome Back
                      </motion.h2>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-gray-600 mt-2"
                      >
                        Sign in to access your water monitoring dashboard
                      </motion.p>
                    </div>

                    {/* Login Form */}
                    <motion.form
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      onSubmit={handleLoginSubmit}
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
                            value={loginForm.username}
                            onChange={handleLoginChange}
                            className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                              errors.username
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter your username"
                            disabled={isLoading}
                          />
                          <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                        {errors.username && (
                          <motion.p
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="mt-2 text-sm text-red-600 flex items-center space-x-2"
                          >
                            <FaExclamationTriangle className="w-4 h-4" />
                            <span>{errors.username}</span>
                          </motion.p>
                        )}
                      </div>

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
                            value={loginForm.password}
                            onChange={handleLoginChange}
                            className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                              errors.password
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter your password"
                            disabled={isLoading}
                          />
                          <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                          <motion.p
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="mt-2 text-sm text-red-600 flex items-center space-x-2"
                          >
                            <FaExclamationTriangle className="w-4 h-4" />
                            <span>{errors.password}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Submit Error */}
                      {errors.submit && (
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="p-4 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <p className="text-red-600 flex items-center space-x-2">
                            <FaExclamationTriangle className="w-5 h-5" />
                            <span>{errors.submit}</span>
                          </p>
                        </motion.div>
                      )}

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="cursor-pointer w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Signing In...</span>
                          </>
                        ) : (
                          <>
                            <FaSignInAlt className="w-5 h-5" />
                            <span>Sign In</span>
                          </>
                        )}
                      </motion.button>

                      {/* Switch to Register */}
                      <div className="text-center pt-4">
                        <p className="text-gray-600">
                          Don't have an account?
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={switchToRegister}
                            className="cursor-pointer ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
                          >
                            Create Account
                          </motion.button>
                        </p>
                      </div>
                    </motion.form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    custom={direction}
                    variants={formVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-8 lg:p-12 flex flex-col justify-center min-h-[600px]"
                  >
                    <div className="mb-8 mt-12">
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl font-bold text-gray-900"
                      >
                        Create Account
                      </motion.h2>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-gray-600 mt-2"
                      >
                        Join our water monitoring system administration
                      </motion.p>
                    </div>

                    {/* Register Form */}
                    <motion.form
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      onSubmit={handleRegisterSubmit}
                      className="space-y-6"
                    >
                      {/* Full Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center space-x-2">
                            <FaIdCard className="w-4 h-4 text-blue-600" />
                            <span>Full Name</span>
                          </div>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="fullName"
                            value={registerForm.fullName}
                            onChange={handleRegisterChange}
                            className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                              errors.fullName
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter your full name"
                            disabled={isLoading}
                          />
                          <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                        {errors.fullName && (
                          <motion.p
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="mt-2 text-sm text-red-600 flex items-center space-x-2"
                          >
                            <FaExclamationTriangle className="w-4 h-4" />
                            <span>{errors.fullName}</span>
                          </motion.p>
                        )}
                      </div>

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
                            value={registerForm.username}
                            onChange={handleRegisterChange}
                            className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                              errors.username
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Choose a username"
                            disabled={isLoading}
                          />
                          <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                        {errors.username && (
                          <motion.p
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="mt-2 text-sm text-red-600 flex items-center space-x-2"
                          >
                            <FaExclamationTriangle className="w-4 h-4" />
                            <span>{errors.username}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Email Field */}
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
                          <motion.p
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="mt-2 text-sm text-red-600 flex items-center space-x-2"
                          >
                            <FaExclamationTriangle className="w-4 h-4" />
                            <span>{errors.email}</span>
                          </motion.p>
                        )}
                      </div>

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
                            value={registerForm.password}
                            onChange={handleRegisterChange}
                            className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                              errors.password
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Create a strong password"
                            disabled={isLoading}
                          />
                          <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                          <motion.p
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="mt-2 text-sm text-red-600 flex items-center space-x-2"
                          >
                            <FaExclamationTriangle className="w-4 h-4" />
                            <span>{errors.password}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Confirm Password Field */}
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
                          <motion.p
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="mt-2 text-sm text-red-600 flex items-center space-x-2"
                          >
                            <FaExclamationTriangle className="w-4 h-4" />
                            <span>{errors.confirmPassword}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Submit Error */}
                      {errors.submit && (
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="p-4 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <p className="text-red-600 flex items-center space-x-2">
                            <FaExclamationTriangle className="w-5 h-5" />
                            <span>{errors.submit}</span>
                          </p>
                        </motion.div>
                      )}

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="cursor-pointer w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <FaUserPlus className="w-5 h-5" />
                            <span>Create Account</span>
                          </>
                        )}
                      </motion.button>

                      {/* Switch to Login */}
                      <div className="text-center pt-4">
                        <p className="text-gray-600">
                          Already have an account?
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={switchToLogin}
                            className="cursor-pointer ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
                          >
                            Sign In
                          </motion.button>
                        </p>
                      </div>
                    </motion.form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content Container - Switches sides based on form */}
            <div className="lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login-content"
                    custom={direction}
                    variants={contentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-8 lg:p-12 text-white flex flex-col justify-center min-h-[600px]"
                  >
                    <div className="max-w-md mx-auto">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                      >
                        <h3 className="text-2xl font-bold mb-4">
                          Monitor Water Quality
                        </h3>
                        <p className="text-blue-100 mb-8">
                          Access real-time water quality data, manage monitoring
                          locations, and ensure safe water access for
                          communities across Maasin, Southern Leyte.
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                      >
                        <motion.div
                          whileHover={{ x: 10 }}
                          className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FaMapMarkerAlt className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Track Locations</h4>
                            <p className="text-sm text-blue-100">
                              Monitor multiple water sources
                            </p>
                          </div>
                        </motion.div>
                        <motion.div
                          whileHover={{ x: 10 }}
                          className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FaFlask className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Water Testing</h4>
                            <p className="text-sm text-blue-100">
                              Comprehensive quality analysis
                            </p>
                          </div>
                        </motion.div>
                        <motion.div
                          whileHover={{ x: 10 }}
                          className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FaChartLine className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Real-time Data</h4>
                            <p className="text-sm text-blue-100">
                              Live monitoring dashboard
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register-content"
                    custom={direction}
                    variants={contentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="p-8 lg:p-12 text-white flex flex-col justify-center min-h-[600px]"
                  >
                    <div className="max-w-md mx-auto">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                      >
                        <h3 className="text-2xl font-bold mb-4">
                          Admin Access
                        </h3>
                        <p className="text-blue-100 mb-8">
                          Create an administrator account to manage water
                          quality monitoring locations and ensure safe water
                          access for communities.
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                      >
                        <motion.div
                          whileHover={{ x: 10 }}
                          className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FaShieldAlt className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Secure Access</h4>
                            <p className="text-sm text-blue-100">
                              Protected admin dashboard
                            </p>
                          </div>
                        </motion.div>
                        <motion.div
                          whileHover={{ x: 10 }}
                          className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FaChartLine className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Full Monitoring</h4>
                            <p className="text-sm text-blue-100">
                              Access all locations data
                            </p>
                          </div>
                        </motion.div>
                        <motion.div
                          whileHover={{ x: 10 }}
                          className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                        >
                          <div className="p-2 bg-white/20 rounded-lg">
                            <FaCog className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">System Control</h4>
                            <p className="text-sm text-blue-100">
                              Manage monitoring settings
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
