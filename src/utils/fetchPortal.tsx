import axios from "axios";

export const fetchPortal = (
  token: string,
  statusFilter: string,
  searchQuery: string
) => {
  let status = "";
  if (statusFilter === "OOS") {
    status = "Item out of stock, do you want to place on back order?";
  } else if (statusFilter === "Invalid") {
    status =
      "Barcode incorrect - please resend in the comments box below or request to cancel the order";
  } else if (statusFilter === "Submitted") {
    status = "request submitted";
  } else if (statusFilter === "Ordered") {
    status = "Order placed";
  } else if (statusFilter === "RTS") {
    status = "Please return this token to the Spine";
  } else if (statusFilter === "Call") {
    status = "Please call Wardles about this order – 0800 050 1055";
  } else if (statusFilter === "Cancelled") {
    status = "Order cancelled";
  }
  let url = `
  https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/order?${new URLSearchParams(
    {
      pageSize: "200",
      page: "1",
    }
  ).toString()}`;

  if (statusFilter) {
    url += `&recordStatus=${status}`;
  }
  if (searchQuery) {
    url += `&searchText=${searchQuery}`;
  }

  return axios.get(url, {
    headers: {
      Authorization: token,
    },
  });
};
