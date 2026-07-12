import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

/**
 * Main application component configuring routing.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background antialiased selection:bg-primary selection:text-white">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
