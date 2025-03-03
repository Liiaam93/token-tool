import axios from "axios";

export const fetchPortal = (
  token: string,
  statusFilter: string,
  searchQuery: string,
  startDate?: string,
  endDate?: string
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
    pageSize: "300",
    page: "1",
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
  if (endDate) {
    urlParams.append("orderDate", endDate); // Append endDate if present
  }

  const url = `https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/order?${urlParams.toString()}`;

  return axios.get(url, {
    headers: {
      Authorization: token,
    },
  });
};
