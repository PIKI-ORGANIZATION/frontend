"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface TeamMember {
  name: string;
  role: string;
  department: string;
  bio: string;
  avatar: string;
}

const defaultMembers: TeamMember[] = [
  {
    name: "Clara Hoffmann",
    role: "Chief Executive Officer",
    department: "Leadership",
    bio: "20 years scaling enterprise software from seed to IPO across three continents.",
    avatar:
      "https://cdn.21st.dev/assets/mirror/d2/d2b2fe54475e5a330231e001d4c00f2909fc9899e1e66d0fa7cff6c46a01b577.jpg",
  },
  {
    name: "Marcus Tran",
    role: "Chief Technology Officer",
    department: "Engineering",
    bio: "Former Staff Engineer at Google. Obsessed with distributed systems and developer experience.",
    avatar:
      "https://cdn.21st.dev/assets/mirror/d0/d0d44f08bd9b7fdcf181419e79fe36e61ef39a6fcedf25f0d22997313e40b8b0.jpg",
  },
  {
    name: "Amara Osei",
    role: "Head of Design",
    department: "Design",
    bio: "Crafts interfaces that win awards and convert users, rarely a coincidence.",
    avatar:
      "https://cdn.21st.dev/assets/mirror/b3/b3703104f1fc207e32006b10c65f8061ddd0b6c9cb989a41bf1cbcd2a891b32d.jpg",
  },
  {
    name: "Lena Kovač",
    role: "VP of Engineering",
    department: "Engineering",
    bio: "Led platform migrations at Stripe and Figma. Turns technical debt into roadmap wins.",
    avatar:
      "https://cdn.21st.dev/assets/mirror/70/700b4f1517d433a8ff2ccc3324e42155f8081aa79503b26795031fb800a077f6.jpg",
  },
  {
    name: "Daniel Reyes",
    role: "Head of Product",
    department: "Product",
    bio: "Zero-to-one product thinker. Launched features now used by 4 million people.",
    avatar:
      "https://cdn.21st.dev/assets/mirror/eb/ebb231694aaddb5df21dc73c96a7d569c3192faf108b57a2be7cf1e5c7a794cb.jpg",
  },
  {
    name: "Sophie Laurent",
    role: "Head of Marketing",
    department: "Marketing",
    bio: "Turned brand storytelling into a growth engine, twice, at companies you know.",
    avatar:
      "https://cdn.21st.dev/assets/mirror/43/4341c48155c5f5db8e89382d4ba975ec0475647da2b0fc68de786a32eb611ab6.jpg",
  },
];

function getInitials(name: string) {
  if (!name) return "PI";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface TeamBlockProps {
  badgeTitle?: string;
  heading?: string;
  description?: string;
  members?: TeamMember[];
}

export default function TeamBlock({
  badgeTitle = "Meet The Team",
  heading = "The people behind Acme",
  description = "Founders and leaders who have shipped products used by millions. Relentlessly focused on craft, speed, and customer impact.",
  members = defaultMembers,
}: TeamBlockProps) {
  return (
    <section className="flex w-full items-center justify-center bg-background px-6 py-20 text-foreground">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="outline"
            className="mb-5 px-3 py-1 text-xs tracking-widest uppercase"
          >
            {badgeTitle}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-heading">
            {heading}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">{description}</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 md:grid-cols-3">
          {members.map(({ name, role, department, bio, avatar }) => (
            <div
              key={name}
              className="group flex flex-col gap-5 bg-card p-6 transition-colors duration-200 hover:bg-muted/40 sm:p-8"
            >
              <div className="flex items-center gap-4">
                <Avatar className="size-16 shrink-0 border border-border">
                  <AvatarImage
                    src={avatar}
                    alt={name}
                    className="grayscale transition-all duration-300 group-hover:grayscale-0"
                  />
                  <AvatarFallback className="text-sm font-semibold">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start gap-1">
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    {department}
                  </Badge>
                  <span className="text-sm leading-snug font-semibold text-foreground">
                    {name}
                  </span>
                  <span className="text-xs text-muted-foreground">{role}</span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { TeamBlock };

