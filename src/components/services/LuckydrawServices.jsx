 // components/LuckyDrawSystemPage.jsx
import React from 'react';
import { Gift, Users, Shield, Award, Play, CheckCircle } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';

const LuckydrawServices = () => {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Participant Management",
      description: "Automatically include registered attendees or manually add participants to the draw pool"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Fair Random Selection",
      description: "Transparent algorithm ensures every participant has equal winning opportunity"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Winner Management",
      description: "Track winners, manage prizes, and maintain complete draw history"
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Multiple Prize Levels",
      description: "Support for different prize categories and instant winner announcements"
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: "Setup Draw",
      description: "Configure prize categories and participant eligibility criteria"
    },
    {
      step: "2",
      title: "Select Winners",
      description: "Run the random selection process with live visual display"
    },
    {
      step: "3",
      title: "Announce Results",
      description: "Display winners and track prize distribution in real-time"
    }
  ];

  return (
  <>
  <Navbar/>
    <div className="min-h-screen bg-white pt-24 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center">
              <Gift className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Lucky Draw System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Engage your attendees with fair and exciting lucky draws. Automated selection, 
            instant results, and complete winner management.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Process */}
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Automatic Enrollment</h4>
                    <p className="text-gray-600 text-sm">
                      Registered attendees are automatically included in eligible draws
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Play className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Live Draw Execution</h4>
                    <p className="text-gray-600 text-sm">
                      Start draws with one click and watch real-time selection process
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Winner Verification</h4>
                    <p className="text-gray-600 text-sm">
                      Verify winners and track prize claims with QR code validation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Steps */}
          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Simple 3-Step Process</h3>
              
              <div className="space-y-6">
                {processSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                      <span className="text-purple-700 font-bold text-lg">{step.step}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">100%</div>
                <div className="text-sm text-purple-700">Fair Selection</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">Instant</div>
                <div className="text-sm text-green-700">Results</div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Perfect For All Events</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { name: "Conferences", count: "Keynote Sessions" },
              { name: "Corporate Events", count: "Team Building" },
              { name: "Exhibitions", count: "Booth Engagement" },
              { name: "Social Events", count: "Audience Prizes" }
            ].map((event, index) => (
              <div key={index} className="p-4">
                <div className="font-semibold text-gray-900 mb-1">{event.name}</div>
                <div className="text-sm text-gray-600">{event.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="bg-purple-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Add Excitement?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Engage your attendees with exciting lucky draws and prize giveaways.
            </p>
            <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Start Your First Draw
            </button>
          </div>
        </div>

      </div>
    </div>
    <Footer/>
    </>
  );
};

export default LuckydrawServices;