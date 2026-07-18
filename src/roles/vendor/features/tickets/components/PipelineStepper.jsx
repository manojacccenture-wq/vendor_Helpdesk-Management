import React from 'react';

export const PipelineStepper = ({ currentStep = 1, totalSteps = 4, status }) => {
  const dots = [];
  
  // Custom active color based on status if needed, otherwise default green/teal
  const activeColor = status === 'On Hold' ? 'bg-[#14B8A6]' : 
                     status === 'Raised' ? 'bg-[#F59E0B]' : 'bg-[#0F766E]';

  for (let i = 1; i <= totalSteps; i++) {
    const isActive = i <= currentStep;
    
    dots.push(
      <React.Fragment key={i}>
        <div 
          className={`w-2 h-2 rounded-full ${isActive ? activeColor : 'bg-[#E2E8F0]'}`} 
        />
        {i < totalSteps && (
          <div 
            className={`w-4 h-[2px] ${i < currentStep ? activeColor : 'bg-[#E2E8F0]'}`} 
          />
        )}
      </React.Fragment>
    );
  }

  return (
    <div className="flex items-center gap-[2px]">
      {dots}
    </div>
  );
};
