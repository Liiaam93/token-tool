import axios from "axios";

export const fetchPortal = (token: string, statusFilter: string) => {
  // Start with the common query parameters
  const queryParams: Record<string, string> = {
    pageSize: "100",
    page: "1",
  };

  // Add the recordStatus parameter only if it's not an empty string
  if (statusFilter !== '') {
    queryParams.recordStatus = statusFilter;
  }

  // Construct the URL with the query parameters
  const url = `https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/order?${new URLSearchParams(queryParams).toString()}`;

  // Make the GET request
  return axios.get(url, {
    headers: {
      Authorization: token,
    },
  });
};
