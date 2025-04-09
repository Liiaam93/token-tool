// LoginModal.tsx
import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Text,
  useToast,
} from "@chakra-ui/react";

import { login } from "../utils/loginPortal"; // Import the login function

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Error state to show login errors
  const toast = useToast(); // Chakra Toast for notifications

  const handleSubmit = async () => {
    try {
      // Call the login function passed from the parent
      await onLogin(email, password); // Call onLogin from the parent (Navbar)

      toast({
        title: "Login successful",
        description: "You are successfully logged in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setEmail("");
      setPassword("");
    } catch (err: any) {
      // Handle any errors from the login process
      setError("Login failed. Please try again.");
      toast({
        title: "Login failed",
        description: err.message || "An error occurred during login.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Login</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && <Text color="red.500">{error}</Text>} {/* Display error message */}
          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </FormControl>
          <FormControl isRequired mt={4}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Login
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
