import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Heading,
  useToast,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { messages } from "../data/ErrorMessages";

const Templates = () => {
  const [templates, setTemplates] = useState<
    { id: number; error: string; message: string }[]
  >([]);
  const toast = useToast();

  useEffect(() => {
    setTemplates(messages);
  }, []);

  const copyToClipboard = (message: string) => {
    navigator.clipboard.writeText(message).then(
      () => {
        toast({
          title: "Copied to clipboard.",
          // description: ,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      },
      (err) => {
        toast({
          title: "Failed to copy.",
          description: err,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    );
  };

  return (
    <Box bg="gray.800" minHeight="100vh" color="white">
      <VStack spacing={4} maxW="90vw" m="auto" p={4}>
        <Heading size={"md"}>Email Message Templates</Heading>

        <Flex wrap={"wrap"} justifyContent={"center"}>
          {templates.length > 0 ? (
            templates.map((template) => (
              <Box
                key={template.id}
                p={4}
                m="1"
                border="1px solid white"
                borderRadius="lg"
                w={["100%", "48%", "30%"]}
                bg="gray.700"
                display="flex"
                flexDirection="column"
              >
                <Box w="100%" textAlign={"center"} mb="4">
                  <Text backgroundColor={"#AA2F33"} borderRadius={"10"}>
                    {template.error}
                  </Text>
                </Box>
                {template.message.split("\n").map((line, index) => (
                  <Text fontSize={"small"} m={2} key={index}>
                    {line}
                  </Text>
                ))}
                <Spacer />
                <Button
                  size={"sm"}
                  colorScheme="green"
                  onClick={() => copyToClipboard(template.message)}
                >
                  Copy
                </Button>
              </Box>
            ))
          ) : (
            <Text>No templates found.</Text>
          )}
        </Flex>
      </VStack>
    </Box>
  );
};

export default Templates;
