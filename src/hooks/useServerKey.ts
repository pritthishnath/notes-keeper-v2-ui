import { useEffect, useState } from "react";
import { AuthAPI } from "../utils/api-helper";
import { useAuth } from "./useAuth";

export function useServerKey() {
  const [key, setKey] = useState("");
  const { isAuth } = useAuth();

  useEffect(() => {
    getServerKey();
  }, [isAuth]);

  async function getServerKey() {
    const res = await AuthAPI.serverKey();

    setKey(res.data.serverKey);
  }

  return [key, setKey] as [string, typeof setKey];
}
