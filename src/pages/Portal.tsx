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
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Divider,
} from "@chakra-ui/react";
import {
  EditIcon,
  ChatIcon,
} from "@chakra-ui/icons";
import { fetchPortal } from "../utils/fetchPortal";
import { updateOrder } from "../utils/updateOrder";
import PortalHeader from "../components/PortalHeader";
import { PortalType } from "../types/PortalType";
import ExpandedRow from "../components/ExpandedRow";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  formatDate,
  formatModifiedDate,
} from "../utils/helpers";

const Portal: React.FC = () => {
  const cancelRef = useRef(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [dialogAction, setDialogAction] = useState<() => void>(() => { });
  const [dialogMessage, setDialogMessage] = useState<React.ReactNode>("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderTypeFilter, setOrderTypeFilter] = useState("eps");
  const [portalData, setPortalData] = useState<PortalType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortField, setSortField] = useState<"date" | "account" | "hasMessage" | null>(null);
  const [startDate, setStartDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("Submitted");
  const [token, setToken] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [countdown, setCountdown] = useState(120);
  const [fastMode, setFastMode] = useState(true);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


  const toast = useToast();

  const statusFilterRef = useRef(statusFilter);
  const orderTypeFilterRef = useRef(orderTypeFilter);
  const searchQueryRef = useRef(searchQuery);
  const startDateRef = useRef(startDate);



  useEffect(() => {
    statusFilterRef.current = statusFilter;
    orderTypeFilterRef.current = orderTypeFilter;
    searchQueryRef.current = searchQuery;
    startDateRef.current = startDate;
  }, [statusFilter, orderTypeFilter, searchQuery, startDate]);


  useEffect(() => {
    const storedToken = localStorage.getItem("bearerToken");
    if (storedToken) setToken(storedToken);
    const storedEmail = localStorage.getItem('PortalEmail');
    if (storedEmail) setUserEmail(storedEmail)
  }, []);

  const resetAutoRefreshTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    if (expandedRow !== null) return; // Don't restart timer if row is expanded

    setCountdown(120); // reset to full duration

    intervalRef.current = setInterval(() => {
      fetchPortalData();
    }, 120000);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };



  const fetchPortalData = useCallback(async () => {
    if (!token) return;

    setLoading(true);

    try {
      const results = await fetchPortal(token, statusFilter, searchQueryRef.current, startDateRef.current, fastMode);
      const items = results.flatMap((page) => page.items || []);

      const uniqueItems = Array.from(new Map(items.map(item => [item.id, item])).values());

      const filtered = orderTypeFilter
        ? uniqueItems.filter(item => item.order_type === orderTypeFilter)
        : uniqueItems;

      setPortalData(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      resetAutoRefreshTimer();
    }
  }, [token, statusFilter, orderTypeFilter]);



  useEffect(() => {
    if (!token) return;
    resetAutoRefreshTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [token]);


  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  useEffect(() => {
    if (expandedRow && !portalData.some(item => item.id === expandedRow)) {
      setExpandedRow(null); // Collapse row if it's no longer in the data
    }
  }, [portalData, expandedRow]);

  useEffect(() => {
    if (expandedRow !== null) {
      // Pause auto-refresh when a row is expanded
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    } else {
      // Resume auto-refresh when no row is expanded
      resetAutoRefreshTimer();
    }

    // Cleanup if component unmounts while row is expanded
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [expandedRow]);


  const printCount = portalData.length;

  const totalTradePrice = useMemo(() => {
    if (orderTypeFilter !== "trade") return null;
    const sum = portalData.reduce((acc, item) => acc + Number(item.totalTradePrice || 0), 0);
    return parseFloat(sum.toFixed(2));
  }, [portalData, orderTypeFilter]);




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
    } catch (err: any) {
      console.error("Failed to update order:", err);
      toast({
        title: "Failed to update order",
        description: err?.message || "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSort = (field: "date" | "account" | "hasMessage") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    const data = [...portalData];
    const comparators = {
      date: (a: any, b: any) => sortDirection === "asc" ? a.created_date - b.created_date : b.created_date - a.created_date,
      account: (a: any, b: any) => sortDirection === "asc"
        ? (a.pharmacy_account_number || "").localeCompare(b.pharmacy_account_number || "")
        : (b.pharmacy_account_number || "").localeCompare(a.pharmacy_account_number || ""),
      hasMessage: (a: any, b: any) => sortDirection === "asc"
        ? Number(Boolean(b.customer_comment || b.customer_record_status)) - Number(Boolean(a.customer_comment || a.customer_record_status))
        : Number(Boolean(a.customer_comment || a.customer_record_status)) - Number(Boolean(b.customer_comment || b.customer_record_status)),
    };
    if (sortField) data.sort(comparators[sortField]);
    return data;
  }, [portalData, sortField, sortDirection]);



  return (
    <>
      {loading && <LoadingSpinner />}

      <Box bg="gray.900" minHeight="100vh" mt="-2">
        <Divider mt="2" borderColor="gray.500" borderBottomWidth="2px" opacity={1} />

        <PortalHeader
          countdown={countdown}
          printCount={printCount}
          totalTradePrice={totalTradePrice}
          orderTypeFilter={orderTypeFilter}
          setStartDate={setStartDate}
          setSearchQuery={setSearchQuery}
          fetchPortalData={fetchPortalData}
          setOrderTypeFilter={setOrderTypeFilter}
          statusFilter={statusFilter}
          handleStatusChange={handleStatusChange}
          fastMode={fastMode}
          setFastMode={setFastMode}
        />

        <TableContainer m="auto" maxWidth="100vw" overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead >
              <Tr>
                <Th width="50px"> </Th>
                <Th textAlign="center" width="50px" color={'white'} cursor="pointer" onClick={() => handleSort("date")} _hover={{ backgroundColor: 'gray.500' }}>
                  Date {sortField === "date" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </Th>
                <Th textAlign="center" width="150px" color={'white'} cursor="pointer" onClick={() => handleSort("account")} _hover={{ backgroundColor: 'gray.500' }}>
                  Account {sortField === "account" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </Th>

                <Th textAlign="center" width="200px" color={'white'}>
                  Barcode
                </Th>
                <Th textAlign="center" width="250px" color={'white'} cursor="pointer" onClick={() => handleSort("hasMessage")} _hover={{ backgroundColor: 'gray.500' }}>
                  Name {sortField === "hasMessage" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
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
              {sortedData.map((data, index) => (
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
                      {' '}{orderTypeFilter === '' && data.order_type}

                    </Td>
                    <Td textAlign="center">{formatDate(data.created_date)}</Td>

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
                        whiteSpace="normal"
                        borderTopRadius={10}
                        paddingLeft="2"
                        paddingRight="2"
                        fontSize="sm"
                        backgroundColor={
                          data.record_status === "Order placed"
                            ? "green.700"
                            : data.customer_record_status
                              ? "yellow.500"
                              : "orange.600"
                        }
                        marginBottom={-2}
                      >
                        {data.record_status}
                        {data.record_status === "Order placed" ? `: ${data.awards_script_number}` : ""}
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
    </>
  );
};

export default Portal;