import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";

const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    navigate("/auth");
    setIsMobileMenuOpen(false);
  };

  const handleStartApplication = () => {
    navigate("/map");
    setIsMobileMenuOpen(false);
  };

  const handleViewMap = () => {
    navigate("/map");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const barangays = [
    {
      name: "Combado",
      fullName: "Maasin City - Barangay Combado",
      logo: "/images/logo/combado.jpg",
    },
    {
      name: "Batuan",
      fullName: "Maasin City - Barangay Batuan",
      logo: "/images/logo/batuan.jpg",
    },
    {
      name: "Rizal",
      fullName: "Maasin City - Barangay Rizal",
      logo: "/images/logo/rizal.jpg",
    },
    {
      name: "Hantag",
      fullName: "Maasin City - Barangay Hantag",
      logo: "/images/logo/hantag.jpg",
    },
    {
      name: "Malapoc Sur",
      fullName: "Maasin City - Barangay Malapoc Sur",
      logo: "/images/logo/malapoc-sur.jpg",
    },
    {
      name: "Malapoc Norte",
      fullName: "Maasin City - Barangay Malapoc Norte",
      logo: "/images/logo/maasin.png",
    },
    {
      name: "Matin-ao",
      fullName: "Maasin City - Barangay Matin-ao",
      logo: "/images/logo/matin-ao.jpg",
    },
    {
      name: "San Isidro",
      fullName: "Maasin City - Barangay San Isidro",
      logo: "/images/logo/maasin.png",
    },
  ];

  // Animation variants
  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="min-h-screen bg-white"
    >
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <motion.div className="flex items-center space-x-3">
              <motion.img
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                src="/images/logo/cropped_circle_image.png"
                alt="MWAVE logo for maasin"
                className="w-15 h-15 lg:w-18 lg:h-18 object-cover rounded-full"
              />
              <motion.div className="flex flex-col">
                <motion.span
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xl lg:text-[20px] font-medium text-blue-800"
                >
                  M-W.A.V.E
                </motion.span>
                <motion.span
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-xs text-slate-800"
                >
                  Maasin Water Analysis and Visualization Engine
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Desktop Menu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="hidden lg:flex items-center space-x-8"
            >
              {["About", "Features", "Contact"].map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                >
                  {item}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="cursor-pointer text-slate-600 hover:text-slate-900 px-5 py-2.5 text-sm font-medium transition-colors"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartApplication}
                className="cursor-pointer bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 text-sm font-medium rounded-full transition-colors shadow-md hover:shadow-lg"
              >
                Start Application
              </motion.button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMobileMenu}
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <div className="w-5 h-5 relative flex flex-col justify-center space-y-1.5">
                <motion.span
                  animate={
                    isMobileMenuOpen
                      ? { rotate: 45, y: 8 }
                      : { rotate: 0, y: 0 }
                  }
                  className="w-full h-0.5 bg-slate-600"
                ></motion.span>
                <motion.span
                  animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-full h-0.5 bg-slate-600"
                ></motion.span>
                <motion.span
                  animate={
                    isMobileMenuOpen
                      ? { rotate: -45, y: -8 }
                      : { rotate: 0, y: 0 }
                  }
                  className="w-full h-0.5 bg-slate-600"
                ></motion.span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={
            isMobileMenuOpen
              ? { height: "auto", opacity: 1 }
              : { height: 0, opacity: 0 }
          }
          transition={{ duration: 0.3 }}
          className="lg:hidden absolute w-full bg-white border-b border-slate-100 shadow-lg overflow-hidden"
        >
          <div className="px-4 py-6 space-y-4">
            {["About", "Features", "Contact"].map((item) => (
              <motion.button
                key={item}
                whileHover={{ x: 10 }}
                className="block w-full text-left px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-base font-medium transition-colors"
              >
                {item}
              </motion.button>
            ))}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <motion.button
                whileHover={{ x: 10 }}
                onClick={handleLogin}
                className="block w-full text-left px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-base font-medium transition-colors"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartApplication}
                className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-lg text-base font-medium transition-colors shadow-md"
              >
                Start Application
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        {/* Abstract Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute top-0 -left-4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1,
            }}
            className="absolute top-0 -right-4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
            }}
            className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          ></motion.div>
        </motion.div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 items-center">
            {/* Left Column */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="space-y-4">
                <motion.h1
                  variants={fadeInUp}
                  className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight"
                >
                  <motion.span
                    variants={fadeInUp}
                    className="block text-blue-900"
                  >
                    Water Quality
                  </motion.span>
                  <motion.span
                    variants={fadeInUp}
                    className="block mt-2 text-blue-600"
                  >
                    Monitoring System
                  </motion.span>
                </motion.h1>
                <motion.p
                  variants={fadeInUp}
                  className="text-lg text-slate-500 leading-relaxed max-w-xl"
                >
                  Monitor water quality across 10 barangays in Maasin, Southern
                  Leyte. Access real-time data and comprehensive insights for
                  better water resource management.
                </motion.p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex items-center space-x-8"
              >
                {[
                  { value: "10+", label: "Barangays" },
                  { value: "24/7", label: "Monitoring" },
                  { value: "100%", label: "Real-time" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="text-3xl font-light text-blue-900"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-blue-500">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewMap}
                  className="cursor-pointer group bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-full text-base font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <span className="mr-2">View Map</span>
                  <motion.span className="inline-block">
                    <svg
                      className="w-5 h-5 text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer group border border-slate-200 hover:border-slate-300 bg-white/50 backdrop-blur-sm text-slate-700 px-8 py-4 rounded-full text-base font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  Watch Video
                  <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-blue-800"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Column - Illustration */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block"
            >
              <motion.div className="relative h-[650px] w-full">
                <motion.img
                  transition={{ type: "spring", stiffness: 300 }}
                  src="/images/hero/hero-nobg.png"
                  alt="Research illustration showing water quality analysis and monitoring"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
                <motion.div
                  animate={{ opacity: [0.2, 0.3, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-tl from-blue-50/20 via-transparent to-transparent pointer-events-none rounded-3xl"
                ></motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Barangay Carousel Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white py-24 border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-medium text-blue-600 uppercase tracking-wider"
            >
              Coverage Areas
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl lg:text-4xl font-light text-slate-900 mt-3"
            >
              Monitored Barangays
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 mt-4 max-w-2xl mx-auto"
            >
              Real-time water quality monitoring across 8 barangays in Maasin,
              Southern Leyte
            </motion.p>
          </motion.div>

          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-8">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={24}
              slidesPerView="auto"
              centeredSlides={true}
              loop={true}
              speed={3000}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              className="!overflow-visible"
            >
              {barangays.map((barangay, index) => (
                <SwiperSlide
                  key={index}
                  className="!w-72 !h-auto transition-all duration-500 ease-out [&.swiper-slide-active]:scale-105 [&:not(.swiper-slide-active)]:scale-95 [&:not(.swiper-slide-active)]:opacity-40"
                >
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="group cursor-pointer"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="aspect-video bg-gradient-to-br from-slate-50 to-white relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div className="w-26 h-26 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden">
                            <motion.img
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: index * 0.1 + 0.2 }}
                              src={barangay.logo}
                              alt={barangay.name}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        </div>
                      </div>
                      <div className="p-6 text-center">
                        <motion.h3
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="text-lg font-medium text-blue-900 mb-1"
                        >
                          {barangay.name}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                          className="text-sm text-blue-500"
                        >
                          {barangay.fullName}
                        </motion.p>
                      </div>
                    </motion.div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-slate-800 text-gray-300 border-t border-slate-100 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="col-span-1 lg:col-span-2"
            >
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-13 h-13 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden"
                >
                  <img
                    src="/images/logo/logo-circled1.png"
                    alt="Safe water logo for maasin"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <span className="text-xl font-medium text-white">MWAVE</span>
              </div>
              <p className="text-sm text-slate-500 max-w-md">
                Real-time water quality monitoring system for Maasin, Southern
                Leyte, ensuring safe and clean water for all communities.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-sm font-medium text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {["About", "Features", "Contact"].map((item) => (
                  <motion.li
                    key={item}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <button className="text-sm text-gray-300 hover:text-white transition-colors">
                      {item}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="text-sm font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms"].map((item) => (
                  <motion.li
                    key={item}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <button className="text-sm text-gray-300 hover:text-white transition-colors">
                      {item}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-8 border-t border-slate-100 text-center text-sm text-slate-400"
          >
            <p>© 2026 MWAVE. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default HomePage;
