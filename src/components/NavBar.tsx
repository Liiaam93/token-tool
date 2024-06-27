import React from "react";
import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  Heading,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const Links = [
  { name: "Home", path: "/" },
  { name: "Branch Codes", path: "/branch-codes" },
  { name: "Templates", path: "/templates" },
];

const NavLink = ({ name, path }: { name: string; path: string }) => (
  <ChakraLink
    as={RouterLink}
    to={path}
    px={8}
    pb={2}
    _hover={{
      textDecoration: "none",
      bg: "green.600",
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
    <Box bg="#1A202C" px={4} color={"white"}>
      <Box textAlign="center" mb={2}>
        <Box
          display="inline-block"
          bgGradient="linear(to-r, red.500, orange.400, yellow.300, green.300, teal.300, blue.400, purple.500)"
          bgClip="text"
        >
          <Heading size="sm">Liam's Magical Token Tool</Heading>
        </Box>
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
