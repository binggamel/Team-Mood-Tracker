import { FormEvent, useMemo, useState } from "react";
import { MoodType } from "../types";
import { api } from "../api/client";

type Props = {
  selectedDate: string;
  moods: MoodType[];
  onSaved: () => void;
};

export default function EntryComposer({ selectedDate, moods, onSaved }: Props) {
  const [moodType, setMoodType] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => moodType !== null && !saving, [moodType, saving]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!moodType) return;
    setSaving(true);
    try {
      await api.post("/entries/upsert/", {
        date: selectedDate,
        mood_type: moodType,
        comment,
      });
      setComment("");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-soft bg-white p-4 shadow-soft md:p-6">
      <h3 className="mb-3 text-lg font-semibold text-ink">오늘 기록하기 ({selectedDate})</h3>
      <div className="mb-3 flex flex-wrap gap-2">
        {moods.map((m) => (
          <button
            type="button"
            key={m.id}
            onClick={() => setMoodType(m.id)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              moodType === m.id ? "border-gray-700 bg-gray-100" : "border-gray-200"
            }`}
          >
            <span className="mr-1">{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>
      <textarea
        className="h-24 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-gray-400"
        maxLength={140}
        placeholder="오늘의 한마디를 남겨보세요."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        disabled={!canSubmit}
        type="submit"
        className="mt-3 rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-700 disabled:opacity-40"
      >
        {saving ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
