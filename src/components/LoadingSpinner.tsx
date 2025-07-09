import { Box, Spinner, Text } from "@chakra-ui/react"

const LoadingSpinner: React.FC = () => {


    return(
          <Box
            position="fixed"
            top={50}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0,0,0,0.3)" // dim background, or "transparent" if you prefer
            zIndex={9998}
            pointerEvents="auto" // this blocks interactions underneath
          >
          <Box
            position="fixed"
            backgroundColor="white"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            p={6}
            borderRadius="md"
            boxShadow="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={9999} // above the overlay
            flexDir={'column'}
          >
            <Spinner size="xl" color="green.500" />
            <Text m='5' mb='0'>Loading...</Text>
          </Box>
        </Box>
      )
}

export default LoadingSpinner