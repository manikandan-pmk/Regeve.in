// components/EventDashboardPage.jsx
import React from 'react';
import { BarChart2, Zap, Clock, Shield, Users, TrendingUp, Cpu, Download } from 'lucide-react';

// Reusable component for displaying key metric data
const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl">
    <div className="flex items-center">
        <Icon className={`w-8 h-8 ${color} mr-4`} />
        <div>
            <p className="text-3xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
    </div>
  </div>
);

const DashboardSystemPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 sm:py-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Core Value Proposition */}
        <div className="text-center mb-16 p-8 bg-blue-50 rounded-xl border border-blue-100">
          <BarChart2 className="w-12 h-12 text-blue-700 mx-auto mb-4" />
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            The Real-time Event Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Your single source of truth for operational metrics, attendance tracking, and system performance—make decisions with data, not guesswork.
          </p>
        </div>

        {/* Real-time Key Performance Indicators (KPIs) */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            Live Operational Metrics
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={Users} 
              value="1,845" 
              label="Checked-in Attendees" 
              color="text-green-600" 
            />
            <StatCard 
              icon={TrendingUp} 
              value="87%" 
              label="Registration Completion Rate" 
              color="text-indigo-600" 
            />
            <StatCard 
              icon={Clock} 
              value="09:15 AM" 
              label="Peak Entry Time Today" 
              color="text-orange-600" 
            />
            <StatCard 
              icon={Cpu} 
              value="99.9%" 
              label="System Uptime (SLA)" 
              color="text-blue-600" 
            />
          </div>
        </div>

        {/* Dashboard Components & Analytics Breakdown */}
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
            Advanced Monitoring and Segmentation
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Component 1: Live Check-in Visualizer */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <Zap className="w-6 h-6 text-red-500 mb-3" />
                <h3 className="font-semibold text-xl text-gray-900 mb-2">Check-in Flow Visualizer</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    Monitor queue lengths and scanner throughput across multiple entry points in real-time. Immediately deploy resources where bottlenecks are forming.
                </p>
                <div className="h-40 bg-white border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 italic">
                    
                </div>
            </div>

            {/* Component 2: Segmentation & Reporting */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <Shield className="w-6 h-6 text-purple-500 mb-3" />
                <h3 className="font-semibold text-xl text-gray-900 mb-2">Custom Segment Reporting</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    Filter attendance data by ticket type, VIP status, session attendance, or organizational tier. Export detailed reports instantly for sponsors and internal stakeholders.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-center text-sm text-gray-700"><Download className="w-4 h-4 text-purple-600 mr-2" /> PDF and CSV exports ready.</li>
                    <li className="flex items-center text-sm text-gray-700"><Download className="w-4 h-4 text-purple-600 mr-2" /> Sponsorship ROI measurement.</li>
                    <li className="flex items-center text-sm text-gray-700"><Download className="w-4 h-4 text-purple-600 mr-2" /> Post-event attendance audit logs.</li>
                </ul>
            </div>
          </div>
        </div>

        {/* High-Level Reporting CTA */}
        <div className="mt-16 text-center bg-blue-700/80 p-10 rounded-xl shadow-2xl">
          <h3 className="text-3xl font-bold text-white mb-4">Need an Executive Summary?</h3>
          <p className="text-blue-200 mb-8 max-w-3xl mx-auto">
            Generate polished, event-wide summaries and audit trails automatically from the dashboard for immediate stakeholder delivery.
          </p>
          <button className="inline-flex items-center bg-yellow-400 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-yellow-300 transition duration-300 transform hover:scale-[1.02]">
            Generate Full Event Report
            <BarChart2 className="w-5 h-5 ml-3" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default DashboardSystemPage;