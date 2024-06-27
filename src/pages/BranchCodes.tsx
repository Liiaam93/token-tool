import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  Text,
  VStack,
  Heading,
  Flex,
} from "@chakra-ui/react";
import pharmacyData from "../data/BranchCodes.json"; // Adjust this import according to your setup
import { Pharmacy } from "../types/Pharmacy";

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Pharmacy[]>([]);

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    const results = pharmacyData.filter((pharmacy) => {
      return (
        (pharmacy["ODS Code"] &&
          pharmacy["ODS Code"].toLowerCase().includes(trimmedSearchTerm)) ||
        (pharmacy["Pharmacy Number"] &&
          pharmacy["Pharmacy Number"]
            .toLowerCase()
            .includes(trimmedSearchTerm)) ||
        (pharmacy["Postcode"] &&
          pharmacy["Postcode"].toLowerCase().includes(trimmedSearchTerm))
      );
    });
    setSearchResults(results);
  };

  return (
    <Box bg="gray.800" minHeight="100vh">
      <Flex
        p={2}
        maxW="90vw"
        m="auto"
        border="solid white 2px"
        borderRadius="5"
        color={"white"}
      >
        <VStack spacing={4} m="auto" w="100%">
          <Heading size={"sm"}>Pharmacy Search</Heading>
          <Input
            color={"white"}
            placeholder="Enter ODS Code, Branch Number, or Postcode"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            textAlign={"center"}
            w="50%"
            outline={"green"}
            fontSize={"xs"}
          />
          <Button colorScheme="green" onClick={handleSearch}>
            Search
          </Button>
          {searchResults.length > 0 ? (
            searchResults.map((pharmacy, index) => (
              <Box
                key={index}
                p={4}
                border="1px solid white"
                borderRadius="lg"
                w="50%"
              >
                <Text>
                  <strong>Branch Number:</strong> {pharmacy["Pharmacy Number"]}
                </Text>
                <Text>
                  <strong>Pharmacy Name:</strong> {pharmacy["Pharmacy Name"]}
                </Text>
                <Text>
                  <strong>ODS Code:</strong> {pharmacy["ODS Code"]}
                </Text>
                <Text>
                  <strong>Phone No:</strong> {pharmacy["Phone No"]}
                </Text>
                <Text>
                  <strong>Postcode:</strong> {pharmacy["Postcode"]}
                </Text>
                {/* Add more fields as needed */}
              </Box>
            ))
          ) : (
            <Text>No results found</Text>
          )}
        </VStack>
      </Flex>
    </Box>
  );
};

export default SearchPage;
