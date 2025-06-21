import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Code2, Users, Trophy, Rocket, ArrowRight, Zap, Globe, Target } from 'lucide-react';
import ParallaxContainer from '../components/ui/ParallaxContainer';
import FloatingElements from '../components/ui/FloatingElements';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import GlitchText from '../components/ui/GlitchText';
import { useParallax } from '../hooks/useParallax';

export default function Home() {
  const scrollY = useParallax();
  const { scrollYProgress } = useScroll();
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: Globe,
      title: 'GLOBAL COMMUNITY',
      description: 'Connect with developers from around the world and collaborate on innovative projects.',
    },
    {
      icon: Target,
      title: 'SKILL DEVELOPMENT',
      description: 'Improve your coding skills and learn new technologies through hands-on challenges.',
    },
    {
      icon: Zap,
      title: 'RAPID PROTOTYPING',
      description: 'Build functional prototypes in short timeframes and bring your ideas to life.',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <FloatingElements />
      
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-brutal relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="text-center"
          >
            {/* Main Heading */}
            <div className="mb-6 sm:mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative"
              >
                {/* HackNest - Main Brand */}
                <motion.h1 
                  className="font-space font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-primary leading-tight mb-4 sm:mb-6 lg:mb-8 relative z-10"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <GlitchText 
                    text="HACKNEST"
                    className="text-secondary"
                  />
                </motion.h1>

                {/* Subtitle - Smaller and less prominent */}
                <motion.h2 
                  className="font-space font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-primary/80 leading-tight mb-4 sm:mb-6 relative z-10"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  WHERE INNOVATION MEETS COLLABORATION
                </motion.h2>
                
                {/* Animated underline */}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 sm:h-2 bg-gradient-to-r from-secondary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                />
              </motion.div>
              
              <ParallaxContainer speed={0.3}>
                <motion.p 
                  className="font-inter text-base sm:text-lg md:text-xl lg:text-2xl text-primary/70 max-w-3xl mx-auto mb-8 sm:mb-10 lg:mb-12 px-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  Join the premier platform for discovering and participating in hackathons worldwide. 
                  Build, compete, and innovate with developers from around the globe.
                </motion.p>
              </ParallaxContainer>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-12 sm:mb-16 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '16px 16px 0px rgba(0,0,0,0.8)',
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group w-full sm:w-auto"
              >
                <Link
                  to="/hackathons"
                  className="bg-secondary text-background px-6 sm:px-8 py-3 sm:py-4 border-4 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-sm sm:text-base lg:text-lg inline-flex items-center justify-center relative overflow-hidden w-full sm:w-auto"
                >
                  <motion.div
                    className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  />
                  <Rocket className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 relative z-10" />
                  <span className="relative z-10">EXPLORE HACKATHONS</span>
                  <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 relative z-10" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '16px 16px 0px rgba(0,0,0,0.8)',
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group w-full sm:w-auto"
              >
                <Link
                  to="/auth"
                  className="bg-accent text-primary px-6 sm:px-8 py-3 sm:py-4 border-4 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-sm sm:text-base lg:text-lg inline-flex items-center justify-center relative overflow-hidden w-full sm:w-auto"
                >
                  <motion.div
                    className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  />
                  <Users className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 relative z-10" />
                  <span className="relative z-10">JOIN COMMUNITY</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <ParallaxContainer speed={0.2}>
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                {[
                  { number: '10K+', label: 'ACTIVE HACKERS' },
                  { number: '500+', label: 'HACKATHONS HOSTED' },
                  { number: '$2M+', label: 'PRIZES AWARDED' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.2, duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 10,
                    }}
                    className="bg-background border-4 border-primary shadow-brutal p-4 sm:p-6 relative group overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="font-space font-bold text-2xl sm:text-3xl lg:text-4xl text-secondary mb-2 relative z-10">
                      {stat.number}
                    </div>
                    <div className="font-inter font-semibold text-primary relative z-10 text-xs sm:text-sm lg:text-base">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </ParallaxContainer>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <ParallaxContainer speed={0.4}>
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-brutal bg-primary relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="font-space font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-background mb-4 sm:mb-6">
                WHY CHOOSE <GlitchText text="HACKNEST" className="text-accent" />?
              </h2>
              <p className="font-inter text-base sm:text-lg lg:text-xl text-background/80 max-w-3xl mx-auto">
                We provide everything you need to participate in or organize successful hackathons
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50, rotateX: -30 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    boxShadow: '20px 20px 0px rgba(0,0,0,0.8)',
                  }}
                  className="bg-background border-4 border-background shadow-brutal p-6 sm:p-8 text-center relative group overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-accent/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10"
                  >
                    <feature.icon className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-secondary mx-auto mb-4 sm:mb-6" />
                  </motion.div>
                  
                  <h3 className="font-space font-bold text-lg sm:text-xl text-primary mb-3 sm:mb-4 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="font-inter text-primary/80 relative z-10 text-sm sm:text-base">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ParallaxContainer>

      {/* CTA Section */}
      <ParallaxContainer speed={0.6}>
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-brutal relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-accent border-4 border-primary shadow-brutal p-6 sm:p-8 lg:p-12 relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative z-10"
              >
                <Code2 className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-primary mx-auto mb-4 sm:mb-6" />
              </motion.div>
              
              <h2 className="font-space font-bold text-2xl sm:text-3xl lg:text-4xl text-primary mb-4 sm:mb-6 relative z-10">
                READY TO START <GlitchText text="HACKING" className="text-secondary" />?
              </h2>
              <p className="font-inter text-sm sm:text-base lg:text-lg text-primary/80 mb-6 sm:mb-8 max-w-2xl mx-auto relative z-10">
                Join thousands of developers who are already building the future. 
                Your next breakthrough project is just one hackathon away.
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 inline-block"
              >
                <Link
                  to="/auth"
                  className="bg-secondary text-background px-6 sm:px-8 lg:px-10 py-3 sm:py-4 border-4 border-primary shadow-brutal hover:shadow-brutal-hover transition-all duration-200 font-inter font-bold text-sm sm:text-base lg:text-xl inline-flex items-center relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  />
                  <Trophy className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 relative z-10" />
                  <span className="relative z-10">GET STARTED NOW</span>
                  <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 relative z-10" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </ParallaxContainer>
    </div>
  );
}