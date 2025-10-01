// ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ensureAuthOnBoot } from "@/api/http";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const location = useLocation(); // 👈
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const rt = localStorage.getItem("refreshToken");
    const at = localStorage.getItem("accessToken");

    if (!rt) {
      setAllowed(false);
      setChecking(false);
      return;
    }
    if (at) {
      setAllowed(true);
      setChecking(false);
    } else {
      (async () => {
        try {
          await ensureAuthOnBoot();
          setAllowed(!!localStorage.getItem("accessToken"));
        } finally {
          setChecking(false);
        }
      })();
    }
  }, []);

  if (checking) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
        Đang kiểm tra phiên đăng nhập…
      </div>
    );
  }
  if (!allowed) {
    // 👇 giữ lại đường dẫn để Login xong quay lại
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
