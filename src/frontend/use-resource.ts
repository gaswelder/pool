import { useEffect, useState } from "react";

export const useResource = <T>(f: () => Promise<T>, deps: unknown[]) => {
  const [data, setData] = useState(null as null | T);
  const load = async () => {
    setData(await f());
  };
  useEffect(() => {
    load();
  }, deps);
  return { data, reload: load };
};
