import React from "react";
import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";

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
  return (
    <Box bg="#1A202C" px={4} color={"white"} position="relative" fontFamily={'jura'}>
      <Box textAlign="center" mb={2}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box display="inline-block" fontFamily={'jura'}>
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

                // Hide cursor after 7 seconds
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
        <HStack
          spacing={8}
          alignItems={"center"}
          justifyContent="center"
          flex="1"
        >
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            {Links.map((link) => (
              <NavLink key={link.name} name={link.name} path={link.path} />
            ))}
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
