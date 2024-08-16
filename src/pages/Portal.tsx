import React, { useEffect, useState } from "react";
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
  useToast,
} from "@chakra-ui/react";
import { fetchPortal } from "../utils/fetchPortal";
import { updateOrder } from "../utils/updatePatientName";

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
  const [selectedId, setSelectedId] = useState<string | null>(null); // State to track selected row
  const [printCount, setPrintCount] = useState<number>(0);
  const [userEmail] = useState<string>("liam.burbidge@well.co.uk");

  const toast = useToast();

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchPortalData();
    }, 120000);

    return () => clearInterval(intervalId);
  }, [token]);

  useEffect(() => {
    setPrintCount(0);
    portalData.forEach((e) => {
      if (e.patient_name) {
        const name = e.patient_name.toLowerCase();
        if (name === "print") setPrintCount((prev) => prev + 1);
      }
    });
  }, [portalData]);

  const fetchPortalData = async () => {
    const { data } = await fetchPortal(token);

    // Filter out the manual orders
    const filteredData = data.items.filter(
      (item: PortalType) => item.order_type !== "manual"
    );

    setPortalData(filteredData);
  };

  const handleReturnToSpine = async (
    email: string,
    id: string,
    modifiedBy: string,
    orderSearchId: string
  ) => {
    try {
      await updateOrder(
        token,
        email,
        id,
        modifiedBy,
        orderSearchId,
        "Please return token to the NHS spine and call 0333 8666 977 when done",
        "return to nhs spine"
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleCancelOrder = async (
    email: string,
    id: string,
    modifiedBy: string,
    orderSearchId: string
  ) => {
    try {
      await updateOrder(
        token,
        email,
        id,
        modifiedBy,
        orderSearchId,
        "Token Invalid - Please check and re-submit",
        "request cancelled"
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCopyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setSelectedId(id); // Set the selected ID when copying
    console.log(selectedId);
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleUpdatePatientName = async (
    email: string,
    id: string,
    patientName: string,
    orderSearchId: string,
    modifiedBy: string
  ) => {
    if (token && email && id && orderSearchId) {
      try {
        await updateOrder(
          token,
          email,
          id,
          patientName,
          orderSearchId,
          modifiedBy
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast({
          title: "Patient Name Updated",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchPortalData();
      } catch (error) {
        console.error("Failed to update patient name:", error);
      }
    } else {
      console.error("All fields except patient name are required");
    }
  };

  return (
    <Box bg="gray.800" minHeight="100vh">
      <Flex p={2} maxW="80vw" m="auto" borderRadius="5" color={"white"}>
        <Input
          alignSelf={"center"}
          m="auto"
          color={"white"}
          placeholder="Enter access token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          textAlign={"center"}
          outline={"green"}
          fontSize={"xs"}
        />

        <Button
          colorScheme="green"
          fontSize={"xs"}
          onClick={fetchPortalData}
          m="5"
        >
          Validate
        </Button>
      </Flex>
      <Text textAlign={"center"} color={"orange"}>
        Prints: {printCount}
      </Text>
      <TableContainer m="auto" w="95%" border={"solid white 1px"}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th textAlign={"center"}>Account</Th>
              <Th textAlign={"center"}>Barcode</Th>
              <Th textAlign={"center"}>Name</Th>
              <Th textAlign={"center"}>Print</Th>
              <Th textAlign={"center"}>RTS</Th>
              <Th textAlign={"center"}>Invalid</Th>
            </Tr>
          </Thead>
          <Tbody fontSize={"sm"}>
            {portalData.map((data, index) => {
              if (data.order_type === "manual") return null;

              return (
                <Tr
                  _hover={{ background: "green.800" }}
                  key={index}
                  bg={index % 2 === 0 ? "gray.800" : "blue.800"}
                  color={
                    selectedId === data.id
                      ? "salmon"
                      : data.patient_name
                      ? "yellow"
                      : "white"
                  } // Change text color when copied
                >
                  <Td textAlign="center">{data.pharmacy_account_number}</Td>
                  <Td textAlign="center">
                    <Text
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => handleCopyToClipboard(data.id)}
                    >
                      {data.id}
                    </Text>
                  </Td>
                  <Td
                    textAlign="center"
                    maxW="400px"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {data.patient_name}
                  </Td>
                  <Td
                    textAlign="center"
                    w="100px"
                    borderLeft={"solid 1px white"}
                  >
                    <Button
                      colorScheme="green"
                      size={"sm"}
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
                      Printed
                    </Button>
                  </Td>
                  <Td textAlign="center" w="100px">
                    <Button
                      colorScheme="orange"
                      size={"sm"}
                      onClick={() =>
                        handleReturnToSpine(
                          data.email,
                          data.id,
                          userEmail,
                          data.order_search_id
                        )
                      }
                    >
                      RTS
                    </Button>
                  </Td>
                  <Td textAlign="center" w="100px">
                    <Button
                      colorScheme="red"
                      size={"sm"}
                      onClick={() =>
                        handleCancelOrder(
                          data.email,
                          data.id,
                          userEmail,
                          data.order_search_id
                        )
                      }
                    >
                      Invalid
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
