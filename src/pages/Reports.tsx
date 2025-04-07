import { InputGroup, Input, InputRightElement, Flex, Select, Text, Box, Table, Thead, Tbody, Tr, Th, Td, Spinner, Progress, Button, Center } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { fetchPortal } from "../utils/fetchPortal";
import { PortalType } from "../types/PortalType";

const Reports: React.FC = () => {
  const [token, setToken] = useState('');
  const [startDate, setStartDate] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('eps');
  const [reportCount, setReportCount] = useState<any>({}); // State for report count as an object
  const [loading, setLoading] = useState(false);
  const [tradePrice, setTradePrice] = useState(0)
  const [progress, setProgress] = useState(0); // State to track progress percentage


  const statusFilters = [
    'OOS',
    'Invalid',
    'Submitted',
    'Ordered',
    'RTS',
    'Downloaded',
    'Call',
    'Cancelled',
    'Comments',
    'Stop',
  ];

  const orderTypeOptions = [
    { value: 'eps', label: 'EPS' },
    { value: 'trade', label: 'Trade' },
    { value: 'mtm', label: 'MTM' },
    { value: 'manual', label: 'Manual' }
  ];

  // Function to generate the report and return data in the desired format
  const generateReport = async () => {
    setLoading(true);
    setProgress(0); // Reset progress to 0 when starting
    const counts: { [key: string]: number } = {
      ordered: 0,
      cancelled: 0,
      callbacks: 0, // This will combine OOS and Call
      cannot_download_token: 0, // This will combine Invalid and RTS
      not_ordered: 0,
      total: 0, // This will be the sum of all counts
    };

    let totalTradePrice = 0; // Initialize a variable to accumulate the trade price

    for (let i = 0; i < statusFilters.length; i++) {
      const status = statusFilters[i];

      console.log(`Fetching data for status: ${status}`);

      const allResults = await fetchPortal(token, status, '', startDate);
      const flattenedData = allResults.flatMap(pageData => pageData.items || []);

      const uniqueData = flattenedData.filter((item: PortalType, index, self) =>
        self.findIndex(i => i.id === item.id) === index
      );

      // Log the fetched data to check what you are getting for each status
      console.log(`Fetched ${uniqueData.length} unique items for status: ${status}`);

      const filteredData = uniqueData.filter(
        (item: PortalType) => item.order_type === orderTypeFilter
      );

      console.log(`Filtered down to ${filteredData.length} items matching order type: ${orderTypeFilter}`);

      // If the orderType is 'trade', sum up the totalTradePrice of the ordered items
      if (orderTypeFilter === 'trade') {
        totalTradePrice += filteredData
          .filter((item: PortalType) => item.record_status === 'Order placed') // Only sum 'Ordered' statuses
          .reduce((sum, data) => sum + (Number(data.totalTradePrice) || 0), 0);
      }

      // Count the occurrences of each status
      switch (status.toLowerCase()) {
        case 'ordered':
          counts.ordered = filteredData.length;
          break;
        case 'cancelled':
          counts.cancelled = filteredData.length;
          break;
        case 'oos':
          counts.callbacks += filteredData.length; // Adding OOS to callbacks
          break;
        case 'rts':
          counts.cannot_download_token += filteredData.length; // Adding RTS to cannot_download_token
          break;
        case 'call':
          counts.callbacks += filteredData.length; // Adding Call to callbacks
          break;
        case 'Comments':
          counts.callbacks += filteredData.length; // Adding Call to callbacks
          break;
        case 'invalid':
          counts.cannot_download_token += filteredData.length; // Adding Invalid to cannot_download_token
          break;
        case 'submitted':
          // Ensure you're adding the correct number of "submitted" items to `not_ordered`
          counts.not_ordered += filteredData.length;
          break;
        default:
          if (status.toLowerCase() in counts) {
            counts[status.toLowerCase()] = filteredData.length;
          }
      }
      const newProgress = Math.round(((i + 1) / statusFilters.length) * 100);
      setProgress(newProgress);

    }

    // Calculate total count
    counts.total = Object.values(counts).reduce((acc, curr) => acc + curr, 0);

    setReportCount(counts); // Set the result to the state

    // After the loop finishes, set the final trade price
    setTradePrice(parseFloat(totalTradePrice.toFixed(3))); // You can format it here if you need to

    console.log(counts);
    setLoading(false);
  };
  const generateExcelCopy = () => {
    // Create a header with the orderTypeFilter as a merged header
    const headers = [`${orderTypeFilter.toUpperCase()}`]; // This will simulate a merged header

    // Map the report data into rows for the table
    const rows = Object.entries(reportCount).map(([key, value]) => [
      key.toLocaleUpperCase().replace(/[-_]/g, ' '),
      value,
    ]);

    // Combine headers and rows for the final data
    const data = [headers, ...rows] // Added secondaryHeaders for 'Status' and 'Count'
      .map(row => row.join("\t")) // Join each row's columns with tab
      .join("\n"); // Join rows with newlines

    // Create a temporary textarea element to copy the data to the clipboard
    const textarea = document.createElement('textarea');
    textarea.value = data;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    alert("Data copied to clipboard! You can now paste it into Excel.");
  };




  return (
    <Box bg="gray.800" minHeight="100vh" fontFamily={'jura'}>
      <Flex direction="row" align="center" color='white' w='60%' m='auto'>
        <InputGroup w="50%">
          <Input
            m="auto"
            color="white"
            placeholder="Enter access token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            textAlign="center"
            outline="green"
            fontSize="xs"
          />
          <InputRightElement>
            <CheckIcon
              _hover={{ color: "green", cursor: "pointer" }}
              onClick={generateReport}
            />
          </InputRightElement>
        </InputGroup>

        <InputGroup w="20%" m="10px">
          <Input
            color="white"
            type="date"
            placeholder="Start Date"
            onChange={(e) => setStartDate(e.target.value)}
          />
        </InputGroup>

        <Select
          color="white"
          w="30%"
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
      </Flex>

      {loading && (
        <Flex justify="center" align="center" flexDir={'column'} mt='10'>
          <Spinner size="xl" color="green.500" />
          <Text color={'white'}>Loading</Text>
          <Progress value={progress} size="xs" width="50%" colorScheme="green" mt="4" />
          <Text color="white" mt={2}>{progress}%</Text>
        </Flex>
      )}
      {token.length > 20 &&
        <Box color="white">
          <Table variant="simple" color="white" mt={5} w='50%' m='auto'>
            <Thead>
              <Tr >
                <Th color={'yellow'}>Status</Th>
                <Th color={'yellow'}>Count</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(reportCount).map(([key, value]) => (
                <Tr key={key}>
                  <Td color={key === 'ordered' ? 'whatsapp.200' : ''}>  {`${key.toLocaleUpperCase().replace(/[-_]/g, ' ')}`}
                  </Td>
                  <Td color={key === 'ordered' ? 'whatsapp.200' : ''}>{`${value}`}</Td>
                </Tr>
              ))}</Tbody>
          </Table>
          {tradePrice > 0 && <Text marginTop={10} textAlign={'center'}>£{tradePrice.toFixed(2)}</Text>}
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

        </Box>

      }

    </Box>
  );
};

export default Reports;
