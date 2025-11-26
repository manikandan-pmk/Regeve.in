import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Utensils, 
    Gift, 
    Trophy, 
    BarChart3, 
    Package,
    ArrowRight,
    Sparkles
} from 'lucide-react';

const EventFeatures = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [showWinner, setShowWinner] = useState(false);
    const wheelRef = useRef(null);

    // Feature data with professional icons
    const features = [
        {
            id: 1,
            title: "Participant Registration",
            description: "Streamlined registration process with custom forms and instant confirmation emails",
            icon: Users,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-700"
        },
        {
            id: 2,
            title: "Food Counter Management",
            description: "Track Veg/Non-Veg preferences and manage meal allocations efficiently",
            icon: Utensils,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-700"
        },
        {
            id: 3,
            title: "Lucky Draw System",
            description: "Interactive spin wheel for engaging prize distributions and giveaways",
            icon: Gift,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            textColor: "text-purple-700"
        },
        {
            id: 4,
            title: "Live Winners Board",
            description: "Real-time updates of winners with celebratory animations",
            icon: Trophy,
            color: "from-amber-500 to-amber-600",
            bgColor: "bg-amber-50",
            textColor: "text-amber-700"
        },
        {
            id: 5,
            title: "Event Analytics Dashboard",
            description: "Comprehensive dashboard with real-time analytics and insights",
            icon: BarChart3,
            color: "from-indigo-500 to-indigo-600",
            bgColor: "bg-indigo-50",
            textColor: "text-indigo-700"
        },
        {
            id: 6,
            title: "Gift Allocation System",
            description: "Systematic prize distribution with tracking and management",
            icon: Package,
            color: "from-pink-500 to-pink-600",
            bgColor: "bg-pink-50",
            textColor: "text-pink-700"
        }
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 30
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.9
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        },
        hover: {
            y: -8,
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        }
    };

    return (
        <div className="min-h-screen bg-white py-16 mt-5 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div
                    className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-blue-700 font-semibold text-sm">Event Management Platform</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 ">Features</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Comprehensive event management solutions designed to streamline your operations and enhance attendee experiences.
                </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                className="max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <motion.div
                            key={feature.id}
                            variants={itemVariants}
                            className="group"
                        >
                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col relative overflow-hidden"
                            >
                                {/* Background Gradient Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />

                                {/* Icon Container */}
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                                    {feature.description}
                                </p>

                                {/* Hover Border Effect */}
                                <div className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${feature.color} group-hover:w-full transition-all duration-500`} />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

        </div>
    );
};

export default EventFeatures;