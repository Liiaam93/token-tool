import axios from "axios";

interface LastEvaluatedKey {
  id: { S: string };
  email: { S: string };
  record_status: { S: string };
  created_date?: { N: number };
  modified_time?: { S: string };
}

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

export const fetchPortal = async (
  token: string,
  statusFilter: string,
  searchQuery: string,
  startDate?: string,
  fastMode?: boolean
) => {
  const status = statusMap[statusFilter] || "";
  const baseParams = new URLSearchParams({ pageSize: "200" });

  if (status) baseParams.append("recordStatus", status);
  if (searchQuery) baseParams.append("searchText", searchQuery);
  if (startDate) baseParams.append("orderDate", startDate);

  const fetchPage = async (lastEvaluatedKey?: LastEvaluatedKey) => {
    const params = new URLSearchParams(baseParams.toString());

    if (lastEvaluatedKey) {
      for (const [key, value] of Object.entries(lastEvaluatedKey)) {
        if ("N" in value) {
          params.append(`lastEvaluatedKey.${key}.N`, value.N as string);
        } else if ("S" in value) {
          params.append(`lastEvaluatedKey.${key}.S`, value.S);
        }
      }
    }

    const url = `https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/order?${params.toString().replace(
      /\+/g,
      "%20"
    )}`;

    try {
      const response = await axios.get(url, {
        headers: { Authorization: token },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  const allItems = [];
  let lastEvaluatedKey: LastEvaluatedKey | undefined;
  const maxPages = fastMode ? 2 : 8; 


  for (let page = 0; page < maxPages; page++) {
    const data = await fetchPage(lastEvaluatedKey);
    if (!data) break;

    allItems.push(...(data.items || []));

    if (!data.lastEvaluatedKey) break;
    lastEvaluatedKey = data.lastEvaluatedKey;
  }

  return [{ items: allItems }];
};
