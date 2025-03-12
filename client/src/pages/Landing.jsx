import React from "react";
import Button from "../components/Button";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaGlobe,
} from "react-icons/fa";

const Landing = () => {
  return (
    <div className="relative h-screen overflow-hidden flex flex-col justify-between">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="landing.mp4" type="video/mp4" />
      </video>

      {/* Navbar */}
      <div className="fixed top-0 w-full bg-black backdrop-blur-lg shadow-md p-2 flex justify-between items-center">
        <div className="flex items-center mr-2">
          <span className=" text-white">TechSpardha 2025 | Microbus</span>
        </div>

        {/* Absolute Centered Text */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-white font-mono text-lg">
          Are you ready to hunt?
        </div>

        <div className="flex items-center space-x-4">
          <Button to="/login">Login</Button>
          <Button to="/register">Register</Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-black backdrop-blur-lg shadow-md p-3 flex justify-evenly items-center">
        {/* Left Side: Text */}

        {/* Right Side: Social Media Links */}
        <div className="flex items-center space-x-4 mb-1">
          <a
            href="https://www.linkedin.com/company/microbusnitkkr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="text-white/80 hover:text-white text-2xl transition-colors" />
          </a>
          <a
            href="https://www.facebook.com/microbusnitkkr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook className="text-white/80 hover:text-white text-2xl transition-colors" />
          </a>
          <a
            href="https://instagram.com/microbus_nitkkr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="text-white/80 hover:text-white text-2xl transition-colors" />
          </a>
          <a
            href="https://www.microbus-nitkkr.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGlobe className="text-white/80 hover:text-white text-2xl transition-colors" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
