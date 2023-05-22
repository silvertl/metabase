import React, { ReactNode } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableDiv } from "./Sortable.styled";

interface SortableProps {
  id: UniqueIdentifier;
  children: ReactNode;
}

export function Sortable({ id, children }: SortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <SortableDiv
      transform={CSS.Transform.toString(transform)}
      transition={transition}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      {children}
    </SortableDiv>
  );
}
