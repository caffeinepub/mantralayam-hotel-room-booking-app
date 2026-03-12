import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface RouteTransitionProps {
  children: React.ReactNode;
}

export default function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<
    "fade-in" | "fade-out"
  >("fade-in");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fade-out");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "fade-out") {
      setDisplayLocation(location);
      setTransitionStage("fade-in");
    }
  };

  return (
    <div
      className={`route-transition route-transition-${transitionStage}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
}
