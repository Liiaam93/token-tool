import React, { useEffect, useState } from "react";
import { Flex, Text, Button, Checkbox, Input } from "@chakra-ui/react";
import { FormattedBarcode } from "../pages/Home";

interface BarcodeItemProps {
  barcodeData: FormattedBarcode;
  showScriptInput: boolean;
  updateScriptNumber: (barcode: string, scriptNumber: string) => void;
  onRTSChange: (barcode: string, checked: boolean) => void; // RTS change handler passed from Home
  isChecked: boolean; // Control the checked state
  lastCopiedBarcode: string; // Pass this prop to track last copied barcode
  setLastCopiedBarcode: (barcode: string) => void; // Add this prop
}

const BarcodeItem: React.FC<BarcodeItemProps> = ({
  barcodeData,
  showScriptInput,
  updateScriptNumber,
  onRTSChange,
  isChecked,
  lastCopiedBarcode,
  setLastCopiedBarcode,
}) => {
  const [copied, setCopied] = useState("");
  const [scriptNumber, setScriptNumber] = useState("");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      barcodeData.barcode.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3")
    );
    setLastCopiedBarcode(barcodeData.barcode);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRTSChange(barcodeData.barcode, e.target.checked);
  };

  const handleScriptNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setScriptNumber(value);
    updateScriptNumber(barcodeData.barcode, value);
  };

  const renderBarcode = barcodeData.barcode
    .toUpperCase()
    .replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3");

  useEffect(() => {
    if (lastCopiedBarcode && lastCopiedBarcode !== barcodeData.barcode) {
      setCopied("");
    } else if (lastCopiedBarcode === barcodeData.barcode) {
      setCopied("Copied");
    }
  }, [lastCopiedBarcode]);

  return (
    <Flex
      m="2"
      align="center"
      mb={1}
      maxH="7vh"
      border="solid 1px white"
      borderRadius="5"
      backgroundColor={!barcodeData.valid ? "red.900" : "whiteAlpha.200"}
    >
      <Button
        m="2"
        colorScheme="blue"
        size="xs"
        onClick={() =>
          window.open(
            `https://portal2.national.ncrs.nhs.uk/prescriptionsadmin/prescription?id=${renderBarcode}&instance=1`,
            "_blank"
          )
        }
      >
        NHS
      </Button>

      <Text flex="1" ml="10" textAlign="center" fontSize="12" color="white">
        {`${renderBarcode}${!barcodeData.valid ? "\n- Invalid" : ""}`}
      </Text>

      <Button
        m="5"
        size="xs"
        colorScheme={copied ? "green" : "whiteAlpha"}
        onClick={copyToClipboard}
      >
        {copied ? "Copied" : "Copy"}
      </Button>

      <Checkbox
        isChecked={isChecked}
        onChange={handleCheckboxChange}
        mr={2}
        size="sm"
        colorScheme="red"
        color="white"
      >
        RTS
      </Checkbox>

      {showScriptInput && (
        <Input
          color="white"
          size="xs"
          placeholder="Script Number"
          value={scriptNumber}
          onChange={handleScriptNumberChange}
          maxW="100px"
          ml="2"
          mr="2"
        />
      )}
    </Flex>
  );
};

export default BarcodeItem;
