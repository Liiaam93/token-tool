interface UpdatePatientNamePayload {
  token: string;
  id: string;
  newName: string;
  email: string;
  modifiedBy: string;
}

interface UpdateOrderSearchIdPayload {
  token: string;
  id: string;
  newOrderSearchId: string;
  email: string;
  modifiedBy: string;
}

export const updatePatientName = async (
  payload: UpdatePatientNamePayload
): Promise<any> => {
  const response = await fetch("/api/prod/fp/order", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: payload.token,
    },
    body: JSON.stringify({
      updateKey: "patient_name",
      updateValue: payload.newName,
      id: payload.id,
      email: payload.email,
      modifiedBy: payload.modifiedBy,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update patient name");
  }

  return response.json();
};

export const updateOrderSearchId = async (
  payload: UpdateOrderSearchIdPayload
): Promise<any> => {
  const response = await fetch("/api/prod/fp/order", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: payload.token,
    },
    body: JSON.stringify({
      updateKey: "order_search_id",
      updateValue: payload.newOrderSearchId,
      id: payload.id,
      email: payload.email,
      modifiedBy: payload.modifiedBy,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update order_search_id");
  }

  return response.json();
};
