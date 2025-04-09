import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FileText, User, Users } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Hero Section */}
            <section className="text-center py-12 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                GATOR PRIME
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your personalized knee health assessment and monitoring system
              </p>
              
              {/* Login Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Button
                  variant="health"
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 text-lg bg-orange-500 hover:bg-orange-600"
                >
                  <User className="mr-2 h-5 w-5" />
                  Patient Login
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/general-login")}
                  className="px-8 py-3 text-lg border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Admin Login
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Looking for your report? Enter your Patient ID
              </p>
              <div className="flex justify-center">
                <Button
                  variant="link"
                  onClick={() => navigate("/patient-id")}
                  className="text-orange-600"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Enter Patient ID
                </Button>
              </div>
            </section>
            
            {/* Features Section */}
            <section className="py-10">
              <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
                Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card
                  title="Comprehensive Assessment"
                  description="Detailed analysis of your knee health and overall mobility assessment"
                  icon="📊"
                />
                <Card
                  title="Personalized Reports"
                  description="Customized report with specific recommendations for your condition"
                  icon="📝"
                />
                <Card
                  title="Ongoing Monitoring"
                  description="Track progress over time and update your treatment plan accordingly"
                  icon="📱"
                />
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
