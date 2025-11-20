import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Award, Calendar, Star, TrendingUp, Clock, Globe } from 'lucide-react';

const About = () => {
  const eventDetails = {
    title: "Annual Tech Summit 2024",
    shortDescription: "The premier gathering for technology innovators, thought leaders, and digital pioneers shaping the future of our industry.",
    purpose: "To create a collaborative environment where technology professionals can share knowledge, network with peers, and discover cutting-edge solutions that drive business transformation.",
    attendees: "Developers, Engineers, Product Managers, CTOs, Startup Founders, Tech Entrepreneurs, and Innovation Leaders"
  };

  const highlights = [
    {
      icon: Star,
      title: "Keynote Sessions",
      description: "Insightful talks from industry leaders and technology visionaries"
    },
    {
      icon: TrendingUp,
      title: "Hands-on Workshops",
      description: "Practical sessions to enhance your technical skills and knowledge"
    },
    {
      icon: Users,
      title: "Networking Events",
      description: "Connect with like-minded professionals and potential collaborators"
    },
    {
      icon: Award,
      title: "Innovation Awards",
      description: "Celebrating outstanding achievements in technology and innovation"
    }
  ];

  const stats = [
    { number: "50+", label: "Expert Speakers", icon: Users },
    { number: "1000+", label: "Attendees", icon: Users },
    { number: "25+", label: "Technical Sessions", icon: Award },
    { number: "15+", label: "Countries", icon: Globe }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About The Event
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-600  mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover what makes our event the must-attend technology gathering of the year
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left Content - Event Overview */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Short Description */}
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Event Overview</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                {eventDetails.shortDescription}
              </p>
            </motion.div>

            {/* Event Purpose */}
            <motion.div variants={itemVariants}>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Our Purpose</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {eventDetails.purpose}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Who Can Attend */}
            <motion.div variants={itemVariants}>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Who Should Attend</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    This event is designed for professionals across the technology ecosystem:
                  </p>
                  <ul className="text-gray-700 space-y-2">
                    {eventDetails.attendees.split(', ').map((attendee, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        {attendee}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Stats */}
          <motion.div
            className="grid grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center"
                variants={cardVariants}
                whileHover="hover"
              >
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Event Highlights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h3 
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            variants={itemVariants}
          >
            Event Highlights
          </motion.h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center group cursor-pointer"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <highlight.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {highlight.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {highlight.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-16 bg-gradient-to-r bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-8 text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Calendar className="w-8 h-8 mb-3 text-blue-200" />
              <h4 className="font-semibold text-lg mb-2">Event Date</h4>
              <p className="text-blue-100">December 15, 2024</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 mb-3 text-blue-200" />
              <h4 className="font-semibold text-lg mb-2">Duration</h4>
              <p className="text-blue-100">3 Days</p>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="w-8 h-8 mb-3 text-blue-200" />
              <h4 className="font-semibold text-lg mb-2">Format</h4>
              <p className="text-blue-100">Hybrid (In-person & Virtual)</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Register Your Interest
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default About;