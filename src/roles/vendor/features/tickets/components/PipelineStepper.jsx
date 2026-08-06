import React from 'react';
import { cn } from '../../../../../shared/utils/cn.js';

// Centralized mapping configuration.
// Only real backend statuses go here.
// As the API exposes more statuses (e.g. "Escalated", "In Progress"), 
// add them to this map to automatically advance the pipeline.
const STATUS_TO_STEP = {
  'Open': 1,
};

export const PipelineStepper = ({ status, showLabels = false, className }) => {
  // Derive the current step from the real backend status, defaulting to 1 for unknown statuses temporarily
  const currentStep = STATUS_TO_STEP[status] || 1;

  // Do not fake future pipeline stages. Only return the label for the active known stage.
  const getLabelForStep = (stepNumber) => {
    if (stepNumber === currentStep) return status;
    return '';
  };

  return (
    <div className={cn("flex flex-col", showLabels ? "pb-6" : "", className)}>
      <div className={cn("flex items-center", showLabels ? "w-full" : "gap-[2px]")}>
        {[1, 2, 3, 4].map((stepNumber, index) => {
          const isLast = stepNumber === 4;
          
          let dotColor = 'bg-default';
          if (currentStep === 4) {
            dotColor = 'bg-success';
          } else if (stepNumber < currentStep) {
            dotColor = 'bg-success';
          } else if (stepNumber === currentStep) {
            dotColor = 'bg-warning';
          }

          let lineColor = 'bg-default';
          if (currentStep === 4) {
            lineColor = 'bg-success';
          } else if (stepNumber < currentStep) {
            lineColor = 'bg-success';
          }

          const label = getLabelForStep(stepNumber);

          return (
            <React.Fragment key={stepNumber}>
              {showLabels ? (
                <div className="relative flex flex-col items-center justify-center">
                  <div className={cn("w-[10px] h-[10px] rounded-full flex-shrink-0 z-10", dotColor)} />
                  {label && (
                    <span className={cn(
                      "badgeClassName whitespace-nowrap absolute top-4",
                      stepNumber === currentStep ? "text-warning" : 
                      (currentStep === 4 || stepNumber < currentStep) ? "text-success" : "text-secondary"
                    )}>
                      {label}
                    </span>
                  )}
                </div>
              ) : (
                <div 
                  className={cn("w-2 h-2 rounded-full flex-shrink-0", dotColor)} 
                  title={label || undefined}
                />
              )}
              
              {!isLast && (
                <div 
                  className={cn("h-[2px]", showLabels ? "flex-1 min-w-[24px]" : "w-4 flex-shrink-0", lineColor)} 
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
