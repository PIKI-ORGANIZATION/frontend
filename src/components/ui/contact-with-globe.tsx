"use client";

import * as React from "react";
import { useId, useState } from "react";
import { motion } from "motion/react";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { ArrowRight, Mail, Phone, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GlobeWireframe,
  type GlobeWireframeProps,
} from "@/components/ui/globe-wireframe";
import { cn } from "@/lib/utils";

const smoothEase = [0.25, 0.1, 0.25, 1] as const;

export interface ContactLinkItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subLabel?: string;
  href?: string;
  external?: boolean;
}

export interface ContactFormValues {
  fullName: string;
  organization: string;
  email: string;
  message: string;
}

const DEFAULT_CONTACT_LINKS: ContactLinkItem[] = [
  {
    icon: Mail,
    label: "contact@yoursaas.ai",
    href: "mailto:contact@yoursaas.ai",
  },
  {
    icon: Phone,
    label: "+1 (800) 321 XX21",
    href: "tel:+18003214321",
  },
  {
    icon: Headphones,
    label: "support@yoursaas.ai",
    href: "mailto:support@yoursaas.ai",
  },
];

const FormDots = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive>
>(({ className, orientation = "horizontal", ...props }, ref) => {
  const isHorizontal = orientation === "horizontal";
  return (
    <SeparatorPrimitive
      ref={ref}
      orientation={orientation}
      className={cn(
        "shrink-0 flex items-center justify-center overflow-hidden",
        isHorizontal ? "w-full" : "h-full",
        className,
      )}
      {...props}
    >
      <div
        className={cn("relative", isHorizontal ? "w-full h-4" : "h-full w-4")}
      >
        <div
          className="absolute inset-0 bg-repeat text-muted-foreground/40"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 0.8px, transparent 0.8px)",
            backgroundSize: isHorizontal ? "6px 100%" : "100% 6px",
            maskImage: isHorizontal
              ? "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)"
              : "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        />
      </div>
    </SeparatorPrimitive>
  );
});
FormDots.displayName = "FormDots";

export interface ContactWithGlobeProps {
  badge?: string;
  title?: string;
  description?: string;
  infoTitle?: string;
  infoDescription?: string;
  contactItems?: ContactLinkItem[];
  formTitle?: string;
  formDescription?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  organizationLabel?: string;
  organizationPlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  globeProps?: Partial<GlobeWireframeProps>;
  onSubmitMessage?: (values: ContactFormValues) => Promise<void> | void;
  className?: string;
}

const INPUT_CLASS =
  "w-full bg-muted/40 border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200";

export default function ContactWithGlobe({
  badge = "Contact",
  title = "Contact us",
  description = "We are always looking for ways to improve our products and services. Contact us and let us know how we can help you.",
  infoTitle = "Get in touch",
  infoDescription = "Reach out via any channel below. We typically reply within one business day.",
  contactItems = DEFAULT_CONTACT_LINKS,
  formTitle = "Send a message",
  formDescription = "Fill out the form and we'll get back to you promptly.",
  nameLabel = "Full Name",
  namePlaceholder = "Nama lengkap Anda",
  organizationLabel = "Organization",
  organizationPlaceholder = "Asal instansi / cabang",
  emailLabel = "Email Address",
  emailPlaceholder = "nama@email.com",
  messageLabel = "Message",
  messagePlaceholder = "Tuliskan pesan Anda di sini",
  submitLabel = "Submit",
  globeProps,
  onSubmitMessage,
  className,
}: ContactWithGlobeProps) {
  const formId = useId();
  const [values, setValues] = useState<ContactFormValues>({
    fullName: "",
    organization: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitMessage) return;
    setIsSubmitting(true);
    try {
      await onSubmitMessage(values);
      setValues({ fullName: "", organization: "", email: "", message: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={cn(
        "relative w-full bg-background overflow-hidden py-20 md:py-28 border-t border-border/60",
        className,
      )}
    >
      <div className="relative mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.12, ease: smoothEase }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.24, ease: smoothEase }}
            className="text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 max-w-5xl mx-auto items-start">
          {/* Left: Info + Interactive Wireframe Globe */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: smoothEase }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-semibold text-foreground">
                {infoTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {infoDescription}
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              {contactItems.map((item, i) => {
                const Icon = item.icon;
                const inner = (
                  <>
                    <div className="w-9 h-9 rounded-lg bg-muted/70 border border-border group-hover:border-primary/40 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-200">
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      {item.subLabel && (
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                          {item.subLabel}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200 leading-snug">
                        {item.label}
                      </span>
                    </div>
                  </>
                );

                return (
                  <motion.div
                    key={`${item.label}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.45,
                      delay: 0.25 + i * 0.08,
                      ease: smoothEase,
                    }}
                  >
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className="group flex items-start gap-3 w-fit"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="group flex items-start gap-3 w-fit">
                        {inner}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Cropped Rotating Globe */}
            <div className="relative overflow-hidden h-56 mt-2">
              <GlobeWireframe
                className="w-full aspect-square max-w-full absolute top-0 left-0 text-foreground/70"
                variant="wireframesolid"
                autoRotate
                autoRotateSpeed={0.45}
                strokeWidth={0.6}
                graticuleOpacity={0.12}
                {...globeProps}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-background to-transparent" />
            </div>
          </motion.div>

          {/* Right: Contact Form Card */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.25, ease: smoothEase }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-5 shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-0.5">
                {formTitle}
              </h3>
              <p className="text-sm text-muted-foreground">{formDescription}</p>
            </div>

            <FormDots />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${formId}-name`}
                  className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
                >
                  {nameLabel}
                </label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  required
                  value={values.fullName}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, fullName: e.target.value }))
                  }
                  placeholder={namePlaceholder}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${formId}-org`}
                  className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
                >
                  {organizationLabel}
                </label>
                <input
                  id={`${formId}-org`}
                  type="text"
                  value={values.organization}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, organization: e.target.value }))
                  }
                  placeholder={organizationPlaceholder}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor={`${formId}-email`}
                className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
              >
                {emailLabel}
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                required
                value={values.email}
                onChange={(e) =>
                  setValues((p) => ({ ...p, email: e.target.value }))
                }
                placeholder={emailPlaceholder}
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor={`${formId}-msg`}
                className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
              >
                {messageLabel}
              </label>
              <textarea
                id={`${formId}-msg`}
                required
                rows={4}
                value={values.message}
                onChange={(e) =>
                  setValues((p) => ({ ...p, message: e.target.value }))
                }
                placeholder={messagePlaceholder}
                className={cn(INPUT_CLASS, "py-3 resize-none")}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-fit h-11 px-4 font-semibold text-sm group cursor-pointer"
            >
              <span>{isSubmitting ? "Mengirim..." : submitLabel}</span>
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
