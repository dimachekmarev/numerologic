import { useEffect, useState } from "react";
export function useLoad(loader, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    loader()
      .then((data) => {
        if (alive) setState({ loading: false, data, error: "" });
      })
      .catch((error) => {
        if (alive)
          setState({ loading: false, data: null, error: error.message });
      });
    return () => {
      alive = false;
    };
    // Callers pass stable API functions; explicit deps identify load parameters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, revision]);
  return { ...state, reload: () => setRevision((x) => x + 1) };
}
export function stored(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function localDay() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow" }).format(
    new Date(),
  );
}
