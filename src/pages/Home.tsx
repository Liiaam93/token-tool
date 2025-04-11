import React, { useState } from "react";
import { Textarea, Button, Box, Flex, useToast } from "@chakra-ui/react";
import MessageDisplay from "../components/MessageDisplay";
import BarcodeItem from "../components/BarcodeItem";

export interface FormattedBarcode {
  barcode: string;
  originalBarcode: string;
  valid: boolean;
}

const Home: React.FC = () => {
  const [value, setValue] = useState("");
  const [formattedBarcodes, setFormattedBarcodes] = useState<
    FormattedBarcode[]
  >([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [scriptNumbers, setScriptNumbers] = useState<{
    [barcode: string]: string;
  }>({});
  const [showScriptInput, setShowScriptInput] = useState(false);
  const [invalidBarcodes, setInvalidBarcodes] = useState<string[]>([]);
  const [lastCopiedBarcode, setLastCopiedBarcode] = useState<string>("");

  // Initialize useToast
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
  };

  const handleClick = () => {
    setSelectedTokens([]);
    const barcodes = value.split(/\s+/);
    const formattedBarcodes = barcodes
      .map((barcode) => {
        const trimmedBarcode = barcode.replace(/[^A-Za-z0-9+]/g, "");
        return {
          barcode: trimmedBarcode.slice(0, 18),
          valid: trimmedBarcode.length === 18,
          originalBarcode: barcode,
        };
      })
      .filter(({ barcode }) => barcode.length >= 16) as FormattedBarcode[];

    const invalids = formattedBarcodes.filter(({ valid }) => !valid);
    setInvalidBarcodes(invalids.map(({ originalBarcode }) => originalBarcode));

    setFormattedBarcodes(formattedBarcodes);
  };

  const handleAddScriptNumbers = () => {
    setShowScriptInput((prev) => !prev);
  };

  // Function to handle script number updates from BarcodeItem
  const updateScriptNumber = (barcode: string, scriptNumber: string) => {
    setScriptNumbers((prev) => ({
      ...prev,
      [barcode]: scriptNumber,
    }));
  };

  // Function to handle RTS checkbox changes
  const handleRTSChange = (barcode: string, checked: boolean) => {
    setSelectedTokens((prevTokens) =>
      checked
        ? [...prevTokens, barcode]
        : prevTokens.filter((token) => token !== barcode)
    );
  };

  // Function to copy text to clipboard
  const copyToClipboard = () => {
    const formattedText = formattedBarcodes
      .map(
        ({ barcode }) =>
          `${barcode
            .toUpperCase()
            .replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3")} - (REF: ${scriptNumbers[barcode] || ""
          })`
      )
      .join("\n");

    navigator.clipboard.writeText(formattedText).then(() => {
      toast({
        title: "Copied to clipboard",
        description:
          "The formatted barcodes and script numbers have been copied.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  return (
    <Box bg="gray.800" minHeight="100vh" >
      <Flex
        p={2}
        maxW="90vw"
        m="auto"
        border="solid white 2px"
        borderRadius="5"
      >
        <Box flex="1" mr={4} justifyContent={"center"}>
          <Textarea
            color="white"
            placeholder="Paste barcodes here..."
            value={value}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleClick();
              }
            }}
            w="90%"
            h="60vh"
            m="2"
          />
          <Button colorScheme="green" onClick={handleClick} m="2" width="90%">
            Format Barcodes
          </Button>

          <MessageDisplay
            selectedTokens={selectedTokens}
            formattedBarcodes={formattedBarcodes}
          />
        </Box>

        <Box flex="1" m="2">
          {invalidBarcodes.length > 0 && (
            <Box
              m="2"
              w="100%"
              color="red.500"
              textAlign={"center"}
              fontSize={"sm"}
              textDecoration={"underline"}
            >
              {`Invalid barcode(s) detected - please double check, as this could be a false error `}
            </Box>
          )}
          {formattedBarcodes.length > 0 && (
            <Flex justifyContent="center" mb="4">
              <Button
                colorScheme="green"
                size="sm"
                onClick={handleAddScriptNumbers}
              >
                {showScriptInput ? "Hide Script Numbers" : "Add Script Numbers"}
              </Button>
            </Flex>
          )}

          {formattedBarcodes.map((barcodeData, index) => (
            <BarcodeItem
              key={index}
              barcodeData={barcodeData}
              showScriptInput={showScriptInput}
              updateScriptNumber={updateScriptNumber}
              onRTSChange={handleRTSChange}
              isChecked={selectedTokens.includes(barcodeData.barcode)}
              lastCopiedBarcode={lastCopiedBarcode}
              setLastCopiedBarcode={setLastCopiedBarcode}
            />
          ))}

          {Object.keys(scriptNumbers).length > 0 && (
            <Box mt="4">
              <Textarea
                mt="2"
                value={formattedBarcodes
                  .map(
                    ({ barcode }) =>
                      `${barcode
                        .toUpperCase()
                        .replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3")} - ${scriptNumbers[barcode] || "still with ordering team"
                      }`
                  )
                  .join("\n")}
                isReadOnly
                color="white"
              />
              <Button
                colorScheme="blue"
                mt="2"
                w="100%"
                onClick={copyToClipboard}
              >
                Copy to Clipboard
              </Button>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Home;
