import { useState, useEffect, useCallback, useRef } from "react";

export type DetectionStep = 1 | 2 | 3 | 4;

interface TelemetryData {
  zoneId: string;
  flowRate: number;
}

// Set to 0 as per instruction: any flowrate > 0 is a leakage
const NOISE_THRESHOLD = 0; 

export const useDetection = (initialStep: DetectionStep = 1) => {
  const [step, setStep] = useState<DetectionStep>(initialStep);
  const [leakingZones, setLeakingZones] = useState<Set<string>>(new Set());
  const monitoringActive = useRef(false);

  // When we enter Step 3, start monitoring
  useEffect(() => {
    if (step === 3) {
      monitoringActive.current = true;
      setLeakingZones(new Set()); // Reset on start
      
      const timer = setTimeout(() => {
        monitoringActive.current = false;
        setStep(4);
      }, 5000); // 5 seconds detection window

      return () => {
        monitoringActive.current = false;
        clearTimeout(timer);
      };
    }
  }, [step]);

  const processTelemetry = useCallback((data: TelemetryData | null) => {
    if (monitoringActive.current && data && data.flowRate > NOISE_THRESHOLD) {
      setLeakingZones((prev) => {
        const idStr = String(data.zoneId);
        if (prev.has(idStr)) return prev;
        const next = new Set(prev);
        next.add(idStr);
        return next;
      });
    }
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => (prev < 4 ? ((prev + 1) as DetectionStep) : prev));
  }, []);

  const goToStep = useCallback((targetStep: DetectionStep) => {
    setStep(targetStep);
  }, []);

  const resetDetection = useCallback(() => {
    setStep(1);
    setLeakingZones(new Set());
    monitoringActive.current = false;
  }, []);

  return {
    step,
    nextStep,
    goToStep,
    resetDetection,
    processTelemetry,
    leakingZones,
  };
};
