import React, { useState, useEffect } from 'react';
import {
  X, Play, Image as ImageIcon, Calendar,
  MapPin, ChevronLeft, ChevronRight,
  Grid, Building, School, Filter,
  Video as VideoIcon, Maximize2, Minimize2
} from 'lucide-react';

const EventGallery = () => {
  // Sample event data
  const eventData = [
    {
      id: 1,
      title: "BASF Innovation Day 2024",
      category: "basf",
      type: "image",
      url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop",
      description: "Annual innovation showcase with industry partners and new technology demonstrations",
      date: "2024-10-15",
      featured: true
    },
    {
      id: 2,
      title: "BASF Sustainability Conference",
      category: "basf",
      type: "video",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop",
      description: "Discussions on green chemistry initiatives and environmental sustainability",
      date: "2024-09-22"
    },
    {
      id: 3,
      title: "Sunshine School Science Fair",
      category: "shine-school",
      type: "image",
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop",
      description: "Student projects showcasing scientific innovations and experiments",
      date: "2024-11-05",
      featured: true
    },
    {
      id: 4,
      title: "Sunshine School Annual Day",
      category: "shine-school",
      type: "video",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop",
      description: "Cultural performances and awards ceremony celebrating student achievements",
      date: "2024-12-10"
    },
    {
      id: 5,
      title: "BASF Tech Symposium",
      category: "basf",
      type: "image",
      url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop",
      description: "Technical presentations on new materials and chemical innovations",
      date: "2024-08-30"
    },
    {
      id: 6,
      title: "Sunshine School Sports Meet",
      category: "shine-school",
      type: "image",
      url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop",
      description: "Annual inter-house sports competition with various athletic events",
      date: "2024-10-28"
    },
    {
      id: 7,
      title: "BASF Community Outreach",
      category: "basf",
      type: "image",
      url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop",
      description: "Volunteer activities and community development programs",
      date: "2024-11-18"
    },
    {
      id: 8,
      title: "Sunshine School Art Exhibition",
      category: "shine-school",
      type: "image",
      url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&auto=format&fit=crop",
      description: "Student artwork showcase featuring paintings and sculptures",
      date: "2024-09-14"
    }
  ];

  const categories = [
    { id: "all", name: "All Events", icon: Grid },
    { id: "basf", name: "BASF Events", icon: Building },
    { id: "shine-school", name: "Sunshine School", icon: School }
  ];

  // State management
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [filteredEvents, setFilteredEvents] = useState(eventData);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [clickedCardRect, setClickedCardRect] = useState(null);
  const [animateCard, setAnimateCard] = useState(false);

  // Filter events based on category
  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredEvents(eventData);
    } else {
      setFilteredEvents(eventData.filter(event => event.category === activeCategory));
    }
  }, [activeCategory]);

  // Update current index when selected item changes
  useEffect(() => {
    if (selectedItem) {
      const index = filteredEvents.findIndex(item => item.id === selectedItem.id);
      setCurrentIndex(index);
    }
  }, [selectedItem, filteredEvents]);

  // Handle item click with animation
  const handleItemClick = (item, event) => {
    const cardElement = event.currentTarget;
    const rect = cardElement.getBoundingClientRect();
    
    setClickedCardRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    });
    
    setSelectedItem(item);
    setAnimateCard(true);
    
    // Open modal after a brief delay for animation
    setTimeout(() => {
      setModalOpen(true);
    }, 50);
    
    setFullscreenMode(false);
  };

  // Navigate to next item
  const handleNext = () => {
    if (currentIndex < filteredEvents.length - 1) {
      setSelectedItem(filteredEvents[currentIndex + 1]);
    }
  };

  // Navigate to previous item
  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedItem(filteredEvents[currentIndex - 1]);
    }
  };

  // Close modal with animation
  const handleCloseModal = () => {
    setModalOpen(false);
    setAnimateCard(false);
    
    // Delay before clearing selected item to allow animation
    setTimeout(() => {
      setSelectedItem(null);
      setClickedCardRect(null);
      setFullscreenMode(false);
    }, 300);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date for modal
  const formatModalDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!modalOpen) return;
      
      switch(e.key) {
        case 'Escape':
          if (fullscreenMode) {
            setFullscreenMode(false);
          } else {
            handleCloseModal();
          }
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen, currentIndex, filteredEvents.length, fullscreenMode]);

  return (
    <div className="min-h-screen bg-gradient-to-b mt-16 from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-100 to-green-100 rounded-2xl mb-4">
            <Filter className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Event Gallery
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Explore moments from BASF corporate events and Shine School activities.
            Click on any image or video to view in detail.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex items-center px-4 py-2 rounded-lg transition-all duration-300
                  text-sm md:text-base
                  ${activeCategory === category.id 
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                `}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-8 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>{eventData.filter(e => e.category === 'basf').length} BASF Events</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>{eventData.filter(e => e.category === 'shine-school').length} School Events</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>{eventData.filter(e => e.type === 'video').length} Videos</span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
          {filteredEvents.map((item) => (
            <div 
              key={item.id}
              className="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white cursor-pointer"
              onClick={(e) => handleItemClick(item, e)}
            >
              {/* Featured badge */}
              {item.featured && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Featured
                  </span>
                </div>
              )}

              {/* Media container */}
              <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
                {item.type === 'video' ? (
                  <>
                    <img 
                      src={item.thumbnail || item.url} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 md:w-6 md:h-6 text-blue-600 ml-1" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img 
                    src={item.url} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                )}
                
                {/* Type indicator */}
                <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white p-1.5 rounded-lg">
                  {item.type === 'video' ? (
                    <Play className="w-3 h-3 md:w-4 md:h-4" />
                  ) : (
                    <ImageIcon className="w-3 h-3 md:w-4 md:h-4" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`
                    text-xs font-semibold px-2 py-1 rounded-full
                    ${item.category === 'basf' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'}
                  `}>
                    {item.category === 'basf' ? 'BASF' : 'Sunshine School'}
                  </span>
                  <div className="flex items-center text-gray-500 text-xs md:text-sm">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    {formatDate(item.date)}
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-800 text-sm md:text-base mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3">
                  {item.description}
                </p>
                
                <div className="flex items-center text-gray-500 text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{item.category === 'basf' ? 'Corporate Event' : 'School Campus'}</span>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-xs md:text-sm font-medium">
                  Click to view {item.type === 'video' ? 'video' : 'image'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4 text-6xl">📷</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No events found
            </h3>
            <p className="text-gray-500">
              Try selecting a different category or check back later for new events.
            </p>
          </div>
        )}
      </div>

      {/* Animated Card Expansion */}
      {selectedItem && clickedCardRect && (
        <div 
          className="fixed z-[9998] pointer-events-none"
          style={{
            top: clickedCardRect.top,
            left: clickedCardRect.left,
            width: clickedCardRect.width,
            height: clickedCardRect.height,
            transition: animateCard ? 'all 0.3s ease-out' : 'all 0.3s ease-in',
            transform: animateCard ? 'scale(1.5) translateY(-20px)' : 'scale(1)',
            opacity: animateCard ? 0 : 1,
            zIndex: 9998
          }}
        >
          <div className="w-full h-full rounded-xl shadow-lg overflow-hidden bg-white">
            <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
              {selectedItem.type === 'video' ? (
                <>
                  <img 
                    src={selectedItem.thumbnail || selectedItem.url} 
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 md:w-6 md:h-6 text-blue-600 ml-1" />
                    </div>
                  </div>
                </>
              ) : (
                <img 
                  src={selectedItem.url} 
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  text-xs font-semibold px-2 py-1 rounded-full
                  ${selectedItem.category === 'basf' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'}
                `}>
                  {selectedItem.category === 'basf' ? 'BASF' : 'Sunshine School'}
                </span>
                <div className="flex items-center text-gray-500 text-xs md:text-sm">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  {formatDate(selectedItem.date)}
                </div>
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base mb-2 line-clamp-1">
                {selectedItem.title}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Centered content with full image */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fadeIn"
            onClick={handleCloseModal}
          />
          
          {/* Modal Container - Centered with max dimensions */}
          <div className="relative w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-modalAppear flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 border-b bg-white">
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`
                  p-2 rounded-lg flex-shrink-0
                  ${selectedItem.category === 'basf' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'}
                `}>
                  {selectedItem.category === 'basf' ? (
                    <Building className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <School className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-lg md:text-xl text-gray-900 truncate">{selectedItem.title}</h2>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{formatModalDate(selectedItem.date)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Toggle fullscreen (F)"
                >
                  {fullscreenMode ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Content Area - Image/Video takes center stage */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Media Container - Takes 70% of space */}
              <div className="relative flex-1 bg-black flex items-center justify-center min-h-[400px] md:min-h-0">
                {selectedItem.type === 'video' ? (
                  <div className="w-full h-full">
                    <video
                      src={selectedItem.url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={selectedItem.url}
                      alt={selectedItem.title}
                      className="w-auto h-auto max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                
                {/* Navigation arrows */}
                {currentIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-20"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                )}
                {currentIndex < filteredEvents.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-20"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                )}
              </div>

              {/* Details Panel - Takes 30% of space */}
              <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l bg-white p-4 md:p-6 overflow-y-auto">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className={`
                      text-sm font-bold px-3 py-1.5 rounded-full flex-shrink-0
                      ${selectedItem.category === 'basf' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'}
                    `}>
                      {selectedItem.category === 'basf' ? 'BASF Company Event' : 'Sunshine School Event'}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm flex-shrink-0">
                      <MapPin className="w-4 h-4 mr-1.5" />
                      <span>{selectedItem.category === 'basf' ? 'Corporate Venue' : 'School Campus'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Event Description</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedItem.description}</p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-gray-800 mb-2">Event Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{formatModalDate(selectedItem.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          {selectedItem.type === 'video' ? (
                            <>
                              <VideoIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="text-sm">Video Content • {selectedItem.featured ? 'Featured Event' : 'Regular Event'}</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="text-sm">Image Gallery • {selectedItem.featured ? 'Featured Event' : 'Regular Event'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-500 mb-4">
                    {selectedItem.type === 'video' ? (
                      <p className="flex items-center">
                        <VideoIcon className="w-4 h-4 mr-2" />
                        <span>Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mx-1">F</kbd> for fullscreen • Use arrow keys to navigate</span>
                      </p>
                    ) : (
                      <p className="flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        <span>Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mx-1">F</kbd> for fullscreen • Use arrow keys to navigate</span>
                      </p>
                    )}
                  </div>
                  
                  {/* <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={toggleFullscreen}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      {fullscreenMode ? 'Exit Fullscreen' : 'Fullscreen'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Close Preview
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Mode */}
      {fullscreenMode && selectedItem && (
        <div className="fixed inset-0 z-[10000] bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            {selectedItem.type === 'video' ? (
              <video
                src={selectedItem.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={selectedItem.url}
                alt={selectedItem.title}
                className="w-auto h-auto max-w-full max-h-full object-contain"
              />
            )}
          </div>
          
          {/* Fullscreen Controls */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-lg p-2 z-30">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
              title="Exit fullscreen (ESC or F)"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleCloseModal}
              className="p-2 text-white hover:bg-white/20 rounded transition-colors"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation in fullscreen */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < filteredEvents.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          
          {/* Fullscreen Info */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white p-4 rounded-lg max-w-md">
            <h3 className="font-bold text-lg mb-1">{selectedItem.title}</h3>
            <p className="text-sm text-gray-300 mb-2">{selectedItem.description}</p>
            <div className="flex items-center text-xs text-gray-400">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatModalDate(selectedItem.date)}</span>
              <span className="mx-2">•</span>
              <span>
                {selectedItem.category === 'basf' ? 'BASF Company Event' : 'Sunshine School Event'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery;