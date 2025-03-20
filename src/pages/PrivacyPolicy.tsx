
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
              <p className="text-gray-600 mb-6">PreciX is committed to protecting your privacy. This privacy notice applies to the PreciX websites and governs the way that we collect and use the data you give us. </p>
              <p className="text-gray-600 mb-6">By using this website, you consent to the data practices described in this statement.</p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Collection of your personal information</h2>
                <p className="text-gray-600 mb-6">
                  When you apply for or request specific PreciX services (such as subscriptions to email and newsletters), we will collect personal identifiable information related to the purpose and use of that service, which we will use to provide the services you have requested.
                </p>
                <p className="text-gray-600 mb-6">
                  We will never disclose your personal identifiable information to third parties for the purposes of allowing them to market to you.
                </p>
                <p className="text-gray-600 mb-6">
                  PreciX operates beyond Singapore and this means that we will transfer your personal identifiable information to other countries. If you do not want your personal information transferred in this way, please do not provide it to us on the website.
                </p>
                <p className="text-gray-600 mb-6">
                  As you navigate through this website, we will automatically collect anonymous information about you and your activities during your visit. This information includes navigational data and web server logs, and may include (but is not limited to) information such as your IP address, the version of both your browser and operating system, and the URL of the website you just came from.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our use of cookies</h2>
                <p className="mb-4">
                  Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and allows us to improve our website.
                </p>
                <p className="mb-4">
                  A cookie is a small file of letters and numbers that we store on your browser or the hard drive of your computer if you agree. Cookies contain information that is transferred to your computer's hard drive.
                </p>
                <p className="mb-4">
                  We use the following types of cookies on precix.io:
                </p>
                <p className="mb-4">
                  <strong>Strictly necessary cookies.</strong><br />
                  These are cookies that are required for the operation of our website. They include, for example, cookies that enable you to log into secure areas of our website (e.g. the use of any learning resources) and anti-forgery token cookies.
                </p>
                <p className="mb-4">
                  <strong>Performance cookies.</strong><br />
                  They allow us to recognise and count the number of visitors and to see how visitors move around our website, for instance which pages visitors go to most often and if they receive an error message. This helps us to improve the way our website works, for example, by ensuring that users are finding what they are looking for easily. These cookies are deleted when the browser is closed.
                </p>
                <p className="mb-4">
                  <strong>Targeting cookies.</strong><br />
                  These cookies record your visit to our website, the pages you have visited and the links you have followed. We use this information to make our website and advertising more relevant to your interests.
                </p>
                <p className="mb-4">
                  Please note that third parties (including for example advertising networks and providers of external services like web traffic analysis services) may also use cookies, over which we have no control.
                  We do not sell the information collected by cookies, nor do we disclose the information to unrelated third parties, except where required by law (for example to government bodies and law enforcement agencies).
                </p>
                <p className="mb-4">
                  You have the ability to accept or decline cookies. Most web browsers automatically accept cookies but you can usually modify your browser setting to decline cookies if you prefer. If you use your browser settings to block all cookies, you may not be able to access all or parts of our website. Unless you have adjusted your browser setting so that it will refuse cookies, once you have opted in to accept our cookies, our system will issue cookies as soon as you visit our website.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to this statement</h2>
                <p className="mb-4">PreciX will occasionally update this privacy notice to reflect company and customer feedback. We will not proactively notify you of any such changes and encourage you to periodically review this notice.</p>
                <p className="mb-4">This statement was last updated on 17 November 2020.</p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p className="mb-4">If you have questions or requests, please feel free to contact us at <b>cs@precix.io</b> </p>
                <p className="mb-4">Because email communications are not always secure, please do not include sensitive information in your emails to us.</p>
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
