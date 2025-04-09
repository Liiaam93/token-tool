import React, { useState, useEffect } from "react";
import { Box, Flex, HStack, Link as ChakraLink, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";
import LoginModal from "./LoginModal"; // Import the LoginModal component
import { login } from "../utils/loginPortal";

const Links = [
  { name: "Home", path: "/" },
  { name: "Branch Codes", path: "/branch-codes" },
  { name: "Templates", path: "/templates" },
  { name: "Portal", path: "/portal" },
  { name: "Report", path: "/reports" },
];

const NavLink = ({ name, path }: { name: string; path: string }) => (
  <ChakraLink
    as={RouterLink}
    to={path}
    px={8}
    color={"whatsapp.200"}
    pb={2}
    _hover={{
      textDecoration: "none",
      bg: "whatsapp.800",
      transition: "background-color 0.3s",
      border: "solid white 2px",
      borderTopRadius: "md",
    }}
  >
    {name}
  </ChakraLink>
);

const Navbar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem("bearerToken")); // Initialize state from localStorage

  // Open and close the modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Listen for localStorage changes and update the token state
  useEffect(() => {
    const storedToken = localStorage.getItem("bearerToken");
    setToken(storedToken);
  }, []); // Empty dependency array to run only on mount

  // Handle Login (triggered by LoginModal)
  const handleLogin = async (email: string, password: string) => {
    console.log("Logging in with", email, password);
    
    // Simulating a successful login and generating a token
    const generatedToken = await login(email, password); // Replace with actual logic from your API
    localStorage.setItem("bearerToken", generatedToken); // Store token in localStorage

    // Update token state and force re-render immediately
    setToken(generatedToken); 

    closeModal(); // Close the modal after login
  };

  const handleLogout = () => {
    localStorage.removeItem("bearerToken"); // Remove token from localStorage
    setToken(null); // Update state to null
  };

  return (
    <Box bg="#1A202C" px={4} color={"white"} position="relative" fontFamily={"jura"}>
      <Box textAlign="center" mb={2}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
          <Box display="inline-block" fontFamily={"jura"}>
            <Typewriter
              options={{
                delay: 30,
                loop: false,
              }}
              onInit={(typewriter) => {
                typewriter
                  .typeString("Liam's Super Professional Token Tool")
                  .pauseFor(1000)
                  .start();

                setTimeout(() => {
                  const cursor = document.querySelector(".Typewriter__cursor") as HTMLElement;
                  if (cursor) {
                    cursor.style.display = "none";
                  }
                }, 5000);
              }}
            />
          </Box>
        </motion.div>
      </Box>
      <Flex h={8} alignItems={"center"} justifyContent={"space-between"}>
        <HStack spacing={8} alignItems={"center"} justifyContent="center" flex="1">
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            {Links.map((link) =>
              (link.name !== "Portal" && link.name !== "Report") || token ? (
                <NavLink key={link.name} name={link.name} path={link.path} />
              ) : null
            )}
          </HStack>
        </HStack>

        {/* Login/Logout Button */}
        {token ? (
          <Button mb='10' colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button mb="10" colorScheme="teal" onClick={openModal}>
            Login
          </Button>
        )}
      </Flex>

      {/* Login Modal */}
      <LoginModal isOpen={isModalOpen} onClose={closeModal} onLogin={handleLogin} />
    </Box>
  );
};

export default Navbar;
