import React, { useState } from "react";
import { Tr, Td, Flex, VStack, Text, Input, Button } from "@chakra-ui/react";
import { PortalType } from "../types/PortalType";

interface ExpandedRowProps {
  data: PortalType;
  updatePatientName: any;
  email: string;
}

const ExpandedRow: React.FC<ExpandedRowProps> = ({
  data,
  updatePatientName,
  email,
}) => {
  const [patientName, setPatientName] = useState(data.patient_name);

  return (
    <Tr>
      <Td colSpan={6} bg="gray.700">
        <Flex>
          <VStack color={"white"} m="2">
            <Text>{data.pharmacy_name}</Text>
            <Text>{data.created_date_string}</Text>
            <Text>{data.email}</Text>
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
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <Button
            colorScheme="green"
            m="2"
            onClick={() =>
              updatePatientName(
                data.email,
                data.id,
                "print",
                email,
                data.pharmacy_account_number,
                data.pharmacy_name
              )
            }
          >
            Ordered
          </Button>
        </Flex>
      </Td>
    </Tr>
  );
};

export default ExpandedRow;
