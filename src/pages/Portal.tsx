import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  IconButton,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Spinner,
  InputGroup,
  InputRightElement,
  Select,
  HStack,
} from "@chakra-ui/react";
import {
  EditIcon,
  SearchIcon,
  ChatIcon,
  CalendarIcon,
} from "@chakra-ui/icons";
import { fetchPortal } from "../utils/fetchPortal";
import { updateOrder } from "../utils/updateOrder";
import { PortalType } from "../types/PortalType";
import ExpandedRow from "../components/ExpandedRow";

const Portal: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(null);

  const [token, setToken] = useState("");
  const [portalData, setPortalData] = useState<PortalType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("Submitted");
  const [orderTypeFilter, setOrderTypeFilter] = useState("eps");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<React.ReactNode>("");
  const [dialogAction, setDialogAction] = useState<() => void>(() => { });
  const [loading, setLoading] = useState(false);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(120);
  const [userEmail, setUserEmail] = useState('')
  // const userEmail = "liam.burbidge@well.co.uk";
  const toast = useToast();

  const statusFilterRef = useRef(statusFilter);
  const orderTypeFilterRef = useRef(orderTypeFilter);
  const searchQueryRef = useRef(searchQuery);
  const startDateRef = useRef(startDate);

  useEffect(() => { statusFilterRef.current = statusFilter }, [statusFilter]);
  useEffect(() => { orderTypeFilterRef.current = orderTypeFilter }, [orderTypeFilter]);
  useEffect(() => { searchQueryRef.current = searchQuery }, [searchQuery]);
  useEffect(() => { startDateRef.current = startDate }, [startDate]);

  useEffect(() => {
    const storedToken = localStorage.getItem("bearerToken");
    if (storedToken) setToken(storedToken);
    const storedEmail = localStorage.getItem('PortalEmail');
    if (storedEmail) setUserEmail(storedEmail)
  }, []);

  const fetchPortalData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const results = await fetchPortal(token, statusFilter, searchQueryRef.current, startDate);
      const items = results.flatMap((page) => page.items || []);
      const seen = new Set();
      const unique = items.filter((item) => !seen.has(item.id) && seen.add(item.id));
      const filtered = unique.filter((item) => item.order_type === orderTypeFilter);
      setPortalData(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  }, [token, statusFilter, startDate, orderTypeFilter]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!token) return;
    const intervalId = setInterval(fetchPortalData, 120000);
    return () => clearInterval(intervalId);
  }, [token, fetchPortalData]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilRefresh((s) => (s <= 1 ? 120 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const printCount = portalData.length;

  const totalTradePrice = useMemo(() => {
    if (orderTypeFilter !== "trade") return null;
    const sum = portalData.reduce((acc, item) => acc + Number(item.totalTradePrice || 0), 0);
    return parseFloat(sum.toFixed(2));
  }, [portalData, orderTypeFilter]);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
    return `${date} ${time}`;
  };

  const formatModifiedDate = (modified: string) => {
    const d = new Date(modified);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d).replace(",", "");
  };

  const handleExpandRow = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const handleCopyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setSelectedId(id);
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

  const handleUpdateOrder = async (data: any, overrides: any) => {
    if (!token || !data.email || !data.id) return;
    setExpandedRow(null);
    try {
      await updateOrder({ ...data, token, ...overrides });
      await new Promise((res) => setTimeout(res, 500));
      toast({
        title: overrides.patientName ? "Patient Name Updated" : `Order status updated to ${overrides.status}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      fetchPortalData();
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  return (
    <Box bg="gray.800" minHeight="100vh" mt='-2'>
      <Flex p={2} borderRadius="5" color={"white"} justifyContent={"center"}>
        <Text
          marginTop="0"
          textAlign="center"
          color="orange"
          w="60%"
          border="solid white 2px"
          borderRadius="5"
          height="38px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          Total: {printCount}{" "}
          {orderTypeFilter === "trade" ? "Trade: £" + totalTradePrice : ""}
        </Text>
      </Flex>
      <Text color="gray.300" fontSize="sm" textAlign="center" mt={1}>
        Auto-refreshing in {secondsUntilRefresh} seconds
      </Text>


      <HStack m="auto" justifyContent="center" w="100%">
        <InputGroup w="20%" m="10px">
          <Input
            ref={inputRef}
            color="white"
            type="date"
            placeholder="Start Date"
            onChange={(e) => setStartDate(e.target.value)}
            sx={{
              '::-webkit-calendar-picker-indicator': {
                opacity: 0,
                display: 'none',
                WebkitAppearance: 'none',
              },
            }}

          />
          <InputRightElement>
            <IconButton
              aria-label="Open calendar"
              icon={<CalendarIcon color="white" />}
              size="sm"
              variant="ghost"
              onClick={() => inputRef.current?.showPicker()}

            />
          </InputRightElement>
        </InputGroup>
        <InputGroup w="50%">
          <Input
            color={"white"}
            placeholder="Search"
            textAlign={"center"}
            outline={"green"}
            fontSize={"xs"}
            onChange={(e) => setSearchQuery(e.target.value)}  // Update searchQuery state on input change
            onKeyDown={(e) => {
              if (e.key === 'Enter') {  // Check if the Enter key is pressed
                e.preventDefault();  // Prevent the default Enter behavior (like form submission)
                fetchPortalData();  // Trigger the fetch (same as clicking search button)
              }
            }}
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
          zIndex={9999}
          flexDir={'column'}
        >
          <Spinner size="xl" color="green.500" />
          <Text m='5' mb='0'>Loading...</Text>
        </Box>

      )}
      <TableContainer m="auto" maxWidth="100vw" overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead >
            <Tr>
              <Th width="50px"> </Th>
              <Th width="50px" color={'white'}> Date </Th>
              <Th textAlign="center" width="150px" color={'white'}>
                Account
              </Th>
              <Th textAlign="center" width="200px" color={'white'}>
                Barcode
              </Th>
              <Th textAlign="center" width="250px" color={'white'}>
                Name
              </Th>
              <Th textAlign="center" width="150px" color={'white'}>
                Print
              </Th>
              <Th textAlign="center" width="300px" color={'white'}>
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
                  <Td>{formatDate(data.created_date)}</Td>

                  <Td textAlign="center" width="150px">
                    {data.pharmacy_account_number}
                  </Td>

                  <Td textAlign="center" width="200px">
                    {data.order_type === "trade" ? (
                      <Text>£{data.totalTradePrice}</Text>
                    ) : (
                      <Text
                        cursor="pointer"
                        _hover={{ textDecoration: "underline" }}
                        onClick={() => handleCopyToClipboard(data.id)}
                      >
                        {data.id}
                      </Text>
                    )}
                  </Td>
                  <Td
                    textAlign="center"
                    width="250px"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxWidth="250px"
                  >
                    {(data.customer_comment || data.customer_record_status) &&
                      data.modified_time && (
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
                        handleUpdateOrder(data, {
                          status: "Token Downloaded",
                          patientName: data.patient_name,
                          modifiedBy: userEmail,
                          accountNumber: data.pharmacy_account_number,
                          pharmacyName: data.pharmacy_name,
                        })
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
                            <Text>Mark this order as 'Please RTS and select -token returned- from the drop-down box'?</Text>
                            <Text>Account: {data.pharmacy_account_number}</Text>
                            <Text>Barcode: {data.id}</Text>
                          </>,
                          () =>
                            handleUpdateOrder(data, {
                              status: "Please return this token to the Spine",
                              patientName: "Please RTS and select -token returned- from the drop-down box",
                              modifiedBy: userEmail,
                              accountNumber: data.pharmacy_account_number,
                              pharmacyName: data.pharmacy_name,
                            })
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
                              Mark this order as 'Barcode incorrect - please
                              resend in the comments box below or request to
                              cancel the order'?
                            </Text>
                            <Text>Account: {data.pharmacy_account_number}</Text>
                            <Text>Barcode: {data.id}</Text>
                          </>,
                          () =>
                            handleUpdateOrder(data, {
                              status: "Barcode incorrect - please resend in the comments box below or request to cancel the order",
                              patientName: "Invalid Barcode - Please check and ammend this order",
                              modifiedBy: userEmail,
                              accountNumber: data.pharmacy_account_number,
                              pharmacyName: data.pharmacy_name,
                            })
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
                            <Text>Mark this order as cancelled?</Text>
                            <Text>Account: {data.pharmacy_account_number}</Text>
                            <Text>Barcode: {data.id}</Text>
                          </>,
                          () =>

                            handleUpdateOrder(data, {
                              status: "Order cancelled",
                              patientName: data.patient_name,
                              modifiedBy: userEmail,
                              accountNumber: data.pharmacy_account_number,
                              pharmacyName: data.pharmacy_name,
                            })
                        )
                      }
                    >
                      Cancelled
                    </Button>
                    <Text
                      color="white"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      maxWidth="400px"
                      textAlign="center"
                      borderTopRadius={10}
                      paddingLeft="2"
                      paddingRight="2"
                      fontSize="sm"
                      backgroundColor={
                        data.record_status === "Order placed"
                          ? "whatsapp.700"
                          : "orange.600"
                      }
                      marginBottom={-2}
                    >
                      {data.record_status}
                      {data.record_status === "Order placed"
                        ? ": " + data.awards_script_number
                        : ""}
                    </Text>
                  </Td>
                </Tr>
                {expandedRow === data.id && (
                  <ExpandedRow
                    data={data}
                    email={userEmail}
                    updateOrder={handleUpdateOrder}
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
