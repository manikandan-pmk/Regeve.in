import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Clock, Send, User, MessageCircle } from 'lucide-react';
import Map from "../assets/india-map.jpg"
import ContactBg from "../assets/ContactBg2.jpg"

const ContactInfo = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        product: '',
        venue: '',
        city: '',
        eventDate: '',
        message: ''
    });

    const products = [
        'Event Registration System',
        'Food Counter Management',
        'Lucky Draw System',
    ];

    const cities = [
        'Bangalore',
        'Mumbai',
        'Delhi',
        'Chennai',
        'Hyderabad',
        'Kolkata',
        'Pune',
        'Ahmedabad'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Handle form submission here
        alert('Thank you for your inquiry! We will get back to you soon.');
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            product: '',
            venue: '',
            city: '',
            eventDate: '',
            message: ''
        });
    };

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

    const formVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    return (
        <section id="contact" className="relative min-h-screen bg-gray-300">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${ContactBg})`,
                }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>

            <div className="relative z-10 container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Contact Info & Image */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-white"
                    >
                        {/* Header */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                                Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Touch</span>
                            </h1>
                            <p className="text-2xl text-gray-300 mb-2">Masters of Connection</p>
                            <p className="text-xl text-blue-300 font-semibold">Let's Work Together</p>
                        </motion.div>

                        {/* Contact Information */}
                        <motion.div variants={itemVariants} className="space-y-6 mb-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Email</p>
                                    <a href="mailto:info@bilimbedigital.com" className="text-white text-lg font-semibold hover:text-blue-300 transition-colors">
                                        regeveindia@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Phone</p>
                                    <div className="text-white text-lg font-semibold">
                                        <a href="tel:+919884030207" className="hover:text-green-300 transition-colors">+91 86088 89999</a>                                    
                                    </div>
                                </div>
                            </div>

                        </motion.div>

                        {/* Service Description */}


                        {/* Image Section - Replaced Map */}
                        <motion.div
                            variants={itemVariants}
                            className="relative rounded-2xl overflow-hidden"
                        >
                            <img
                                src={Map}
                                alt="Map"
                                className="w-full h-full object-contain object-center"
                            />
                        </motion.div>



                    </motion.div>

                    {/* Right Side - Contact Form */}
                    <motion.div
                        variants={formVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="bg-white/50 opacity-30 rounded-2xl shadow-xl p-8 border border-white/40"

                    >

                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Event Inquiry Form</h2>
                        <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 border  bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            {/* Email & Phone */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mail Id *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 pr-4 py-3 border bg-white  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 bg-white  pr-4 py-3 border  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Product Selection */}
                            <div>
                                <label htmlFor="product" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Product *
                                </label>
                                <select
                                    id="product"
                                    name="product"
                                    value={formData.product}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 bg-white py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                >
                                    <option value="">Select Product</option>
                                    {products.map((product, index) => (
                                        <option key={index} value={product}>{product}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Venue & City */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="venue" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Event Venue
                                    </label>
                                    <input
                                        type="text"
                                        id="venue"
                                        name="venue"
                                        value={formData.venue}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter venue name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Choose your city *
                                    </label>
                                    <select
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white px-4 py-3 border  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    >
                                        <option value="">Choose the City</option>
                                        {cities.map((city, index) => (
                                            <option key={index} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Event Date */}
                            <div>
                                <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Event Date & Time *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        id="eventDate"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="w-full pl-12 bg-white pr-4 py-3 border  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2 flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Note: Choose the event's date and time
                                </p>
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Message *
                                </label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                        className="w-full pl-12 pr-4 py-3 bg-white border  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                                        placeholder="Tell us about your event requirements..."
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Send className="w-5 h-5" />
                                Submit Inquiry
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ContactInfo;