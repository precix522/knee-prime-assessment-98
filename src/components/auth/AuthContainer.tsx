
import React from "react";
import { Navbar } from "../Navbar";

interface AuthContainerProps {
  children: React.ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center flex-grow py-10">
        {children}
      </div>
    </div>
  );
}
