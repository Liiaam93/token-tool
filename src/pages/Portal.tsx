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
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { fetchPortal } from "../utils/fetchPortal";
import { updatePatientName } from "../utils/updatePatientName";
import { updateOrderStatus } from "../utils/updateOrderStatus";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import ExpandedRow from "../components/ExpandedRow";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [printCount, setPrintCount] = useState<number>(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null); // New state to track expanded row

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

  const handleExpandRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id); // Toggle row expansion
  };

  const fetchPortalData = async () => {
    const { data } = await fetchPortal(token);
    setPortalData(data.items);
    const filteredData = data.items.filter(
      (item: PortalType) => item.order_type !== "manual"
    );

    setPortalData(filteredData);
  };

  const handleCopyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setSelectedId(id);
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
    modifiedBy: string,
    accountNumber: string,
    pharmacyName: string
  ) => {
    if (token && email && id) {
      try {
        await updatePatientName(
          token,
          email,
          id,
          patientName,
          modifiedBy,
          accountNumber,
          pharmacyName
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

  const handleUpdateOrderStatus = async (
    email: string,
    id: string,
    status: string,
    patientName: string,
    modifiedBy: string,
    accountNumber: string,
    pharmacyName: string
  ) => {
    if (token && email && id) {
      try {
        await updatePatientName(
          token,
          email,
          id,
          patientName,
          modifiedBy,
          accountNumber,
          pharmacyName
        );

        await updateOrderStatus(token, email, id, status, userEmail);
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast({
          title: `Order status updated to ${status}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchPortalData();
      } catch (error) {
        console.error("Failed to update order status:", error);
      }
    } else {
      console.error("Email and ID are required");
    }
  };

  return (
    <Box bg="gray.800" minHeight="100vh">
      <Flex p={2} borderRadius="5" color={"white"} justifyContent={"center"}>
        <InputGroup w="50%">
          <Input
            m="auto"
            // w="70%"
            color={"white"}
            placeholder="Enter access token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            textAlign={"center"}
            outline={"green"}
            fontSize={"xs"}
          />

          <InputRightElement>
            <CheckIcon
              _hover={{ color: "green", cursor: "pointer" }}
              onClick={fetchPortalData}
            />
          </InputRightElement>
        </InputGroup>
      </Flex>
      <Text textAlign={"center"} color={"orange"}>
        Prints: {printCount}
      </Text>
      <TableContainer m="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th> </Th>
              <Th textAlign={"center"}>Account</Th>
              <Th textAlign={"center"}>Barcode</Th>
              <Th textAlign={"center"}>Name</Th>
              <Th textAlign={"center"}>Print</Th>
              <Th textAlign={"center"}>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {portalData.map((data, index) => {
              return (
                <>
                  <Tr
                    _hover={{ background: "green.800" }}
                    bg={index % 2 === 0 ? "gray.800" : "blue.800"}
                    color={
                      selectedId === data.id
                        ? "salmon"
                        : data.patient_name
                        ? "yellow"
                        : "white"
                    }
                    key={index}
                  >
                    <Td>
                      <EditIcon
                        _hover={{ cursor: "pointer" }}
                        onClick={() => handleExpandRow(data.id)}
                      />
                    </Td>
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
                    <Td textAlign="center">{data.patient_name}</Td>
                    <Td textAlign="center">
                      <Button
                        onClick={() =>
                          handleUpdatePatientName(
                            data.email,
                            data.id,
                            "print",
                            userEmail,
                            data.pharmacy_account_number,
                            data.pharmacy_name
                          )
                        }
                      >
                        Set Printed
                      </Button>
                    </Td>
                    <Td textAlign="center">
                      <Button
                        onClick={() =>
                          handleUpdateOrderStatus(
                            data.email,
                            data.id,
                            "return to nhs spine",
                            "return to spine",
                            userEmail,
                            data.pharmacy_account_number,
                            data.pharmacy_name
                          )
                        }
                      >
                        RTS
                      </Button>
                      <Button
                        m="2"
                        onClick={() =>
                          handleUpdateOrderStatus(
                            data.email,
                            data.id,
                            "request cancelled",
                            "token invalid - please re-submit",
                            userEmail,
                            data.pharmacy_account_number,
                            data.pharmacy_name
                          )
                        }
                      >
                        Invalid
                      </Button>
                    </Td>
                  </Tr>
                  {expandedRow === data.id && (
                    <ExpandedRow
                      data={data}
                      email={userEmail}
                      updatePatientName={handleUpdatePatientName}
                    />
                  )}
                </>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Portal;
