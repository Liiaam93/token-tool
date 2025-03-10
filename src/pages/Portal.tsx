import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { CheckIcon, EditIcon, SearchIcon, ChatIcon } from "@chakra-ui/icons";
import { PortalType } from "../types/PortalType";
import ExpandedRow from "../components/ExpandedRow";

const Portal: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [portalData, setPortalData] = useState<PortalType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null); // New state to track expanded row
  const [statusFilter, setStatusFilter] = useState<string>("Submitted");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<React.ReactNode>("");
  const [dialogAction, setDialogAction] = useState<() => void>(() => {});
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("eps"); // Default to 'eps'
  const [userEmail] = useState<string>("liam.burbidge@well.co.uk");
  const [startDate, setStartDate] = useState<string>('');
 

  const cancelRef = useRef(null);

  const statusFilterRef = useRef(statusFilter);
  const orderTypeFilterRef = useRef(orderTypeFilter);
  const searchQueryRef = useRef(searchQuery);
  const startDateRef = useRef(startDate);

  
  const fetchPortalData = useCallback(async () => {
    setLoading(true);
    try {
      const allResults = await fetchPortal(token, statusFilter, searchQuery, startDate);
      const flattenedData = allResults.flatMap(pageData => pageData.items || []);
  
      // Remove duplicates based on id.S
      const seen = new Set();
      const uniqueData = flattenedData.filter((item: PortalType) => {
        if (seen.has(item.id)) {
          return false; // Skip this item since it's a duplicate
        } else {
          seen.add(item.id); // Add the id to the Set to track it
          return true; // Keep this item
        }
      });
  
      // Apply additional filtering if needed (like filtering based on `orderTypeFilter`)
      const filteredData = uniqueData.filter(
        (item: PortalType) => item.order_type === orderTypeFilter
      );
  
      setPortalData(filteredData); // Set the filtered and unique data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  }, [token, statusFilter, searchQuery, startDate, orderTypeFilter]);
  

  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  useEffect(() => {
    orderTypeFilterRef.current = orderTypeFilter;
  }, [orderTypeFilter]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    startDateRef.current = startDate;
  }, [startDate]);


  const formatDate = (date: number) => {
    const newDate = new Date(date * 1000);

    const formattedDate = newDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    });
    const formattedTime = newDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return formattedDate + ' ' + formattedTime
  }
  const toast = useToast();

  useEffect(() => {
    if (token) fetchPortalData();

    const intervalId = setInterval(() => {
      if (token) fetchPortalData(); // Use refs for filters
    }, 120000); // 2-minute interval

    return () => clearInterval(intervalId);
  }, [token, fetchPortalData]); // Only depend on token, refs handle filters

const printCount = useMemo(() => {
  return portalData.length;
}, [portalData]);


const totalTradePrice = useMemo(() => {
  if (orderTypeFilter === "trade") {
    return parseFloat(portalData.reduce((sum, data) => sum + Number(data.totalTradePrice || 0), 0).toFixed(3));
  }
  return null;
}, [portalData, orderTypeFilter]);


