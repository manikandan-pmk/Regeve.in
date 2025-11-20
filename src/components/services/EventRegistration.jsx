 // components/ServicesWebsite.jsx
import React from 'react';
import { QrCode, Ticket, Users, Gift, Utensils, CheckSquare, BarChart2, Zap } from 'lucide-react';

// Reusable Feature Card Component
const ServiceCard  = ({ icon: Icon, title, headline, description, features, accentColor }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl transition duration-300 hover:shadow-2xl border border-gray-100 hover:border-gray-200">
      <div className={`w-14 h-14 ${accentColor} rounded-full flex items-center justify-center mb-5 ring-4 ring-offset-4 ring-white/50`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      <h3 className="text-lg font-semibold text-gray-600 mb-4 border-b pb-3">{headline}</h3>
      
      <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>

      <div className="mt-4">
        <h4 className="text-sm font-bold text-gray-800 uppercase mb-2">Key Features:</h4>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm text-gray-600">
              <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const EventRegistration = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 sm:py-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 text-sm font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-100 rounded-full">
            Our Core Services
          </span>
          <h1 className="mt-4 text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl">
            Complete Event Management Solutions
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
            From seamless attendee check-in to real-time analytics and engaging contests, we provide the tools to run exceptional events.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* 1. Event Registration */}
          <ServiceCard
            icon={QrCode}
            title="Event Registration"
            headline="Seamless Digital Onboarding & Ticketing"
            description="Streamline the entire attendee journey, from initial sign-up to confirmed entry. Our secure, customizable registration forms and automated digital ticketing ensure a fast, frictionless, and branded experience."
            features={[
              "Customizable branded forms.",
              "Automated email/SMS ticket delivery.",
              "Payment gateway integration.",
              "Real-time data synchronization.",
            ]}
            accentColor="bg-indigo-600"
          />

          {/* 2. Lucky Draw System */}
          <ServiceCard
            icon={Gift}
            title="Lucky Draw System"
            headline="Engaging & Transparent Audience Contests"
            description="Drive excitement and participation with a robust, verifiable, and fair digital lucky draw engine. Integrates directly with attendee data for 100% transparency and easy winner notification on-screen."
            features={[
              "Integration with attendee check-in data.",
              "Random, verifiable number generation.",
              "Live on-screen display of winners.",
              "Customizable prize tiers and rules.",
            ]}
            accentColor="bg-pink-500"
          />

          {/* 3. Food Management */}
          <ServiceCard
            icon={Utensils}
            title="Food Management"
            headline="Efficient Catering and Dietary Control"
            description="Simplify complex meal planning and service logistics. Capture attendee dietary restrictions and use our QR-based validation system at catering stations to eliminate waste and ensure personalized service."
            features={[
              "Dietary requirement tagging (Vegan, GF).",
              "QR code validation for meal redemption.",
              "Real-time consumption tracking.",
              "Automated catering headcounts.",
            ]}
            accentColor="bg-green-600"
          />

          {/* 4. Event Dashboard */}
          <ServiceCard
            icon={BarChart2}
            title="Event Dashboard"
            headline="Centralized Real-time Operations & Analytics"
            description="Gain 360-degree visibility into your event's performance through an intuitive, centralized dashboard. Monitor key metrics and system health to make informed, data-driven decisions instantly."
            features={[
              "Live attendance and check-in metrics.",
              "Financial and ticket sales reporting.",
              "System health and security alerts.",
              "Customizable widgets for focused data views.",
            ]}
            accentColor="bg-yellow-600"
          />
        </div>

        {/* Closing CTA Section */}
        <div className="mt-20 text-center">
            <div className="bg-indigo-600 p-10 rounded-2xl shadow-2xl">
                <h3 className="text-3xl font-bold text-white mb-3">Ready to transform your event experience?</h3>
                <p className="text-indigo-200 mb-6 max-w-3xl mx-auto">
                    Explore our full platform capabilities and see how our integrated services can elevate your next event.
                </p>
                <button className="inline-flex items-center bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-[1.02]">
                    <Zap className="w-5 h-5 mr-3" />
                    Request a Demo
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;