"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, CheckIcon } from "lucide-react";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  getLabel: (value: string) => React.ReactNode | undefined;
  registerLabel: (value: string, label: React.ReactNode) => void;
  disabled?: boolean;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error(
      "Select compound components must be rendered within a <Select> root.",
    );
  }
  return context;
}

function extractLabelsFromChildren(
  children: React.ReactNode,
): Record<string, React.ReactNode> {
  const labels: Record<string, React.ReactNode> = {};

  function traverse(nodes: React.ReactNode) {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) return;

      const props = child.props as Record<string, unknown> | undefined;
      if (!props) return;

      if ("value" in props && props.value !== undefined) {
        labels[String(props.value)] =
          (props.children as React.ReactNode) ?? String(props.value);
      }

      if (props.children) {
        traverse(props.children as React.ReactNode);
      }
    });
  }

  traverse(children);
  return labels;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  modal?: boolean;
  items?:
    | Record<string, React.ReactNode>
    | Array<{ value: string; label: React.ReactNode }>;
  children: React.ReactNode;
}

function Select({
  value,
  defaultValue = "",
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  name,
  required,
  modal,
  items,
  children,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<string>(defaultValue);
  const isControlledValue = value !== undefined;
  const currentValue = isControlledValue ? (value ?? "") : uncontrolledValue;

  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState<boolean>(defaultOpen);
  const isControlledOpen = open !== undefined;
  const isOpen = isControlledOpen ? (open ?? false) : uncontrolledOpen;

  const dynamicLabelsRef = React.useRef<Record<string, React.ReactNode>>({});

  const staticLabels = React.useMemo(() => {
    const extracted = extractLabelsFromChildren(children);
    if (items) {
      if (Array.isArray(items)) {
        for (const item of items) {
          extracted[item.value] = item.label;
        }
      } else {
        Object.assign(extracted, items);
      }
    }
    return extracted;
  }, [children, items]);

  const registerLabel = React.useCallback(
    (val: string, label: React.ReactNode) => {
      dynamicLabelsRef.current[val] = label;
    },
    [],
  );

  const getLabel = React.useCallback(
    (val: string) => {
      return staticLabels[val] ?? dynamicLabelsRef.current[val];
    },
    [staticLabels],
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlledOpen) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlledOpen, onOpenChange],
  );

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (!isControlledValue) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlledValue, onValueChange],
  );

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open: isOpen,
        setOpen: handleOpenChange,
        getLabel,
        registerLabel,
        disabled,
      }}
    >
      <Popover open={isOpen} onOpenChange={handleOpenChange} modal={modal}>
        {children}
      </Popover>
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue}
          required={required}
          disabled={disabled}
        />
      )}
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof PopoverTrigger> {
  size?: "default" | "sm" | "lg";
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, size = "default", disabled, ...props }, ref) => {
    const context = useSelectContext();
    const isDisabled = disabled || context.disabled;

    return (
      <PopoverTrigger
        ref={ref}
        disabled={isDisabled}
        data-slot="select-trigger"
        data-size={size}
        className={cn(
          "group/trigger flex w-full items-center justify-between gap-2 rounded-sm border border-input bg-transparent px-3 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 cursor-pointer",
          size === "sm" && "h-8 px-2.5 text-xs",
          size === "default" && "h-9 py-2",
          size === "lg" && "h-11 px-4 py-2 text-base md:text-sm",
          className,
        )}
        {...props}
      >
        <span className="flex flex-1 items-center gap-2 text-left truncate pointer-events-none">
          {children}
        </span>
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground opacity-60 transition-transform duration-200 group-aria-expanded/trigger:rotate-180" />
      </PopoverTrigger>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps
  extends React.ComponentPropsWithoutRef<"span"> {
  placeholder?: React.ReactNode;
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder = "Pilih...", children, ...props }, ref) => {
    const context = useSelectContext();
    const hasValue = context.value !== undefined && context.value !== "";
    const label = hasValue ? context.getLabel(context.value) : undefined;

    return (
      <span
        ref={ref}
        data-slot="select-value"
        className={cn(
          "truncate block",
          !hasValue && "text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children ?? (hasValue ? (label ?? context.value) : placeholder)}
      </span>
    );
  },
);
SelectValue.displayName = "SelectValue";

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  alignItemWithTrigger?: boolean;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  (
    {
      className,
      children,
      side = "bottom",
      sideOffset = 4,
      align = "start",
      alignOffset = 0,
      alignItemWithTrigger,
      ...props
    },
    ref,
  ) => {
    void alignItemWithTrigger;
    return (
      <PopoverContent
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        data-slot="select-content"
        className={cn(
          "z-50 min-w-(--anchor-width) w-auto max-h-72 overflow-x-hidden overflow-y-auto rounded-sm bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-0.5">{children}</div>
      </PopoverContent>
    );
  },
);
SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<"button"> {
  value: string;
}

const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const context = useSelectContext();
    const isSelected = context.value === value;

    React.useEffect(() => {
      context.registerLabel(value, children);
    }, [context, value, children]);

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={isSelected}
        disabled={disabled}
        data-slot="select-item"
        data-state={isSelected ? "checked" : "unchecked"}
        className={cn(
          "relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm text-popover-foreground outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 transition-colors text-left",
          isSelected && "bg-accent/60 font-medium text-accent-foreground",
          className,
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) return;
          context.onValueChange(value);
          context.setOpen(false);
        }}
        {...props}
      >
        <span className="flex flex-1 items-center gap-2 truncate">
          {children}
        </span>
        {isSelected && (
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
            <CheckIcon className="size-3.5 text-primary" />
          </span>
        )}
      </button>
    );
  },
);
SelectItem.displayName = "SelectItem";

function SelectGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-group"
      className={cn("p-1", className)}
      {...props}
    />
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-label"
      className={cn(
        "px-2 py-1 text-xs font-semibold text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-border/60", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton() {
  return null;
}

function SelectScrollDownButton() {
  return null;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
