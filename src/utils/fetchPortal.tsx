
import axios from "axios";

interface LastEvaluatedKey {
  created_date?: {N: number} 
  order_id: {S: string}
  record_status: {S: string}
  email: {S: string}
  modified_time?: {S: string}
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
  };

  const status = statusMap[statusFilter] || "";
  const urlParams = new URLSearchParams({
    pageSize: "200",  // Page size remains 200
  });

  if (status) {
    urlParams.append("recordStatus", status);
  }
  if (searchQuery) {
    urlParams.append("searchText", searchQuery);
  }
  if (startDate) {
    urlParams.append("orderDate", startDate); // Append startDate if present
  }

  // Helper function to fetch data for a given page
  const fetchPage = async (page: number) => {
    const url = `https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/order?${urlParams.toString()}&page=${page}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching page ${page}:, error`);
      return null;
    }
  };

  const allResults = [];

  // Fetch the first page
  const firstPageData = await fetchPage(1);
  if (firstPageData) {
    allResults.push(firstPageData);
  
    // Check if there is a lastEvaluatedKey
    const lastEvaluatedKey: LastEvaluatedKey = firstPageData.lastEvaluatedKey;
    if (lastEvaluatedKey) {
      // Convert lastEvaluatedKey to query params for page 2
      const lastEvaluatedParams = new URLSearchParams();
      Object.entries(lastEvaluatedKey).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          if (key === "modified_time" && "S" in value && value.S !== undefined) {
            lastEvaluatedParams.append(`lastEvaluatedKey.${key}.S`, value.S);
          } else if (key === "created_date" && "N" in value && value.N !== undefined) {
            lastEvaluatedParams.append(`lastEvaluatedKey.${key}.N`, value.N as string);
          } else if ("S" in value) {
            lastEvaluatedParams.append(`lastEvaluatedKey.${key}.S`, value.S.replace(' ', '%20'));

          }
        }
      });
      
      
      
      
  
      // Fetch the second page using lastEvaluatedKey
      const secondPageUrl = `https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/order?pageSize=200&${lastEvaluatedParams.toString().replace('+', '%20')}`;
      try {
        const secondPageResponse = await axios.get(secondPageUrl, {
          headers: {
            Authorization: token,
          },
        });
  
        if (secondPageResponse.data) {
          allResults.push(secondPageResponse.data);
        }
      } catch (error) {
        console.error("Error fetching second page:", error);
      }
    }
  }
  
  const flattenedResults = allResults.flatMap(pageData => pageData.items || []);


  const data = [{items: flattenedResults}]
  console.log(flattenedResults)
  return data;
  
};