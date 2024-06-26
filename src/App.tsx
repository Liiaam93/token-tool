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
import MessageDisplay from "./components/MessageDisplay";
import { fetchPage } from "./scrape";

interface AppProps {}

export interface FormattedBarcode {
  barcode: string;
  originalBarcode: string;
  valid: boolean;
}

export interface PortalType {
  created_by: string;
  created_date: number;
  created_date_string: string;
  email: string;
  id: string;
  modified_time: string;
  order_open: boolean;
  order_search_id: string;
  order_type: string;
  pharmacy_account_number: string;
  pharmacy_name: string;
  pharmacy_post_code: string;
  record_status: string;
  record_type: string;
}

const App: React.FC<AppProps> = () => {
  const [value, setValue] = useState("");
  const [formattedBarcodes, setFormattedBarcodes] = useState<
    FormattedBarcode[]
  >([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [portalData, setPortalData] = useState<PortalType[]>([]);

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

  useEffect(() => {
    const fetchPortal = async () => {
      const { data } = await fetchPage();
      console.log(data.items);
      setPortalData(data.items);
    };
    fetchPortal();
  }, []);

  const handleClick = () => {
    setCopiedIndex(null);
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
      .filter(({ barcode }) => barcode.length >= 16) as FormattedBarcode[]; // Type assertion to string[]

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
        <Heading size="md" textAlign="center" pt="5" pb="5">
          Liam's Magical Token Tool
        </Heading>
      </Box>
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
          {formattedBarcodes.map(({ barcode, valid }, index) => {
            const renderBarcode = barcode
              .toUpperCase()
              .replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3");
            return (
              <Flex
                key={index}
                align="center"
                mb={1}
                maxH="5vh"
                border="solid 1px white"
                borderRadius="5"
                backgroundColor={!valid ? "red.900" : "whiteAlpha.200"}
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
                  {`${renderBarcode}${!valid ? " - Token Invalid" : ""}`}
                </Text>
                <Button
                  m="5"
                  size="xs"
                  colorScheme={copiedIndex === index ? "green" : "whiteAlpha"}
                  onClick={() => copyToClipboard(renderBarcode, index)}
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
            );
          })}
        </Box>
      </Flex>
      {portalData.map((p: PortalType, index) => (
        <Text color={"white"} key={index}>
          {p.pharmacy_account_number}
        </Text>
      ))}
    </Box>
  );
};

export default App;
