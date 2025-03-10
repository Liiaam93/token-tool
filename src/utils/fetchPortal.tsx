import axios from "axios";

interface LastEvaluatedKey {
  id: { S: string };
  email: { S: string };
  record_status: { S: string };
  created_date?: { N: number };
  modified_time?: { S: string };
}

export const fetchPortal = async (
  token: string,
  statusFilter: string,
  searchQuery: string,
  startDate?: string
) => {
  const statusMap: Record<string, string> = {
    OOS: "Item out of stock, do you want to place on back order?",
    Invalid:
      "Barcode incorrect - please resend in the comments box below or request to cancel the order",
    Submitted: "request submitted",
    Ordered: "Order placed",
    RTS: "Please return this token to the Spine",
    Downloaded: "Token Downloaded",
    Call: "Please call Wardles about this order – 0800 050 1055",
    Cancelled: "Order cancelled",
    Comments: "Comments Added",
    Stop: "Account is on stop please call our accounts department on 0161 259 9282",
  };

  const status = statusMap[statusFilter] || "";
  const urlParams = new URLSearchParams({
    pageSize: "200",
  });

  if (status) {
    urlParams.append("recordStatus", status);
  }
  if (searchQuery) {
    urlParams.append("searchText", searchQuery);
  }
  if (startDate) {
    urlParams.append("orderDate", startDate);
  }

  const fetchPage = async (page: number, lastEvaluatedKey?: LastEvaluatedKey) => {
    const params = new URLSearchParams(urlParams.toString());
    if (lastEvaluatedKey) {
      const lastEvaluatedParams = new URLSearchParams();
      Object.entries(lastEvaluatedKey).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          if ("N" in value) {
            lastEvaluatedParams.append(`lastEvaluatedKey.${key}.N`, value.N as string);
          } else if ("S" in value) {
            lastEvaluatedParams.append(`lastEvaluatedKey.${key}.S`, value.S);
          }
        }
      });
      
      // Manually append each key-value pair from lastEvaluatedParams
      lastEvaluatedParams.forEach((value, key) => {
        params.append(key, value);
      });
    }

    const url = `https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/order?${params.toString().replace('+', '%20')}`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      return null;
    }
  };

  const allResults = [];

  // Fetch first page
  const firstPageData = await fetchPage(1);
  if (firstPageData) {
    allResults.push(firstPageData);

    let lastEvaluatedKey: LastEvaluatedKey = firstPageData.lastEvaluatedKey;

    // Fetch second page if lastEvaluatedKey exists
    if (lastEvaluatedKey) {
      const secondPageData = await fetchPage(2, lastEvaluatedKey);
      if (secondPageData) {
        allResults.push(secondPageData);

        lastEvaluatedKey = secondPageData.lastEvaluatedKey;

        // Fetch third page if lastEvaluatedKey exists
        if (lastEvaluatedKey) {
          const thirdPageData = await fetchPage(3, lastEvaluatedKey);
          if (thirdPageData) {
            allResults.push(thirdPageData);
          }
        }
      }
    }
  }

  const flattenedResults = allResults.flatMap((pageData) => pageData.items || []);

  const data = [{ items: flattenedResults }];
  console.log(flattenedResults);
  return data;
};
