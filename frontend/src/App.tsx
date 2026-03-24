import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { api } from "./api/client";
import { AttendanceRecord, Entry, MoodType, User } from "./types";
import LoginForm from "./components/LoginForm";
import CalendarView from "./components/CalendarView";
import DateDetailPanel from "./components/DateDetailPanel";
import MatrixView from "./components/MatrixView";
import AttendanceView from "./components/AttendanceView";

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
  const [authChecked, setAuthChecked] = useState(false);
  const [mode, setMode] = useState<"calendar" | "matrix" | "attendance">("calendar");
  const [month, setMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [attendanceDate, setAttendanceDate] = useState(dayjs().format("YYYY-MM-DD"));

  const calendarStart = month.startOf("month").format("YYYY-MM-DD");
  const calendarEnd = month.endOf("month").format("YYYY-MM-DD");
  const matrixStart = dayjs().month(2).startOf("month").format("YYYY-MM-DD");
  const matrixEnd = dayjs().month(6).endOf("month").format("YYYY-MM-DD");

  const calendarEntriesQuery = useQuery({
    queryKey: ["entries", "calendar", calendarStart, calendarEnd, !!me],
    enabled: !!me,
    queryFn: async () => {
      const { data } = await api.get<Entry[]>(`/entries/?start=${calendarStart}&end=${calendarEnd}`);
      return data;
    },
  });

  const matrixEntriesQuery = useQuery({
    queryKey: ["entries", "matrix", matrixStart, matrixEnd, !!me],
    enabled: !!me,
    queryFn: async () => {
      const { data } = await api.get<Entry[]>(`/entries/?start=${matrixStart}&end=${matrixEnd}`);
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

  const attendanceQuery = useQuery({
    queryKey: ["attendance", attendanceDate, !!me],
    enabled: !!me,
    queryFn: async () => {
      const { data } = await api.get<AttendanceRecord[]>(`/entries/attendance/date/${attendanceDate}/`);
      return data;
    },
  });

  const today = dayjs().format("YYYY-MM-DD");
  const todayAttendanceQuery = useQuery({
    queryKey: ["attendance", "today", today, !!me],
    enabled: !!me,
    queryFn: async () => {
      const { data } = await api.get<AttendanceRecord[]>(`/entries/attendance/date/${today}/`);
      return data;
    },
  });

  const calendarEntries = calendarEntriesQuery.data ?? [];
  const matrixEntries = matrixEntriesQuery.data ?? [];
  const selectedEntries = calendarEntries.filter((entry) => entry.date === selectedDate);
  const nowHHmm = dayjs().format("HH:mm");
  const presentPeople = useMemo(() => {
    const todayRecords = todayAttendanceQuery.data ?? [];
    return todayRecords
      .filter((record) => {
        const checkIn = record.check_in?.slice(0, 5);
        const checkOut = record.check_out?.slice(0, 5);
        if (!checkIn) return false;
        if (checkOut) {
          return checkIn <= nowHHmm && nowHHmm < checkOut;
        }
        return checkIn <= nowHHmm;
      })
      .map((record) => record.user_name);
  }, [nowHHmm, todayAttendanceQuery.data]);
  const matrixDates = useMemo(
    () => makeDateRange(dayjs(matrixStart, "YYYY-MM-DD"), dayjs(matrixEnd, "YYYY-MM-DD")),
    [matrixStart, matrixEnd]
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAuthChecked(true);
      return;
    }

    api
      .get<User>("/auth/me/")
      .then((res) => setMe(res.data))
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setMe(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-cream p-4">
        <div className="mx-auto mt-12 w-full max-w-md rounded-soft bg-white p-8 text-center text-sm text-gray-500 shadow-soft">
          로그인 상태 확인 중...
        </div>
      </main>
    );
  }

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
              <p className="text-sm text-gray-500">{me.name}님, 오늘 설계 어땠나요?</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span>지금 설계실인 사람 :</span>
                {presentPeople.length > 0 ? (
                  presentPeople.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                    없음
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`rounded-lg px-3 py-2 text-sm ${mode === "attendance" ? "bg-gray-100 text-gray-700" : "bg-gray-800 text-white"}`}
                onClick={() => setMode("calendar")}
              >
                메인 화면
              </button>
              <button
                className={`rounded-lg px-3 py-2 text-sm ${mode === "attendance" ? "bg-gray-800 text-white" : "bg-gray-100"}`}
                onClick={() => setMode("attendance")}
              >
                출퇴근기록부
              </button>
            </div>
          </div>
        </header>

        {mode === "attendance" ? (
          <AttendanceView
            me={me}
            users={usersQuery.data ?? []}
            records={attendanceQuery.data ?? []}
            selectedDate={attendanceDate}
            onDateChange={setAttendanceDate}
            onSaved={() => attendanceQuery.refetch()}
          />
        ) : (
          <section>
            <div className="flex items-end gap-1.5 px-2">
              <button
                className={`rounded-t-xl border border-b-0 px-4 py-2 text-sm font-medium transition ${
                  mode === "calendar"
                    ? "border-gray-300 bg-white text-gray-800 shadow-soft"
                    : "border-transparent bg-gray-200/70 text-gray-500"
                }`}
                onClick={() => setMode("calendar")}
              >
                월캘린더
              </button>
              <button
                className={`rounded-t-xl border border-b-0 px-4 py-2 text-sm font-medium transition ${
                  mode === "matrix"
                    ? "border-gray-300 bg-white text-gray-800 shadow-soft"
                    : "border-transparent bg-gray-200/70 text-gray-500"
                }`}
                onClick={() => setMode("matrix")}
              >
                팀 매트릭스
              </button>
            </div>
            <div className="rounded-soft border border-gray-200 bg-white p-3 shadow-soft md:p-4">
              {mode === "calendar" ? (
                <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                  <CalendarView
                    currentMonth={month}
                    entries={calendarEntries}
                    moods={moodsQuery.data ?? []}
                    meId={me.id}
                    onPrevMonth={() => setMonth((m) => m.subtract(1, "month"))}
                    onNextMonth={() => setMonth((m) => m.add(1, "month"))}
                    onSelectDate={setSelectedDate}
                    onSaved={() => {
                      void calendarEntriesQuery.refetch();
                      void matrixEntriesQuery.refetch();
                    }}
                    onMoodAdded={() => moodsQuery.refetch()}
                  />
                  <DateDetailPanel
                    date={selectedDate}
                    entries={selectedEntries}
                    onLiked={() => {
                      void calendarEntriesQuery.refetch();
                      void matrixEntriesQuery.refetch();
                    }}
                  />
                </section>
              ) : (
                <MatrixView dates={matrixDates} users={usersQuery.data ?? [me]} entries={matrixEntries} />
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
