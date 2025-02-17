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
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      barcodeData.barcode.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3")
    );
    setLastCopiedBarcode(barcodeData.barcode);
    // Mark as copied and toggle strikethrough (done)
    setCopied("Copied");
    setIsStrikethrough(true); // Add this line to toggle the 'Done' state
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRTSChange(barcodeData.barcode, e.target.checked);
  };

  // const handleStrikethroughChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setIsStrikethrough(e.target.checked);
  // };

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

  useEffect(() => {
  setIsStrikethrough(false);
}, [barcodeData]);


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

      <Text
        flex="1"
        ml="10"
        textAlign="center"
        fontSize="12"
        color={copied ? 'green' : 'white'}
        textDecoration={isStrikethrough ? "line-through" : "none"}
        onClick={copyToClipboard}
        cursor="pointer"  
      >
        {`${renderBarcode}${!barcodeData.valid ? "\n- Invalid" : ""}`}
      </Text>

{/*       <Button
        m="5"
        size="xs"
        colorScheme={copied ? "green" : "whiteAlpha"}
        onClick={copyToClipboard}
      >
        {copied ? "Copied" : "Copy"}
      </Button> */}

{/*       {!isStrikethrough && (
        <Checkbox
          isChecked={isStrikethrough}
          onChange={handleStrikethroughChange}
          mr={2}
          size="sm"
          colorScheme="gray"
          color="white"
        >
          Done
        </Checkbox>
      )}
 */}
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
