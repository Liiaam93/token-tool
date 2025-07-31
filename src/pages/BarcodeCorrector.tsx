import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Heading,
  Input,
  List,
  ListItem,
  Text,
  useToast,
} from '@chakra-ui/react';

const typoMap: { [key: string]: string[] } = {
  '0': ['O'],
  '1': ['L', 'I'],
  '2': ['Z'],
  '5': ['S'],
  '6': ['G'],
  '8': ['B'],
  'B': ['8'],
  'O': ['0'],
  'I': ['1', 'L'],
  'L': ['1', 'I'],
  'S': ['5'],
  'Z': ['2'],
  'G': ['6'],
  'A': ['4'],
  '4': ['A'],
  '7': ['T'],
  'T': ['7'],
};

function BarcodeCorrector() {
  const [input, setInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const toast = useToast();

  // Helper: parse barcode sections
  // Example input: "ABC-A12345-XYZ"
  // sections = ["ABC", "A12345", "XYZ"]
  function parseBarcode(barcode: string): string[] {
    return barcode.split('-');
  }

  function generateBarcodes(inputBarcode: string): string[] {
    const results = new Set<string>();
    const sections = parseBarcode(inputBarcode);

    if (sections.length !== 3) {
      // If barcode format unexpected, just try whole string for safety
      // (Or could return empty array)
      return [];
    }

    const [section1, section2, section3] = sections;

    // Sanity check: section2 is letter + 5 digits
    if (!/^[A-Z]\d{5}$/.test(section2)) {
      // Format not as expected, return empty suggestions
      return [];
    }

    // We will generate corrections only on section1 and section3

    // Helper to generate corrected strings for a given section
    function generateForSection(section: string) {
      const corrected = new Set<string>();

      for (let i = 0; i < section.length; i++) {
        const char = section[i];
        const replacements = typoMap[char as keyof typeof typoMap];
        if (replacements) {
          for (const replacement of replacements) {
            const newSection =
              section.slice(0, i) + replacement + section.slice(i + 1);
            corrected.add(newSection);
          }
        }
      }
      return corrected;
    }

    const correctedSection1 = generateForSection(section1);
    const correctedSection3 = generateForSection(section3);

    // Combine corrected sections with the unchanged middle section
    for (const c1 of correctedSection1) {
      results.add(`${c1}-${section2}-${section3}`);
    }
    for (const c3 of correctedSection3) {
      results.add(`${section1}-${section2}-${c3}`);
    }

    return Array.from(results);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCopied(null); // reset copied highlight on new search
    setSuggestions(generateBarcodes(input));
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      toast({
        title: 'Copied!',
        description: `Barcode "${code}" copied to clipboard.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    });
  };

  return (
    <Box bg="gray.800" minHeight="100vh" >
    <Box  p={2}
        maxW="90vw"
        m="auto"
        border="solid white 2px"
        borderRadius="5"
        color={"white"}>
      <Heading mb={4} textAlign="center" size="md">
        Barcode Fixer
      </Heading>

<Box display="flex" justifyContent="center" mt={4}>
  <form onSubmit={handleSubmit}>
    <FormControl display="flex" alignItems="center" gap={2}>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value.toUpperCase())}
        placeholder="Enter barcode e.g. ABCDEF-A12345-XYZ123"
        autoFocus
        width="60vw"      // 60% of viewport width
        maxW="600px"      // optional max width for big screens
        flexShrink={0}
      />
      <Button type="submit" colorScheme="blue" flexShrink={0}>
        Fix
      </Button>
    </FormControl>
  </form>
</Box>




      {suggestions.length > 0 && (
        <Box mt={6}>
          <Text mb={2} fontWeight="semibold">
            Possible corrected barcodes:
          </Text>
          <List spacing={2}>
          {[...suggestions].reverse().map((code) => (
  <ListItem
    key={code}
    cursor="pointer"
    p={2}
    borderWidth={1}
    borderRadius="md"
    bg={copied === code ? 'blue.100' : undefined}
    _hover={{ bg: 'blue.50' }}
    onClick={() => handleCopy(code)}
    userSelect="none"
  >
    {code}
  </ListItem>
))}

          </List>
          <Text mt={2} fontSize="sm" color="gray.500">
            Click a barcode to copy it.
          </Text>
        </Box>
      )}
    </Box>
    </Box>
  );
}

export default BarcodeCorrector;
