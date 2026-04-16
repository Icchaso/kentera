"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CureBoardLogo } from "@/components/brand/logo";
import { Activity, Calendar, ClipboardList, Coins } from "lucide-react";

const DEMO_EMAIL = "owner@demo.example";
const DEMO_PASSWORD = "demo1234";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => router.push("/dashboard"), 350);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-blue-600 to-sky-500 p-12 text-white">
        <CureBoardLogo tone="light" size={36} />
        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            治療院の経営を、
            <br />
            ひとつの画面で。
          </h1>
          <p className="text-white/90 leading-relaxed">
            予約・カルテ・売上・スタッフ管理まで。
            <br />
            日々の業務も、経営判断も、CureBoard に任せて。
          </p>
          <ul className="space-y-3 pt-4">
            {[
              { icon: Calendar, text: "予約とシフトを直感的に管理" },
              { icon: ClipboardList, text: "電子カルテで患者の経過を追う" },
              { icon: Coins, text: "売上・KPI をリアルタイム可視化" },
              { icon: Activity, text: "LINE連携で再来院を自動促進" },
            ].map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/70">© 2026 ICHI DESIGN — CureBoard mockup</p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <CureBoardLogo size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">ログイン</h2>
            <p className="text-sm text-muted-foreground">デモアカウントが初期入力されています。</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  パスワードをお忘れの方
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">または</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" disabled>
            LINE でログイン（近日公開）
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            アカウントをお持ちでない方は <span className="text-primary">営業担当までお問い合わせ</span>
          </p>
        </div>
      </section>
    </div>
  );
}
