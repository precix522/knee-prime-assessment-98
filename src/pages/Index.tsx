import React, { useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/Card";
import { cn } from "../lib/utils";

const Index = () => {
  // Refs for animation elements
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Function to check if element is in viewport
  const isInViewport = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8
    );
  };

  // Handle scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const refs = [heroRef, aboutRef, scoreRef, benefitsRef, ctaRef];
      
      refs.forEach(ref => {
        if (ref.current && isInViewport(ref.current)) {
          ref.current.classList.add('animate-fade-in');
          ref.current.style.opacity = '1';
        }
      });
    };

    // Initial check
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden pt-28 md:pt-32 lg:pt-36 pb-16 md:pb-24 opacity-0 transition-opacity duration-700"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="animate-float bg-gray-50/50 backdrop-blur-sm px-3 py-1 rounded-full inline-flex items-center mb-8 border border-gray-200/50">
              <span className="bg-health-500 h-2 w-2 rounded-full mr-2"></span>
              <span className="text-sm text-gray-600 font-medium">Advanced Knee Health Assessment</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              <span className="block mb-1">Know Your Knees,</span>
              <span className="block text-health-600">Protect Your Future</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Access your personalized GATOR PRIME assessment reports to understand your joint health and take control of your mobility.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="outline" size="lg" onClick={() => window.location.href = '#about'}>
                Learn More
              </Button>
              <Button variant="health" size="lg" onClick={() => window.location.href = '/login'}>
                Access Your Report
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = '/manage-patients'}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-health-50 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-gray-100 rounded-full opacity-40 blur-3xl"></div>
        
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>
      
      {/* About Section */}
      <section 
        id="about" 
        ref={aboutRef}
        className="py-16 md:py-24 bg-white opacity-0 transition-opacity duration-700 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="h-px w-8 bg-health-300 mr-4"></span>
              <span className="text-health-600 font-medium uppercase text-sm tracking-wider">Our Mission</span>
              <span className="h-px w-8 bg-health-300 ml-4"></span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About GATOR PRIME
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive assessment system designed to evaluate and protect knee joint health.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto glassmorphism p-8 rounded-2xl">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">The Next Generation of Knee Health Assessment</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                GATOR PRIME is an innovative assessment tool developed by Precix to help patients and healthcare providers understand and manage knee health. Using advanced analytics and medical expertise, we provide personalized reports that guide treatment and prevention strategies.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By combining clinical data, biomechanical assessments, and lifestyle factors, GATOR PRIME delivers a comprehensive view of your knee joint health and potential risk factors.
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-12 w-64 h-64 bg-health-50 rounded-full opacity-20 blur-3xl"></div>
      </section>
      
      {/* PRIME Score Section */}
      <section 
        id="how-it-works" 
        ref={scoreRef}
        className="py-16 md:py-24 bg-gray-50 opacity-0 transition-opacity duration-700 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="h-px w-8 bg-health-300 mr-4"></span>
              <span className="text-health-600 font-medium uppercase text-sm tracking-wider">Methodology</span>
              <span className="h-px w-8 bg-health-300 ml-4"></span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Understanding Your PRIME Score
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The PRIME Score is your personalized knee health metric, providing clear insights into your current status and future risks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white overflow-hidden border-gray-100 card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-health-100 text-health-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle>Assessment</CardTitle>
                <CardDescription>Comprehensive evaluation of your knee health</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your PRIME assessment combines clinical examination, functional testing, and self-reported health information to create a complete picture of your knee joint status.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white overflow-hidden border-gray-100 card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-health-100 text-health-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle>Scoring</CardTitle>
                <CardDescription>Your numerical knee health rating</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The PRIME Score ranges from 0-100, with higher scores indicating better knee health and lower risk of future issues. This score helps you and your healthcare provider track progress over time.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white overflow-hidden border-gray-100 card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-health-100 text-health-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Personalized action plan</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Based on your PRIME Score, you'll receive tailored recommendations for exercises, lifestyle modifications, and potential medical interventions to maintain or improve your knee health.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-16 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">The PRIME Score Scale</h3>
            <div className="h-10 bg-gray-200 rounded-full overflow-hidden mb-6 shadow-inner">
              <div className="flex h-full">
                <div className="h-full bg-red-500 w-1/5 transition-all duration-500 ease-in-out"></div>
                <div className="h-full bg-orange-400 w-1/5 transition-all duration-500 ease-in-out"></div>
                <div className="h-full bg-yellow-400 w-1/5 transition-all duration-500 ease-in-out"></div>
                <div className="h-full bg-green-400 w-1/5 transition-all duration-500 ease-in-out"></div>
                <div className="h-full bg-green-600 w-1/5 transition-all duration-500 ease-in-out"></div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <div className="text-center">
                <div className="font-medium mb-1">0-20</div>
                <div>High Risk</div>
              </div>
              <div className="text-center">
                <div className="font-medium mb-1">21-40</div>
                <div>At Risk</div>
              </div>
              <div className="text-center">
                <div className="font-medium mb-1">41-60</div>
                <div>Moderate</div>
              </div>
              <div className="text-center">
                <div className="font-medium mb-1">61-80</div>
                <div>Good</div>
              </div>
              <div className="text-center">
                <div className="font-medium mb-1">81-100</div>
                <div>Excellent</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-1/4 -left-12 w-64 h-64 bg-health-50 rounded-full opacity-20 blur-3xl"></div>
      </section>
      
      {/* Benefits Section */}
      <section 
        id="benefits"
        ref={benefitsRef}
        className="py-16 md:py-24 bg-white opacity-0 transition-opacity duration-700 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="h-px w-8 bg-health-300 mr-4"></span>
              <span className="text-health-600 font-medium uppercase text-sm tracking-wider">Advantages</span>
              <span className="h-px w-8 bg-health-300 ml-4"></span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefits of Your PRIME Report
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Accessing your personalized report provides valuable insights and actionable recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 card-hover">
              <div className="w-12 h-12 bg-health-100 text-health-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Early Intervention</h3>
              <p className="text-gray-600">
                Identify potential issues before they develop into serious problems, allowing for preventative measures and early treatment.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 card-hover">
              <div className="w-12 h-12 bg-health-100 text-health-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Plan</h3>
              <p className="text-gray-600">
                Receive custom recommendations specific to your knee health profile, lifestyle, and goals for optimized results.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 card-hover">
              <div className="w-12 h-12 bg-health-100 text-health-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor changes in your knee health over time with objective metrics, helping you stay motivated and informed.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 card-hover">
              <div className="w-12 h-12 bg-health-100 text-health-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Access</h3>
              <p className="text-gray-600">
                View, download, and share your report securely through our platform, making it simple to collaborate with healthcare providers.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 card-hover">
              <div className="w-12 h-12 bg-health-100 text-health-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Evidence-Based</h3>
              <p className="text-gray-600">
                All assessments and recommendations are grounded in current medical research and clinical best practices.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 card-hover">
              <div className="w-12 h-12 bg-health-100 text-health-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Connect with healthcare professionals who can help interpret your results and guide your knee health journey.
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/3 -right-12 w-64 h-64 bg-health-50 rounded-full opacity-20 blur-3xl"></div>
      </section>
      
      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className="py-16 md:py-24 bg-gradient-to-br from-health-500 to-health-600 text-white opacity-0 transition-opacity duration-700 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOHY2YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJoNnptLTYgNmMwLTYuNjI3LTUuMzczLTEyLTEyLTEydjZjMy4zMTQgMCA2IDIuNjg2IDYgNmg2eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center mb-6">
            <span className="h-px w-8 bg-white/30 mr-4"></span>
            <span className="text-white/90 font-medium uppercase text-sm tracking-wider">Get Started</span>
            <span className="h-px w-8 bg-white/30 ml-4"></span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Access Your PRIME Report?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your personalized knee health assessment is just a few clicks away. Secure, confidential, and invaluable for your long-term mobility.
          </p>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="bg-white text-health-600 hover:bg-gray-100 border-white relative overflow-hidden group"
            onClick={() => window.location.href = '/login'}
          >
            <span className="relative z-10">Access Your Report Now</span>
            <span className="absolute inset-0 w-0 bg-gray-100 transition-all duration-300 ease-out group-hover:w-full"></span>
          </Button>  
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
