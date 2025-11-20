import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, Users, Utensils, Gift, Trophy } from 'lucide-react';

const FAQSection = () => {
  const [activeId, setActiveId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const faqs = [
    {
      id: 1,
      question: "How does event registration work?",
      answer: "Our registration process is simple and efficient. Participants can register through our online portal by filling out a custom form. Once submitted, they receive instant confirmation with a digital pass. Event organizers can track registrations in real-time, manage attendee lists, and send automated reminders.",
      icon: Users,
      category: "Registration"
    },
    {
      id: 2,
      question: "How to manage veg/non-veg food counters?",
      answer: "The food management system allows you to track dietary preferences during registration. You can set up separate counters for vegetarian and non-vegetarian meals, monitor consumption in real-time, and adjust quantities based on attendance. The system provides analytics to help optimize food planning for future events.",
      icon: Utensils,
      category: "Food Management"
    },
    {
      id: 3,
      question: "How to add lucky draw gifts and prizes?",
      answer: "Adding gifts to the lucky draw is straightforward. Access the prizes section in your dashboard, click 'Add New Prize', upload prize details and images, set quantities and values. You can categorize prizes by type and value, and the system will automatically track distribution and remaining inventory.",
      icon: Gift,
      category: "Lucky Draw"
    },
    {
      id: 4,
      question: "How are winners selected in the lucky draw?",
      answer: "Winners are selected using our transparent and fair random selection algorithm. The system ensures each eligible participant has an equal chance. Winners are announced in real-time on the winners board, and both organizers and participants receive instant notifications. The entire process is auditable for transparency.",
      icon: Trophy,
      category: "Lucky Draw"
    },
    {
      id: 5,
      question: "Can participants register on the event day?",
      answer: "Yes, we support on-the-spot registration through our mobile app. However, we recommend pre-registration to ensure smooth check-in and accurate food/seat planning. Walk-in registrations are processed instantly with the same digital pass system.",
      icon: Users,
      category: "Registration"
    },
    {
      id: 6,
      question: "How do I track food consumption during the event?",
      answer: "Our real-time dashboard shows live consumption data for both veg and non-veg counters. You can monitor usage patterns, identify peak times, and make adjustments as needed. The system also alerts you when supplies are running low.",
      icon: Utensils,
      category: "Food Management"
    },
    {
      id: 7,
      question: "What types of prizes can I add to the lucky draw?",
      answer: "You can add various prize types including physical goods, digital vouchers, discount coupons, experience packages, and cash prizes. Each prize type has specific configuration options to ensure proper tracking and distribution.",
      icon: Gift,
      category: "Lucky Draw"
    },
    {
      id: 8,
      question: "Is the winner selection process truly random?",
      answer: "Absolutely. Our algorithm uses cryptographically secure random number generation to ensure complete fairness. The selection process is transparent and can be verified. We also provide options for live spin wheel animations to enhance participant engagement.",
      icon: Trophy,
      category: "Lucky Draw"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'Registration', name: 'Registration', icon: Users },
    { id: 'Food Management', name: 'Food Management', icon: Utensils },
    { id: 'Lucky Draw', name: 'Lucky Draw', icon: Gift }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  const toggleAccordion = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  // Reset active accordion when category changes
  useEffect(() => {
    setActiveId(null);
  }, [activeCategory]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      y: 20, 
      opacity: 0,
      scale: 0.95
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const accordionVariants = {
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants = {
    closed: { 
      rotate: 0,
      scale: 1
    },
    open: { 
      rotate: 180,
      scale: 1.1
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(59, 130, 246, 0.05)",
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.98
    }
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-6"
          >
            <HelpCircle className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-blue-700 font-semibold text-sm">FAQ</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get answers to all your questions about our event management platform and features.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-white shadow-lg border-transparent'
                    : 'bg-white text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 hover:shadow-md'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-4 h-4" />
                {category.name}
              </motion.button>
            );
          })}
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {filteredFaqs.map((faq) => (
                <motion.div
                  key={faq.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <motion.button
                    className="w-full px-6 py-6 text-left flex items-center justify-between gap-4"
                    onClick={() => toggleAccordion(faq.id)}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <faq.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                          {faq.question}
                        </h3>
                        <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                          faq.category === 'Registration' 
                            ? 'bg-blue-100 text-blue-700' 
                            : faq.category === 'Food Management'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {faq.category}
                        </span>
                      </div>
                    </div>
                    <motion.div
                      variants={iconVariants}
                      animate={activeId === faq.id ? "open" : "closed"}
                      transition={{ duration: 0.3, type: "spring" }}
                      className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                    >
                      {activeId === faq.id ? (
                        <Minus className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Plus className="w-4 h-4 text-gray-600" />
                      )}
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {activeId === faq.id && (
                      <motion.div
                        variants={accordionVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div className="pl-16 border-l-2 border-blue-200 ml-2">
                            <p className="text-gray-600 leading-relaxed text-lg">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

       
      </div>
    </section>
  );
};

export default FAQSection;