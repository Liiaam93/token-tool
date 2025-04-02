import { InputGroup, Input, InputRightElement, Flex, Select, Text, Box } from "@chakra-ui/react";
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

    const counts: { [key: string]: number } = {
      ordered: 0,
      cancelled: 0,
      callbacks: 0, // This will combine OOS and Call
      cannot_download_token: 0, // This will combine Invalid and RTS
      not_ordered: 0,
      total: 0, // This will be the sum of all counts
    };

    for (const status of statusFilters) {
      const allResults = await fetchPortal(token, status, '', startDate);
      const flattenedData = allResults.flatMap(pageData => pageData.items || []);

      const uniqueData = flattenedData.filter((item: PortalType, index, self) =>
        self.findIndex(i => i.id === item.id) === index
      );

      const filteredData = uniqueData.filter(
        (item: PortalType) => item.order_type === orderTypeFilter
      );

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
        case 'Submitted':
          counts.submitted += filteredData.length; // Adding Invalid to cannot_download_token
          break;
        default:
          if (status.toLowerCase() in counts) {
            counts[status.toLowerCase()] = filteredData.length;
          }
      }
    }

    // Calculate total count
    counts.total = Object.values(counts).reduce((acc, curr) => acc + curr, 0);

    setReportCount(counts); // Set the result to the state
    console.log(counts);
    setLoading(false);
  };

  return (
    <Box bg="gray.800" minHeight="100vh">
      <Flex direction="row" align="center" color='white'>
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

      {loading ? (
        <Text color="white">Loading...</Text>
      ) : (
        <Box color="white">
          {Object.entries(reportCount).map(([key, value]) => (
            <Text key={key}>{`${key}: ${value}`}</Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Reports;
