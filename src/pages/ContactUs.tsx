
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  // Page loading state - shows while checking auth status
  const [pageLoading, setPageLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  
  // Auth store state and methods
  const {
    user,
    isLoading,
    isVerifying,
    error,
    phoneNumber,
    sendOTP,
    verifyOTP,
    clearError,
    validateSession
  } = useTwilioAuthStore();

      <Footer />
    </div>
  );
}


