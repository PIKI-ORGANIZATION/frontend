"use client";

import {
  Copy,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaqApiItem } from "@/features/faq/types";
import { getFaqViewStatus } from "@/features/faq/utils";
import { cn } from "@/lib/utils";
import { FaqRowHandlers, FaqRowPermissions } from "./faq-view.types";

interface FaqRowActionsProps {
  item: FaqApiItem;
  canWrite: boolean;
  permissions: FaqRowPermissions;
  handlers: FaqRowHandlers;
  className?: string;
}

/** Menu aksi overflow (⋮) untuk satu FAQ: Edit, Duplikat, Ubah Status, Pratinjau, Hapus. */
export function FaqRowActions({
  item,
  canWrite,
  permissions,
  handlers,
  className,
}: FaqRowActionsProps) {
  const isArchived = getFaqViewStatus(item) === "ARCHIVED";
  const canEdit = canWrite && permissions.canUpdate && !isArchived;
  const canDuplicate = canWrite && permissions.canCreate && !isArchived;
  const canToggleStatus = canWrite && permissions.canUpdate;
  const canDelete = canWrite && permissions.canArchive && !isArchived;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Menu aksi FAQ: ${item.pertanyaan}`}
            className={cn(
              "size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground",
              className,
            )}
          />
        }
      >
        <MoreVertical className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className="min-w-44">
        {canEdit && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handlers.onEdit(item)}
          >
            <Edit2 className="size-4 shrink-0" />
            <span>Edit</span>
          </DropdownMenuItem>
        )}

        {canDuplicate && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handlers.onDuplicate(item)}
          >
            <Copy className="size-4 shrink-0" />
            <span>Duplikat</span>
          </DropdownMenuItem>
        )}

        {canToggleStatus &&
          (isArchived ? (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handlers.onRestore(item)}
            >
              <RotateCcw className="size-4 shrink-0" />
              <span>Aktifkan Kembali</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handlers.onTogglePublish(item)}
            >
              {item.isPublish ? (
                <EyeOff className="size-4 shrink-0" />
              ) : (
                <Globe className="size-4 shrink-0" />
              )}
              <span>
                {item.isPublish ? "Ubah ke Draft" : "Publikasikan"}
              </span>
            </DropdownMenuItem>
          ))}

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handlers.onPreview(item)}
        >
          <Eye className="size-4 shrink-0" />
          <span>Pratinjau</span>
        </DropdownMenuItem>

        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => handlers.onArchive(item)}
            >
              <Trash2 className="size-4 shrink-0" />
              <span>Hapus</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
