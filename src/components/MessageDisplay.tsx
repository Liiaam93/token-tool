import { Button, Flex, Text } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { FormattedBarcode } from "../App";

interface DisplayMessageProps {
  selectedTokens: string[];
  formattedBarcodes: FormattedBarcode[];
}

const MessageDisplay: React.FC<DisplayMessageProps> = ({
  selectedTokens,
  formattedBarcodes,
}) => {
  const [messageText, setMessageText] = useState<string>("");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      "Hi, thank you for your e-mail,\n" + messageText + "\nMany Thanks"
    );
  };

  useEffect(() => {
    const displaySelectedTokens = () => {
      if (selectedTokens.length > 0) {
        const tokensString = selectedTokens
          .map((token) => token.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3"))
          .join("\n");

        return `\nPlease return the following tokens to the spine so that your order can be placed:\n\n${tokensString}\n`;
      }
      return ""; // Return an empty string when there are no selectedTokens
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
          <Flex bgColor="slategrey" m="2" w="90%" borderRadius="5">
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
            color={"black"}
            colorScheme="whatsapp"
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
