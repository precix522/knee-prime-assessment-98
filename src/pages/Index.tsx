import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "@/components/ui/button";
import { FileText, User, Users, Check, ArrowRight, Info, UserRoundPlus, Star, BookOpen, Activity, Clipboard, BarChart, Award } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureCard } from "../components/FeatureCard";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section with Admin Login in corner */}
        <section className="text-center py-16 bg-gradient-to-b from-white to-gray-50 relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/manage-patients")}
              className="px-4 py-2"
            >
              <UserRoundPlus className="mr-2 h-4 w-4" />
              Admin Login
            </Button>
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                GATOR PRIME
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your personalized knee health assessment and monitoring system
              </p>
              
              {/* Single Main Action Button */}
              <div className="flex justify-center mt-8">                
                <Button
                  variant="health"
                  size="lg"
                  onClick={() => navigate("/patient-id")}
                  className="px-8 py-3 text-lg"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Access Your Report
                </Button>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button
                  variant="link"
                  onClick={() => document.getElementById('mission-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-primary"
                >
                  <Info className="mr-2 h-4 w-4" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Mission Section */}
        <section id="mission-section" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-purple-100 rounded-lg mb-10">
                <h2 className="text-3xl font-bold text-center pt-6 mb-4 text-gray-900">
                  Our Mission
                </h2>
                <div className="p-6">
                  <p className="text-xl text-gray-700 text-justify">
                    GATOR PRIME aims to be a global leader in medical technology. We continuously seek to address gaps in the medical and healthcare markets. We promise to invent novel devices and solutions to do so. We strive to deliver these inventions and technology in a universally accessible fashion.
                  </p>
                </div>
              </div>
              
              <div className="bg-purple-900 rounded-lg">
                <h2 className="text-3xl font-bold text-center pt-6 mb-4 text-white">
                  Our Vision
                </h2>
                <div className="p-6">
                  <p className="text-xl text-white/90 mb-4 text-justify">
                    GATOR PRIME is a medical technology company that believes in constant growth and innovation. We invent that which has not been invented, to enhance precision in diagnosis and efficiency in recovery and rehabilitation.
                  </p>
                  <p className="text-xl text-white/90 text-justify">
                    Our vision is to become a global leader in the development of innovative medical devices and solutions, for application within and beyond a clinical setting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about-section" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
                About Gator Prime
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-lg text-gray-700 mb-6 text-justify">
                    GATOR Prime is an advanced kinematic knee screening tool that offers a simple and effective way to assess your knee joint movement. Whether you're concerned about mobility limitations, recovering from an injury, or just want to take control of your knee health, GATOR Prime delivers personalised insights tailored to your unique needs.
                  </p>
                  <p className="text-lg text-gray-700 mb-6 text-justify">
                    GATOR Prime helps you protect your knee mobility. Even if you have no current symptoms, early screening can prevent future issues and help you stay active for years to come.
                  </p>
                  <p className="text-lg text-gray-700 text-justify">
                    Take charge of your knee health today with GATOR Prime—ensuring your mobility, comfort and overall well-being.
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
                <div className="text-center">
                  <img 
                    src="/lovable-uploads/e563ca10-e5ee-4f2f-9f8a-a5aea7b352b2.png" 
                    alt="Gator Prime Medical Devices" 
                    className="mx-auto max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Methodology Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
                Methodology
              </h2>
              <p className="text-xl text-center text-gray-700 mb-10">
                Understanding Your PRIME Score
              </p>
              <p className="text-lg text-center text-gray-600 mb-12 max-w-4xl mx-auto">
                The PRIME Score is your personalized knee health metric, providing clear insights into your current status and future risks.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clipboard className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-3">Assessment</h3>
                  <p className="text-center text-gray-600 mb-2">Comprehensive evaluation of your knee health</p>
                  <p className="text-center text-gray-600">
                    Your PRIME assessment combines clinical examination, functional testing, and self-reported health information to create a complete picture of your knee joint status.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-3">Scoring</h3>
                  <p className="text-center text-gray-600 mb-2">Your numerical knee health rating</p>
                  <p className="text-center text-gray-600">
                    The PRIME Score ranges from 0-100, with higher scores indicating better knee health and lower risk of future issues. This score helps you and your healthcare provider track progress over time.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-3">Recommendations</h3>
                  <p className="text-center text-gray-600 mb-2">Personalized action plan</p>
                  <p className="text-center text-gray-600">
                    Based on your PRIME Score, you'll receive tailored recommendations for exercises, lifestyle modifications, and potential medical interventions to maintain or improve your knee health.
                  </p>
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold text-center mb-6">The PRIME Score Scale</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-red-100 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-red-700">0-20</div>
                  <div className="text-red-800 font-medium">High Risk</div>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-orange-700">21-40</div>
                  <div className="text-orange-800 font-medium">At Risk</div>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-yellow-700">41-60</div>
                  <div className="text-yellow-800 font-medium">Moderate</div>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-700">61-80</div>
                  <div className="text-blue-800 font-medium">Good</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-green-700">81-100</div>
                  <div className="text-green-800 font-medium">Excellent</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Advantages Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
                Advantages
              </h2>
              <p className="text-xl text-center text-gray-700 mb-12">
                Benefits of Your PRIME Report
              </p>
              <p className="text-lg text-center text-gray-600 mb-12 max-w-4xl mx-auto">
                Accessing your personalized report provides valuable insights and actionable recommendations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Early Intervention</h3>
                    </div>
                    <p className="text-gray-600 text-center">
                      Identify potential issues before they develop into serious problems, allowing for preventative measures and early treatment.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <User className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Personalized Plan</h3>
                    </div>
                    <p className="text-gray-600 text-center">
                      Receive custom recommendations specific to your knee health profile, lifestyle, and goals for optimized results.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <BarChart className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
                    </div>
                    <p className="text-gray-600 text-center">
                      Monitor changes in your knee health over time with objective metrics, helping you stay motivated and informed.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Easy Access</h3>
                    </div>
                    <p className="text-gray-600 text-center">
                      View, download, and share your report securely through our platform, making it simple to collaborate with healthcare providers.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Evidence-Based</h3>
                    </div>
                    <p className="text-gray-600 text-center">
                      All assessments and recommendations are grounded in current medical research and clinical best practices.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Expert Support</h3>
                    </div>
                    <p className="text-gray-600 text-center">
                      Connect with healthcare professionals who can help interpret your results and guide your knee health journey.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
          
        {/* How It Works Section */}
        <section className="py-16 bg-white">
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
        <section className="py-16 bg-gray-50">
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
        <section className="py-16 bg-white">
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
        
        {/* Get Started Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                Get Started
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                Ready to Access Your PRIME Report?
              </p>
              <p className="text-lg text-gray-600 mb-10">
                Your personalized knee health assessment is just a few clicks away. Secure, confidential, and invaluable for your long-term mobility.
              </p>
              <Button
                variant="health"
                size="lg"
                onClick={() => navigate("/patient-id")}
                className="px-8 py-6 text-lg"
              >
                <FileText className="mr-2 h-5 w-5" />
                Access Your Report Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
