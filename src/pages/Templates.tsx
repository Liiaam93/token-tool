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

const messages = [
  {
    id: 1,
    error: "Token hasn't been returned to spine",
    message:
      "Thank you for your E-mail, \nPlease return the token to the spine and reply to this email so we can print the token and your order can be placed. \nMany thanks",
  },
  {
    id: 2,
    error: "Token is invalid",
    message:
      "Thank you for your E-mail, \nThis is not a valid script token. Please check the token against the value printed on the script and reply with the correct bar code.\nMany thanks",
  },
  {
    id: 3,
    error: "Token already dispensed by sender",
    message:
      "Thank you for your E-mail \nThis token has been dispensed on your system, please reset and return back to the spine and notify us when complete. \nMany thanks",
  },
  {
    id: 4,
    error: "Token already ordered",
    message:
      "Thank you for your email,\nThis token was ordered on _____, if you have not received your item, please contact Wardles customer service quoting reference number _____.\nMany thanks",
  },
  {
    id: 5,
    error: "Token can't be found",
    message:
      "Thank you for your E-mail,\nThe token is showing that it can not be found.\n Please check the NHS tracker as it may have already been claimed.\nMany thanks",
  },
  {
    id: 6,
    error: "Token cancelled by prescriber",
    message:
      "Thank you for your E-mail,\nUnfortunately this token has been cancelled by the prescriber.\n Please check the NHS tracker for more information.\nMany thanks",
  },
];

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
        <Heading size={"lg"}>Email Message Templates</Heading>

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
