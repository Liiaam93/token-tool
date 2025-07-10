import {
  InputGroup, Input, Flex, Select, Text, Box, Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Progress, Button, Center, InputRightElement, IconButton, useToast
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { fetchPortal } from "../utils/fetchPortal";
import { PortalType } from "../types/PortalType";
import { CalendarIcon } from "@chakra-ui/icons";

interface ReportCounts {
  ordered?: number;
  cancelled?: number;
  callbacks?: number;
  cannot_download_token?: number;
  not_ordered?: number;
  total?: number;
  [key: string]: number | Record<string, number> | undefined;
  __well__?: Record<string, number>;
}

const Reports: React.FC = () => {
  const [token, setToken] = useState('');
  const [startDate, setStartDate] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('eps');
  const [reportCount, setReportCount] = useState<ReportCounts>({});
  const [loading, setLoading] = useState(false);
  const [tradePrice, setTradePrice] = useState(0);
  const [progress, setProgress] = useState(0);
  const [wellAccountBreakdown, setWellAccountBreakdown] = useState<Record<string, number>>({});
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

    // Initial counts with guaranteed number keys
    const initialCounts: Record<string, number> = {
      ordered: 0,
      cancelled: 0,
      callbacks: 0,
      cannot_download_token: 0,
      not_ordered: 0,
      total: 0,
    };

    let counts: Record<string, number> = { ...initialCounts };
    let wellAccountCounts: Record<string, number> = { ...initialCounts };
    const wellAccountList: Record<string, number> = {};
    let totalTradePrice = 0;
    let completed = 0;

    const incrementCount = (obj: Record<string, number>, key: string, amount = 1) => {
      obj[key] = (obj[key] ?? 0) + amount;
    };

    const handleStatusData = (status: string, items: PortalType[]) => {
      // Unique items by id
      const uniqueItems = items.filter(
        (item, index, self) => self.findIndex(i => i.id === item.id) === index
      );

      const filtered = uniqueItems.filter(item => item.order_type === orderTypeFilter);
      const wellFiltered = filtered.filter(isWellAccount);

      wellFiltered.forEach(item => {
        const account = item.pharmacy_account_number?.toUpperCase();
        if (account) {
          wellAccountList[account] = (wellAccountList[account] ?? 0) + 1;
        }
      });

      if (orderTypeFilter === 'trade') {
        totalTradePrice += filtered
          .filter(item => item.record_status === 'Order placed')
          .reduce((sum, item) => sum + (Number(item.totalTradePrice) || 0), 0);
      }

      const s = status.toLowerCase();

      switch (s) {
        case 'ordered':
        case 'cancelled':
          incrementCount(counts, s, filtered.length);
          incrementCount(wellAccountCounts, s, wellFiltered.length);
          break;

        case 'oos':
        case 'call':
        case 'comments':
          incrementCount(counts, 'callbacks', filtered.length);
          incrementCount(wellAccountCounts, 'callbacks', wellFiltered.length);
          break;

        case 'rts':
        case 'invalid':
          if (['eps', 'mtm'].includes(orderTypeFilter)) {
            incrementCount(counts, 'cannot_download_token', filtered.length);
            incrementCount(wellAccountCounts, 'cannot_download_token', wellFiltered.length);
          }
          break;

        case 'submitted':
          incrementCount(counts, 'not_ordered', filtered.length);
          incrementCount(wellAccountCounts, 'not_ordered', wellFiltered.length);
          break;

        default:
          if (counts[s] !== undefined) {
            incrementCount(counts, s, filtered.length);
            incrementCount(wellAccountCounts, s, wellFiltered.length);
          }
      }
    };

    await Promise.all(
      statusFilters.map(async (status) => {
        try {
          const result = await fetchPortal(token, status, '', startDate, false);
          const items = result.flatMap(page => page.items ?? []);
          handleStatusData(status, items);
        } catch (err) {
          console.error(`Error fetching ${status}:`, err);
        } finally {
          completed++;
          setProgress(Math.round((completed / statusFilters.length) * 100));
        }
      })
    );

    counts.total = Object.values(counts).reduce((acc, val) => acc + val, 0);
    wellAccountCounts.total = Object.values(wellAccountCounts).reduce((acc, val) => acc + val, 0);

    if (!['eps', 'mtm'].includes(orderTypeFilter)) {
      delete counts.cannot_download_token;
      delete wellAccountCounts.cannot_download_token;
    }

    setReportCount({ ...counts, __well__: wellAccountCounts });
    setWellAccountBreakdown(wellAccountList);
    setTradePrice(parseFloat(totalTradePrice.toFixed(3)));
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
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
const generateExcelCopy = () => {
  const { __well__, ...mainCounts } = reportCount;
  const rows = Object.values(mainCounts).map(value => {
    const count = typeof value === 'number' ? value : 0;
    return `${count}`;
  });

  const data = rows.join("\n");
  copyToClipboard(data);
};



  const copyWellAccountBreakdown = () => {
    if (!Object.keys(wellAccountBreakdown).length) return;

    const rows = Object.entries(wellAccountBreakdown).map(
      ([account, count]) => `${account}\t${count}`
    ).join("\n");

    copyToClipboard(rows);
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
                const valNum = typeof value === 'number' ? value : 0;
                const wellValue = reportCount.__well__ && typeof reportCount.__well__[key] === 'number'
                  ? reportCount.__well__[key]
                  : 0;
                return (
                  <Tr key={key}>
                    <Td color={key === 'ordered' ? 'whatsapp.200' : ''}>
                      {key.toLocaleUpperCase().replace(/[-_]/g, ' ')}
                    </Td>
                    <Td color={key === 'ordered' ? 'whatsapp.200' : ''}>
                      {valNum}{wellValue > 0 ? ` (${wellValue})` : ''}
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
