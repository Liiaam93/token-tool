export const updateOrderStatus = async (
  token: string,
  email: string,
  id: string,
  status: string,
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

  const updatePayload = async (updateKey: string, updateValue: string) => {
    const payload = {
      email: email,
      id: id,
      modifiedBy: modifiedBy,
      updateKey: updateKey,
      updateValue: updateValue,
    };

    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${updateKey}`);
    }

    return response.json();
  };

  try {
    // Send request twice as mentioned
    await updatePayload("record_status", status);
    await updatePayload("record_status", status);

    console.log("Order status updated successfully");
  } catch (error) {
    console.error("Error updating order status:", error);
  }
};