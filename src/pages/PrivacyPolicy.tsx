
import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">PreciX is committed to protecting your privacy. This privacy notice applies to the PreciX websites and governs the way that we collect and use the data you give us.
By using this website, you consent to the data practices described in this statement.</p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Collection of your personal information</h2>
                <p>
                  At GATOR PRIME, we take your privacy seriously. This Privacy Policy describes how we collect, use, 
                  and share information when you use our services, including our website and knee health assessment platform.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
                <p className="mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  fill out a form, or communicate with us. This may include:
                </p>
                <ul className="list-disc ml-6 mb-4 space-y-2">
                  <li>Contact information (name, email address, phone number)</li>
                  <li>Demographic information (age, gender)</li>
                  <li>Health information related to knee assessments</li>
                  <li>Account credentials</li>
                </ul>
                <p>
                  We also automatically collect certain information when you visit our website, including your 
                  IP address, browser type, and information about how you interact with our website.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc ml-6 mb-4 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and complete transactions</li>
                  <li>Send you technical notices, updates, security alerts, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Develop new products and services</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
                <p className="mb-4">
                  We may share information as follows:
                </p>
                <ul className="list-disc ml-6 mb-4 space-y-2">
                  <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf</li>
                  <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process</li>
                  <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of GATOR PRIME or others</li>
                  <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company</li>
                  <li>With your consent or at your direction</li>
                </ul>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
                <p>
                  We take reasonable measures to help protect information about you from loss, theft, misuse, 
                  unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable, 
                  and we cannot guarantee the security of our systems.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Choices</h2>
                <p className="mb-4">
                  You may update, correct, or delete information about you at any time by logging into your account or 
                  emailing us at privacy@gatorprime.com. You may also opt out of receiving promotional communications 
                  from us by following the instructions in those communications.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to this Policy</h2>
                <p>
                  We may change this Privacy Policy from time to time. If we make changes, we will notify you by 
                  revising the date at the top of the policy and, in some cases, we may provide you with additional 
                  notice (such as adding a statement to our website or sending you a notification).
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at: privacy@gatorprime.com or 
                  write to us at: GATOR PRIME, 2 College Road #02-00, Singapore 169850
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
