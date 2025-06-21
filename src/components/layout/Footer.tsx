import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer 
      className="bg-primary text-background border-t-4 border-primary mt-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-brutal py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              <span className="font-space font-bold text-lg sm:text-xl text-background">
                HACKNEST
              </span>
            </div>
            <p className="font-inter text-background/80 mb-6 max-w-md text-sm sm:text-base">
              The premier platform for discovering and participating in hackathons worldwide. 
              Build, compete, and innovate with developers from around the globe.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-background text-primary p-2 border-2 border-background shadow-brutal-sm hover:bg-accent hover:text-primary transition-all duration-200"
              >
                <Github className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-background text-primary p-2 border-2 border-background shadow-brutal-sm hover:bg-accent hover:text-primary transition-all duration-200"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-background text-primary p-2 border-2 border-background shadow-brutal-sm hover:bg-accent hover:text-primary transition-all duration-200"
              >
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 md:mt-0">
            <h3 className="font-space font-bold text-base sm:text-lg text-background mb-4">
              QUICK LINKS
            </h3>
            <ul className="space-y-2">
              {['Hackathons', 'About', 'How it Works', 'FAQ'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="font-inter text-background/80 hover:text-accent transition-colors duration-200 text-sm sm:text-base"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="mt-8 md:mt-0">
            <h3 className="font-space font-bold text-base sm:text-lg text-background mb-4">
              SUPPORT
            </h3>
            <ul className="space-y-2">
              {['Contact', 'Privacy Policy', 'Terms of Service', 'Help Center'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="font-inter text-background/80 hover:text-accent transition-colors duration-200 text-sm sm:text-base"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-background/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-inter text-background/60 text-xs sm:text-sm">
              © 2024 HackNest. All rights reserved.
            </p>
            <p className="font-inter text-background/60 mt-2 md:mt-0 text-xs sm:text-sm">
              Built with 💚 for the developer community
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}