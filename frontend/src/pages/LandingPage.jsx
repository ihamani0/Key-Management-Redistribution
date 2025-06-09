import React from 'react'

// Icons: For a real project, you'd use a library like 'react-icons' or 'heroicons'.
// For simplicity, we'll use simple SVG components here.
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ChipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3m6-7h3m-3 7h3m-3-4.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
);

const CloudIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
);

function LandingPage() {
  return (
        <div className="bg-gray-900 text-gray-200 font-sans leading-relaxed">
      
      {/* ====== Header ====== */}
      <header className="py-6 px-8 flex justify-between items-center border-b border-gray-800 sticky top-0 bg-gray-900 bg-opacity-80 backdrop-blur-md z-50">
        <h1 className="text-2xl font-bold text-white">VectaraKMS</h1>
        <nav className="space-x-6 hidden md:block">
          <a href="#problem" className="hover:text-yellow-400 transition-colors">The Problem</a>
          <a href="#features" className="hover:text-yellow-400 transition-colors">Features</a>
          <a href="#dashboard" className="hover:text-yellow-400 transition-colors">Dashboard</a>
        </nav>
        <a href="#contact" className="bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-all">
          Learn More
        </a>
      </header>

      <main>
        {/* ====== Hero Section ====== */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 -mt-20">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Secure, Scalable Key Management for the IoT Era.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl">
            Introducing <span className="text-yellow-400 font-semibold">VectaraKMS</span>, a web-based platform designed to automate and simplify cryptographic key redistribution in complex IoT networks using an efficient Vector-based Key Management Scheme (VKMS).
          </p>
          <div className="mt-10">
            <a href="#problem" className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-all text-lg">
              Discover the Solution
            </a>
          </div>
        </section>

        {/* ====== Problem & Solution Section ====== */}
        <section id="problem" className="py-20 px-8 bg-gray-800">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">The IoT Key Management Challenge</h3>
              <p className="text-gray-400 mb-6">
                Manually managing cryptographic keys in large-scale, dynamic IoT networks is tedious, error-prone, and a major security risk. Existing solutions are often too complex, lack practical interfaces, and fail to support resource-constrained devices effectively.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 mt-1">✓</span>
                  <span><strong>Prone to Manual Errors:</strong> Tedious processes lead to critical mistakes.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 mt-1">✓</span>
                  <span><strong>Security Vulnerabilities:</strong> Lack of automation creates security gaps.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-3 mt-1">✓</span>
                  <span><strong>Inefficient for Constrained Devices:</strong> Heavy protocols drain limited power and computational resources.</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-900 p-8 rounded-lg shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">Our Solution: VectaraKMS</h3>
              <p className="text-gray-300">
                VectaraKMS bridges the gap between theoretical security and practical usability. By leveraging a lightweight, vector-based key scheme, we provide a centralized, user-friendly web platform that automates key redistribution. This ensures robust security while remaining highly efficient for even the most resource-constrained IoT devices.
              </p>
            </div>
          </div>
        </section>

        {/* ====== Features Section ====== */}
        <section id="features" className="py-20 px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features, Simplified.</h2>
            <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
              Our platform is designed to give administrators full control and visibility over their IoT network's security posture.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="bg-gray-800 p-8 rounded-lg">
                <LockIcon />
                <h4 className="text-xl font-bold text-white mb-2">Automated Key Redistribution</h4>
                <p className="text-gray-400">Securely schedule and perform key updates, renewals, and revocations with a few clicks, eliminating manual errors.</p>
              </div>
              <div className="bg-gray-800 p-8 rounded-lg">
                <ChipIcon />
                <h4 className="text-xl font-bold text-white mb-2">Lightweight & Efficient</h4>
                <p className="text-gray-400">Built on the VKMS protocol, our system minimizes computational and communication overhead, perfect for low-power IoT devices.</p>
              </div>
              <div className="bg-gray-800 p-8 rounded-lg">
                <CloudIcon />
                <h4 className="text-xl font-bold text-white mb-2">Centralized Web Dashboard</h4>
                <p className="text-gray-400">Manage device registration, monitor network health, and visualize key status from a single, intuitive web interface.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* ====== Dashboard Preview ====== */}
        <section id="dashboard" className="py-20 px-8 bg-gray-800">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Intuitive Management at Your Fingertips</h2>
                <p className="text-gray-400 mb-12 max-w-3xl mx-auto">
                    Our clean and responsive dashboard provides real-time monitoring and simplifies complex security tasks.
                </p>
                <div className="bg-gray-700 border-2 border-dashed border-gray-500 rounded-lg shadow-xl flex items-center justify-center h-96">
                    <p className="text-gray-400 text-2xl font-semibold">Your Dashboard Screenshot Goes Here</p>
                </div>
            </div>
        </section>

      </main>

      {/* ====== Footer ====== */}
      <footer id="contact" className="py-12 px-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Advance IoT Security?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            This project is currently in the conceptual phase based on academic research. Follow the progress or get in touch to discuss potential collaboration.
          </p>
          <a href="mailto:your-email@example.com" className="bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 transition-all text-lg">
            Contact Me
          </a>
          <p className="mt-12 text-gray-500">© {new Date().getFullYear()} Your Name. A Master Thesis Project.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage;




