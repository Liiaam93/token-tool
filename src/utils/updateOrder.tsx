type UpdateOrderParams = {
  token: string;
  email: string;
  id: string;
  modifiedBy: string;
  patientName?: string;
  accountNumber?: string;
  pharmacyName?: string;
  scriptNumber?: string;
  status?: string;
  comment?: string;
  orderDate?: string;
};

export const updateOrder = async ({
  token,
  email,
  id,
  modifiedBy,
  patientName,
  accountNumber,
  pharmacyName,
  scriptNumber,
  status,
  comment,
  orderDate
}: UpdateOrderParams) => {
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
      email,
      id,
      modifiedBy,
      updateKey,
      updateValue,
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
    // Handle order open/close status if provided
    await updatePayload("order_open", "close");

    await updatePayload("order_open", "open");

    // Update patient name if provided
    if (patientName) {
      await updatePayload("patient_name", patientName);

      // If accountNumber and pharmacyName are provided, update order_search_id
      if (accountNumber && pharmacyName) {
        await updatePayload(
          "order_search_id",
          `${accountNumber.toLowerCase()}-${pharmacyName.toLowerCase()}-${patientName.toLowerCase()}`
        );
      }

      // Update script number if provided
      if (scriptNumber) {
        await updatePayload("awards_script_number", scriptNumber);
      }

    }

    if (comment) {
      await updatePayload("staff_comment", comment);
    }

    if (orderDate) {
      await updatePayload("order_delivery_date", orderDate)
    }

    // Update status if provided
    if (status) {
      // Send request twice as needed
      await updatePayload("record_status", status);
      await updatePayload("record_status", status);
    }

    await updatePayload("order_open", "close");

    console.log("Order updated successfully");
  } catch (error) {
    console.error("Error updating order:", error);
  }
};
