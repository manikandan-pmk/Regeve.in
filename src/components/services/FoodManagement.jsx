// components/FoodManagementPage.jsx
import React from 'react';
import { Utensils, CheckSquare, QrCode, ClipboardList, Shield, Zap } from 'lucide-react';

// Reusable component for displaying key metric data
const MetricBox = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
    <Icon className={`w-8 h-8 ${color} mx-auto mb-3`} />
    <p className="text-3xl font-extrabold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

const FoodManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 sm:py-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Core Value Proposition */}
        <div className="text-center mb-16 p-8 bg-green-50 rounded-xl border border-green-100">
          <Utensils className="w-12 h-12 text-green-700 mx-auto mb-4" />
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Smart Food Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Simplify complex catering logistics, ensure dietary safety, and eliminate meal ticket fraud with integrated QR validation.
          </p>
        </div>

        {/* Key Metrics/Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <MetricBox 
            icon={Shield} 
            value="100%" 
            label="Dietary Safety Compliance" 
            color="text-red-600" 
          />
          <MetricBox 
            icon={Zap} 
            value="<2 Sec" 
            label="Average Meal Validation Time" 
            color="text-blue-600" 
          />
          <MetricBox 
            icon={ClipboardList} 
            value="30%" 
            label="Reduction in Food Waste" 
            color="text-green-600" 
          />
        </div>

        {/* Feature Breakdown: Dietary Safety & Validation */}
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
            Precision Catering & QR Validation
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Feature List */}
            <div>
              <p className="text-gray-700 mb-6">
                Our system links specific meal requirements directly to the attendee's digital QR ticket. This eliminates human error at the serving line, dramatically improving attendee safety and satisfaction.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <QrCode className="w-6 h-6 text-indigo-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">QR Meal Entitlement</h4>
                    <p className="text-gray-600 text-sm">One-time use validation for meal redemption prevents duplication and fraud.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckSquare className="w-6 h-6 text-indigo-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Allergen Highlighting</h4>
                    <p className="text-gray-600 text-sm">Staff tablets instantly display critical dietary warnings upon scanning the attendee's code.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Utensils className="w-6 h-6 text-indigo-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-Time Headcounts</h4>
                    <p className="text-gray-600 text-sm">Monitor how many meals (and which types) have been served to optimize refills and prevent waste.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Visual Placeholder */}
            <div className="bg-gray-100 p-8 rounded-xl h-full flex items-center justify-center">
                <span className="text-gray-400 italic">
                    [Image Placeholder: QR Scanner Interface showing 'VEGAN MEAL ONLY' and 'VALIDATED']
                </span>
            </div>
          </div>
        </div>

        {/* Planning & Reporting Section */}
        <div className="bg-indigo-700 p-10 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">
            Simplified Catering Planning
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-indigo-100">
            <div>
              <h4 className="text-xl font-semibold mb-3">Pre-Event Reporting</h4>
              <p>
                Generate comprehensive reports detailing exact counts for every dietary category (vegetarian, allergies, standard meals). Exportable in PDF or CSV formats for direct submission to your catering vendor.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-3">Post-Event Auditing</h4>
              <p>
                Access detailed consumption logs showing exactly when and where meals were redeemed. Use this data for accurate vendor billing and improved budgeting for future events.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <button className="inline-flex items-center bg-yellow-400 text-indigo-900 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-yellow-300 transition duration-300">
                Download Sample Catering Report
                <ClipboardList className="w-5 h-5 ml-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FoodManagement;