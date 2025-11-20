 import React from "react";
import { Phone, Mail, MessageCircle, Clock, FileText, Users, Settings, CreditCard, Shield, HelpCircle } from "lucide-react";

const HelpCenter = () => {
  const faqs = [
    {
      question: "How do I set up QR code registration for my event?",
      answer: "Navigate to the Event Registration section in your dashboard, click 'Create New Event', and follow the setup wizard. You can customize QR codes, set up attendee fields, and configure check-in settings.",
      icon: <FileText className="w-5 h-5" />
    },
    {
      question: "Can I run multiple lucky draws during one event?",
      answer: "Yes, our system supports multiple lucky draw sessions. You can schedule different draws for various prize categories or time slots throughout your event.",
      icon: <Users className="w-5 h-5" />
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. Enterprise customers can also request invoice-based billing.",
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      question: "How secure is attendee data?",
      answer: "We use bank-level encryption and comply with global data protection regulations. All data is stored securely and never shared with third parties without explicit consent.",
      icon: <Shield className="w-5 h-5" />
    },
    {
      question: "What happens if the scanner goes offline?",
      answer: "Our app has offline mode capability. Scans are stored locally and automatically sync when connectivity is restored.",
      icon: <Settings className="w-5 h-5" />
    },
    {
      question: "Can I export attendee data?",
      answer: "Yes, you can export attendee lists, check-in reports, and participation data in CSV or Excel format from your dashboard.",
      icon: <FileText className="w-5 h-5" />
    }
  ];

  const contactMethods = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "Available 24/7",
      action: "Start Chat"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Response within 2 hours",
      action: "Send Email"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Speak directly with our experts",
      availability: "Mon-Fri, 9AM-6PM EST",
      action: "Call Now"
    }
  ];

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-slate-600">
            Get help with event registration, lucky draws, and more
          </p>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                    {faq.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-3 text-lg">
                      {faq.question}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
         

        

      </div>
    </div>
  );
};

export default HelpCenter;