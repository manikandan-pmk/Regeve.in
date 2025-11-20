 import React from "react";
import { Target, Users, TrendingUp, Lightbulb, Shield, BarChart } from "lucide-react";

const BlogPage = () => {
  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Expert Insights",
      description: "Learn from industry professionals with years of experience in event management."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Latest Trends",
      description: "Stay updated with the newest technologies and strategies in the event industry."
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Practical Tips",
      description: "Get actionable advice you can implement in your events immediately."
    }
  ];

  const contentSections = [
    {
      title: "Embracing Digital Transformation",
      icon: <BarChart className="w-8 h-8" />,
      content: "In today's fast-paced event industry, staying ahead of the curve requires continuous learning and adaptation. Our blog serves as your trusted companion in this journey, offering deep insights into the evolving landscape of event management. From small corporate gatherings to large-scale international conferences, we cover the spectrum of event planning challenges and solutions.",
      color: "blue"
    },
    {
      title: "Technology in Modern Events",
      icon: <TrendingUp className="w-8 h-8" />,
      content: "The digital transformation of event management has opened up new possibilities for engagement, efficiency, and measurement. We explore how technologies like artificial intelligence, virtual reality, and advanced analytics are reshaping how we plan, execute, and evaluate events. Understanding these tools is no longer optional—it's essential for creating memorable experiences that resonate with modern audiences.",
      color: "green"
    },
    {
      title: "Human-Centric Event Design",
      icon: <Users className="w-8 h-8" />,
      content: "Beyond technology, we delve into the human aspects of event management. Successful events are built on strong relationships, clear communication, and thoughtful planning. Our content emphasizes the importance of understanding attendee psychology, building effective teams, and creating environments where meaningful connections can flourish.",
      color: "purple"
    },
    {
      title: "Sustainable Event Practices",
      icon: <Shield className="w-8 h-8" />,
      content: "Sustainability and social responsibility have become critical considerations in event planning. We provide guidance on how to organize eco-friendly events without compromising on quality or attendee experience. From waste reduction strategies to ethical sourcing and carbon footprint management, we help you make responsible choices that benefit both your organization and the planet.",
      color: "emerald"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-100 text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'bg-green-100 text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-100 text-purple-600',
        border: 'border-purple-200'
      },
      emerald: {
        bg: 'bg-emerald-50',
        icon: 'bg-emerald-100 text-emerald-600',
        border: 'border-emerald-200'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h- mt-15 bg-white">
      {/* Hero Section */}
      <div className="relative bg-slate-900">
        <div className="relative h-96 lg:h-[500px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Event Management Insights"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/50"></div>
        </div>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Event Insights Blog
            </h1>
            <p className="text-xl lg:text-2xl text-slate-200 mb-8">
              Expert knowledge and industry trends for event professionals
            </p>
           
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6">
              Welcome to Our Event Management Blog
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Your comprehensive resource for professional event management insights, 
              strategies, and industry trends. We're dedicated to helping you create 
              exceptional events through expert guidance and practical advice.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              Deep Dive into Event Excellence
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore comprehensive insights that transform your approach to event management
            </p>
          </div>

          <div className="space-y-12">
            {contentSections.map((section, index) => {
              const colorClasses = getColorClasses(section.color);
              return (
                <div 
                  key={index}
                  className={`flex flex-col lg:flex-row gap-8 items-start ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                >
                  {/* Icon Section */}
                  <div className="flex-shrink-0 lg:w-1/4">
                    <div className={`w-20 h-20 ${colorClasses.icon} rounded-2xl flex items-center justify-center mx-auto lg:mx-0 shadow-lg`}>
                      {section.icon}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className={`flex-1 ${colorClasses.bg} rounded-2xl p-8 border ${colorClasses.border} shadow-sm`}>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                      {section.title}
                    </h3>
                    <p className="text-lg text-slate-700 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              );
            })}

            
          </div>
        </div>
      </section>

      {/* Stats Section */}
      
    </div>
  );
};

export default BlogPage;