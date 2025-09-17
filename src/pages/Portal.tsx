import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Box, Button, Input,
  IconButton, Text, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  useToast, InputGroup, InputRightElement, Select, HStack, Divider, Checkbox,
} from "@chakra-ui/react";
import {
  EditIcon, SearchIcon, ChatIcon, CalendarIcon, TimeIcon,
} from "@chakra-ui/icons";
import { fetchPortal } from "../utils/fetchPortal";
import { updateOrder } from "../utils/updateOrder";
import { PortalType } from "../types/PortalType";
import ExpandedRow from "../components/ExpandedRow";
import {
  formatDate,
  formatModifiedDate,
  sortPortalData,
} from "../utils/helpers";

import LoadingSpinner from "../components/LoadingSpinner";

const Portal: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toast = useToast();

  const [dialogAction, setDialogAction] = useState<() => void>(() => { });
  const [dialogMessage, setDialogMessage] = useState<React.ReactNode>("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portalData, setPortalData] = useState<PortalType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [countdown, setCountdown] = useState(120);
  const [fastMode, setFastMode] = useState(true);
  const [appliedSearch, setAppliedSearch] = useState("");


  const [filters, setFilters] = useState({
    orderType: "eps",
    status: "Submitted",
    search: "",
    startDate: "",
  });

  const [sortState, setSortState] = useState<{
    field: "date" | "account" | "hasMessage" | null;
    direction: "asc" | "desc";
  }>({ field: null, direction: "asc" });

  // Initialize token and email from localStorage
  useEffect(() => {
    setToken(localStorage.getItem("bearerToken") || "");
    setUserEmail(localStorage.getItem("PortalEmail") || "");
  }, []);

  const clearAllIntervals = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const startIntervals = () => {
    intervalRef.current = setInterval(fetchPortalData, 120000);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const resetAutoRefreshTimer = () => {
    clearAllIntervals();
    setCountdown(120);
    startIntervals();
  };

  const fetchPortalData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const { orderType, status, startDate } = filters;

    try {
const results = await fetchPortal(token, status, appliedSearch, startDate, fastMode);
      const items = results.flatMap((page) => page.items || []);
      const uniqueItems = Array.from(new Map(items.map((i) => [i.id, i])).values());
      const filtered = orderType ? uniqueItems.filter((i) => i.order_type === orderType) : uniqueItems;
      setPortalData(filtered);
    } catch (err) {
      console.error("Error fetching portal data:", err);
    } finally {
      setLoading(false);
      resetAutoRefreshTimer();
    }
}, [token, filters.orderType, filters.status, filters.startDate, appliedSearch, fastMode]);

