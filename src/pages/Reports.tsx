import {
  InputGroup, Input, Flex, Select, Text, Box, Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Progress, Button, Center, InputRightElement, IconButton, useToast
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { fetchPortal } from "../utils/fetchPortal";
import { PortalType } from "../types/PortalType";
import { CalendarIcon } from "@chakra-ui/icons";

const Reports: React.FC = () => {
  const [token, setToken] = useState('');
  const [startDate, setStartDate] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('eps');
  const [reportCount, setReportCount] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [tradePrice, setTradePrice] = useState(0);
  const [progress, setProgress] = useState(0);
  const [wellAccountBreakdown, setWellAccountBreakdown] = useState<{ [key: string]: number }>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();


  const statusFilters = [
    'OOS', 'Invalid', 'Submitted', 'Ordered', 'RTS',
    'Downloaded', 'Call', 'Cancelled', 'Comments', 'Stop',
  ];

  const orderTypeOptions = [
    { value: 'eps', label: 'EPS' },
    { value: 'trade', label: 'Trade' },
    { value: 'mtm', label: 'MTM' },
    { value: 'manual', label: 'Manual' }
  ];

  useEffect(() => {
    const storedToken = localStorage.getItem('bearerToken');
    if (storedToken) setToken(storedToken);
  }, []);

  const isWellAccount = (item: PortalType): boolean => {
    const keywords = ['NCC', 'UCP', 'PCT', 'WIL'];
    const accountMatch = keywords.some(keyword => item.pharmacy_account_number?.toUpperCase().startsWith(keyword));
    const nameMatch = item.pharmacy_name?.toLowerCase().includes('well');
    return accountMatch && nameMatch;
  };

  const generateReport = async () => {
    if (!token) return;
    setLoading(true);
    setProgress(0);

    const counts: { [key: string]: number } = {
      ordered: 0, cancelled: 0, callbacks: 0,
      cannot_download_token: 0, not_ordered: 0, total: 0
    };

    const wellAccountCounts: { [key: string]: number } = {
      ordered: 0, cancelled: 0, callbacks: 0,
      cannot_download_token: 0, not_ordered: 0, total: 0
    };

    const wellAccountList: { [key: string]: number } = {};
    let totalTradePrice = 0;

    for (let i = 0; i < statusFilters.length; i++) {
      const status = statusFilters[i];
      const allResults = await fetchPortal(token, status, '', startDate, false);
      const flattenedData = allResults.flatMap(pageData => pageData.items || []);
      const uniqueData = flattenedData.filter((item: PortalType, index, self) =>
        self.findIndex(i => i.id === item.id) === index
      );
      const filteredData = uniqueData.filter(
        (item: PortalType) => item.order_type === orderTypeFilter
      );

      if (orderTypeFilter === 'trade') {
        totalTradePrice += filteredData
          .filter((item: PortalType) => item.record_status === 'Order placed')
          .reduce((sum, data) => sum + (Number(data.totalTradePrice) || 0), 0);
      }

      const wellFiltered = filteredData.filter(isWellAccount);

      // Count individual Well accounts
      for (const item of wellFiltered) {
        const accountNumber = item.pharmacy_account_number?.toUpperCase();
        if (!accountNumber) continue;

        if (!wellAccountList[accountNumber]) {
          wellAccountList[accountNumber] = 1;
        } else {
          wellAccountList[accountNumber]++;
        }
      }

      switch (status.toLowerCase()) {
        case 'ordered':
          counts.ordered = filteredData.length;
          wellAccountCounts.ordered = wellFiltered.length;
          break;
        case 'cancelled':
          counts.cancelled = filteredData.length;
          wellAccountCounts.cancelled = wellFiltered.length;
          break;
        case 'oos':
          counts.callbacks += filteredData.length;
          wellAccountCounts.callbacks += wellFiltered.length;
          break;
        case 'rts':
          if (orderTypeFilter === 'eps' || orderTypeFilter === 'mtm') {
            counts.cannot_download_token += filteredData.length;
            wellAccountCounts.cannot_download_token += wellFiltered.length;
          }
          break;
        case 'call':
        case 'comments':
          counts.callbacks += filteredData.length;
          wellAccountCounts.callbacks += wellFiltered.length;
          break;
        case 'invalid':
          if (orderTypeFilter === 'eps' || orderTypeFilter === 'mtm') {
            counts.cannot_download_token += filteredData.length;
            wellAccountCounts.cannot_download_token += wellFiltered.length;
          }
          break;
        case 'submitted':
          counts.not_ordered += filteredData.length;
          wellAccountCounts.not_ordered += wellFiltered.length;
          break;
        default:
          if (status.toLowerCase() in counts) {
            counts[status.toLowerCase()] = filteredData.length;
            wellAccountCounts[status.toLowerCase()] = wellFiltered.length;
          }
      }

      setProgress(Math.round(((i + 1) / statusFilters.length) * 100));
    }

    counts.total = Object.values(counts).reduce((acc, curr) => acc + curr, 0);
    wellAccountCounts.total = Object.values(wellAccountCounts).reduce((acc, curr) => acc + curr, 0);

    if (orderTypeFilter !== 'eps' && orderTypeFilter !== 'mtm') {
      delete counts.cannot_download_token;
      delete wellAccountCounts.cannot_download_token;
    }

    setReportCount({ ...counts, __well__: wellAccountCounts });
    setTradePrice(parseFloat(totalTradePrice.toFixed(3)));
    setWellAccountBreakdown(wellAccountList);
    setLoading(false);
  };

const generateExcelCopy = () => {
  const counts = { ...reportCount };
  const wellCounts = counts.__well__;
  delete counts.__well__;

  const rows = Object.entries(counts).map(([key, value]) => {
    const wellValue = wellCounts?.[key];
    return [
      key.toLocaleUpperCase().replace(/[-_]/g, ' '),
      wellValue ? `${value} (${wellValue})` : value
    ];
  });

  const data = rows.map(row => row.join("\t")).join("\n");
  const textarea = document.createElement('textarea');
  textarea.value = data;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);

  toast({
    title: "Copied!",
    status: "success",
    duration: 2000,
    isClosable: true,
    position: "bottom",
  });};


const copyWellAccountBreakdown = () => {
  if (!wellAccountBreakdown || Object.keys(wellAccountBreakdown).length === 0) return;

  const rows = Object.entries(wellAccountBreakdown).map(([account, count]) => [account, count]);

  const data = rows.map(row => row.join("\t")).join("\n");
  const textarea = document.createElement("textarea");
  textarea.value = data;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);

  toast({
    title: "Copied!",
    status: "success",
    duration: 2000,
    isClosable: true,
    position: "bottom",
  });
};



  return (
    <Box bg="gray.800" minHeight="100vh">
      <Flex direction="row" align="center" color='white' m='auto' w='60%' border={'solid white 2px'} borderRadius={'10'} justifyContent={'center'}>
        <InputGroup w="20%">
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

        <Select
          m='2'
          color="white"
          w="50%"
          value={orderTypeFilter}
          onChange={(e) => setOrderTypeFilter(e.target.value)}
          sx={{
            option: {
              backgroundColor: "gray.800",
              color: "white",
            },
          }}
        >
          {orderTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Button colorScheme="teal" onClick={generateReport}>Generate Report</Button>
      </Flex>

      {loading && (
        <Flex justify="center" align="center" flexDir={'column'} mt='10'>
          <Spinner size="xl" color="green.500" />
          <Text color={'white'}>Loading</Text>
          <Progress value={progress} size="xs" width="50%" colorScheme="green" mt="4" />
          <Text color="white" mt={2}>{progress}%</Text>
        </Flex>
      )}

      {Object.keys(reportCount).length > 0 && (
        <Box color="white">
          <Table variant="simple" color="white" mt={5} w='50%' m='auto'>
            <Thead>
              <Tr>
                <Th color={'yellow'}>Status</Th>
                <Th color={'yellow'}>Count</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(reportCount).map(([key, value]) => {
                if (key === "__well__") return null;
                const wellValue = reportCount.__well__?.[key];
                return (
                  <Tr key={key}>
                    <Td color={key === 'ordered' ? 'whatsapp.200' : ''}>
                      {key.toLocaleUpperCase().replace(/[-_]/g, ' ')}
                    </Td>
                    <Td color={key === 'ordered' ? 'whatsapp.200' : ''}>
                      {String(value)}{Number(wellValue) > 0 ? ` (${wellValue})` : ''}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>

          {tradePrice > 0 && (
            <Text marginTop={10} textAlign={'center'}>
              £{tradePrice.toFixed(2)}
            </Text>
          )}

          <Center>
            <Button
              m="auto"
              alignSelf="center"
              colorScheme="green"
              mt={5}
              onClick={generateExcelCopy}
            >
              Copy to Excel
            </Button>
          </Center>

          {Object.keys(wellAccountBreakdown).length > 0 && (
            <Box mt={10} color="white">
              <Text fontSize="xl" textAlign="center" color="yellow.300">Well Account Breakdown</Text>
              <Table variant="simple" color="white" mt={2} w='30%' m='auto'>
                <Thead>
                  <Tr>
                    <Th color="yellow">Account</Th>
                    <Th color="yellow">Count</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(wellAccountBreakdown).map(([account, count]) => (
                    <Tr key={account}>
                      <Td>{account}</Td>
                      <Td>{count}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
                <Center>
      <Button
        colorScheme="green"
        mt={4}
        onClick={copyWellAccountBreakdown}
      >
        Copy Well Account Data
      </Button>
    </Center>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Reports;
