import React, { useState } from "react";
import { Tr, Td, Flex, VStack, Text, Input, Button, Select } from "@chakra-ui/react";
import { PortalType } from "../types/PortalType";

interface ExpandedRowProps {
  data: PortalType;
  email: string;
  updatePatientName: (
    email: string,
    id: string,
    patientName: string,
    modifiedBy: string,
    accountNumber: string,
    pharmacyName: string,
    scriptNumber?: string
  ) => Promise<void>;
  updateOrderStatus: (
    email: string,
    id: string,
    status: string,
    patientName: string,
    modifiedBy: string,
    accountNumber: string,
    pharmacyName: string
  ) => Promise<void>;
}

const ExpandedRow: React.FC<ExpandedRowProps> = ({
  data,
  email,
  updatePatientName,
  updateOrderStatus,
}) => {
  const [patientName, setPatientName] = useState(data.patient_name);
  const [scriptNumber, setScriptNumber] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<string>("Order placed");

  const date = new Date(data.created_date * 1000);

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const handleCompleteOrder = async (data: PortalType, email: string) => {
    await updatePatientName(
      data.email,
      data.id,
      patientName,
      email,
      data.pharmacy_account_number,
      data.pharmacy_name,
      scriptNumber
    );

    await updateOrderStatus(
      data.email,
      data.id,
      orderStatus, // Dynamically selected order status
      patientName,
      email,
      data.pharmacy_account_number,
      data.pharmacy_name
    );
  };

  return (
    <Tr>
      <Td colSpan={6} bg="gray.700">
        <Flex>
          <VStack color={"white"} m="2">
            {data.pharmacy_name !== "n/a" && <Text>{data.pharmacy_name}</Text>}
            <Text>{formattedDate}</Text>
            <Text>{formattedTime}</Text>
            <Text>{data.email}</Text>
            <Text>{data.order_type}</Text>
            <Text>{data.record_status}</Text>
            <Text color="red">{data.customer_comment}</Text>
            <Text color="red">{data.customer_record_status}</Text>
          </VStack>
          <Input
            m="2"
            w="40%"
            color={"white"}
            placeholder="Patient Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <Input
            m="2"
            w="20%"
            color={"white"}
            placeholder="Script Number"
            value={scriptNumber}
            inputMode="numeric"
            onChange={(e) => setScriptNumber(e.target.value)}
          />
          <Select
            m="2"
            w="20%"
            color="white"
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
            <option value="Order Cancelled">Cancelled</option>
            <option value="Token Downloaded">Downloaded</option>
          </Select>
          <Button colorScheme="green" m="2" onClick={() => handleCompleteOrder(data, email)}>
            Update Patient Name
          </Button>
        </Flex>
      </Td>
    </Tr>
  );
};

export default ExpandedRow;
