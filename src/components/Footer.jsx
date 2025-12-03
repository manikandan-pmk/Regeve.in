import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
} from "lucide-react";
import Logo from "../assets/Logo.png";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const footerLinks = {
    company: {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Our Team", path: "/team" },
        { name: "Careers", path: "/careers" },
        { name: "Blog", path: "/blog" },
      ],
    },
    services: {
      title: "Services",
      links: [
        { name: "Event Registration", path: "/service/registration" },
        { name: "Lucky Draw System", path: "/service/luckydraw-system-page" },
        { name: "Food Management", path: "/service/food-management" },
        { name: "Event Dashboard", path: "/service/dashboard-system-page" },
        { name: "Election Management", path: "/electionManagementplatform" },
      ],
    },
    support: {
      title: "Support",
      links: [
        { name: "Help Center", path: "/help" },
        { name: "Contact Us", path: "/contact" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
      ],
    },
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "#",
      gradient: "hover:from-blue-600 hover:to-cyan-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "#",
      gradient: "hover:from-purple-600 hover:to-pink-600",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "#",
      gradient: "hover:from-green-600 hover:to-emerald-600",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "#",
      gradient: "hover:from-blue-600 hover:to-purple-600",
    },
  ];

  const contactInfo = [
    {
      icon: MapPin,
      text: "Vadapalani, Chennai, Tamil Nadu 600026",
      gradient: "hover:text-green-600",
    },
    {
      icon: Phone,
      text: "+91 98432 75075",
      href: "tel: 98432 75075",
      gradient: "hover:text-blue-600",
    },
    {
      icon: Mail,
      text: "regeveindia@gmail.com",
      href: "mailto:regeveindia@gmail.com",
      gradient: "hover:text-purple-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <footer className="bg-[#4A70A9] backdrop-blur-md border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 text-center lg:text-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Brand Section - Takes 2 columns */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <div
              className="flex items-center justify-center lg:justify-start space-x-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img src={Logo} alt="Regeve Logo" className="w-18 h-14 " />

              <span className="text-2xl font-bold text-white bg-clip-text ">
                REGEVE
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed max-w-md mx-auto lg:mx-0">
              Creating unforgettable event experiences with seamless
              registration, interactive lucky draws, and smart food management
              solutions.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  className={`flex items-start space-x-3 text-white transition-colors duration-200 text-sm group justify-center lg:justify-start ${item.gradient}`}
                  whileHover={{ x: 5 }}
                >
                  <item.icon className="w-4 h-4 text-white mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span className="leading-tight">{item.text}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections - Each takes 1 column */}
          {Object.entries(footerLinks).map(([key, section], sectionIndex) => (
            <motion.div
              key={key}
              variants={itemVariants}
              className="lg:col-span-1"
            >
              <h4 className="font-semibold text-white mb-6 text-lg relative inline-block">
                {section.title}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></div>
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <motion.button
                      onClick={() => handleNavigation(link.path)}
                      className="text-gray-300 hover:text-black transition-colors duration-200 text-sm  cursor-pointer w-full text-start relative group"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{link.name}</span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Copyright */}
          <div className="text-gray-100 text-sm flex items-center justify-center md:justify-start">
            © {currentYear} Regeve. Made with{" "}
            <motion.div
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" />
            </motion.div>{" "}
            for amazing event experiences.
          </div>         

          {/* Social Links */}
          <div className="flex space-x-3">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 transition-all duration-200 border border-gray-200 hover:shadow-lg hover:scale-110 ${social.gradient} hover:text-white`}
                whileHover={{
                  scale: 1.1,
                  y: -2,
                  background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.name}
              >
                <social.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
