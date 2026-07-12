import React from 'react';

/**
 * Premium enterprise layout for auth screens.
 * Desktop: Left-side rich illustration, Right-side form slot.
 * Mobile/Tablet: Centered form layout.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex bg-background font-sans overflow-x-hidden">
      {/* Left Side: Enterprise Illustration (Desktop & Laptop only, hidden below lg breakpoint) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-700 via-blue-600 to-primary items-center justify-center p-12 text-white overflow-hidden select-none">
        
        {/* Soft decorative blur circles */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-400 rounded-full filter blur-[120px] opacity-35 animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300 rounded-full filter blur-[100px] opacity-25"></div>

        {/* Geometric Network Grid SVG Background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Content container */}
        <div className="relative z-10 w-full max-w-lg flex flex-col justify-between h-full">
          {/* Brand header */}
          <div className="flex items-center">
            {/* White variant logo */}
            <div className="inline-flex items-center gap-2.5">
              <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 14V6C4 4.89543 4.89543 4 6 4H14V14H4Z" fill="#FFFFFF" />
                <path d="M10 20V10C10 8.89543 10.8954 8 12 8H20V20H10Z" fill="#E0F2FE" className="mix-blend-overlay" />
                <circle cx="9" cy="9" r="1.5" fill="#2563EB" />
                <circle cx="15" cy="15" r="1.5" fill="#2563EB" />
              </svg>
              <span className="text-2xl font-bold tracking-tight text-white">
                Asset<span className="text-blue-100">Flow</span>
              </span>
            </div>
          </div>

          {/* Premium ERP Mockup Illustration */}
          <div className="my-auto py-8">
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl animate-fade-in">
              {/* Fake dashboard headers */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                  ERP Dashboard v1.0
                </div>
              </div>

              {/* Fake chart/stats layout */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-blue-200 font-medium uppercase tracking-wider">Total Assets</span>
                  <span className="text-xl font-bold">12,480</span>
                  <div className="text-[9px] text-green-300 flex items-center gap-1 mt-1">
                    <span>↑ 12.4%</span>
                    <span className="text-blue-200">from last month</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-blue-200 font-medium uppercase tracking-wider">Utilization</span>
                  <span className="text-xl font-bold">94.2%</span>
                  <div className="text-[9px] text-green-300 flex items-center gap-1 mt-1">
                    <span>↑ 2.1%</span>
                    <span className="text-blue-200">optimal rate</span>
                  </div>
                </div>
              </div>

              {/* Asset Flow visual timeline items */}
              <div className="mt-5 space-y-2.5">
                <div className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Recent Asset Tracking</div>
                <div className="flex items-center justify-between text-xs bg-white/5 border border-white/5 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="font-medium">Heavy Machinery #42</span>
                  </div>
                  <span className="text-[10px] text-blue-200">Assigned</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-white/5 border border-white/5 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></div>
                    <span className="font-medium">IT Rack Suite B</span>
                  </div>
                  <span className="text-[10px] text-blue-200">Maintenance</span>
                </div>
              </div>
            </div>

            {/* Tagline below illustration */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Enterprise Asset & Resource Management System
              </h2>
              <p className="text-sm text-blue-100 font-normal leading-relaxed">
                Streamline tracking, utilization logs, depreciation modeling, and security protocols in one unified, responsive workspace.
              </p>
            </div>
          </div>

          {/* Footer copyright */}
          <div className="text-[11px] text-blue-200 font-medium tracking-wide">
            © {new Date().getFullYear()} AssetFlow. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side: Auth Forms Card Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
export { AuthLayout };
