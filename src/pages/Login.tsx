
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";

export default function Login() {
  const { login, isLoading, user } = useTwilioAuthStore();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone"); // "phone" or "code"
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    
    try {
      setError("");
      
      // In a real app, this would call an API to send a verification code
      // For demo purposes, we'll just move to the code step
      setStep("code");
      
    } catch (error) {
      console.error("Error sending verification code:", error);
      setError("Failed to send verification code. Please try again.");
    }
  };
  
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!code || code.length < 4) {
      setError("Please enter a valid verification code");
      return;
    }
    
    try {
      setError("");
      
      // Mock successful login with phone verification
      await login({
        id: "user123",
        phone: phone,
        name: "Test User"
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Error verifying code:", error);
      setError("Invalid verification code. Please try again.");
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Access Your PRIME Report</h1>
                <p className="mt-2 text-gray-600">
                  {step === "phone" 
                    ? "Enter your phone number to access your personalized knee health report" 
                    : "Enter the verification code sent to your phone"}
                </p>
              </div>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {step === "phone" ? (
                <form onSubmit={handlePhoneSubmit}>
                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="(123) 456-7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    variant="health"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Verification Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCodeSubmit}>
                  <div className="mb-6">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter 4-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      For demo purposes, enter any 4 digits
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <Button
                      type="submit"
                      variant="health"
                      size="lg"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                    
                    <button
                      type="button"
                      className="text-sm text-orange-600 hover:text-orange-700"
                      onClick={() => setStep("phone")}
                      disabled={isLoading}
                    >
                      Back to Phone Entry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
