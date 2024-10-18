import axios from "axios";

export const fetchPortal = (token: string) => {
  return axios.get(
    `
  https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/fp/order?${new URLSearchParams(
    {
      pageSize: "100",
      page: "1",
    }
  ).toString()}&recordStatus=return%20to%20nhs%20spine`,
    {
      headers: {
        Authorization: token,
      },
    }
  );
};
