import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(formData.username, formData.password);

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

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="water-waves"></div>
        <div className="water-bubbles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`bubble bubble-${i + 1}`}></div>
          ))}
        </div>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">💧</div>
              <h1>Water Quality Monitor</h1>
              <p>Maasin, Southern Leyte</p>
            </div>
            <div className="auth-title">
              <h2>Welcome Back</h2>
              <p>Sign in to access your water monitoring dashboard</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <span className="label-icon">👤</span>
                Username
              </label>
              <div className="input-container">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className={`form-input ${errors.username ? "error" : ""}`}
                  disabled={isLoading}
                />
                {errors.username && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {errors.username}
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <div className="input-container">
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`form-input ${errors.password ? "error" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {errors.password}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="submit-error">
                <span className="error-icon">❌</span>
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`auth-submit ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Sign In
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="auth-footer">
              <p>Don't have an account?</p>
              <Link to="/register" className="auth-link">
                Create Account
              </Link>
            </div>
          </form>
        </div>

        {/* Side Info */}
        <div className="auth-info">
          <div className="info-content">
            <div className="info-icon">🌊</div>
            <h3>Monitor Water Quality</h3>
            <p>
              Access real-time water quality data, manage monitoring locations,
              and ensure safe water access for communities across Maasin,
              Southern Leyte.
            </p>

            <div className="info-features">
              <div className="feature">
                <span className="feature-icon">📍</span>
                <span>Track multiple locations</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🧪</span>
                <span>Water quality testing</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Real-time monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
        }

        .auth-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            #0891b2 0%,
            #0e7490 50%,
            #155e75 100%
          );
          z-index: 1;
        }

        .water-waves {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(255,255,255,0.1)' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")
            repeat-x;
          animation: waveAnimation 20s linear infinite;
        }

        @keyframes waveAnimation {
          0% {
            background-position-x: 0;
          }
          100% {
            background-position-x: 1440px;
          }
        }

        .water-bubbles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: bubbleFloat 15s infinite linear;
        }

        .bubble-1 {
          width: 40px;
          height: 40px;
          left: 10%;
          animation-delay: 0s;
        }
        .bubble-2 {
          width: 60px;
          height: 60px;
          left: 20%;
          animation-delay: 2s;
        }
        .bubble-3 {
          width: 20px;
          height: 20px;
          left: 35%;
          animation-delay: 4s;
        }
        .bubble-4 {
          width: 80px;
          height: 80px;
          left: 50%;
          animation-delay: 6s;
        }
        .bubble-5 {
          width: 30px;
          height: 30px;
          left: 70%;
          animation-delay: 8s;
        }
        .bubble-6 {
          width: 50px;
          height: 50px;
          left: 85%;
          animation-delay: 10s;
        }

        @keyframes bubbleFloat {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1);
            opacity: 0;
          }
        }

        .auth-content {
          position: relative;
          z-index: 2;
          display: flex;
          max-width: 1200px;
          width: 100%;
          gap: 40px;
          align-items: center;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex: 1;
          max-width: 500px;
        }

        .auth-info {
          flex: 1;
          max-width: 400px;
          color: white;
          padding: 40px 20px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .auth-logo {
          margin-bottom: 30px;
        }

        .logo-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .auth-logo h1 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
          color: #0891b2;
        }

        .auth-logo p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }

        .auth-title h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
        }

        .auth-title p {
          margin: 0;
          font-size: 16px;
          color: #64748b;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .label-icon {
          font-size: 16px;
        }

        .input-container {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #0891b2;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .password-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .password-toggle:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #ef4444;
          margin-top: 4px;
        }

        .submit-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #dc2626;
        }

        .auth-submit {
          background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 56px;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(8, 145, 178, 0.3);
        }

        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .auth-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .auth-footer p {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #64748b;
        }

        .auth-link {
          color: #0891b2;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: color 0.3s ease;
        }

        .auth-link:hover {
          color: #0e7490;
          text-decoration: underline;
        }

        .info-content {
          text-align: center;
        }

        .info-icon {
          font-size: 64px;
          margin-bottom: 24px;
          opacity: 0.9;
        }

        .info-content h3 {
          margin: 0 0 16px 0;
          font-size: 32px;
          font-weight: 700;
        }

        .info-content p {
          margin: 0 0 32px 0;
          font-size: 18px;
          line-height: 1.6;
          opacity: 0.9;
        }

        .info-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
          max-width: 300px;
          margin: 0 auto;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          opacity: 0.9;
        }

        .feature-icon {
          font-size: 20px;
        }

        @media (max-width: 768px) {
          .auth-content {
            flex-direction: column;
            max-width: 500px;
          }

          .auth-info {
            order: -1;
            padding: 20px;
            text-align: center;
          }

          .auth-card {
            padding: 30px 20px;
          }

          .info-content h3 {
            font-size: 24px;
          }

          .info-content p {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
