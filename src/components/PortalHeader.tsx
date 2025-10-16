import React, { useRef } from "react";
import {
    Box,
    HStack,
    Text,
    InputGroup,
    Input,
    InputRightElement,
    IconButton,
    Select,
    Checkbox,
} from "@chakra-ui/react";
import { TimeIcon, CalendarIcon, SearchIcon } from "@chakra-ui/icons";

interface PortalHeaderProps {
    countdown: number;
    printCount: number;
    totalTradePrice: number | null;
    orderTypeFilter: string;
    setStartDate: (date: string) => void;
    setSearchQuery: (query: string) => void;
    fetchPortalData: () => void;
    setOrderTypeFilter: (orderType: string) => void;
    statusFilter: string;
    handleStatusChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    fastMode: boolean;
    setFastMode: (fastMode: boolean) => void;
    isPaused: boolean;
    togglePause: () => void;
}

const PortalHeader: React.FC<PortalHeaderProps> = ({
    countdown,
    printCount,
    totalTradePrice,
    orderTypeFilter,
    setStartDate,
    setSearchQuery,
    fetchPortalData,
    setOrderTypeFilter,
    statusFilter,
    handleStatusChange,
    fastMode,
    setFastMode,
    isPaused,
    togglePause
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <Box
            position="sticky"
            top="0"
            zIndex={1000}
            bg="gray.900"
            borderBottom="2px solid"
            borderColor="gray.500"
        >
            <HStack py={5} justify="center" w="100%" spacing={4} maxW="1200px" mx="auto" px={4}>

                {/* Countdown Timer */}
                <HStack
                    h="38px"
                    borderRadius="md"
                    borderWidth={1}
                    p={2}
                    w="10%"
                    justify="center"
                    borderColor="gray.600"

                >
                    <TimeIcon
                        color={isPaused ? "red.400" : "gray.300"}
                        cursor="pointer"
                        onClick={togglePause}
                    // title={isPaused ? "Resume Timer" : "Pause Timer"}
                    />
                    <Text color={countdown > 30 ? "gray.300" : "red.300"} fontSize="sm" px={2}>
                        {countdown}s
                    </Text>


                </HStack>

                {/* Print Count */}
                <Text
                    textAlign="center"
                    color="orange.300"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="md"
                    h="38px"
                    w="25%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="semibold"
                >
                    Total: {printCount}{" "}
                    {orderTypeFilter === "trade" ? "Trade: £" + totalTradePrice : ""}
                </Text>

                {/* Date Picker */}
                <InputGroup w="20%">
                    <Input
                        ref={inputRef}
                        color="white"
                        type="date"
                        onChange={(e) => setStartDate(e.target.value)}
                        sx={{
                            '::-webkit-calendar-picker-indicator': {
                                opacity: 0,
                                display: "none",
                                WebkitAppearance: "none",
                            },
                        }}
                        height="38px"
                        borderRadius={5}
                        borderWidth={1}
                        px={2}
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

                {/* Search Input */}
                <InputGroup w="20%" m="0">
                    <Input
                        color="white"
                        placeholder="Search"
                        textAlign="center"
                        fontSize="xs"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                fetchPortalData();
                            }
                        }}
                        height="38px"
                        borderRadius={5}
                        borderWidth={1}
                        px={2}
                    />
                    <InputRightElement>
                        <SearchIcon
                            color="white"
                            _hover={{ color: "green", cursor: "pointer" }}
                            onClick={fetchPortalData}
                        />
                    </InputRightElement>
                </InputGroup>

                {/* Order Type Select */}
                <Select
                    color="white"
                    w="20%"
                    height="38px"
                    borderRadius={5}
                    borderWidth={1}
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
                    <option value="">No Filter</option>
                </Select>

                {/* Status Select */}
                <Select
                    color="white"
                    w="20%"
                    height="38px"
                    borderRadius={5}
                    borderWidth={1}
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

                {/* Fast Mode Checkbox */}
                <Checkbox isChecked={fastMode} onChange={(e) => setFastMode(e.target.checked)}>
                    <Text fontSize={"xs"} color={"white"}>
                        Fast Mode
                    </Text>
                </Checkbox>
            </HStack>
        </Box>
    );
};

export default PortalHeader;
