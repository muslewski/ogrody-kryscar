"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelRequestAction } from "@/app/(app)/panel/zamowienia/actions";

export function RequestActions({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function onCancel() {
    start(async () => {
      const res = await cancelRequestAction(id);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Zapytanie anulowane.");
        router.refresh();
      }
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">
        Anuluj
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anulować to zapytanie?</AlertDialogTitle>
          <AlertDialogDescription>
            Zapytanie zostanie oznaczone jako anulowane. Możesz złożyć nowe w każdej chwili.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Wróć</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
            disabled={pending}
            className="bg-red-600 hover:bg-red-700"
          >
            {pending ? "Anulowanie…" : "Anuluj zapytanie"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
