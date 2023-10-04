import React, { useEffect, useState } from "react";
import {
  Textarea,
  Button,
  Box,
  Flex,
  Text,
  Heading,
  Checkbox,
} from "@chakra-ui/react";

function App() {
  const [value, setValue] = useState("");
  const [formattedBarcodes, setFormattedBarcodes] = useState<string[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [displayedMessage, setDisplayedMessage] = useState<JSX.Element | null>(
    null
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
  };

  useEffect(() => {
    const updatedMessage = displayMessage(); // Get the initial message

    // Check if any barcode is less than 18 characters and update the message accordingly
    const invalidTokens = formattedBarcodes
      .filter((barcode) => barcode.length < 18)
      .map((barcode) => barcode.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3"));

    if (invalidTokens.length > 0) {
      const invalidTokensMessage = `The following tokens are invalid: \n ${invalidTokens.join(
        "\n "
      )}`;
      setDisplayedMessage(
        <div style={{ whiteSpace: "pre-line" }}>
          Hi thank you for your e-mail,
          <br />
          {updatedMessage}
          <br />
          {invalidTokensMessage}
          <br />
          Many Thanks
        </div>
      );
    } else {
      setDisplayedMessage(updatedMessage);
    }
  }, [selectedTokens, formattedBarcodes]);

  const handleCheckboxChange = (barcode: string) => {
    setSelectedTokens((prevTokens) =>
      prevTokens.includes(barcode)
        ? prevTokens.filter((token) => token !== barcode)
        : [...prevTokens, barcode]
    );
  };

  const displayMessage = () => {
    if (selectedTokens.length > 0) {
      const tokensString = selectedTokens
        .map((token) => `${token.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3")}`)
        .join("\n"); // New line after each token

      return (
        <div style={{ whiteSpace: "pre-line" }}>
          Please return the following tokens to the spine so that your order can
          be placed:
          <br />
          {tokensString}
          <br />
        </div>
      );
    }
    return null;
  };

  const copyToClipboard = (barcode: string, index: number) => {
    navigator.clipboard.writeText(barcode);
    setCopiedIndex(index);
  };

  const handleClick = () => {
    const barcodes = value.split(/\s+/);
    const formattedBarcodes = barcodes
      .map((barcode) => {
        const trimmedBarcode = barcode.replace(/[^A-Za-z0-9+]/g, "");
        return trimmedBarcode.slice(0, 18); // Trim to 18 characters
      })
      .filter((barcode) => barcode.length >= 16);

    setFormattedBarcodes(formattedBarcodes);
  };

  return (
    <Box bg="gray.800" minHeight="100vh">
      <Box
        m="auto"
        w="20%"
        bgGradient="linear(to-r, red.500, orange.400, yellow.300, green.300, teal.300, blue.400, purple.500)"
        bgClip="text"
      >
        <Heading size={"md"} textAlign="center" pt="5" pb="5">
          Liam's Magical Token Tool
        </Heading>
      </Box>
      <Flex
        p={2}
        maxW="80vw"
        m="auto"
        border="solid white 2px"
        borderRadius={"5"}
      >
        {/* Input box on the left */}
        <Box flex="1" mr={4}>
          <Textarea
            color={"white"}
            placeholder="Paste barcodes here..."
            value={value}
            onChange={handleInputChange}
            w="90%"
            h="60vh"
            m="2"
          />
          <Box display="flex" flexDirection="column" justifyContent="center">
            <Button
              color={"black"}
              colorScheme="green"
              onClick={handleClick}
              m="2"
              width="90%"
            >
              Format Barcodes
            </Button>
            {selectedTokens.length > 0 && (
              <Flex bgColor={"slategrey"} m="2" w={"90%"} borderRadius="5">
                <Text p="5" color={"black"}>
                  {displayedMessage}
                </Text>
              </Flex>
            )}
          </Box>
        </Box>

        {/* Formatted list on the right */}
        <Box flex="1" p="1">
          {formattedBarcodes.map((barcode, index) => (
            <Flex
              key={index}
              align="center"
              mb={1}
              maxH={"5vh"}
              border="solid 1px white"
              borderRadius="5"
              backgroundColor={"whiteAlpha.200"}
              _hover={{ bg: "whiteAlpha.400" }}
            >
              <Text
                flex="1"
                marginY="0"
                ml="10"
                textAlign="center"
                fontSize="12"
                color={"white"}
              >
                {barcode.length === 18
                  ? barcode.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3")
                  : barcode + " - Token Invalid"}
              </Text>
              <Button
                m="5"
                size="xs"
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
                color={"white"}
              >
                RTS
              </Checkbox>
            </Flex>
          ))}
        </Box>
      </Flex>
    </Box>
  );
}

export default App;
