import axios from "axios";

export const fetchPortal = (token: string, statusFilter: string) => {
  return axios.get(
    `
  https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/order?${new URLSearchParams(
    {
      pageSize: "200",
      page: "1",
    }
  ).toString()}&recordStatus=${statusFilter}`,
    {
      headers: {
        Authorization: token,
      },
    }
  );
};
