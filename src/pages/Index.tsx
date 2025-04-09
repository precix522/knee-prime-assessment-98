
import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "../components/FeatureCard";
import { FileText, User, Users, Check, ArrowRight, Info, UserRoundPlus } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                GATOR PRIME
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your personalized knee health assessment and monitoring system
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 text-lg"
                >
                  <User className="mr-2 h-5 w-5" />
                  Patient Login
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/patient-id")}
                  className="px-8 py-3 text-lg"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Access Your Report
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/manage-patients")}
                  className="px-8 py-3 text-lg"
                >
                  <UserRoundPlus className="mr-2 h-5 w-5" />
                  Sign Up
                </Button>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button
                  variant="link"
                  onClick={() => navigate("/general-login")}
                  className="text-primary"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Admin Login
                </Button>
                <Button
                  variant="link"
                  onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-primary"
                >
                  <Info className="mr-2 h-4 w-4" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about-section" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
                About Gator Prime
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-lg text-gray-700 mb-6">
                    Gator Prime is an innovative knee health assessment and monitoring system designed to help patients maintain optimal joint health and mobility.
                  </p>
                  <p className="text-lg text-gray-700">
                    Developed by a team of orthopedic specialists and health technology experts, our system provides personalized evaluations, recommendations, and progress tracking to ensure you receive the best care for your knee health.
                  </p>
                  <div className="mt-8">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/contactus")}
                    >
                      Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="rounded-lg overflow-hidden shadow-lg w-full max-w-md h-64 bg-gray-200">
                    <img 
                      src="/placeholder.svg" 
                      alt="Knee health assessment" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-3">Assessment</h3>
                  <p className="text-gray-600">Complete a comprehensive knee health assessment with our specialists</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-3">Analysis</h3>
                  <p className="text-gray-600">Receive a detailed analysis and personalized recommendations</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-3">Monitoring</h3>
                  <p className="text-gray-600">Track your progress and adjust your care plan over time</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
                Benefits
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Early Detection</h3>
                    <p className="text-gray-600">Identify potential issues before they become serious problems, allowing for proactive interventions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Personalized Care</h3>
                    <p className="text-gray-600">Receive recommendations tailored to your specific condition, lifestyle, and goals</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Continuous Monitoring</h3>
                    <p className="text-gray-600">Track changes in your knee health over time with regular assessments and updates</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Improved Outcomes</h3>
                    <p className="text-gray-600">Achieve better long-term results through consistent monitoring and timely interventions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
                Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  title="Comprehensive Assessment"
                  description="Detailed analysis of your knee health and overall mobility assessment"
                  icon="📊"
                />
                <FeatureCard
                  title="Personalized Reports"
                  description="Customized report with specific recommendations for your condition"
                  icon="📝"
                />
                <FeatureCard
                  title="Ongoing Monitoring"
                  description="Track progress over time and update your treatment plan accordingly"
                  icon="📱"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
