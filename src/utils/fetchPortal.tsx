import axios from "axios";

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
      console.error(`Error fetching page ${page}:`, error);
      return null;
    }
  };

  const allResults = [];

  // Loop through pages 1 to 3 and fetch them sequentially
  for (let page = 1; page <= 1; page++) {
    const pageData = await fetchPage(page);
    if (pageData) {
      allResults.push(pageData);
    }
  }
  const uniqueResults = Array.from(
    new Map(allResults.map(item => [item.id, item])).values()
  );
  return uniqueResults;  // Return all fetched data
};
