import { Button, Flex, Text, useToast } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { FormattedBarcode } from "../pages/Home";

interface DisplayMessageProps {
  selectedTokens: string[];
  formattedBarcodes: FormattedBarcode[];
}
const MessageDisplay: React.FC<DisplayMessageProps> = ({
  selectedTokens,
  formattedBarcodes,
}) => {
  const [messageText, setMessageText] = useState<string>("");

  const toast = useToast();

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(
        "Hi, thank you for your e-mail,\n" + messageText + "\nMany Thanks"
      )
      .then(() => {
        toast({
          title: "Copied to clipboard.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    const displaySelectedTokens = () => {
      if (selectedTokens.length > 0) {
        const tokensString = selectedTokens
          .map((token) => token.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3"))
          .join("\n");

        return `\nPlease return the following token(s) to the spine and reply to this email so that we can print the token(s) and your order can be placed:\n\n${tokensString}\n`;
      }
      return "";
    };

    const invalidTokens = formattedBarcodes.filter(({ valid }) => !valid);

    const hasInvalidTokens = invalidTokens.length > 0;

    const invalidTokensText = hasInvalidTokens
      ? `\n${
          displaySelectedTokens() !== "" ? "Also the" : "The"
        } following tokens are invalid:\n\n${invalidTokens
          .map(({ originalBarcode }) => originalBarcode)
          .join(
            "\n "
          )}\n\nPlease check the values and reply with the correct barcode so that your order can be placed.\n\n`
      : "";

    const fullMessage = `${displaySelectedTokens()}${invalidTokensText}`;

    setMessageText(fullMessage);
  }, [selectedTokens, formattedBarcodes]);

  return (
    <>
      {messageText !== "" && (
        <>
          <Flex bgColor="gray.200" m="2" w="90%" borderRadius="5">
            <Text p="5" color="black">
              <div style={{ whiteSpace: "pre-line" }}>
                Hi, thank you for your e-mail,{"\n"}
                {messageText}
                {"\n"}
                Many Thanks
              </div>
            </Text>
          </Flex>
          <Button
            m="2"
            w="90%"
            color={"white"}
            colorScheme="green"
            onClick={() => copyToClipboard()}
          >
            Copy
          </Button>
        </>
      )}
    </>
  );
};

export default MessageDisplay;
