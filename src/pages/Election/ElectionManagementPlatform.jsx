import React, { useState } from "react";
import {
  Trophy,
  Users,
  Vote,
  Shield,
  BarChart,
  Settings,
  Globe,
  Clock,
  CheckCircle,
  Zap,
  Lock,
  Smartphone,
  Cloud,
  Award,
  TrendingUp,
  Star,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "../../assets/election/vote1.jpg";
import suiteBg from "../../assets/election/vote6.jpg";

const ElectionManagementPlatform = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Tamper-Proof",
      description:
        "Military-grade encryption and blockchain technology ensure election integrity",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Accessibility",
      description: "Vote from anywhere, on any device with internet connection",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile-First Design",
      description: "Optimized for smartphones, tablets, and desktop devices",
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Real-Time Analytics",
      description: "Live results dashboard with detailed voting statistics",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-Level Authentication",
      description:
        "Biometric, OTP, and email verification for maximum security",
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Hosted",
      description: "99.9% uptime guarantee with automatic scaling",
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
    {
      label: "Elections Managed",
      value: "1,500+",
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      label: "Total Votes Cast",
      value: "100K+",
      icon: <Vote className="w-5 h-5" />,
    },
    {
      label: "States Served",
      value: "10+",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      label: "Client Satisfaction",
      value: "98.7%",
      icon: <Star className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}

      <div
        className="relative overflow-hidden bg-cover bg-center h-[550px]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Modern Election Management
              <span className="block text-3xl md:text-4xl font-normal mt-2">
                For Every Organization
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Enterprise-grade election software for corporations, universities,
              associations, and organizations worldwide. Secure, scalable, and
              simple to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/create-election")}
                className="px-8 py-3.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate("/demo")}
                className="px-8 py-3.5 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                Request Demo
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-blue-600">{stat.icon}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Built with cutting-edge technology and designed for simplicity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Use Cases Section */}
      <div className="bg-gray-50/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Who Uses Our Platform?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From small clubs to multinational corporations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      {useCase.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {useCase.title}
                      </h3>
                      <div className="space-y-2">
                        {useCase.examples.map((example, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">
                              {example}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-8 text-white  bg-cover bg-center bg-no-repeat 
             relative overflow-hidden text-center"
              style={{ background: `url(${suiteBg})` }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-4">
                  Complete Election Suite
                </h3>
                <p className="text-blue-100 mb-6">
                  Everything you need to run successful elections
                </p>
              </div>

              <div className="space-y-6">
                {/* Feature 1 */}
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Voter Management</h4>
                    <p className="text-sm text-blue-100">
                      Import, verify, and manage voters
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Custom Ballots</h4>
                    <p className="text-sm text-blue-100">
                      Design ballots with multiple question types
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Advanced Security</h4>
                    <p className="text-sm text-blue-100">
                      End-to-end encryption and audit trails
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex flex-col items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BarChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Results Dashboard</h4>
                    <p className="text-sm text-blue-100">
                      Real-time analytics and reporting
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple 4-Step Process
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get started in minutes, not weeks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "1",
              title: "Create Election",
              desc: "Set up your election details and rules",
            },
            {
              step: "2",
              title: "Add Voters",
              desc: "Import or manually add eligible voters",
            },
            {
              step: "3",
              title: "Configure Ballot",
              desc: "Design your ballot with candidates/options",
            },
            {
              step: "4",
              title: "Launch & Monitor",
              desc: "Start election and track participation",
            },
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
              {index < 3 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ChevronRight className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper components
const Building = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const GraduationCap = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
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

export default ElectionManagementPlatform;
