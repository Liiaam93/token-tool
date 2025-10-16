import { useState, useEffect } from "react";
import {
    Box, Textarea, Button, Table, Thead, Tbody, Tr, Th, Td, Spinner, Progress, Flex, Text
} from "@chakra-ui/react";

const AccountChecker: React.FC = () => {
    const [token, setToken] = useState('');
    const [accountsInput, setAccountsInput] = useState('');
    const [results, setResults] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const storedToken = localStorage.getItem("bearerToken");
        if (storedToken) setToken(storedToken);
    }, []);

    const handleCheck = async () => {
        if (!token || !accountsInput.trim()) return;

        setLoading(true);
        setProgress(0);
        const list = accountsInput
            .split(/\r?\n/)
            .map(a => a.trim())
            .filter(a => a);

        const batchResults: Record<string, boolean> = {};
        let completed = 0;

        for (const acc of list) {
            const url = `https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/user?pageSize=10&searchText=${encodeURIComponent(acc)}&active=true`;
            try {
                const res = await fetch(url, { headers: { Authorization: `${token}` } });
                const data = await res.json();
                console.log("Response for", acc, data); // 👈 see what the API actually sends back

                // Try to auto-handle common structures
                let items: any[] = [];

                if (Array.isArray(data)) items = data;
                else if (Array.isArray(data.items)) items = data.items;
                else if (data.body) {
                    try {
                        const bodyParsed = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
                        if (Array.isArray(bodyParsed.items)) items = bodyParsed.items;
                        else if (Array.isArray(bodyParsed)) items = bodyParsed;
                    } catch (e) {
                        console.log("Failed to parse body", e);
                    }
                }

                batchResults[acc] = items.length > 0;
            } catch (err) {
                console.error(`Error checking account ${acc}:`, err);
                batchResults[acc] = false;
            }

            completed++;
            setProgress(Math.round((completed / list.length) * 100));
        }


        setResults(batchResults);
        setLoading(false);
    };

    const copyResults = () => {
        const text = Object.entries(results)
            .map(([acc, registered]) => `${acc}\t${registered ? "Yes" : "No"}`)
            .join("\n");
        navigator.clipboard.writeText(text);
    };


    return (
        <Box p={6} color="white" backgroundColor={'gray.800'}>
            <Text fontSize="xl" mb={2}>Check Registered Accounts</Text>
            <Textarea
                color={'white'}
                placeholder="Paste account numbers here (one per line)"
                value={accountsInput}
                onChange={e => setAccountsInput(e.target.value)}
                rows={8}
                bg="gray.700"
            />

            <Button mt={4} colorScheme="green" onClick={handleCheck}>
                Check Accounts
            </Button>

            {loading && (
                <Flex mt={6} direction="column" align="center">
                    <Spinner size="xl" color="green.400" />
                    <Progress value={progress} w="50%" mt={3} colorScheme="green" />
                    <Text mt={2}>{progress}%</Text>
                </Flex>
            )}

            {!loading && Object.keys(results).length > 0 && (
                <Table variant="simple" mt={6} w="50%" m="auto">
                    <Thead>
                        <Tr>
                            <Th color="yellow.300">Account</Th>
                            <Th color="yellow.300">Registered</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {Object.entries(results).map(([acc, registered]) => (
                            <Tr key={acc}>
                                <Td>{acc}</Td>
                                <Td color={registered ? "green.300" : "red.300"}>
                                    {registered ? "✅ Yes" : "❌ No"}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
            <Button mt={4} colorScheme="blue" onClick={copyResults} alignSelf={'center'}>
                Copy Results
            </Button>

        </Box>
    );
};

export default AccountChecker;
