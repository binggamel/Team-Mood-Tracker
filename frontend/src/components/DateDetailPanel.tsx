import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { Entry } from "../types";

type Props = {
  date: string;
  entries: Entry[];
  onLiked: () => void;
};

type LikeState = {
  count: number;
  likedByMe: boolean;
  saving: boolean;
};

export default function DateDetailPanel({ date, entries, onLiked }: Props) {
  const [likeMap, setLikeMap] = useState<Record<number, LikeState>>({});

  const initializedLikeMap = useMemo(() => {
    const next: Record<number, LikeState> = {};
    entries.forEach((entry) => {
      next[entry.id] = {
        count: entry.like_count ?? 0,
        likedByMe: entry.liked_by_me ?? false,
        saving: false,
      };
    });
    return next;
  }, [entries]);

  useEffect(() => {
    setLikeMap(initializedLikeMap);
  }, [initializedLikeMap]);

  const toggleLike = async (entryId: number) => {
    const current = likeMap[entryId];
    if (!current || current.saving) return;

    const optimistic = {
      count: current.likedByMe ? Math.max(0, current.count - 1) : current.count + 1,
      likedByMe: !current.likedByMe,
      saving: true,
    };

    setLikeMap((prev) => ({ ...prev, [entryId]: optimistic }));

    try {
      const { data } = await api.post<{ like_count: number; liked_by_me: boolean }>(`/entries/${entryId}/like/`);
      setLikeMap((prev) => ({
        ...prev,
        [entryId]: {
          count: data.like_count,
          likedByMe: data.liked_by_me,
          saving: false,
        },
      }));
      onLiked();
    } catch {
      setLikeMap((prev) => ({
        ...prev,
        [entryId]: {
          ...current,
          saving: false,
        },
      }));
    }
  };

  return (
    <div className="rounded-soft bg-white p-4 shadow-soft md:p-6">
      <h3 className="mb-3 text-lg font-semibold text-ink">{date}</h3>
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400">기록이 없습니다.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-gray-700">
                  {entry.mood_emoji} {entry.user_name}
                </div>
                <button
                  type="button"
                  onClick={() => toggleLike(entry.id)}
                  disabled={likeMap[entry.id]?.saving}
                  className={`rounded-lg border px-2 py-1 text-xs ${
                    likeMap[entry.id]?.likedByMe
                      ? "border-rose-300 bg-rose-50 text-rose-500"
                      : "border-gray-200 text-gray-500"
                  } disabled:opacity-50`}
                >
                  붐업👍 {likeMap[entry.id]?.count ?? entry.like_count ?? 0}
                </button>
              </div>
              <div className="mt-1 text-sm text-gray-500">{entry.comment || "한마디 없음"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
