import { Flex, Text } from "@chakra-ui/react";
import React from "react";

interface DisplayMessageProps {
  selectedTokens: string[];
  formattedBarcodes: string[];
}

const MessageDisplay: React.FC<DisplayMessageProps> = ({
  selectedTokens,
  formattedBarcodes,
}) => {
  const displaySelectedTokens = () => {
    if (selectedTokens.length > 0) {
      const tokensString = selectedTokens
        .map((token) => token.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3"))
        .join("\n");

      return (
        <>
          {"\n"}
          Please return the following tokens to the spine so that your order can
          be placed:{"\n"}
          {"\n"}
          {tokensString}
          {"\n"}
        </>
      );
    }
    return null;
  };

  const invalidTokens = formattedBarcodes
    .filter((barcode) => barcode.length < 18)
    .map((barcode) => barcode.replace(/(.{6})(.{6})(.{6})/, "$1-$2-$3"));

  const hasInvalidTokens = invalidTokens.length > 0;

  return (
    <>
      {hasInvalidTokens && (
        <Flex bgColor="slategrey" m="2" w="90%" borderRadius="5">
          <Text p="5" color="black">
            <div style={{ whiteSpace: "pre-line" }}>
              Hi, thank you for your e-mail,{"\n"}
              {displaySelectedTokens()}
              <>
                {"\n"}
                Also, the following tokens are invalid:{"\n"}
                {"\n"}
                {invalidTokens.join("\n ")}
                {"\n"}
                {"\n"}
                Please check the values and reply with the correct barcode so
                that your order can be placed.{"\n"}
                {"\n"} Many Thanks
              </>
            </div>
          </Text>
        </Flex>
      )}
    </>
  );
};

export default MessageDisplay;
