import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const jsonValue = localStorage.getItem(key);

    if (jsonValue == null) {
      // If value doesn't exist then initialize the value
      if (typeof initialValue === "function") {
        return (initialValue as () => T)();
      } else {
        return initialValue;
      }
    } else {
      // If value exists in local storage then return the value
      return JSON.parse(jsonValue);
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
    if (key === "MODE") {
      window.dispatchEvent(new Event("storage"));
    }
  }, [value, key]);

  return [value, setValue] as [T, typeof setValue];
}
