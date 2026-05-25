import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth.context";

export default function RequireCustomerAuth() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, recoverSession } = useAuth();
  const [isRecovering, setIsRecovering] = useState(false);
  const [hasRetriedPaymentResult, setHasRetriedPaymentResult] = useState(false);
  const isPaymentResultRoute = location.pathname === "/checkout/payment/result";

  useEffect(() => {
    let cancelled = false;

    if (isBootstrapping || isAuthenticated || !isPaymentResultRoute || hasRetriedPaymentResult) {
      return () => {
        cancelled = true;
      };
    }

    setIsRecovering(true);
    setHasRetriedPaymentResult(true);

    void recoverSession().finally(() => {
      if (!cancelled) {
        setIsRecovering(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasRetriedPaymentResult, isAuthenticated, isBootstrapping, isPaymentResultRoute, recoverSession]);

  if (isBootstrapping || isRecovering) {
    return (
      <div className="px-4 py-20 text-center text-sm text-black/45">
        {isPaymentResultRoute ? "Restoring your payment session..." : "Loading your account..."}
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/sign-in?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <Outlet />;
}
