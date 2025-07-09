// components/PageWrapper.tsx
import { motion } from "framer-motion";

const pageVariants = {
  initial: {
    x: "100%",
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    x: "-100%",
    opacity: 0.5, // semi-visible while sliding out
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
    }}
  >
    {children}
  </motion.div>
);


export default PageWrapper;
