import { useState } from "react";

export default function useLoading() {
  const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //     requestPermission();
  // }, []);

  return { loading, setLoading };
}
