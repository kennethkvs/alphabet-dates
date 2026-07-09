"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dateOptions } from "@/types/alphabet";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString(undefined, dateOptions);
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export function DatePickerInput({
  label,
  formValue,
  placeholder,
  handleDateChange,
}: {
  label?: string;
  formValue: Date;
  placeholder: string;
  handleDateChange: (date: Date) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(formValue);
  const [month, setMonth] = React.useState<Date | undefined>(formValue);
  const [value, setValue] = React.useState(formatDate(formValue));

  return (
    <Field className="mx-auto w-full gap-0">
      <FieldLabel
        htmlFor="date-required"
        className="font-hand text-sm text-burgundy"
      >
        {label || "Date"}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <InputGroup className="mt-1 h-9 border-navy/25 bg-cream-deep rounded-lg">
            <InputGroupInput
              className="text-sm"
              id="date-required"
              value={value}
              placeholder={placeholder}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setValue(e.target.value);
                if (isValidDate(date)) {
                  setDate(date);
                  setMonth(date);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(true);
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                id="date-picker"
                variant="link"
                size="icon-xs"
                aria-label="Select date"
              >
                <CalendarIcon />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              setDate(date);
              setValue(formatDate(date));
              setOpen(false);
              handleDateChange(date as Date);
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
