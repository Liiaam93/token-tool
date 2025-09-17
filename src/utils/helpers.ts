export const formatDate = (ts: number) => {
  const d = new Date(ts * 1000);
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return `${date} ${time}`;
};

export const formatModifiedDate = (mod: string) => {
  const d = new Date(mod);
  d.setHours(d.getHours() + 1); // adjust timezone?
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d).replace(",", "");
};

export const sortPortalData = (
  data: any[],
  field: "date" | "account" | "hasMessage" | null,
  direction: "asc" | "desc"
) => {
  const sorted = [...data];
  const cmp: Record<string, (a: any, b: any) => number> = {
    date: (a, b) =>
      direction === "asc"
        ? a.created_date - b.created_date
        : b.created_date - a.created_date,
    account: (a, b) =>
      direction === "asc"
        ? (a.pharmacy_account_number || "").localeCompare(b.pharmacy_account_number || "")
        : (b.pharmacy_account_number || "").localeCompare(a.pharmacy_account_number || ""),
    hasMessage: (a, b) =>
      direction === "asc"
        ? Number(Boolean(b.customer_comment || b.customer_record_status)) -
          Number(Boolean(a.customer_comment || a.customer_record_status))
        : Number(Boolean(a.customer_comment || a.customer_record_status)) -
          Number(Boolean(b.customer_comment || b.customer_record_status)),
  };

  if (field) sorted.sort(cmp[field]);
  return sorted;
};
