
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  BarChart3, 
  LayoutDashboard, 
  ArrowRight 
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const backgroundRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  // Effect for parallax background movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!backgroundRef.current) return;
      
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      backgroundRef.current.style.transform = `translate(${x * -10}px, ${y * -10}px)`;

      // 3D effect for title
      if (titleRef.current) {
        const rotateX = (y - 0.5) * 10; // -5 to 5 degrees
        const rotateY = (0.5 - x) * 10; // -5 to 5 degrees
        titleRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Dynamic typing effect for subtitle
  const [subtitle, setSubtitle] = useState("");
  const fullSubtitle = "Universal business management platform designed for any industry. Manage clients, track projects, automate workflows, and analyze performance - all in one place.";
  
  useEffect(() => {
    let index = 0;
    
    const typingInterval = setInterval(() => {
      if (index < fullSubtitle.length) {
        setSubtitle((prev) => prev + fullSubtitle.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 30);
    
    return () => clearInterval(typingInterval);
  }, []);

  const features = [
    {
      title: "Client Management",
      description: "Track all your client interactions and project information in one centralized location.",
      icon: <Users className="h-10 w-10 mb-4 text-blue-600 opacity-90" />,
      path: "/customers",
      color: "border-blue-600",
      hoverColor: "hover:bg-blue-600",
    },
    {
      title: "Dashboard",
      description: "Get a comprehensive overview of your business performance and key metrics.",
      icon: <LayoutDashboard className="h-10 w-10 mb-4 text-purple-600 opacity-90" />,
      path: "/dashboard",
      color: "border-purple-600",
      hoverColor: "hover:bg-purple-600",
    },
    {
      title: "Analytics",
      description: "Analyze your business data and performance metrics to make informed decisions.",
      icon: <BarChart3 className="h-10 w-10 mb-4 text-indigo-600 opacity-90" />,
      path: "/analytics",
      color: "border-indigo-600",
      hoverColor: "hover:bg-indigo-600",
    },
  ];
  
  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          ref={backgroundRef}
          className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_10%_20%,rgb(59,130,246)_0%,rgb(147,51,234)_90%)]"
          style={{ filter: 'blur(50px)' }}
        ></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj4KPHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzM5ODJmNiIgb3BhY2l0eT0iMC4wMyI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjMzk4MmY2IiBvcGFjaXR5PSIwLjAzIiB4PSI1Ij48L3JlY3Q+CjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjMiIGZpbGw9IiMzOTgyZjYiIG9wYWNpdHk9IjAuMDMiIHg9IjEwIj48L3JlY3Q+Cjwvc3ZnPg==')] opacity-50"></div>
      </div>
      
      <div className="container max-w-6xl mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 
            ref={titleRef}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight transition-transform duration-300"
            style={{ transformStyle: 'preserve-3d' }}
          >
            Welcome to QUIKLE
          </h1>
          <p className="text-xl mt-6 text-gray-600 max-w-3xl leading-relaxed min-h-[96px]">
            {subtitle}
          </p>
        </div>
        
        {/* Desktop Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:-translate-y-2">
              <div className={`absolute inset-x-0 top-0 h-1 ${feature.color} transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100`}></div>
              <CardContent className="pt-10 pb-8 px-6 flex flex-col items-center text-center h-full">
                <div className="mb-2 transform group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 mb-6 flex-1">{feature.description}</p>
                <Button 
                  onClick={() => navigate(feature.path)} 
                  variant="outline" 
                  className={`w-full border-2 ${feature.color} text-gray-700 ${feature.hoverColor} hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group`}
                >
                  <span>View {feature.title}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Mobile Carousel */}
        <div className="md:hidden mb-12">
          <Carousel className="w-full">
            <CarouselContent>
              {features.map((feature, index) => (
                <CarouselItem key={index} className="pl-4">
                  <Card className="overflow-hidden shadow-md border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center text-center">
                      <div className="mb-2">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <Button 
                        onClick={() => navigate(feature.path)} 
                        variant="outline" 
                        className={`w-full border-2 ${feature.color} text-gray-700 ${feature.hoverColor} hover:text-white transition-all`}
                      >
                        View {feature.title}
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious className="static transform-none mx-0 bg-white/50 backdrop-blur-sm" />
              <CarouselNext className="static transform-none mx-0 bg-white/50 backdrop-blur-sm" />
            </div>
          </Carousel>
        </div>
        
        {/* Premium Footer */}
        <div className="mt-16 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 p-8 rounded-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">Ready to transform your business?</h3>
              <p className="text-gray-600 mt-2">Start managing your operations more effectively today.</p>
            </div>
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-600/90 hover:to-purple-600/90 text-white px-6 py-4 h-auto shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
