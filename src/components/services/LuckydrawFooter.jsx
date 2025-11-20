// components/LuckyDrawSystemPage.jsx
import React from 'react';
import { Gift, Zap, Users, ShieldCheck, Play, ListOrdered, Award } from 'lucide-react';

// Reusable component for the workflow steps
const WorkflowStep = ({ icon: Icon, title, description, step }) => (
  <div className="flex relative">
    {/* Step Number Badge */}
    <div className="flex flex-col items-center mr-4">
      <div className="flex items-center justify-center w-10 h-10 border-4 border-indigo-200 bg-indigo-600 text-white rounded-full font-bold flex-shrink-0">
        {step}
      </div>
      {/* Connector Line (Hidden on last step) */}
      {step < 3 && <div className="w-1 h-full bg-indigo-200 mt-2"></div>}
    </div>
    
    <div className="pb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
        <Icon className="w-5 h-5 text-indigo-600 mr-2"/> {title}
      </h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const LuckydrawFooter = () => {
  return (
    <div className="min-h-screen bg-white py-16 sm:py-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Hero Section */}
        <div className="text-center mb-16 p-8 bg-indigo-50 rounded-xl border border-indigo-100">
          <Gift className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            The Digital Lucky Draw System
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Inject excitement into your event with a fully integrated, transparent, and high-impact contest platform. Guaranteed fairness and instant results.
          </p>
        </div>

        {/* Core Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10 border-b pb-4">
            Powerful Features for Maximum Engagement
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="p-6 bg-gray-50 rounded-xl shadow-md border border-gray-100">
              <Users className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Registration Sync</h3>
              <p className="text-gray-600 text-sm">Automatically includes all registered or checked-in attendees, eliminating manual entry and ensuring accurate eligibility.</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl shadow-md border border-gray-100">
              <ShieldCheck className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Verifiable Randomness</h3>
              <p className="text-gray-600 text-sm">Uses cryptographically secure algorithms to ensure every draw is demonstrably fair and unbiased, protecting your event's integrity.</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl shadow-md border border-gray-100">
              <Zap className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Instant Visualization</h3>
              <p className="text-gray-600 text-sm">Project stunning, animated draw results live on screen, driving immediate audience engagement and applause.</p>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="bg-gray-100 p-10 rounded-xl shadow-lg border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            The Simple 3-Step Draw Workflow
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <WorkflowStep
              step={1}
              icon={ListOrdered}
              title="Define Pool & Rules"
              description="Select the criteria for entry (e.g., must be checked-in, VIP status, or specific registration group) and define the prize tiers."
            />
            
            <WorkflowStep
              step={2}
              icon={Play}
              title="Execute Live Draw"
              description="With a single click, initiate the random selection process. The system processes the pool and determines winners instantly."
            />
            
            <WorkflowStep
              step={3}
              icon={Award}
              title="Notify & Document"
              description="Winners are highlighted live, notified via SMS/email, and the entire draw audit log is documented for compliance and reporting."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to host an unforgettable contest?</h3>
          <p className="text-lg text-gray-600 mb-8">
            Integrate the Lucky Draw System into your event today and watch attendee excitement soar.
          </p>
          <button className="inline-flex items-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02]">
            View Draw Customization Options
            <Gift className="w-5 h-5 ml-3" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default LuckydrawFooter;