import { FormEvent, useState } from "react";
import { api } from "../api/client";
import { User } from "../types";

type Props = {
  onSuccess: (user: User) => void;
};

export default function LoginForm({ onSuccess }: Props) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login/", {
        login_id: loginId,
        password,
      });
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      const me = await api.get<User>("/auth/me/");
      onSuccess(me.data);
    } catch {
      setError("로그인에 실패했습니다. 아이디/비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-md rounded-soft bg-white p-8 shadow-soft">
      <h1 className="mb-2 text-center text-3xl tracking-wide text-ink">202-2호 설계실</h1>
      <p className="mb-8 text-center text-sm text-gray-500">팀 전용 로그인</p>
      <form className="space-y-4" onSubmit={submit}>
        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-400"
          placeholder="아이디 (예: mina)"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-gray-400"
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-xl border border-gray-500 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          로그인
        </button>
      </form>
    </div>
  );
}