const handleSearch = () => {
  setAppliedSearch(filters.search);
};


  useEffect(() => {
    if (!token) return;
    resetAutoRefreshTimer();
    return clearAllIntervals;
  }, [token]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  const printCount = portalData.length;

  const totalTradePrice = useMemo(() => {
    if (filters.orderType !== "trade") return null;
    const total = portalData.reduce((sum, i) => sum + Number(i.totalTradePrice || 0), 0);
    return parseFloat(total.toFixed(2));
  }, [portalData, filters.orderType]);

  const handleExpandRow = (id: string) => setExpandedRow((prev) => (prev === id ? null : id));

  const handleCopyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setSelectedId(id);
    toast({ title: "Copied to clipboard", status: "success", duration: 2000, isClosable: true });
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
      console.error("Update failed:", err);
      toast({
        title: "Failed to update order",
        description: err?.message || "Unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSort = (field: "date" | "account" | "hasMessage") => {
    setSortState((prev) => prev.field === field
      ? { ...prev, direction: prev.direction === "asc" ? "desc" : "asc" }
      : { field, direction: "asc" });
  };

  const sortedData = useMemo(() => {
    return sortPortalData(portalData, sortState.field, sortState.direction);
  }, [portalData, sortState]);

  return (
    <>
      {loading && <LoadingSpinner />}
      
      <Box bg="gray.900" minHeight="100vh" mt="-2">
        <Divider mt="2" borderColor="gray.600" borderBottomWidth="2px" opacity={1} />
          <Box
  position="sticky"
  top="0"
  zIndex={1000}
  bg="gray.900"
  borderBottom="2px solid"
  borderColor="gray.600"
>
  <HStack py={5} justify="center" w="100%" spacing={4} maxW="1200px" mx="auto" px={4}>
          <HStack h="38px" borderRadius="md" borderWidth={1} p={2} w="10%" justify="center" borderColor="gray.600">
            <TimeIcon color="gray.300" />
            <Text color="gray.300" fontSize="sm" px={2}>{countdown}s</Text>
          </HStack>
          <Text
            textAlign="center"
            color="orange.300"
            border="1px solid"
            borderColor="gray.600"
            borderRadius="md"
            h="38px"
            w="15%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="semibold"
          >
            Total: {printCount} {filters.orderType === "trade" ? `Trade: £${totalTradePrice}` : ""}
          </Text>
          <InputGroup w="20%">
            <Input
      
              ref={inputRef}
              color="gray.100"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              h="38px"
              borderRadius="md"
              borderColor="gray.600"
              px={2}
            />
            <InputRightElement>
              <IconButton
                aria-label="Open calendar"
                icon={<CalendarIcon color="gray.300" />}
                size="sm"
                variant="ghost"
                onClick={() => inputRef.current?.showPicker()}
              />
            </InputRightElement>
          </InputGroup>
          <InputGroup w="20%">
            <Input
              color="gray.100"
              placeholder="Search"
              textAlign="center"
              fontSize="sm"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              h="38px"
              borderRadius="md"
              borderColor="gray.600"
              px={2}
            />
            <InputRightElement>
              <SearchIcon
                color="gray.300"
                _hover={{ color: "green.400", cursor: "pointer" }}
                onClick={handleSearch}
              />
            </InputRightElement>
          </InputGroup>
          <Select
            color="gray.100"
            w="20%"
            h="38px"
            borderRadius="md"
            borderColor="gray.600"
            value={filters.orderType}
            onChange={(e) => setFilters((f) => ({ ...f, orderType: e.target.value }))}
            sx={{ option: { bg: "gray.900", color: "gray.100" } }}
          >
            <option value="eps">EPS</option>
            <option value="trade">Trade</option>
            <option value="mtm">MTM</option>
            <option value="manual">Manual</option>
            <option value="">No Filter</option>
          </Select>
          <Select
            color="gray.100"
            w="20%"
            h="38px"
            borderRadius="md"
            borderColor="gray.600"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            sx={{ option: { bg: "gray.900", color: "gray.100" } }}
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
          <Checkbox isChecked={fastMode} onChange={(e) => setFastMode(e.target.checked)} colorScheme="green">
            <Text fontSize="sm" color="gray.300">Fast-Mode</Text>
          </Checkbox>
        </HStack>
        </Box>

        <TableContainer maxW="100vw" overflowX="auto" px={4} mt={4}>
          <Table size="sm" variant="simple" colorScheme="gray">
            <Thead>
              <Tr>
                <Th w="50px"></Th>
                <Th
                  textAlign="center"
                  w="50px"
                  color="gray.300"
                  cursor="pointer"
                  onClick={() => handleSort("date")}
                  _hover={{ bg: 'gray.700' }}
                >
                  Date {sortState.field === "date" ? (sortState.direction === "asc" ? "↑" : "↓") : ""}
                </Th>
                <Th
                  textAlign="center"
                  w="150px"
                  color="gray.300"
                  cursor="pointer"
                  onClick={() => handleSort("account")}
                  _hover={{ bg: 'gray.700' }}
                >
                  Account {sortState.field === "account" ? (sortState.direction === "asc" ? "↑" : "↓") : ""}
                </Th>
                <Th textAlign="center" w="200px" color="gray.300">Barcode</Th>
                <Th
                  textAlign="center"
                  w="250px"
                  color="gray.300"
                  cursor="pointer"
                  onClick={() => handleSort("hasMessage")}
                  _hover={{ bg: 'gray.700' }}
                >
                  Name {sortState.field === "hasMessage" ? (sortState.direction === "asc" ? "↑" : "↓") : ""}
                </Th>
                <Th textAlign="center" w="150px" color="white">Print</Th>
                <Th textAlign="center" w="300px" color="white">Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedData.map((data) => (
                <React.Fragment key={data.id}>
                  <Tr
                    _hover={{ bg: "green.800" }}
                    bg={data.id === selectedId ? "blue.800"
                      : portalData.indexOf(data) % 2 === 0 ? "gray.800" : "blue.800"}
                    color={selectedId === data.id ? "salmon" : data.patient_name ? "yellow" : "white"}
                  >
                    <Td w="50px">
                      <EditIcon _hover={{ cursor: "pointer" }} onClick={() => handleExpandRow(data.id)} />
                      {" "}{filters.orderType === "" && data.order_type}
                    </Td>
                    <Td textAlign="center">{formatDate(data.created_date)}</Td>
                    <Td textAlign="center" w="150px">{data.pharmacy_account_number}</Td>
                    <Td textAlign="center" w="200px">
                      {data.order_type === "trade" ? `£${data.totalTradePrice}` : (
                        <Text
                          cursor="pointer" _hover={{ textDecoration: "underline" }}
                          onClick={() => handleCopyToClipboard(data.id)}
                        >
                          {data.id}
                        </Text>
                      )}
                    </Td>
                    <Td
                      textAlign="center" w="250px" whiteSpace="nowrap"
                      overflow="hidden" textOverflow="ellipsis" maxW="250px"
                    >
                      {(data.customer_comment || data.customer_record_status) && data.modified_time && (
                        <>
                          <ChatIcon color="green" />
                          <Text color="white" ml={2} fontSize="sm">{formatModifiedDate(data.modified_time)}</Text>
                        </>
                      )}
                      {data.patient_name}
                    </Td>
                    <Td textAlign="center" w="150px">
                      <Button
                        colorScheme="blue" size="xs"
                        onClick={() => handleUpdateOrder(data, {
                          status: "Token Downloaded",
                          patientName: data.patient_name,
                          modifiedBy: userEmail,
                          accountNumber: data.pharmacy_account_number,
                          pharmacyName: data.pharmacy_name,
                        })}
                      >
                        Set Token Downloaded
                      </Button>
                    </Td>
                    <Td textAlign="center" w="300px">
                      {/* RTS Button */}
                      <Button colorScheme="red" size="xs" m="2"
                        onClick={() => handleOpenDialog(
                          <>
                            <Text>Mark this order as 'Please RTS and select -token returned- from the drop-down box'?</Text>
                            <Text>Account: {data.pharmacy_account_number}</Text>
                            <Text>Barcode: {data.id}</Text>
                          </>,
                          () => handleUpdateOrder(data, {
                            status: "Please return this token to the Spine",
                            patientName: "Please RTS and select -token returned- from the drop-down box",
                            modifiedBy: userEmail,
                            accountNumber:
                              data.pharmacy_account_number,
                            pharmacyName: data.pharmacy_name,
                          })
                        )}
                      >
                        RTS
                      </Button>
                      {/* Invalid Button */}
                      <Button colorScheme="red" size="xs" m="2"
                        onClick={() =>
                          handleOpenDialog(
                            <>
                              <Text>
                                Mark this order as 'Barcode incorrect - please resend in the comments box below or request to cancel the order'?
                              </Text>
                              <Text>Account: {data.pharmacy_account_number}</Text>
                              <Text>Barcode: {data.id}</Text>
                            </>,
                            () => handleUpdateOrder(data, {
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
                      {/* Cancelled Button */}
                      <Button colorScheme="red" size="xs" m="2"
                        onClick={() =>
                          handleOpenDialog(
                            <>
                              <Text>Mark this order as cancelled?</Text>
                              <Text>Account: {data.pharmacy_account_number}</Text>
                              <Text>Barcode: {data.id}</Text>
                            </>,
                            () => handleUpdateOrder(data, {
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
                        color="white" overflow="hidden" textOverflow="ellipsis"
                        maxW="400px" textAlign="center" whiteSpace="normal"
                        borderTopRadius={10} paddingLeft="2" paddingRight="2"
                        fontSize="sm" backgroundColor={
                          data.record_status === "Order placed"
                            ? "whatsapp.700"
                            : data.customer_record_status
                              ? "yellow.500"
                              : "orange.600"
                        }
                        mb={-2}
                      >
                        {data.record_status}
                        {data.record_status === "Order placed" ? `: ${data.awards_script_number}` : ""}
                      </Text>
                    </Td>
                  </Tr>
                  {expandedRow === data.id && (
                    <ExpandedRow data={data} email={userEmail} updateOrder={handleUpdateOrder} />
                  )}
                </React.Fragment>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <AlertDialog isOpen={isDialogOpen} leastDestructiveRef={cancelRef} onClose={() => setIsDialogOpen(false)}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">Confirm Action</AlertDialogHeader>
              <AlertDialogBody>{dialogMessage}</AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsDialogOpen(false)}>No</Button>
                <Button colorScheme="red" onClick={handleConfirm} ml={3}>Yes</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </>
  );
};

export default Portal;
