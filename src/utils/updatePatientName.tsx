export const updatePatientName = async (
  token: string,
  email: string,
  id: string,
  patientName: string,
  modifiedBy: string,
  accountNumber: string,
  pharmacyName: string
) => {
  const url =
    "https://vfgar9uinc.execute-api.eu-west-2.amazonaws.com/prod/order";
  const closeUrl = `${url}/close`;

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

  const updatePayload = async (
    updateKey: string,
    updateValue: string,
    close = false,
    retryCount = 3
  ) => {
    const payload = {
      email: email,
      id: id,
      modifiedBy: modifiedBy,
      updateKey: updateKey,
      updateValue: updateValue,
    };

    const endpoint = close ? closeUrl : url;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(
          `Attempt ${attempt}: Updating ${updateKey} to ${updateValue}`
        );

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error(
            `Attempt ${attempt} failed to update ${updateKey}`,
            responseData
          );
          throw new Error(`Failed to update ${updateKey}`);
        }

        console.log(
          `${updateKey} updated successfully on attempt ${attempt}`,
          responseData
        );
        return responseData;
      } catch (error) {
        if (attempt < retryCount) {
          console.warn(`Retrying update for ${updateKey}...`);
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait before retrying
        } else {
          throw error; // Rethrow the error after max retries
        }
      }
    }
  };

  try {
    // Introduce a delay before starting the update process
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mark order as open (send twice as observed from the source site)
    await updatePayload("order_open", "open");
    await updatePayload("order_open", "open");

    // Update patient name
    await updatePayload("patient_name", patientName);

    // Delay to allow the backend to process before updating search ID
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Update order search ID
    const orderSearchId = `${accountNumber}-${pharmacyName}-${patientName.toLowerCase()}`;
    await updatePayload("order_search_id", orderSearchId);

    // Mark order as closed using the close endpoint
    await updatePayload("order_open", "close", true);

    console.log("Patient name and order updated successfully");
  } catch (error) {
    console.error("Error updating order:", error);
  }
};
