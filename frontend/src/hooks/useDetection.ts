import { useState, useEffect, useCallback } from 'react';

export type DetectionStep = 1 | 2 | 3 | 4;

export const useDetection = (initialStep: DetectionStep = 1) => {
  const [step, setStep] = useState<DetectionStep>(initialStep);

  // Simulate the detection process when we hit Step 3
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3) {
      timer = setTimeout(() => {
        setStep(4); // Move to results after 3 seconds
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [step]);

  const nextStep = useCallback(() => {
    setStep((prev) => (prev < 4 ? (prev + 1 as DetectionStep) : prev));
  }, []);

  const goToStep = useCallback((targetStep: DetectionStep) => {
    setStep(targetStep);
  }, []);

  const resetDetection = useCallback(() => {
    setStep(1);
  }, []);

  return {
    step,
    nextStep,
    goToStep,
    resetDetection,
  };
};
