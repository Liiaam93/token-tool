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
  Text,
  useToast,
  Spinner,
  Flex
} from "@chakra-ui/react";


interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false)
  const toast = useToast();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };


  const handleSubmit = async () => {
    try {
      setLoading(true)
      await onLogin(email, password);

      toast({
        title: "Login successful",
        description: "You are successfully logged in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setEmail("");
      setPassword("");
      setLoading(false)
    } catch (err: any) {
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
          {
            loading && (
              <Flex justify="center" align="center" flexDir={'column'} mt='10'>
                <Spinner size="xl" color="green.500" />
                <Text color={'white'}>Loading</Text>

              </Flex>
            )
          }

          {error && <Text color="red.500">{error}</Text>}
          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              onKeyDown={handleKeyDown}

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
              onKeyDown={handleKeyDown}

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
