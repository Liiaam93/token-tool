import React, { useState, useRef } from "react";
import {
  Tr, Td, Flex, VStack, Text, Input,
  Button, Select, Box, Link,
  Textarea,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider
} from "@chakra-ui/react";
import { PortalType } from "../types/PortalType";
import { CalendarIcon } from "@chakra-ui/icons";

interface ExpandedRowProps {
  data: PortalType;
  email: string;
  updateOrder: (data: any, overrides: any) => Promise<void>;
}

type OrderOverrides = {
  patientName: string;
  scriptNumber: string;
  modifiedBy: string;
  accountNumber: string;
  pharmacyName: string;
  status?: string;
  comment?: string;
  orderDate?: string;
  oosItem?: string;
};

const ExpandedRow: React.FC<ExpandedRowProps> = ({
  data,
  email,
  updateOrder,
}) => {
  const [patientName, setPatientName] = useState(data.patient_name);
  const [scriptNumber, setScriptNumber] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [oosItem, setOosItem] = useState<string>("");
  const [orderDate, setOrderDate] = useState<string>('')

  const inputRef = useRef<HTMLInputElement>(null);


  const handleCompleteOrder = async () => {
    let orderDateIso: string | undefined = undefined;

    if (orderDate) {
      const now = new Date();
      const [year, month, day] = orderDate.split('-').map(Number);

      const fullDate = new Date(Date.UTC(
        year,
        month - 1,
        day,
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds()
      ));

      orderDateIso = fullDate.toISOString();
    }

    const overrides: OrderOverrides = {
      patientName,
      scriptNumber,
      modifiedBy: email,
      accountNumber: data.pharmacy_account_number,
      pharmacyName: data.pharmacy_name,
      ...(orderStatus ? { status: orderStatus } : {}),
      comment,
      ...(orderDateIso ? { orderDate: orderDateIso } : {}),
      oosItem
    };

    await updateOrder(data, overrides);
  };


  return (
    <Tr>
      <Td colSpan={7} bg="gray.700">
        <Flex p={4} align="start" wrap="nowrap" gap={6}>
          {/* Left: Info Section */}
          <VStack
            width="25%"
            align="start"
            spacing={4}
            color="white"
            bg="gray.600"
            boxShadow="md"
            p={4}
            borderRadius="md"
            borderColor="blue.400"
            borderWidth={1}
          >
            {data.pharmacy_name !== "n/a" && (
              <Text fontWeight="semibold" fontStyle="italic">{data.pharmacy_name}</Text>
            )}
            <Link href={`mailto:${data.email}`} color="blue.300" isExternal>
              {data.email}
            </Link>
            <Text whiteSpace="normal">{data.prescriptionExemptions}</Text>

            {data.staff_comment && (
              <>
                <Text color="yellow.300">Staff comment:</Text>
                <Text color="red.300" fontStyle="italic" whiteSpace="normal">
                  {data.staff_comment}
                </Text>
              </>
            )}

            {data.out_of_stock_item && (
              <Text color="red.200" whiteSpace="normal">
                OOS: <Text as="span" fontWeight="semibold">{data.out_of_stock_item}</Text>
              </Text>
            )}

            {data.customer_comment && (
              <>
                <Text color="yellow.300">Customer comment:</Text>
                <Text color="red.300" fontStyle="italic" whiteSpace="normal">
                  Customer reply: {data.customer_comment}
                </Text>
              </>
            )}

            <Text color="yellow.200">{data.customer_record_status}</Text>

            {data.order_items?.length > 0 && (
              <Box border="1px solid white" borderRadius="md" p={3} w="100%">
                <Text mb='5'>Items:</Text>
                {data.order_items.map((o, idx) => (
                  <>
                    <Text key={idx} whiteSpace="normal">{o.productName}</Text>
                    <Text fontSize={12} whiteSpace="normal">  - {o.quantity}  {o.singles} </Text>
                    <Text fontSize={12} whiteSpace="normal" fontStyle={'italic'}>{o.customisation && `  - ${o.customisation}`}</Text>
                    {data.order_items.length - 1 > idx && (<Divider m={2} borderColor="gray.500" borderWidth="1px" my={2} w="90%" />)}
                  </>
                ))}
              </Box>
            )}
          </VStack>

          {/* Right: Editable Fields */}
          <Box width="70%" color="white">
            <VStack align="start" spacing={4}>
              <Flex wrap="wrap" gap={4} width="100%">
                <Input
                  flex="2"
                  placeholder="Patient Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}

                />
                <Input
                  flex="1"
                  placeholder="Script Number"
                  value={scriptNumber}
                  inputMode="numeric"
                  onChange={(e) => setScriptNumber(e.target.value)}
                />

                <Button colorScheme="green" onClick={handleCompleteOrder} boxShadow="sm" >
                  Update
                </Button>
              </Flex>

              <Flex gap={4} width="100%">
                <Select
                  flex="1"
                  placeholder="Select Order Status"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  sx={{ option: { backgroundColor: "gray.800", color: "white" } }}
                >
                  <option value="Order placed">Order placed</option>
                  <option value="Order cancelled">Cancelled</option>
                  <option value="Token Downloaded">Downloaded</option>
                  <option value="Comments Added">Comments Added</option>
                  <option value="Please call Wardles about this order – 0800 050 1055">Please call Wardles</option>
                  <option value="Item out of stock, do you want to place on back order?">Item OOS</option>
                </Select>

                <InputGroup flex='1'>

                  <Input
                    ref={inputRef}
                    type="date"
                    onChange={(e) => setOrderDate(e.target.value)}
                    flex="1"
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

              </Flex>

              {/* Optional Fields */}
              <Flex gap={4} width="100%" flexWrap="wrap">
                <Textarea
                  flex="1"
                  placeholder="Comment (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  minH="100px"
                />
                <Textarea
                  flex="1"
                  placeholder="Out of stock item (optional)"
                  value={oosItem}
                  onChange={(e) => setOosItem(e.target.value)}
                  minH="100px"
                />
              </Flex>
            </VStack>
          </Box>
        </Flex>
      </Td>
    </Tr>

  );
};

export default ExpandedRow;
