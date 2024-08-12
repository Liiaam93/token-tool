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
// import {
//   updatePatientName,
//   updateOrderSearchId,
// } from "../utils/updatePatientName";

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

  useEffect(() => {
    setPrintCount(0);
    portalData.forEach((e) => {
      e.patient_name === "print" ? setPrintCount((prev) => prev + 1) : "";
    });
  }, [portalData]);

  const fetchPortalData = async () => {
    const { data } = await fetchPortal(token);
    setPortalData(data.items);
  };

  //   const handleUpdatePatientName = async (id: string, email: string) => {
  //     const token = "your-auth-token"; // Replace with actual token
  //     const modifiedBy = "liam.burbidge@well.co.uk";

  //     try {
  //       const updatePatientNamePayload = {
  //         token,
  //         id,
  //         newName: "Print",
  //         email,
  //         modifiedBy,
  //       };
  //       const patientNameResponse = await updatePatientName(
  //         updatePatientNamePayload
  //       );
  //       console.log("Updated patient name:", patientNameResponse);

  //       const updateOrderSearchIdPayload = {
  //         token,
  //         id,
  //         newOrderSearchId: `${id}-print`,
  //         email,
  //         modifiedBy,
  //       };
  //       const orderSearchIdResponse = await updateOrderSearchId(
  //         updateOrderSearchIdPayload
  //       );
  //       console.log("Updated order_search_id:", orderSearchIdResponse);

  //       fetchPortalData();
  //     } catch (error) {
  //       console.error("Failed to update:", error);
  //     }
  //   };

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
                  {/* <Td textAlign="center">
                    <Button
                      onClick={() =>
                        handleUpdatePatientName(data.id, data.email)
                      }
                    >
                      Click
                    </Button>
                  </Td> */}
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
