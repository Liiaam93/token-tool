import axios from "axios";

export const fetchPortal = (token: string, statusFilter: string) => {
  let url = `
  https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/order?${new URLSearchParams(
    {
      pageSize: "200",
      page: "1",
    }
  ).toString()}`;

  if (statusFilter) {
    url += `&recordStatus=${statusFilter}`;
  }

  return axios.get(url, {
    headers: {
      Authorization: token,
    },
  });
};
