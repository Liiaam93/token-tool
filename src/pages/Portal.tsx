import React, { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
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
  Select,
  HStack,
} from "@chakra-ui/react";
import { fetchPortal } from "../utils/fetchPortal";
import { updateOrder } from "../utils/updateOrder";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import { PortalType } from "../types/PortalType";
import ExpandedRow from "../components/ExpandedRow";

const Portal: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [portalData, setPortalData] = useState<PortalType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [printCount, setPrintCount] = useState<number>(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null); // New state to track expanded row
  const [statusFilter, setStatusFilter] = useState<string>(
    "request%20submitted"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<React.ReactNode>("");
  const [dialogAction, setDialogAction] = useState<() => void>(() => {});
  const [userEmail] = useState<string>("liam.burbidge@well.co.uk");

  const cancelRef = useRef(null);

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

  useEffect(() => {
    fetchPortalData(); // Fetch data when statusFilter changes
    console.log(statusFilter);
  }, [statusFilter]);

  const handleExpandRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const fetchPortalData = async () => {
    try {
      const { data } = await fetchPortal(token, statusFilter);
      console.log("Fetched data:", data); // Inspect the response data here

      const filteredData = data.items.filter(
      (item: PortalType) => item.order_type === "eps"
    );
      setPortalData(filteredData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(encodeURIComponent(event.target.value.trim())); // Added .trim() to avoid accidental spaces
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
  const handleOpenDialog = (message: React.ReactNode, action: () => void) => {
    setDialogMessage(message);
    setDialogAction(() => action);
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    dialogAction();
    setIsDialogOpen(false);
  };
  const handleUpdatePatientName = async (
    email: string,
    id: string,
    patientName: string,
    modifiedBy: string,
    accountNumber: string,
    pharmacyName: string,
    scriptNumber?: string
  ) => {
    if (token && email && id) {
      try {
        await updateOrder({
          token,
          email,
          id,
          modifiedBy,
          patientName,
          accountNumber,
          pharmacyName,
          scriptNumber, // This is optional
        });

        await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for consistency
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
      console.error("All fields except script number are required");
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
        // First update the patient name and other details (status is passed in this time)
        await updateOrder({
          token,
          email,
          id,
          modifiedBy,
          patientName,
          accountNumber,
          pharmacyName,
          status, // Status is passed here
        });

        await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for consistency
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
      <HStack m="auto" justifyContent="center" w="100%">
        <Text
          textAlign="center"
          color="orange"
          w="30%"
          border="solid white 1px"
          borderRadius="5"
          height="38px"
          display="flex" // Set display to flex
          alignItems="center" // Center content vertically
          justifyContent="center" // Center content horizontally (optional)
        >
          Prints: {printCount}
        </Text>
        <Select
          color="white"
          w="30%"
          onChange={handleStatusChange}
          value={statusFilter.replace(/%20/g, " ")} // Convert back to readable format for display
          sx={{
            option: {
              backgroundColor: "gray.800", // Background color of each option
              color: "white", // Text color
            },
          }}
        >
          <option value="request submitted">Request Submitted</option>
          <option value="Please return this token to the Spine">
            Return to Spine
          </option>
          <option value="Order cancelled">Request Cancelled</option>
          <option value="Order placed">Ordered</option>
          <option value="">No filter</option>
        </Select>
      </HStack>

      <TableContainer m="auto" maxWidth="100vw" overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th width="50px"> </Th>
              <Th textAlign="center" width="150px">
                Account
              </Th>
              <Th textAlign="center" width="200px">
                Barcode
              </Th>
              <Th textAlign="center" width="250px">
                Name
              </Th>
              <Th textAlign="center" width="150px">
                Print
              </Th>
              <Th textAlign="center" width="300px">
                Status
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {portalData.map((data, index) => (
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
                  <Td width="50px">
                    <EditIcon
                      _hover={{ cursor: "pointer" }}
                      onClick={() => handleExpandRow(data.id)}
                    />
                  </Td>
                  <Td textAlign="center" width="150px">
                    {data.pharmacy_account_number}
                  </Td>
                  <Td textAlign="center" width="200px">
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
                    width="250px"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxWidth="250px"
                  >
                    {data.patient_name}
                  </Td>
                  <Td textAlign="center" width="150px">
                    <Button
                      colorScheme="blue"
                      size="xs"
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
                  <Td textAlign="center" width="300px">
                    <Button
                      colorScheme="red"
                      size="xs"
                      m="2"
                      onClick={() =>
                        handleOpenDialog(
                          <>
                            <Text>
                              Mark this order as 'Please return to the spine and
                              call 0333 8666 977 when done'?
                            </Text>
                            <Text>Account: {data.pharmacy_account_number}</Text>
                            <Text>Barcode: {data.id}</Text>
                          </>,
                          () =>
                            handleUpdateOrderStatus(
                              data.email,
                              data.id,
                              "Please return this token to the Spine",
                              "Please return to the spine and update this order when done.",
                              userEmail,
                              data.pharmacy_account_number,
                              data.pharmacy_name
                            )
                        )
                      }
                    >
                      RTS
                    </Button>
                    <Button
                      colorScheme="red"
                      size="xs"
                      m="2"
                      onClick={() =>
                        handleOpenDialog(
                          <>
                            <Text>
                              Mark this order as 'token invalid - please
                              re-submit the correct barcode'?
                            </Text>
                            <Text>Account: {data.pharmacy_account_number}</Text>
                            <Text>Barcode: {data.id}</Text>
                          </>,
                          () =>
                            handleUpdateOrderStatus(
                              data.email,
                              data.id,
                              "Barcode incorrect - please resend in the comments box below or request to cancel the order",
                              "Invalid Barcode - Please check and ammend this order",
                              userEmail,
                              data.pharmacy_account_number,
                              data.pharmacy_name
                            )
                        )
                      }
                    >
                      Invalid
                    </Button>
                    <Button
                      colorScheme="red"
                      size="xs"
                      m="2"
                      onClick={() =>
                        handleOpenDialog(
                          <>
                            <Text>
                              Mark this order as 'request cancelled - token has
                              been returned to NHS spine'?
                            </Text>
                            <Text>Account: {data.pharmacy_account_number}</Text>
                            <Text>Barcode: {data.id}</Text>
                          </>,
                          () =>
                            handleUpdateOrderStatus(
                              data.email,
                              data.id,
                              "Order cancelled",
                              "token has been returned to spine - no order placed",
                              userEmail,
                              data.pharmacy_account_number,
                              data.pharmacy_name
                            )
                        )
                      }
                    >
                      Cancelled
                    </Button>
                  </Td>
                </Tr>
                {expandedRow === data.id && (
                  <ExpandedRow
                    data={data}
                    email={userEmail}
                    updatePatientName={handleUpdatePatientName}
                    updateOrderStatus={handleUpdateOrderStatus}
                  />
                )}
              </>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <AlertDialog
        isOpen={isDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Action
            </AlertDialogHeader>
            <AlertDialogBody>{dialogMessage}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDialogOpen(false)}>
                No
              </Button>
              <Button colorScheme="red" onClick={handleConfirm} ml={3}>
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Portal;
