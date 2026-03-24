import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Entry, User } from "../types";

type Props = {
  dates: string[];
  users: User[];
  entries: Entry[];
};

export default function MatrixView({ dates, users, entries }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; left: number; top: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const today = dayjs().format("YYYY-MM-DD");
  const entryMap = useMemo(() => {
    const map = new Map<string, Entry>();
    entries.forEach((e) => map.set(`${e.user}-${e.date}`, e));
    return map;
  }, [entries]);

  const scrollToToday = (behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const todayCell = container.querySelector<HTMLElement>("[data-today-column='true']");
    if (!todayCell) return false;

    const nextScrollLeft = todayCell.offsetLeft + todayCell.offsetWidth / 2 - container.clientWidth / 2;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const clampedScrollLeft = Math.min(Math.max(nextScrollLeft, 0), Math.max(maxScrollLeft, 0));
    container.scrollTo({ left: clampedScrollLeft, behavior });
    return true;
  };

  useEffect(() => {
    // Center today's column when the matrix first appears.
    scrollToToday("auto");
  }, [dates, today]);

  useEffect(() => {
    const activeKey = openKey ?? hoveredKey;
    if (!activeKey) {
      setTooltip(null);
      return;
    }

    const activeEntry = entryMap.get(activeKey);
    if (!activeEntry?.comment) {
      setTooltip(null);
      return;
    }

    const updateTooltipPosition = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const cell = container.querySelector<HTMLButtonElement>(`button[data-cell-key="${activeKey}"]`);
      if (!cell) return;
      const rect = cell.getBoundingClientRect();
      setTooltip({
        text: activeEntry.comment,
        left: rect.left + rect.width / 2,
        top: rect.top - 10,
      });
    };

    updateTooltipPosition();
    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", updateTooltipPosition);
    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition, true);

    return () => {
      container?.removeEventListener("scroll", updateTooltipPosition);
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition, true);
    };
  }, [openKey, hoveredKey, entryMap]);

  return (
    <div className="rounded-soft bg-white p-4 shadow-soft md:p-6">
      <div className="grid grid-cols-[100px_1fr]">
        <div className="relative z-30 border-r bg-white">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center border-b px-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            onClick={() => scrollToToday()}
          >
            TODAY
          </button>
          {users.map((u) => (
            <button
              type="button"
              key={`u-${u.id}`}
              className="flex h-12 w-full items-center justify-center border-b px-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              onClick={() => scrollToToday()}
            >
              {u.name}
            </button>
          ))}
        </div>

        <div ref={scrollContainerRef} className="overflow-auto">
          <div
            className="grid min-w-[900px]"
            style={{ gridTemplateColumns: `repeat(${dates.length}, minmax(40px, 1fr))` }}
          >
            {dates.map((date) => (
              <div
                key={date}
                data-today-column={date === today ? "true" : undefined}
                className={`flex h-12 items-center justify-center border-b p-2 text-center text-xs ${
                  dayjs(date).date() === 1 ? "border-l-4 border-l-gray-400" : ""
                } ${date === today ? "bg-rose-50 font-semibold text-rose-500" : "text-gray-400"}`}
              >
                {date.slice(5)}
              </div>
            ))}
            {users.map((u) => (
              <Fragment key={`row-${u.id}`}>
                {dates.map((date) => {
                  const entry = entryMap.get(`${u.id}-${date}`);
                  const key = `${u.id}-${date}`;
                  return (
                    <button
                      type="button"
                      key={key}
                      data-cell-key={key}
                      className={`group relative flex h-12 items-center justify-center border-b p-2 text-center ${
                        dayjs(date).date() === 1 ? "border-l-4 border-l-gray-400" : ""
                      } ${date === today ? "bg-rose-50/60" : ""}`}
                      onClick={() => setOpenKey((prev) => (prev === key ? null : key))}
                      onMouseEnter={() => {
                        if (entry?.comment) setHoveredKey(key);
                      }}
                      onMouseLeave={() => setHoveredKey((prev) => (prev === key ? null : prev))}
                    >
                      <span className="text-xl">{entry?.mood_emoji ?? ""}</span>
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      {tooltip ? (
        <div
          className="pointer-events-none fixed z-[100] w-40 -translate-x-1/2 -translate-y-full rounded-lg bg-gray-800 p-2 text-xs text-white"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          {tooltip.text}
          <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-gray-800" />
        </div>
      ) : null}
    </div>
  );
}
