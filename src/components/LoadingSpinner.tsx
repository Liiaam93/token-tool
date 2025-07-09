import { Box, Spinner, Text } from "@chakra-ui/react"

const LoadingSpinner: React.FC = () => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      bg="rgba(0,0,0,0.3)"
      zIndex={9998}
      display="flex"
      alignItems="center"
      justifyContent="center"
      pointerEvents="auto"
    >
      <Box
        backgroundColor="white"
        p={6}
        borderRadius="md"
        boxShadow="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDir="column"
        zIndex={9999}
      >
        <Spinner size="xl" color="green.500" />
        <Text m={5} mb={0}>
          Loading...
        </Text>
      </Box>
    </Box>
  );
};


export default LoadingSpinner