useEffect(() => {
  fetchPortalData();
}, [fetchPortalData]);


  const handleExpandRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
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

  const formatModifiedDate = (modifiedTime: string) => {
  const date = new Date(modifiedTime);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  
  return new Intl.DateTimeFormat('en-GB', options).format(date).replace(',', ''); // Replace comma with space
};

  return (
    <Box bg="gray.800" minHeight="100vh">
     { token ? '' :    <Flex p={2} borderRadius="5" color={"white"} justifyContent={"center"}>
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
      </Flex>}
      <HStack m="auto" justifyContent="center" w="100%">
      <Text
          textAlign="center"
          color="orange"
          w="30%"
          border="solid white 1px"
          borderRadius="5"
          height="38px"
          display="flex" 
          alignItems="center" 
          justifyContent="center"
        >
          Total: {printCount} {orderTypeFilter === 'trade' ? 'Trade: £' + totalTradePrice : ''}
        </Text>
 
</HStack>
      <HStack m="auto" justifyContent="center" w="100%">
      <InputGroup w="20%" m='10px'>
    <Input
      color={"white"}
      type="date"
      placeholder="Start Date"
      onChange={(e) => setStartDate(e.target.value)}
    />
  </InputGroup>
        <InputGroup w="50%">
          <Input
            color={"white"}
            placeholder="Search"
            textAlign={"center"}
            outline={"green"}
            fontSize={"xs"}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <InputRightElement>
            <SearchIcon
              color={"white"}
              _hover={{ color: "green", cursor: "pointer" }}
              onClick={fetchPortalData}
            />
          </InputRightElement>
        </InputGroup>
        <Select
  key={orderTypeFilter}
  color="white"
  w="30%"
  onChange={(e) => setOrderTypeFilter(e.target.value)}
  value={orderTypeFilter}
  sx={{
    option: {
      backgroundColor: "gray.800",
      color: "white",
    },
  }}
>
  <option value="eps">EPS</option>
  <option value="trade">Trade</option>
  <option value="mtm">MTM</option>
  <option value="manual">Manual</option>
</Select>

        <Select
          key={statusFilter}
          color="white"
          w="30%"
          onChange={handleStatusChange}
          value={statusFilter}
          sx={{
            option: {
              backgroundColor: "gray.800",
              color: "white",
            },
          }}
        >
          <option value="Submitted">Request Submitted</option>
          <option value="Downloaded">Token Downloaded</option>
          <option value="RTS">Return to Spine</option>
          <option value="Cancelled">Request Cancelled</option>
          <option value="Ordered">Ordered</option>
          <option value="OOS">Item Out of stock</option>
          <option value="Call">Please Call Wardles</option>
          <option value="Comments">Comments Added</option>
          <option value="Stop">Account on stop</option>
          <option value="Invalid">Invalid Barcode</option>
          <option value="">No Filter</option>
        </Select>
      </HStack>
      {loading && (
        <Text textAlign={"center"} color={"white"} margin={"auto"}>
          Loading...
        </Text>
      )}
      <TableContainer m="auto" maxWidth="100vw" overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
            <Th width="50px"> </Th>
            <Th width='50px'> Date </Th>
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
          <Tbody >
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
                  <Td>
                    {formatDate(data.created_date)}
                  </Td>
                 
                  <Td textAlign="center" width="150px">
                    {data.pharmacy_account_number}
                  </Td>

                  <Td textAlign="center" width="200px">
                    { data.order_type === 'trade'? 
                      <Text>£{data.totalTradePrice}</Text> : 
                    <Text
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => handleCopyToClipboard(data.id)}
                    >
                      {data.id}
                    </Text> 
                    }
                  </Td>
                  <Td
                    textAlign="center"
                    width="250px"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxWidth="250px"
                  >
{(data.customer_comment || data.customer_record_status) && data.modified_time && (
  <>
    <ChatIcon color={"green"} />
          <Text color="white" ml={2} fontSize="sm">
        {formatModifiedDate(data.modified_time)}
      </Text>
  </>
)}


                    {data.patient_name}
                  </Td>
                  <Td textAlign="center" width="150px">
                  <Button
    colorScheme="blue"
    size="xs"
    onClick={() =>
      handleUpdateOrderStatus(
        data.email,
        data.id,
        "Token Downloaded",  // Set status to "Token Downloaded"
        data.patient_name,   // You can still pass the patient name if needed, or omit it
        userEmail,
        data.pharmacy_account_number,
        data.pharmacy_name
      )
    }
  >
    Set Token Downloaded
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
                              Mark this order as 'Please RTS and select -token returned- from the drop-down box'?
                            </Text>
                            <Text>Account: {data.pharmacy_account_number}</Text>
                            <Text>Barcode: {data.id}</Text>
                          </>,
                          () =>
                            handleUpdateOrderStatus(
                              data.email,
                              data.id,
                              "Please return this token to the Spine",
                              "Please RTS and select -token returned- from the drop-down box",
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
                              Mark this order as 'Barcode incorrect - please resend in the comments box below or request to cancel the order'?
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
                              Mark this order as cancelled?
                            </Text>
                            <Text>Account: {data.pharmacy_account_number}</Text>
                            <Text>Barcode: {data.id}</Text>
                          </>,
                          () =>
                            handleUpdateOrderStatus(
                              data.email,
                              data.id,
                              "Order cancelled",
                              data.patient_name,  
                              userEmail,
                              data.pharmacy_account_number,
                              data.pharmacy_name
                            )
                        )
                      }
                    >
                      Cancelled
                    </Button>
                    <Text 
                    color='white'                     
                    overflow="hidden"
                    textOverflow="ellipsis" 
                    maxWidth='400px'
                    textAlign="center" 
                    borderRadius="10" 
                    paddingLeft="2"
                    paddingRight="2"
                    fontSize="sm"
                    backgroundColor={data.record_status === 'Order placed' ? 'green' : 'orange'} 
                    margin='auto'>
                      {data.record_status}{data.record_status === 'Order placed' ? ': '+data.awards_script_number : ''}
                    </Text>
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
