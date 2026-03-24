import { Entry } from "../types";

type Props = {
  date: string;
  entries: Entry[];
};

export default function DateDetailPanel({ date, entries }: Props) {
  return (
    <div className="rounded-soft bg-white p-4 shadow-soft md:p-6">
      <h3 className="mb-3 text-lg font-semibold text-ink">{date}</h3>
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400">기록이 없습니다.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="text-sm font-medium text-gray-700">
                {entry.mood_emoji} {entry.user_name}
              </div>
              <div className="mt-1 text-sm text-gray-500">{entry.comment || "한마디 없음"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
