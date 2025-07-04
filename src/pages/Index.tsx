
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';
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
  const { needsOnboarding } = useOnboardingFlow();
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
  const fullSubtitle = "Premium business management platform designed for discerning professionals. Manage clients, track projects, automate workflows, and analyze performance with unparalleled sophistication.";
  
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
      description: "Sophisticated client relationship management with advanced tracking and analytics.",
      icon: <Users className="h-10 w-10 mb-4 text-quikle-primary opacity-90" />,
      path: "/customers",
      color: "border-quikle-primary/30",
      hoverColor: "hover:bg-quikle-primary/5",
    },
    {
      title: "Executive Dashboard",
      description: "Comprehensive business intelligence and performance metrics at your fingertips.",
      icon: <LayoutDashboard className="h-10 w-10 mb-4 text-quikle-secondary opacity-90" />,
      path: "/dashboard",
      color: "border-quikle-secondary/30",
      hoverColor: "hover:bg-quikle-secondary/5",
    },
    {
      title: "Advanced Analytics",
      description: "Deep insights and predictive analytics to drive strategic business decisions.",
      icon: <BarChart3 className="h-10 w-10 mb-4 text-quikle-accent opacity-90" />,
      path: "/analytics",
      color: "border-quikle-accent/30",
      hoverColor: "hover:bg-quikle-accent/5",
    },
  ];
  
  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      {/* Sophisticated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          ref={backgroundRef}
          className="absolute inset-0 opacity-10 bg-gradient-to-br from-quikle-primary via-quikle-secondary to-quikle-accent"
          style={{ filter: 'blur(60px)' }}
        ></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(31,41,55,0.02)_0%,transparent_50%)]"></div>
      </div>
      
      <div className="container max-w-6xl mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <img src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" alt="Quikle Logo" className="h-24 w-24 mb-4" />
          <h1 
            ref={titleRef}
            className="text-5xl md:text-6xl font-bold luxury-text leading-tight transition-transform duration-300 mb-4"
            style={{ transformStyle: 'preserve-3d' }}
          >
            Welcome to QUIKLE
          </h1>
          <p className="text-xl mt-2 text-quikle-slate max-w-3xl leading-relaxed min-h-[96px]">
            {subtitle}
          </p>
        </div>
        
        {/* Desktop Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group relative overflow-hidden glass-effect hover:shadow-luxury hover:-translate-y-3 transition-all duration-500">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-quikle-primary to-quikle-secondary transform origin-left transition-transform duration-700 scale-x-0 group-hover:scale-x-100`}></div>
              <CardContent className="pt-10 pb-8 px-6 flex flex-col items-center text-center h-full">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3 luxury-text">{feature.title}</h3>
                <p className="text-quikle-slate mb-6 flex-1 leading-relaxed">{feature.description}</p>
                <Button 
                  onClick={() => navigate(feature.path)} 
                  variant="outline" 
                  className={`w-full border-2 ${feature.color} text-quikle-primary ${feature.hoverColor} hover:border-quikle-primary/50 transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-platinum hover:shadow-elegant`}
                >
                  <span>Explore {feature.title}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
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
                  <Card className="overflow-hidden shadow-platinum border-quikle-silver/20 glass-effect">
                    <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center text-center">
                      <div className="mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 luxury-text">{feature.title}</h3>
                      <p className="text-quikle-slate mb-4 leading-relaxed">{feature.description}</p>
                      <Button 
                        onClick={() => navigate(feature.path)} 
                        variant="outline" 
                        className={`w-full border-2 ${feature.color} text-quikle-primary ${feature.hoverColor} hover:border-quikle-primary/50 transition-all`}
                      >
                        Explore {feature.title}
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious className="static transform-none mx-0 glass-effect" />
              <CarouselNext className="static transform-none mx-0 glass-effect" />
            </div>
          </Carousel>
        </div>
        
        {/* Premium Footer */}
        <div className="mt-16 glass-effect p-8 rounded-2xl backdrop-blur-xl shadow-luxury">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold luxury-text">Elevate Your Business Operations</h3>
              <p className="text-quikle-slate mt-2">Experience enterprise-grade management tools designed for excellence.</p>
            </div>
            <Button 
              onClick={() => {
                if (!user) {
                  navigate('/auth');
                } else if (needsOnboarding()) {
                  navigate('/company-onboarding');
                } else {
                  navigate('/dashboard');
                }
              }} 
              className="quikle-button-primary px-8 py-4 h-auto shadow-luxury hover:shadow-platinum text-lg font-medium"
            >
              {!user ? 'Get Started' : needsOnboarding() ? 'Complete Setup' : 'Enter Dashboard'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
