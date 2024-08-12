import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { fetchPortal } from "../utils/fetchPortal";
import { updatePatientName } from "../utils/updatePatientName";

export interface PortalType {
  created_by: string;
  created_date: number;
  created_date_string: string;
  email: string;
  id: string;
  modified_time: string;
  order_open: boolean;
  order_search_id: string;
  order_type: string;
  patient_name: string;
  pharmacy_account_number: string;
  pharmacy_name: string;
  pharmacy_post_code: string;
  record_status: string;
  record_type: string;
}

const Portal: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [portalData, setPortalData] = useState<PortalType[]>([]);
  const [printCount, setPrintCount] = useState<number>(0);
  const [userEmail] = useState<string>("liam.burbidge@well.co.uk");

  useEffect(() => {
    setPrintCount(0);
    portalData.forEach((e) => {
      if (e.patient_name) {
        const name = e.patient_name.toLowerCase();
        name === "print" ? setPrintCount((prev) => prev + 1) : "";
      }
    });
  }, [portalData]);

  const fetchPortalData = async () => {
    const { data } = await fetchPortal(token);
    setPortalData(data.items);
  };

  const handleUpdatePatientName = async (
    email: string,
    id: string,
    patientName: string,
    orderSearchId: string,
    modifiedBy: string
  ) => {
    if (token && email && id && patientName && orderSearchId) {
      try {
        // Await the update request and make sure it completes successfully
        await updatePatientName(
          token,
          email,
          id,
          patientName,
          orderSearchId,
          modifiedBy
        );

        // Adding a delay to ensure server updates are processed
        await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay

        // Now refetch the data
        fetchPortalData();
      } catch (error) {
        console.error("Failed to update patient name:", error);
      }
    } else {
      console.error("All fields are required");
    }
  };

  return (
    <Box bg="gray.800" minHeight="100vh">
      <Flex p={2} maxW="90vw" m="auto" borderRadius="5" color={"white"}>
        <Input
          alignSelf={"center"}
          m="auto"
          color={"white"}
          placeholder="Enter access token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          textAlign={"center"}
          w="80%"
          outline={"green"}
          fontSize={"xs"}
        />

        <Button
          colorScheme="green"
          fontSize={"xs"}
          onClick={() => fetchPortalData()}
        >
          Validate
        </Button>
      </Flex>
      <Text textAlign={"center"} color={"orange"}>
        Prints: {printCount}
      </Text>
      <TableContainer w={"80%"} m="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th textAlign={"center"}>Account</Th>
              <Th textAlign={"center"}>Barcode</Th>
              <Th textAlign={"center"}>Name</Th>
              <Th textAlign={"center"}>Print</Th>
            </Tr>
          </Thead>
          <Tbody>
            {portalData.map((data, index) => {
              if (data.order_type === "manual") return null;

              return (
                <Tr key={index} color={data.patient_name ? "yellow" : "white"}>
                  <Td textAlign="center">{data.pharmacy_account_number}</Td>
                  <Td textAlign="center">
                    <Text
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => {
                        navigator.clipboard.writeText(data.id);
                      }}
                    >
                      {data.id}
                    </Text>
                  </Td>
                  <Td textAlign="center">{data.patient_name}</Td>
                  <Td textAlign="center">
                    <Button
                      onClick={() =>
                        handleUpdatePatientName(
                          data.email,
                          data.id,
                          "print",
                          data.order_search_id,
                          userEmail
                        )
                      }
                    >
                      Click
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Portal;
