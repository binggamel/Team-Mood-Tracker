import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { api } from "./api/client";
import { Entry, MoodType, User } from "./types";
import LoginForm from "./components/LoginForm";
import CalendarView from "./components/CalendarView";
import DateDetailPanel from "./components/DateDetailPanel";
import MatrixView from "./components/MatrixView";

function makeDateRange(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  const result: string[] = [];
  let cur = start;
  while (cur.isBefore(end) || cur.isSame(end, "day")) {
    result.push(cur.format("YYYY-MM-DD"));
    cur = cur.add(1, "day");
  }
  return result;
}

export default function App() {
  const [me, setMe] = useState<User | null>(null);
  const [mode, setMode] = useState<"calendar" | "matrix">("calendar");
  const [month, setMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

  const start = month.startOf("month").format("YYYY-MM-DD");
  const end = month.endOf("month").format("YYYY-MM-DD");

  const entriesQuery = useQuery({
    queryKey: ["entries", start, end, !!me],
    enabled: !!me,
    queryFn: async () => {
      const { data } = await api.get<Entry[]>(`/entries/?start=${start}&end=${end}`);
      return data;
    },
  });

  const usersQuery = useQuery({
    queryKey: ["users", !!me],
    enabled: !!me,
    queryFn: async () => {
      const { data } = await api.get<User[]>("/auth/users/");
      return data;
    },
  });

  const moodsQuery = useQuery({
    queryKey: ["moods", !!me],
    enabled: !!me,
    queryFn: async () => {
      const { data } = await api.get<MoodType[]>("/moods/");
      return data;
    },
  });

  const entries = entriesQuery.data ?? [];
  const selectedEntries = entries.filter((entry) => entry.date === selectedDate);
  const matrixDates = useMemo(() => makeDateRange(month.startOf("month"), month.endOf("month")), [month]);

  if (!me) {
    return (
      <main className="min-h-screen bg-cream p-4">
        <LoginForm onSuccess={setMe} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-soft bg-white px-4 py-3 shadow-soft md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl tracking-[0.1em] text-ink md:text-2xl">202-2호 설계실</h1>
              <p className="text-sm text-gray-500">{me.name}님, 오늘 하루 어땠나요?</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-lg border px-3 py-2 text-sm"
                onClick={() => setMonth((m) => m.subtract(1, "month"))}
              >
                이전
              </button>
              <button
                className="rounded-lg border px-3 py-2 text-sm"
                onClick={() => setMonth((m) => m.add(1, "month"))}
              >
                다음
              </button>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className={`rounded-lg px-3 py-2 text-sm ${mode === "calendar" ? "bg-gray-800 text-white" : "bg-gray-100"}`}
              onClick={() => setMode("calendar")}
            >
              월 캘린더
            </button>
            <button
              className={`rounded-lg px-3 py-2 text-sm ${mode === "matrix" ? "bg-gray-800 text-white" : "bg-gray-100"}`}
              onClick={() => setMode("matrix")}
            >
              팀 매트릭스
            </button>
          </div>
        </header>

        {mode === "calendar" ? (
          <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <CalendarView
              currentMonth={month}
              entries={entries}
              moods={moodsQuery.data ?? []}
              meId={me.id}
              onSelectDate={setSelectedDate}
              onSaved={() => entriesQuery.refetch()}
              onMoodAdded={() => moodsQuery.refetch()}
            />
            <DateDetailPanel date={selectedDate} entries={selectedEntries} />
          </section>
        ) : (
          <MatrixView dates={matrixDates} users={usersQuery.data ?? [me]} entries={entries} />
        )}
      </div>
    </main>
  );
}
