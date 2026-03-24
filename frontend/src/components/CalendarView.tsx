import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { Entry, MoodType } from "../types";

type Props = {
  currentMonth: dayjs.Dayjs;
  entries: Entry[];
  moods: MoodType[];
  meId: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (d: string) => void;
  onSaved: () => void;
  onMoodAdded: () => void;
};

export default function CalendarView({
  currentMonth,
  entries,
  moods,
  meId,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onSaved,
  onMoodAdded,
}: Props) {
  const start = currentMonth.startOf("month").startOf("week");
  const days = Array.from({ length: 42 }).map((_, idx) => start.add(idx, "day"));
  const today = dayjs().format("YYYY-MM-DD");
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [newMoodLabel, setNewMoodLabel] = useState("");
  const [newMoodEmoji, setNewMoodEmoji] = useState("");
  const [addingMood, setAddingMood] = useState(false);

  useEffect(() => {
    if (!openDate) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDate(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [openDate]);

  const byDate = entries.reduce<Record<string, Entry[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const myEntryByDate = useMemo(() => {
    const map = new Map<string, Entry>();
    entries.forEach((entry) => {
      if (entry.user === meId) map.set(entry.date, entry);
    });
    return map;
  }, [entries, meId]);

  const openComposer = (date: string) => {
    onSelectDate(date);
    setSuccess("");
    setError("");
    const mine = myEntryByDate.get(date);
    setSelectedMoodId(mine?.mood_type ?? null);
    setComment(mine?.comment ?? "");
    setOpenDate((prev) => (prev === date ? null : date));
  };

  const saveForDate = async (date: string, closeOnSuccess = false) => {
    if (!selectedMoodId) {
      setError("기분을 먼저 선택해 주세요.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/entries/upsert/", {
        date,
        mood_type: selectedMoodId,
        comment,
      });
      setSuccess("저장됨");
      onSaved();
      if (closeOnSuccess) {
        setOpenDate(null);
      }
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : "") ??
        "";
      if (err?.response?.status === 401) {
        setError("로그인이 만료되었습니다. 다시 로그인해 주세요.");
      } else if (detail) {
        setError(`저장 실패: ${detail}`);
      } else {
        setError("저장 실패. 서버 상태를 확인해 주세요.");
      }
    } finally {
      setSaving(false);
    }
  };

  const addMoodType = async () => {
    if (!newMoodLabel.trim() || !newMoodEmoji.trim()) {
      setError("새 무드는 이름과 이모지가 필요합니다.");
      return;
    }
    setAddingMood(true);
    setError("");
    try {
      const { data } = await api.post<MoodType>("/moods/", {
        label: newMoodLabel.trim(),
        emoji: newMoodEmoji.trim(),
        color: "#E5E7EB",
      });
      setSelectedMoodId(data.id);
      setNewMoodLabel("");
      setNewMoodEmoji("");
      setShowMoodForm(false);
      setSuccess("무드 타입이 추가되었습니다.");
      onMoodAdded();
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : "");
      setError(detail ? `무드 추가 실패: ${detail}` : "무드 추가에 실패했습니다.");
    } finally {
      setAddingMood(false);
    }
  };

  return (
    <div className="rounded-soft bg-white p-3 shadow-soft md:p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold tracking-[0.16em] text-gray-500">{currentMonth.format("YYYY년 M월")}</div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            className="rounded-md border border-gray-200 px-2 py-0.5 text-sm text-gray-600 hover:bg-gray-50"
            aria-label="이전 달"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-md border border-gray-200 px-2 py-0.5 text-sm text-gray-600 hover:bg-gray-50"
            aria-label="다음 달"
          >
            {">"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-400">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = d.format("YYYY-MM-DD");
          const list = byDate[key] ?? [];
          const inMonth = d.month() === currentMonth.month();
          const isToday = key === today;
          const isOpen = key === openDate;
          return (
            <div key={key} className="relative">
              <button
                onClick={() => openComposer(key)}
                className={`relative min-h-16 w-full rounded-xl border p-1.5 text-left transition md:min-h-20 ${
                  inMonth ? "border-gray-200" : "border-gray-100 bg-gray-50"
                } ${isToday ? "ring-2 ring-rose-200 border-rose-300" : ""} hover:border-gray-400`}
              >
                <div className="absolute left-1.5 top-1.5 text-[11px] text-gray-500">{d.date()}</div>
                {isToday ? (
                  <div className="absolute right-1.5 top-1.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-semibold text-rose-500">
                    TODAY
                  </div>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-0.5 md:mt-6">
                  {list.slice(0, 3).map((entry) => (
                    <span key={entry.id} className="text-sm">
                      {entry.mood_emoji}
                    </span>
                  ))}
                </div>
                {list.length > 0 ? <div className="mt-0.5 text-[10px] text-gray-400">{list.length}명</div> : null}
              </button>

              {isOpen ? (
                <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                  <p className="mb-2 text-xs font-semibold text-gray-500">{key} 기록</p>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => setSelectedMoodId(mood.id)}
                        className={`rounded-lg border px-2 py-1 text-xs ${
                          selectedMoodId === mood.id ? "border-gray-700 bg-gray-100" : "border-gray-200"
                        }`}
                      >
                        {mood.emoji} {mood.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowMoodForm((prev) => !prev)}
                      className="rounded-lg border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500"
                    >
                      + 추가
                    </button>
                  </div>
                  {showMoodForm ? (
                    <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                      <div className="mb-2 grid grid-cols-[56px_1fr] gap-2">
                        <input
                          value={newMoodEmoji}
                          onChange={(e) => setNewMoodEmoji(e.target.value)}
                          placeholder="🙂"
                          maxLength={4}
                          className="rounded-md border border-gray-200 px-2 py-1 text-center text-sm outline-none focus:border-gray-400"
                        />
                        <input
                          value={newMoodLabel}
                          onChange={(e) => setNewMoodLabel(e.target.value)}
                          placeholder="무드 이름"
                          maxLength={40}
                          className="rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-gray-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addMoodType}
                        disabled={addingMood}
                        className="rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-700 disabled:opacity-40"
                      >
                        {addingMood ? "추가 중..." : "무드 추가"}
                      </button>
                    </div>
                  ) : null}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !saving) {
                        e.preventDefault();
                        void saveForDate(key, true);
                      }
                    }}
                    maxLength={140}
                    placeholder="오늘의 한마디"
                    className="h-20 w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-gray-400"
                  />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => saveForDate(key)}
                      disabled={saving}
                      className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-700 disabled:opacity-40"
                    >
                      {saving ? "저장 중..." : "저장"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenDate(null)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500"
                    >
                      닫기
                    </button>
                  </div>
                  {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
                  {success ? <p className="mt-2 text-xs text-emerald-600">{success}</p> : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
