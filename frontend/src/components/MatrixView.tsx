import { Fragment } from "react";
import { useState } from "react";
import dayjs from "dayjs";
import { Entry, User } from "../types";

type Props = {
  dates: string[];
  users: User[];
  entries: Entry[];
};

export default function MatrixView({ dates, users, entries }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const today = dayjs().format("YYYY-MM-DD");
  const entryMap = new Map<string, Entry>();
  entries.forEach((e) => entryMap.set(`${e.user}-${e.date}`, e));

  return (
    <div className="overflow-auto rounded-soft bg-white p-4 shadow-soft md:p-6">
      <div
        className="grid min-w-[900px]"
        style={{ gridTemplateColumns: `160px repeat(${dates.length}, minmax(40px, 1fr))` }}
      >
        <div className="sticky left-0 z-10 border-b bg-white p-2 text-xs text-gray-500">MEMBER</div>
        {dates.map((date) => (
          <div
            key={date}
            className={`border-b p-2 text-center text-xs ${
              date === today ? "bg-rose-50 font-semibold text-rose-500" : "text-gray-400"
            }`}
          >
            {date.slice(5)}
          </div>
        ))}
        {users.map((u) => (
          <Fragment key={`row-${u.id}`}>
            <div key={`u-${u.id}`} className="sticky left-0 z-10 border-b bg-white p-2 text-sm font-medium text-ink">
              {u.name}
            </div>
            {dates.map((date) => {
              const entry = entryMap.get(`${u.id}-${date}`);
              const key = `${u.id}-${date}`;
              return (
                <button
                  type="button"
                  key={key}
                  className={`group relative border-b p-2 text-center ${date === today ? "bg-rose-50/60" : ""}`}
                  onClick={() => setOpenKey((prev) => (prev === key ? null : key))}
                >
                  <span className="text-xl">{entry?.mood_emoji ?? ""}</span>
                  {entry?.comment ? (
                    <div
                      className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-40 -translate-x-1/2 rounded-lg bg-gray-800 p-2 text-xs text-white transition ${
                        openKey === key ? "visible opacity-100" : "invisible opacity-0 group-hover:visible group-hover:opacity-100"
                      }`}
                    >
                      {entry.comment}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
