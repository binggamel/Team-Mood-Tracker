import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../api/client";
import { AttendanceRecord, User } from "../types";

type Props = {
  me: User;
  users: User[];
  records: AttendanceRecord[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSaved: () => void;
};

export default function AttendanceView({ me, users, records, selectedDate, onDateChange, onSaved }: Props) {
  const nowTime = dayjs().format("HH:mm");
  const myRecord = useMemo(
    () => records.find((r) => r.user === me.id),
    [records, me.id]
  );

  const [checkIn, setCheckIn] = useState(myRecord?.check_in?.slice(0, 5) ?? nowTime);
  const [checkOut, setCheckOut] = useState(myRecord?.check_out?.slice(0, 5) ?? nowTime);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setCheckIn(myRecord?.check_in?.slice(0, 5) ?? nowTime);
    setCheckOut(myRecord?.check_out?.slice(0, 5) ?? nowTime);
    setMessage("");
    setError("");
  }, [myRecord, selectedDate, nowTime]);

  const recordMap = useMemo(() => {
    const map = new Map<number, AttendanceRecord>();
    records.forEach((r) => map.set(r.user, r));
    return map;
  }, [records]);

  const onSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api.post("/entries/attendance/upsert/", {
        date: selectedDate,
        check_in: checkIn,
        check_out: checkOut,
      });
      setMessage("출퇴근 시간이 저장되었습니다.");
      onSaved();
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : "");
      setError(detail ? `저장 실패: ${detail}` : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-soft bg-white p-4 shadow-soft md:p-6">
        <h2 className="text-lg font-semibold text-ink">설계실 출퇴근기록부</h2>
        <p className="mt-1 text-sm text-gray-500">날짜는 기본 오늘로 설정되며, 직접 수정해서 입력할 수 있어요.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="text-sm text-gray-600">
            날짜
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="text-sm text-gray-600">
            출근 시간
            <input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="text-sm text-gray-600">
            퇴근 시간
            <input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-700 disabled:opacity-40"
            >
              {saving ? "저장 중..." : "내 시간 저장"}
            </button>
          </div>
        </div>
        {message ? <p className="mt-2 text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </div>

      <div className="overflow-hidden rounded-soft bg-white shadow-soft">
        <div className="border-b bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">{selectedDate} 팀 기록</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="px-4 py-3 text-left">이름</th>
                <th className="px-4 py-3 text-left">출근</th>
                <th className="px-4 py-3 text-left">퇴근</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const row = recordMap.get(user.id);
                return (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 text-gray-700">{user.name}</td>
                    <td className="px-4 py-3 text-gray-500">{row?.check_in?.slice(0, 5) ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{row?.check_out?.slice(0, 5) ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
