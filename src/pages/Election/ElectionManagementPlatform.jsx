 import React from "react";
import {
  Trophy,
  Users,
  Vote,
  Shield,
  BarChart,
  Smartphone,
  Cloud,
  Award,
  Star,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import heroBg from "../../assets/election/vote333.jpg";
import suiteBg from "../../assets/election/vote666.jpg";

// Helper Icons
const Building = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const GraduationCap = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
    />
  </svg>
);

const ElectionManagementPlatform = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Tamper-Proof",
      description: "Military-grade encryption and blockchain verification",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Global Accessibility",
      description: "Vote anywhere with an internet connection",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Optimized",
      description: "Designed perfectly for mobile voting",
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Real-Time Analytics",
      description: "Live vote counting and insights",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-Level Authentication",
      description: "OTP, biometric, email verification",
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Hosted",
      description: "99.9% uptime with scalable performance",
    },
  ];

  const useCases = [
    {
      title: "Corporate Elections",
      examples: ["Board Elections", "Union Voting", "Shareholder Meetings"],
      icon: <Building className="w-5 h-5" />,
    },
    {
      title: "Educational Institutions",
      examples: ["Student Council", "Faculty Committees", "Campus Polls"],
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      title: "Associations & Clubs",
      examples: ["Sports Clubs", "Professional Bodies", "Community Groups"],
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Awards & Competitions",
      examples: ["Talent Shows", "Employee Awards", "Public Polls"],
      icon: <Award className="w-5 h-5" />,
    },
  ];

  const stats = [
    { label: "Elections Managed", value: "1,500+", icon: <Trophy className="w-5 h-5" /> },
    { label: "Total Votes Cast", value: "100K+", icon: <Vote className="w-5 h-5" /> },
    { label: "States Served", value: "10+", icon: <Cloud className="w-5 h-5" /> },
    { label: "Client Satisfaction", value: "98.7%", icon: <Star className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* ⭐ HERO SECTION (Improved) */}
      <div className="relative h-[550px] md:h-[650px] w-full overflow-hidden">
        <img
          src={heroBg}
          alt="Election Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome To Online Election
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Enterprise-grade election software for all organizations. Secure,
            scalable & easy to use.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="p-2 bg-blue-50 rounded-lg inline-block mb-3">
                <span className="text-blue-600">{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-center text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Built with cutting-edge technology and designed for simplicity
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border hover:shadow-lg transition-all"
            >
              <div className="flex gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">{f.icon}</div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-gray-50/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-3xl font-bold mb-4">Who Uses Our Platform?</h2>
          <p className="text-center text-gray-600 mb-12">
            Trusted by organizations of all sizes
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Cards Left */}
            <div className="space-y-6">
              {useCases.map((u, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border hover:shadow-md transition"
                >
                  <div className="flex gap-4">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      {u.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">{u.title}</h3>
                      {u.examples.map((e, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">{e}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ⭐ SUITE IMAGE (Improved) */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl h-[380px] sm:h-[450px] md:h-full">
              <img
                src={suiteBg}
                alt="Election Suite"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40" />

              <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-6">
                <h3 className="text-3xl font-bold mb-4">Complete Election Suite</h3>
                <p className="text-blue-100 max-w-sm mb-4">
                  Everything you need to manage voting securely & efficiently.
                </p>

                <p>✔ Secure Voting</p>
                <p>✔ Real-Time Analytics</p>
                <p>✔ Voter Management</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Process */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-center text-3xl font-bold mb-4">Simple 4-Step Process</h2>
        <p className="text-center text-gray-600 mb-12">Get started in minutes</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: 1, title: "Create Election", desc: "Set up election rules" },
            { step: 2, title: "Add Voters", desc: "Import or add voters easily" },
            { step: 3, title: "Configure Ballot", desc: "Add candidates & options" },
            { step: 4, title: "Launch & Monitor", desc: "Track votes live" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border text-center relative">
              <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
              {i < 3 && (
                <ChevronRight className="hidden lg:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ElectionManagementPlatform;
