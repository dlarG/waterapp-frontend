import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVisible(true);
  }, []);

  const handleStartApplication = () => {
    navigate("/map");
  };

  const handleViewMap = () => {
    navigate("/map");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
      <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100/80 transition-all duration-500 animate-fadeIn">
        <div className="max-w-full mx-auto px-10 lg:px-15">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <img
                src="images/logo/logo-circled.png"
                alt="SafeWater logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-105 inline-block">
                SafeWater
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 group-hover:w-full"></span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="cursor-pointer relative text-gray-700 hover:text-blue-600 px-4 py-2 font-medium transition-all duration-300 hover:scale-105 animate-slideInRight group">
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-pulse-slow"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-all duration-700"></div>
                <button
                  onClick={handleStartApplication}
                  className="cursor-pointer relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/30 group-hover:scale-105 animate-slideInRight"
                >
                  Start Application
                  <svg
                    className="inline-block w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative min-h-screen pt-20 lg:pt-24 flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('images/hero/water.webp')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/95 via-blue-50/80 via-70% to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-50/20"></div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/10 to-blue-50/30"></div>

        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float animation-delay-2000"></div>

        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div
              className={`space-y-8 transition-all duration-1000 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight space-y-2">
                <span
                  className="block text-gray-900 animate-slideInUp"
                  style={{ animationDelay: "100ms" }}
                >
                  Water Quality
                </span>
                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Monitoring System
                </span>
              </h1>
              <p
                className="text-xl text-gray-700 leading-relaxed max-w-2xl animate-slideInUp"
                style={{ animationDelay: "200ms" }}
              >
                Monitor water quality across 10 barangays in Maasin, Southern
                Leyte through our interactive map. Click any location to view
                real-time water status, quality data, and visual documentation
                for comprehensive water resource management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={handleViewMap}
                  className="cursor-pointer group relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:-translate-y-1 animate-slideInUp"
                  style={{ animationDelay: "300ms" }}
                >
                  <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <span className="relative flex items-center justify-center">
                    View Map
                    <svg
                      className="w-5 h-5 ml-2 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>

                <button
                  className="cursor-pointer group relative bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-1 animate-slideInUp"
                  style={{ animationDelay: "400ms" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-cyan-50/0 group-hover:from-blue-50/50 group-hover:to-cyan-50/50 rounded-xl transition-all duration-500"></div>
                  <span className="relative flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600 transition-transform duration-500 group-hover:scale-110"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Watch Video
                  </span>
                </button>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-l from-blue-500/5 to-cyan-500/5 rounded-3xl backdrop-blur-sm border border-white/20"></div>
              <div className="relative h-full min-h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-l from-blue-500/5 to-cyan-500/5 rounded-3xl backdrop-blur-sm border border-white/20"></div>
                <div className="absolute inset-0 bg-[url('images/hero/water1.webp')] bg-cover bg-center rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(20px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
