// NotFound.js

import { Box, Heading, Text } from "@chakra-ui/react";
import CatchGame from "../components/CatchGame";

const NotFound = () => {
  return (
    <Box backgroundColor={'gray.200'} height={'100vh'}>
      <Heading size={'lg'} textAlign={'center'}>404 - Page Not Found</Heading>
      <Text fontStyle={'italic'} textAlign={'center'}>Sorry, the page you're looking for doesn't exist.</Text>
      <Text mt='2' textAlign={'center'}>Whilst you're here... why not play a game?</Text>
      <Text textAlign={'center'}>How many prescriptions can you bin in 40s!</Text>
      <Text textAlign={'center'}>Don't bin the ones with tablets! (they are for digital)</Text>
      <CatchGame />
    </Box>
  );
};

export default NotFound;
