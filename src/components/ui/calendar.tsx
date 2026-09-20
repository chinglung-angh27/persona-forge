"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayButtonProps, DayPicker as RDP } from "react-day-picker";
import "react-day-picker/style.css";

import { JournalMarker } from "../../lib/journalDates";
import { cn } from "../../lib/cn";

export type CalendarProps = Omit<React.ComponentProps<typeof RDP>, "classNames" | "components"> & {
  className?: string;
  classNames?: Record<string, string | undefined>;
  markers?: JournalMarker[];
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
};

const markerClassName: Record<JournalMarker["type"], string> = {
  habit: "h-1 w-1 rounded-full bg-emerald-400",
  reflection: "h-1.5 w-1.5 rotate-45 bg-violet-400",
  mission: "h-1.5 w-1.5 bg-amber-400",
};

function Calendar({ className, classNames, markers = [], showOutsideDays = true, ...props }: CalendarProps) {
  const markersByDate = React.useMemo(() => {
    const grouped = new Map<string, JournalMarker[]>();
    markers.forEach((marker) => {
      const dateMarkers = grouped.get(marker.date) ?? [];
      dateMarkers.push(marker);
      grouped.set(marker.date, dateMarkers);
    });
    return grouped;
  }, [markers]);

  const DayButton = ({ day, modifiers, ...buttonProps }: DayButtonProps) => {
    const dateMarkers = markersByDate.get(day.isoDate) ?? [];
    const markerLabels = dateMarkers.map((marker) => marker.label);
    const ariaLabel = buttonProps["aria-label"];
    const title = markerLabels.length ? markerLabels.join("\n") : buttonProps.title;

    return (
      <button
        {...buttonProps}
        aria-label={markerLabels.length && ariaLabel ? `${ariaLabel}. ${markerLabels.join(". ")}` : ariaLabel}
        title={title}
      >
        {buttonProps.children}
        {markerLabels.length > 0 && (
          <span className="pointer-events-none absolute bottom-0.5 flex gap-0.5" aria-hidden="true">
            {dateMarkers.map((marker) => (
              <span
                key={`${marker.type}-${marker.label}`}
                data-marker={marker.type}
                title={marker.label}
                className={markerClassName[marker.type]}
              />
            ))}
          </span>
        )}
      </button>
    );
  };

  return (
    <div>
      <RDP
        showOutsideDays={showOutsideDays}
        className={cn("w-fit select-none", className)}
        classNames={{
          months: cn("relative flex flex-col sm:flex-row gap-4", classNames?.months),
          month: cn("w-full", classNames?.month),
          month_caption: cn(
            "relative mx-10 mb-2 flex h-9 items-center justify-center z-20",
            classNames?.month_caption
          ),
          caption_label: cn("text-sm font-medium text-[#e5e2e1]", classNames?.caption_label),
          nav: cn("absolute top-0 flex w-full justify-between z-10", classNames?.nav),
          button_previous: cn(
            "neo-recessed size-9 text-[#8e9192] hover:text-[#e5e2e1] flex items-center justify-center rounded-lg cursor-pointer",
            classNames?.button_previous
          ),
          button_next: cn(
            "neo-recessed size-9 text-[#8e9192] hover:text-[#e5e2e1] flex items-center justify-center rounded-lg cursor-pointer",
            classNames?.button_next
          ),
          weekday: cn("size-9 p-0 text-[10px] font-medium text-[#7e7d7d]", classNames?.weekday),
          week_number: cn("flex justify-center", classNames?.week_number),
          day_button: cn(
            "relative flex size-9 items-center justify-center rounded-lg text-[#c8c6c5] hover:text-[#e5e2e1] hover:bg-[#1c1b1b] cursor-pointer transition-colors",
            classNames?.day_button
          ),
          day: cn("group size-9 px-0 text-sm", classNames?.day),
          outside: cn("text-[#3a3a3a]", classNames?.outside),
          hidden: cn("invisible", classNames?.hidden),
          weeks: cn("flex flex-col gap-1", classNames?.weeks),
          week: cn("flex gap-1", classNames?.week),
        }}
        components={{
          DayButton,
          Chevron: (props: { orientation?: "left" | "right"; className?: string }) => {
            const Icon = props.orientation === "left" ? ChevronLeft : ChevronRight;
            return <Icon className={cn("w-4 h-4", props.className)} />;
          },
        }}
        {...props}
      />
      {markers.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#1e1e1e] pt-3 text-[10px] font-mono-code text-[#8e9192]">
          <span className="mr-1 uppercase tracking-widest">Journal markers</span>
          {(["habit", "reflection", "mission"] as const).map((type) => (
            <span key={type} className="flex items-center gap-1.5">
              <span className={markerClassName[type]} aria-hidden="true" />
              <span>{type[0].toUpperCase() + type.slice(1)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
export { Calendar as CalendarPicker };
