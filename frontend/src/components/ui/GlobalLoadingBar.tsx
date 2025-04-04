import Lottie from "lottie-react";
import { useGlobalLoading } from "@/app/contexts/LoadingContext";
import loadingAnimation from "@/assets/loading.json";

const GlobalLoadingOverlay = () => {
  const { loading } = useGlobalLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/60 flex items-center justify-center">
      <Lottie animationData={loadingAnimation} loop className="w-32 h-32" />
    </div>
  );
};

export default GlobalLoadingOverlay;
