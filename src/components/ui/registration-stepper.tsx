import * as React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the type for a single step
export interface StepProps {
  step: number; // 1-indexed (e.g., 1, 2, 3, 4)
  title: string;
  description: string;
  content: React.ReactNode;
}

// Define the props for the main component
interface RegistrationStepperProps {
  className?: string;
  steps: StepProps[];
  currentStep: number; // 1-indexed (e.g., 1, 2, 3, 4)
  headerTitle: string;
  headerStatus?: string;
}

const iconVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
};

const contentVariants: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

export const RegistrationStepper = ({
  className,
  steps,
  currentStep,
  headerTitle,
  headerStatus,
}: RegistrationStepperProps) => {
  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <div className="rounded-xl shadow-xl bg-card text-card-foreground">
        <div className="flex flex-col space-y-1.5 px-8 py-6 md:px-12 md:py-8 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold leading-none tracking-tight text-xl">
              {headerTitle}
            </h3>
            {headerStatus && (
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                {headerStatus}
              </span>
            )}
          </div>
        </div>

        <div className="px-8 py-6 md:px-12 md:py-10">
          <ol className="space-y-4">
            {steps.map((step, index) => {
              // currentStep is 1-indexed, step.step is 1-indexed
              const isActive = currentStep === step.step;
              const isCompleted = currentStep > step.step;

              return (
                <li key={step.title} className="overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="relative flex h-10 w-10 items-center justify-center">
                        <AnimatePresence>
                          {isCompleted ? (
                            <motion.div
                              key="check"
                              variants={iconVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="absolute"
                            >
                              <CheckCircle2 className="h-9 w-9 text-green-500" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="circle"
                              initial={{ scale: 1 }}
                              animate={{ scale: isActive ? 1.05 : 1 }}
                              transition={{ duration: 0.2 }}
                              className="absolute"
                            >
                              <Circle
                                className={cn(
                                  "h-9 w-9 text-muted-foreground/30",
                                  isActive && "text-primary border-primary",
                                )}
                              />
                              <span
                                className={cn(
                                  "absolute text-sm font-semibold text-muted-foreground",
                                  "inset-0 flex items-center justify-center",
                                  isActive &&
                                    "text-primary-foreground bg-primary rounded-full h-7 w-7 m-1",
                                )}
                              >
                                {step.step}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {/* Connector line */}
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            "mt-3 h-12 w-0.5",
                            isCompleted ? "bg-green-500" : "bg-border/50",
                          )}
                        />
                      )}
                    </div>

                    <div className="flex-1 mt-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4
                            className={cn(
                              "font-semibold text-lg",
                              isActive && "text-foreground",
                              isCompleted && "text-muted-foreground",
                            )}
                          >
                            {step.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {step.description}
                          </p>
                        </div>
                        {isActive && (
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 text-primary transition-transform rotate-180",
                            )}
                          />
                        )}
                        {isCompleted && (
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 text-muted-foreground/50 transition-transform",
                            )}
                          />
                        )}
                      </div>

                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            key="content"
                            variants={contentVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            className="overflow-hidden"
                          >
                            <div className="pt-6 pb-2">{step.content}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
};
