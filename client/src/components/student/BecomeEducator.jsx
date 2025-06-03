import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaChalkboardTeacher, FaGraduationCap, FaBook, FaLaptopCode } from "react-icons/fa";

const PARTICLE_COUNT = 30;

const BecomeEducatorPage = () => {
  const { backendUrl, getToken, setIsEducator } = useContext(AppContext);
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 1 + 0.5,
        delay: Math.random() * 5,
        color: [
          "rgba(59, 130, 246, 0.4)",
          "rgba(79, 70, 229, 0.4)",
          "rgba(16, 185, 129, 0.4)",
          "rgba(6, 182, 212, 0.4)",
        ][Math.floor(Math.random() * 4)],
      }));
      setParticles(newParticles);
    };

    if (containerRef.current) {
      generateParticles();
    }

    return () => setParticles([]);
  }, []);

  const handleApplyNow = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/update-role`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setIsEducator(true);
        toast.success("You are now an educator!");
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to update role.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to apply as educator.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const features = [
    { icon: <FaChalkboardTeacher />, title: "Teach Your Way", description: "Create courses in your own style with flexible tools" },
    { icon: <FaGraduationCap />, title: "Global Reach", description: "Connect with students from around the world" },
    { icon: <FaBook />, title: "Build Your Brand", description: "Establish yourself as an authority in your field" },
    { icon: <FaLaptopCode />, title: "Earn Income", description: "Generate revenue from your knowledge and expertise" },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            animate={{
              y: ["0%", "100%"],
              x: [`${particle.x}%`, `${particle.x + (Math.random() * 10 - 5)}%`],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: particle.speed * 15,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="absolute top-1/4 left-10 text-blue-500 opacity-20 hidden md:block">
        <motion.div
          animate={{ rotateY: [0, 360], y: [0, -10, 0] }}
          transition={{ rotateY: { duration: 10, repeat: Infinity, ease: "linear" }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
          style={{ fontSize: "80px" }}
        >
          <FaChalkboardTeacher />
        </motion.div>
      </div>

      <div className="absolute bottom-1/4 right-10 text-indigo-500 opacity-20 hidden md:block">
        <motion.div
          animate={{ rotateY: [0, -360], y: [0, 10, 0] }}
          transition={{ rotateY: { duration: 12, repeat: Infinity, ease: "linear" }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          style={{ fontSize: "70px" }}
        >
          <FaGraduationCap />
        </motion.div>
      </div>

      <div className="absolute top-1/3 right-1/4 hidden lg:block">
        <div className="educator-orb" />
      </div>

      <motion.div className="relative p-8 z-10 flex flex-col items-start max-w-lg" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="perspective-container mb-6" variants={itemVariants}>
          <h1 className="text-6xl font-bold font-serif whitespace-pre-line">
            <span className="educator-3d-text bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600">
              Become <br /> an Educator
            </span>
          </h1>
        </motion.div>

        <motion.div className="relative mb-8 max-w-md" variants={itemVariants}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 rounded-xl blur-xl filter opacity-70 animate-pulse-slow" />
          <p className="relative text-blue-800 text-lg bg-white/80 rounded-xl px-6 py-4 shadow-lg backdrop-blur-md border border-blue-100/50 transform hover:scale-105 transition-all duration-300">
            Becoming an educator allows you to share your{" "}
            <span className="font-semibold text-indigo-600 animate-shimmer bg-clip-text text-transparent bg-[length:200%_100%] bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600">
              knowledge and skills
            </span>{" "}
            with students around the world.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="self-center mt-4">
          <motion.button
            onClick={handleApplyNow}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-medium rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10" />
            <span className="relative z-10 flex items-center">
              <FaLaptopCode className="mr-2" />
              Apply Now!
            </span>
          </motion.button>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full" variants={containerVariants} initial="hidden" animate="visible">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/80 p-4 rounded-lg shadow-md backdrop-blur-sm border border-blue-100 hover:shadow-lg transition-all duration-300 flex items-start gap-3"
              variants={itemVariants}
            >
              <div className="text-blue-500 text-2xl">{feature.icon}</div>
              <div>
                <h3 className="font-bold text-blue-800">{feature.title}</h3>
                <p className="text-sm text-blue-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

const styles = `
  .educator-3d-text {
    text-shadow: 0 1px 0 rgba(59, 130, 246, 0.4), 0 2px 0 rgba(59, 130, 246, 0.3), 0 3px 0 rgba(59, 130, 246, 0.2), 0 4px 0 rgba(59, 130, 246, 0.1), 0 20px 30px rgba(0, 0, 0, 0.2);
    animation: float-3d 6s ease-in-out infinite;
  }

  @keyframes float-3d {
    0%, 100% { transform: translateY(0) translateZ(0) rotateX(0) rotateY(0); }
    25% { transform: translateY(-10px) translateZ(20px) rotateX(4deg) rotateY(10deg); }
    50% { transform: translateY(5px) translateZ(10px) rotateX(-2deg) rotateY(-5deg); }
    75% { transform: translateY(-5px) translateZ(15px) rotateX(3deg) rotateY(8deg); }
  }

  .perspective-container { perspective: 1000px; }

  .glassmorphism { backdrop-filter: blur(10px); }

  .educator-orb {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(79, 70, 229, 0.8), rgba(59, 130, 246, 0.4));
    filter: blur(8px);
    opacity: 0.6;
    animation: pulse-glow 4s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.3); opacity: 0.8; }
  }

  @keyframes pulse-slow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .animate-shimmer { animation: shimmer 3s linear infinite; }

  .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
`;

if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default BecomeEducatorPage;