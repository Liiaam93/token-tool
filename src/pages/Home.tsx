import React, { useState } from "react";
import { Textarea, Button, Box, Flex, Text, Checkbox } from "@chakra-ui/react";
import MessageDisplay from "../components/MessageDisplay";

interface AppProps {}

const Home: React.FC<AppProps> = () => {
  const [value, setValue] = useState("");
  const [formattedBarcodes, setFormattedBarcodes] = useState<string[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
  };

  const handleCheckboxChange = (barcode: string) => {
    setSelectedTokens((prevTokens) =>
      prevTokens.includes(barcode)
        ? prevTokens.filter((token) => token !== barcode)
        : [...prevTokens, barcode]
    );
  };

  const copyToClipboard = (barcode: string, index: number) => {
    navigator.clipboard.writeText(barcode);
    setCopiedIndex(index);
  };

  const handleClick = () => {
    setCopiedIndex(null);

    const barcodes = value.split(/\s+/);
    const formattedBarcodes = barcodes
      .map((barcode) => {
        const trimmedBarcode = barcode.replace(/[^A-Za-z0-9+]/g, "");
        return trimmedBarcode.slice(0, 18); // Trim to 18 characters
      })
      .filter((barcode) => barcode.length >= 16) as string[]; // Type assertion to string[]

    setFormattedBarcodes(formattedBarcodes);
  };

  return (
    <Box bg="gray.800" minHeight="100vh">
      <Flex
        p={2}
        maxW="80vw"
        m="auto"
        border="solid white 2px"
        borderRadius="5"
      >
        <Box flex="1" mr={4}>
          <Textarea
            color="white"
            placeholder="Paste barcodes here..."
            value={value}
            onChange={handleInputChange}
            w="90%"
            h="60vh"
            m="2"
          />
          <Box display="flex" flexDirection="column" justifyContent="center">
            <Button
              color="black"
              colorScheme="green"
              onClick={handleClick}
              m="2"
              width="90%"
            >
              Format Barcodes
            </Button>

            <MessageDisplay
              selectedTokens={selectedTokens}
              formattedBarcodes={formattedBarcodes}
            />
          </Box>
        </Box>

        <Box flex="1" m="2">
          {formattedBarcodes.map((barcode, index) => (
            <Flex
              key={index}
              align="center"
              mb={1}
              maxH="5vh"
              border="solid 1px white"
              borderRadius="5"
              backgroundColor={
                barcode.length < 18 ? "red.900" : "whiteAlpha.200"
              }
              _hover={
                barcode.length < 18
                  ? { bg: "red.700" }
                  : { bg: "whiteAlpha.400" }
              }
            >
              <Text
                flex="1"
                marginY="0"
                ml="10"
                textAlign="center"
                fontSize="12"
                color="white"
              >
                {barcode.length === 18
                  ? barcode.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3")
                  : barcode + " - Token Invalid"}
              </Text>
              <Button
                m="5"
                size="xs"
                colorScheme={copiedIndex === index ? "green" : "whiteAlpha"}
                onClick={() =>
                  copyToClipboard(
                    barcode.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3"),
                    index
                  )
                }
              >
                {copiedIndex === index ? "Copied" : "Copy"}
              </Button>
              <Checkbox
                isChecked={selectedTokens.includes(barcode)}
                onChange={() => handleCheckboxChange(barcode)}
                mr={2}
                size="sm"
                colorScheme="red"
                color="white"
              >
                RTS
              </Checkbox>
            </Flex>
          ))}
        </Box>
      </Flex>
    </Box>
  );
};

export default Home;