import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/useAuth";
import { useToast, getErrorMessage } from "@/components/Toast";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("admin@serverembassy.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast("Signed in", "success");
      navigate("/");
    } catch (e) {
      toast(getErrorMessage(e, "Login failed"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <Logo />
        <h1 className="mt-4 text-2xl font-bold text-navy">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Sign in with your staff account.</p>
        <label className="mt-5 block text-sm">
          Email
          <input
            required
            type="email"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm">
          Password
          <input
            required
            type="password"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-brand py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
