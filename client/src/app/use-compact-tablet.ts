import { useEffect, useState } from "react";

const compactTabletMaxWidth = 1100;

function readIsCompactTablet(): boolean {
  return window.innerWidth <= compactTabletMaxWidth;
}

export function useCompactTablet(): boolean {
  const [isCompactTablet, setIsCompactTablet] = useState<boolean>(readIsCompactTablet);

  useEffect(() => {
    function handleResize() {
      setIsCompactTablet(readIsCompactTablet());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isCompactTablet;
}
