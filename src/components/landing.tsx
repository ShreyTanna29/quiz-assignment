import { motion } from "framer-motion";
import {
  BeakerIcon,
  AcademicCapIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center z-10"
        >
          <motion.h1
            className="text-6xl font-bold text-white mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Test Your Knowledge
          </motion.h1>
          <p className="text-xl text-purple-200 mb-8">
            Challenge yourself with our interactive quizzes
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/quiz")}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            Start Quiz
          </motion.button>
        </motion.div>

        {/* Floating Background Elements */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-4 w-4 bg-white rounded-full opacity-20"
              animate={{
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                ],
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section ref={ref} className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <BeakerIcon className="h-16 w-16" />,
              title: "Train Your Brain",
              description: "Enhance your knowledge with challenging questions",
            },
            {
              icon: <AcademicCapIcon className="h-16 w-16" />,
              title: "Learn & Grow",
              description: "Track your progress and improve your skills",
            },
            {
              icon: <LightBulbIcon className="h-16 w-16" />,
              title: "Get Inspired",
              description: "Discover new topics and expand your horizons",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center text-white"
            >
              <div className="text-purple-300 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-purple-200">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
