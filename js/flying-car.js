import React from 'react';

// Helper to import all media files from a directory
const importAll = (r) => r.keys().map(r);

let images = [];
let videos = [];

try {
  images = importAll(require.context('../img/Latest', false, /\.(png|jpe?g|gif|svg)$/i));
  videos = importAll(require.context('../img/Latest', false, /\.(mov|mp4)$/i));
} catch (err) {
  // Fallback for environments without require.context
  console.error('Dynamic media import failed:', err);
}

const FlyingCar = () => (
  <section className="project-section flying-car-section">
    <div className="container">
      <h2 className="text-center mb-4">Flying Car Prototype</h2>
      <p className="text-center mb-5">
        This project showcases my personal attempt at building a flying car by
        modifying a drone with 3D-printed wheels, custom-mounted motors, and an
        ESP32-based control system.
      </p>
      <div className="row">
        {images.map((src, i) => (
          <div key={`img-${i}`} className="col-6 col-md-4 mb-4">
            <img src={src} alt={`Flying car ${i + 1}`} className="img-fluid rounded" />
          </div>
        ))}
        {videos.map((src, i) => (
          <div key={`vid-${i}`} className="col-12 mb-4">
            <video controls className="w-100 rounded">
              <source src={src} />
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
      <div className="tech-stack">
        <h5>Tech stack</h5>
        <ul>
          <li>ESP32 microcontroller</li>
          <li>Drone motors</li>
          <li>3D-printed PLA components</li>
          <li>Custom wiring stack</li>
        </ul>
      </div>
    </div>
  </section>
);

export default FlyingCar;
