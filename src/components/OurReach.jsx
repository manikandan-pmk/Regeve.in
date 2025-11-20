import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Star, Users } from 'lucide-react';

import img1 from "../assets/OurReach/chennai.webp"
import img2 from "../assets/OurReach/Hyderabad.webp"
import img3 from "../assets/OurReach/bangalore.webp"
import img4 from "../assets/OurReach/coimbatore.webp"
import img5 from "../assets/OurReach/delhi.webp"
import img6 from "../assets/OurReach/goa.webp"
import img7 from "../assets/OurReach/kolkata.webp"
import img8 from "../assets/OurReach/mumbai.webp"

const OurReach = () => {

    const cities = [
        { id: 1, name: 'Chennai', image: img1 },
        { id: 2, name: 'Mumbai', image: img8 },
        { id: 3, name: 'Delhi', image: img5 },
        { id: 4, name: 'Hyderabad', image: img2 },
        { id: 5, name: 'Goa', image: img6 },
        { id: 6, name: 'Bangalore', image: img3 },
        { id: 7, name: 'Coimbatore', image: img4 },
        { id: 8, name: 'Kolkata', image: img7 },
    ];

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1 }
        })
    };

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">

                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-6">
                        <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-blue-700 font-semibold text-sm">Pan India Presence</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 ">Reach</span>
                    </h2>

                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        The smart choice for event organisers and agencies in your city
                    </p>
                </motion.div>

                {/* GRID — SHOW ALL CITIES */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {cities.map((city, index) => (
                        <motion.div
                            key={city.id}
                            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.03, y: -3 }}
                        >
                            <div className="relative h-40 overflow-hidden">
                                <motion.img
                                    src={city.image}
                                    alt={city.name}
                                    className="w-full h-full object-cover"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                />

                                {/* City Name */}
                                <div className="absolute bottom-3 left-3 bg-white/90 px-2 py-0.5 rounded-md shadow-sm">
                                    <p className="font-semibold text-gray-800 text-sm">{city.name}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* STATS - Vertical Layout */}
                <motion.div
                    className="flex flex-col md:flex-row gap-8 mt-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                >
                    {[
                        { number: '1,150+', label: 'Total Events', icon: Calendar },
                        { number: '8', label: 'Cities', icon: MapPin },
                        { number: '4.8', label: 'Average Rating', icon: Star },
                        { number: '50,000+', label: 'Happy Clients', icon: Users }
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            className="flex-1 bg-gradient-to-br from-blue-50 to-white p-6 border-l-4 border-blue-500 rounded-r-lg"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <stat.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                                    <div className="text-gray-600 text-sm">{stat.label}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
};

export default OurReach;
