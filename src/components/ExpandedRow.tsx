import React, { useState } from "react";
import { Tr, Td, Flex, VStack, Text, Input, Button, Select } from "@chakra-ui/react";
import { PortalType } from "../types/PortalType";

interface ExpandedRowProps {
  data: PortalType;
  email: string;
  updateOrder: (data: any, overrides: any) => Promise<void>

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
  const [comment, setComment] = useState<string>('')

  const handleCompleteOrder = async () => {
    const overrides: OrderOverrides = {
      patientName,
      scriptNumber,
      modifiedBy: email,
      accountNumber: data.pharmacy_account_number,
      pharmacyName: data.pharmacy_name,
      ...(orderStatus ? { status: orderStatus } : {}),
      comment
    }

    await updateOrder(data, overrides);
  };


  return (
    <Tr>
      <Td colSpan={7} bg="gray.700">
        <Flex>
          <VStack   color={"white"}
                m="2"
                maxW="15%" // Adjust width as needed
                align="start" // Align items to the left
                spacing={1} >
            {data.pharmacy_name !== "n/a" && <Text>{data.pharmacy_name}</Text>}
            <Text>{data.email}</Text>
            <Text color="yellow" whiteSpace="normal" textAlign="left" >{data.staff_comment && 'Staff comment: '}</Text>
            <Text color="red" whiteSpace="normal" textAlign="left" >{data.staff_comment}</Text>
            <Text color="yellow" whiteSpace="normal" textAlign="left" >{data.customer_comment && 'Customner comment: '}</Text> 
            <Text color="red" whiteSpace="normal" textAlign="left">{data.customer_comment && 'Customer reply: '}{data.customer_comment}</Text>
            <Text color="yellow">{data.customer_record_status}</Text>
          </VStack>
          <Input
            m="2"
            width="20%"
            color={"white"}
            placeholder="Patient Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <Input
            m="2"
            w="10%"
            color={"white"}
            placeholder="Script Number"
            value={scriptNumber}
            inputMode="numeric"
            onChange={(e) => setScriptNumber(e.target.value)}
          />
          <Select
            m="2"
            w="15%"
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
            <option value="Order cancelled">Cancelled</option>
            <option value="Token Downloaded">Downloaded</option>
            <option value="Please call Wardles about this order – 0800 050 1055">Please call Wardles</option>
          </Select>
          <Input
            m='2'
            w="30%"
            color={"white"}
            placeholder="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button colorScheme="green" m="2" onClick={handleCompleteOrder}>
            Update
          </Button>
        </Flex>


      </Td>
    </Tr>
  );
};

export default ExpandedRow;
