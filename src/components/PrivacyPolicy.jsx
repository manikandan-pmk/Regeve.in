import React from "react";
import { Shield, Lock, Eye, User, Database, Globe, Mail, Clock } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Information We Collect",
      content: "We collect information that you provide directly to us, including name, email address, phone number, and event registration details. We also automatically collect certain information about your device and usage of our services through cookies and similar technologies."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: "We use the information we collect to provide and maintain our services, process your transactions, send you technical notices and support messages, communicate with you about products and services, and improve our platform. Your data helps us personalize your experience and ensure event security."
    },
    {
      icon: <User className="w-6 h-6" />,
      title: "Information Sharing",
      content: "We do not sell your personal information. We may share your information with trusted third-party service providers who assist us in operating our platform, conducting our business, or servicing you. We may also disclose information when required by law or to protect our rights and safety."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Data Security",
      content: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, access controls, and regular security assessments. However, no method of transmission over the Internet is 100% secure."
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information. You can also object to or restrict certain processing of your data. To exercise these rights, please contact us. We will respond to your request within 30 days."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Data Retention",
      content: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. Event data is typically retained for 3 years after the event conclusion for analytical and legal purposes."
    }
  ];

  const updates = [
    {
      date: "January 15, 2024",
      changes: "Updated data retention policies and added new user rights sections"
    },
    {
      date: "August 3, 2023",
      changes: "Enhanced security measures description and third-party sharing details"
    },
    {
      date: "March 12, 2023",
      changes: "Initial privacy policy publication"
    }
  ];

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-600">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <p className="text-lg text-slate-700 leading-relaxed text-center">
            At Event Management Solutions, we take your privacy seriously. This Privacy Policy explains 
            how we collect, use, disclose, and safeguard your information when you use our event 
            registration and management platform.
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-6 mb-12">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">
                    {section.title}
                  </h2>
                  <p className="text-slate-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cookies Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Cookies & Tracking</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We use cookies and similar tracking technologies to track activity on our platform and 
            hold certain information. Cookies are files with a small amount of data which may include 
            an anonymous unique identifier. You can instruct your browser to refuse all cookies or to 
            indicate when a cookie is being sent.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Essential Cookies</h3>
              <p className="text-slate-600 text-sm">Required for basic platform functionality</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Analytics Cookies</h3>
              <p className="text-slate-600 text-sm">Help us improve user experience</p>
            </div>
          </div>
        </div>

        {/* Policy Updates */}
         

        

      </div>
    </div>
  );
};

export default PrivacyPolicy;