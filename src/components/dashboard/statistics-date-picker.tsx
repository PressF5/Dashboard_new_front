"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type StatisticsDatePickerProps = {
  label: string;
  selectedDate: string;
  availableDates: string[];
  onChange: (date: string) => void;
};

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function formatDateKey(year: number, month: number, day: number) {
  return [
    year,
    String(month + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function StatisticsDatePicker({
  label,
  selectedDate,
  availableDates,
  onChange,
}: StatisticsDatePickerProps) {
  const initialDate = selectedDate
    ? parseDate(selectedDate)
    : availableDates.length > 0
      ? parseDate(availableDates[0])
      : new Date();

  const [opened, setOpened] = useState(false);

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates],
  );

  useEffect(() => {
    if (!selectedDate) return;

    const date = parseDate(selectedDate);

    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [selectedDate]);

  // Закрытие календаря при клике вне компонента или нажатии Escape.
  useEffect(() => {
    if (!opened) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpened(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpened(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [opened]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const monthLabel = visibleMonth.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const selectedLabel = selectedDate
    ? parseDate(selectedDate).toLocaleDateString("ru-RU")
    : "Нет доступных дат";

  function changeMonth(monthOffset: number) {
    setVisibleMonth(new Date(year, month + monthOffset, 1));
  }

  function selectDate(day: number) {
    const value = formatDateKey(year, month, day);

    if (!availableDateSet.has(value)) return;

    onChange(value);
    setOpened(false);
  }

  return (
    <div className="statistics-date-picker" ref={containerRef}>
      <span className="statistics-date-label">{label}</span>

      <button
        type="button"
        className="statistics-date-trigger"
        onClick={() => setOpened((value) => !value)}
        disabled={availableDates.length === 0}
        aria-expanded={opened}
        aria-haspopup="dialog"
      >
        <CalendarDays size={18} />
        <span>{selectedLabel}</span>
        <ChevronDown className="statistics-date-chevron" size={17} />
      </button>

      {opened && (
        <div
          className="statistics-calendar"
          role="dialog"
          aria-label="Выбор даты статистики"
        >
          <div className="statistics-calendar-header">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft size={18} />
            </button>

            <strong>{monthLabel}</strong>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Следующий месяц"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="statistics-calendar-grid">
            {WEEK_DAYS.map((day) => (
              <span className="statistics-calendar-weekday" key={day}>
                {day}
              </span>
            ))}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <span
                    className="statistics-calendar-empty"
                    key={`empty-${index}`}
                  />
                );
              }

              const value = formatDateKey(year, month, day);
              const available = availableDateSet.has(value);
              const selected = selectedDate === value;

              return (
                <button
                  key={value}
                  type="button"
                  disabled={!available}
                  className={[
                    "statistics-calendar-day",
                    available ? "available" : "",
                    selected ? "selected" : "",
                  ].join(" ")}
                  onClick={() => selectDate(day)}
                  aria-label={parseDate(value).toLocaleDateString("ru-RU")}
                  aria-pressed={selected}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="statistics-calendar-legend">
            <span className="statistics-calendar-legend-dot" />
            Есть статистика
          </div>
        </div>
      )}
    </div>
  );
}
