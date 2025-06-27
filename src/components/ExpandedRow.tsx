import React, { useState } from "react";
import {
  Tr, Td, Flex, VStack, Text, Input,
  Button, Select, Box, Link,
  Textarea
} from "@chakra-ui/react";
import { PortalType } from "../types/PortalType";

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

  const handleCompleteOrder = async () => {
    const overrides: OrderOverrides = {
      patientName,
      scriptNumber,
      modifiedBy: email,
      accountNumber: data.pharmacy_account_number,
      pharmacyName: data.pharmacy_name,
      ...(orderStatus ? { status: orderStatus } : {}),
      comment
    };
    await updateOrder(data, overrides);
  };

  return (
    <Tr>
      <Td colSpan={7} bg="gray.700">
        <Flex align="start" wrap="wrap" p={4}>
          {/* Info Box */}
          <VStack
            color="white"
            width="20%"
            align="start"
            spacing={3}
            mr={4}
          >
            <Box border="1px solid white" borderRadius="md" p={3} w="100%" bg="gray.600">
              {data.pharmacy_name !== "n/a" && (
                <Text fontStyle="italic" fontWeight="semibold">
                  {data.pharmacy_name}
                </Text>
              )}
              <Text mt={2}>
                <Link
                  href={`mailto:${data.email}`}
                  color="blue.300"
                  textDecoration="underline"
                  isExternal
                >
                  {data.email}
                </Link>
              </Text>
              <Text mt={4} whiteSpace={'normal'}>{data.prescriptionExemptions}</Text>
            </Box>

            {data.staff_comment && (
              <Text color="yellow.300">Staff comment:</Text>
            )}
            {data.staff_comment && (
              <Text color="red.300" fontStyle="italic" whiteSpace={'normal'}>{data.staff_comment}</Text>
            )}

            {data.out_of_stock_item && (
              <Text color="red.200">
                OOS: <Text as="span" fontWeight="semibold" whiteSpace={'normal'}>{data.out_of_stock_item}</Text>
              </Text>
            )}

            {data.customer_comment && (
              <>
                <Text color="yellow.300">Customer comment:</Text>
                <Text color="red.300" fontStyle="italic" whiteSpace={'normal'}>
                  Customer reply: {data.customer_comment}
                </Text>
              </>
            )}

            <Text color="yellow.200">{data.customer_record_status}</Text>

            {data.order_items?.length > 0 && (
              <Box p={2} border="1px solid white" borderRadius="md" w="100%" bg="gray.600">
                <Text fontWeight="bold" mb={2}>Items:</Text>
                {data.order_items.map((o, idx) => (
                  <Text key={idx} whiteSpace={'normal'} marginTop={2}>
                    {o.productName} x {o.quantity}
                    {o.customisation ? ` - ${o.customisation}` : ''}
                  </Text>
                ))}
              </Box>
            )}
          </VStack>

          {/* Editable Fields */}
          <VStack align="start" spacing={2} flex="1" color="white" minW="50%">
            <Flex wrap="wrap" gap={4} width="100%">
              <Input
                flex="1"
                minW="180px"
                placeholder="Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
              <Input
                flex="0 1 300px"
                placeholder="Script Number"
                value={scriptNumber}
                inputMode="numeric"
                onChange={(e) => setScriptNumber(e.target.value)}
              />
              <Select
                flex="1"
                minW="220px"
                placeholder="Select Order Status"
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                sx={{
                  option: {
                    backgroundColor: "gray.800",
                    color: "white",
                  },
                }}
              >
                <option value="Order placed">Order placed</option>
                <option value="Order cancelled">Cancelled</option>
                <option value="Token Downloaded">Downloaded</option>
                <option value="Please call Wardles about this order – 0800 050 1055">
                  Please call Wardles
                </option>
              </Select>
              <Button colorScheme="green" onClick={handleCompleteOrder}>
                Update
              </Button>
            </Flex>

            <Textarea
              width="530px"
              height='165px'
              placeholder="Comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />


          </VStack>
        </Flex>
      </Td>
    </Tr>
  );
};

export default ExpandedRow;
