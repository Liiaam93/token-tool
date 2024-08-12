export const updatePatientName = async (
  token: string,
  email: string,
  id: string,
  patientName: string,
  orderSearchId: string,
  modifiedBy: string
) => {
  const url =
    "https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/order";

  const headers = {
    "Content-Type": "application/json",
    Authorization: token,
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9",
    Origin: "https://fp.bestwaymedhub.co.uk",
    Referer: "https://fp.bestwaymedhub.co.uk/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Sec-Ch-Ua":
      '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
  };

  const payload1 = {
    email: email,
    id: id,
    modifiedBy: modifiedBy,
    updateKey: "patient_name",
    updateValue: patientName,
  };

  const payload2 = {
    email: email,
    id: id,
    modifiedBy: modifiedBy,
    updateKey: "order_search_id",
    updateValue: orderSearchId + patientName,
  };

  try {
    // First PUT request
    const response1 = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(payload1),
    });

    if (!response1.ok) {
      throw new Error("Failed to update patient_name");
    }

    const data1 = await response1.json();
    console.log("Response 1:", data1);

    // Second PUT request
    const response2 = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(payload2),
    });

    if (!response2.ok) {
      throw new Error("Failed to update order_search_id");
    }

    const data2 = await response2.json();
    console.log("Response 2:", data2);
  } catch (error) {
    console.error("Error updating order:", error);
  }
};
