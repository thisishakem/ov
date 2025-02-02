import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Upload } from './components/Upload';
import { ViewImage } from './components/ViewImage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/view/:token" element={<ViewImage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;