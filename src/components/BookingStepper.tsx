import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BookingStepperProps {
    currentStep: number;
    steps: { num: number; label: string }[];
}

export const BookingStepper = ({ currentStep, steps }: BookingStepperProps) => {
    const { t } = useTranslation(['booking']);
    return (
        <div className="w-full px-4 mb-8">
            <div className="flex items-start w-full">
                {steps.map((s, index) => {
                    const isActive = currentStep === s.num;
                    const isCompleted = currentStep > s.num;
                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={s.num}>
                            {/* Step Item */}
                            <div className="flex flex-col items-center relative z-10">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-2 ${isActive
                                        ? 'bg-primary border-primary text-white shadow-lg scale-110'
                                        : isCompleted
                                            ? 'bg-primary border-primary text-white'
                                            : 'bg-white border-muted-foreground/30 text-muted-foreground'
                                        }`}
                                >
                                    {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                                </div>
                                <span
                                    className={`absolute top-10 text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                >
                                    {s.label}
                                </span>
                            </div>

                            {/* Connector */}
                            {!isLast && (
                                <div className="flex-1 flex items-center mx-2 mt-4">
                                    <div className={`h-[1px] w-full relative transition-colors duration-300 ${isCompleted ? 'bg-primary' : 'bg-border'
                                        }`}>
                                        {/* Arrow Head */}
                                        <div className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-1 transition-colors duration-300 ${isCompleted ? 'text-primary' : 'text-border'
                                            }`}>
                                            <ChevronRight className="w-3 h-3" strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
