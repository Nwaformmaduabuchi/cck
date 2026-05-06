"use server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL          

export const createStock = async function (formdata: FormData) {
  const payload = formdata.get("payload");

  const res = await fetch(`${API_BASE_URL}/stock/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: typeof payload === "string" ? payload : "{}",
  });

  return res.json();
};
