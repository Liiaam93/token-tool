
import { Box, Text } from "@chakra-ui/react";
import CatchGame from "../components/CatchGame";



const About: React.FC = () => {



  return (
    <>
    <Box mt='10'><Text textAlign={'center'}>How many prescriptions can you bin in 40s!</Text></Box>
     <CatchGame />
  </>
  );
};

export default About;
