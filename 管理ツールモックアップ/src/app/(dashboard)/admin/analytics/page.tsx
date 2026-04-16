"use client";

import { ShieldCheck, Database, MapPin, Activity, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { cn, formatCurrency } from "@/lib/utils";

const INDUSTRY_AVG = {
  avgTicket: 5_200,
  monthlyRevenue: 2_450_000,
  repeatRate: 68,
  cancelRate: 4.8,
  dropoutRate: 18,
  selfPayRatio: 62,
  avgStaff: 3.1,
};

const BY_TYPE = [
  { type: "整骨院", count: 128, avgTicket: 4_800, avgRev: 2_100_000 },
  { type: "整体院", count: 94, avgTicket: 6_200, avgRev: 2_850_000 },
  { type: "鍼灸院", count: 52, avgTicket: 7_500, avgRev: 3_100_000 },
  { type: "接骨院", count: 67, avgTicket: 4_100, avgRev: 1_900_000 },
];

const BY_AREA = [
  { area: "東京都", clinics: 82, avgRev: 3_250_000 },
  { area: "神奈川県", clinics: 45, avgRev: 2_680_000 },
  { area: "大阪府", clinics: 38, avgRev: 2_750_000 },
  { area: "愛知県", clinics: 31, avgRev: 2_420_000 },
  { area: "福岡県", clinics: 22, avgRev: 2_180_000 },
  { area: "その他", clinics: 123, avgRev: 1_950_000 },
];

const SYMPTOMS = [
  { name: "腰痛", pct: 28, change: +2 },
  { name: "肩こり", pct: 24, change: -1 },
  { name: "膝痛", pct: 12, change: +3 },
  { name: "首痛", pct: 10, change: 0 },
  { name: "頭痛", pct: 8, change: +1 },
  { name: "骨盤ゆがみ", pct: 7, change: +4 },
  { name: "スポーツ外傷", pct: 6, change: -2 },
  { name: "その他", pct: 5, change: 0 },
];

const AGE_DIST = [
  { range: "10代", pct: 4 },
  { range: "20代", pct: 12 },
  { range: "30代", pct: 18 },
  { range: "40代", pct: 22 },
  { range: "50代", pct: 20 },
  { range: "60代", pct: 14 },
  { range: "70代+", pct: 10 },
];

const REFERRAL_SOURCE = [
  { source: "Web検索", pct: 32 },
  { source: "紹介", pct: 28 },
  { source: "SNS", pct: 15 },
  { source: "チラシ", pct: 12 },
  { source: "看板・通りがかり", pct: 8 },
  { source: "その他", pct: 5 },
];

export default function AnalyticsAdminPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="業界ビッグデータ分析"
        description="全院データを匿名化・集約した業界ベンチマーク"
        badge={
          <Badge variant="default" className="text-[10px] bg-slate-900">
            SuperAdmin
          </Badge>
        }
      />

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">匿名化済みデータ</p>
          <p className="text-xs text-muted-foreground mt-1">
            表示されている統計はすべて個人が特定できない形に匿名化・集約されています。
            業界ベンチマークとして、CureBoard を導入する各院に還元されます。
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BenchmarkCard label="業界平均 客単価" value={formatCurrency(INDUSTRY_AVG.avgTicket)} />
        <BenchmarkCard label="業界平均 月商" value={formatCurrency(INDUSTRY_AVG.monthlyRevenue)} />
        <BenchmarkCard label="業界平均 再来院率" value={`${INDUSTRY_AVG.repeatRate}%`} />
        <BenchmarkCard label="業界平均 自費比率" value={`${INDUSTRY_AVG.selfPayRatio}%`} />
      </div>

      <Tabs defaultValue="market">
        <TabsList>
          <TabsTrigger value="market">
            <Database className="h-4 w-4 mr-1" />
            市場データ
          </TabsTrigger>
          <TabsTrigger value="area">
            <MapPin className="h-4 w-4 mr-1" />
            地域別
          </TabsTrigger>
          <TabsTrigger value="patients">
            <Activity className="h-4 w-4 mr-1" />
            患者動態
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Sparkles className="h-4 w-4 mr-1" />
            AIインサイト
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>業種別ベンチマーク</CardTitle>
                <CardDescription>整骨/整体/鍼灸/接骨 別の指標</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {BY_TYPE.map((t) => {
                    const max = Math.max(...BY_TYPE.map((x) => x.avgRev));
                    const pct = Math.round((t.avgRev / max) * 100);
                    return (
                      <li key={t.type} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{t.type}</span>
                          <span className="text-muted-foreground text-xs">
                            {t.count}院 ・ 客単価 {formatCurrency(t.avgTicket)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-sky-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-mono w-24 text-right">{formatCurrency(t.avgRev)}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>よく見られる症状</CardTitle>
                <CardDescription>全カルテから抽出した主訴の分布</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {SYMPTOMS.map((s) => (
                    <li key={s.name} className="flex items-center gap-3 text-sm">
                      <span className="w-24">{s.name}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(s.pct / 30) * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono w-10 text-right">{s.pct}%</span>
                      <span
                        className={cn(
                          "text-xs font-mono w-12 text-right",
                          s.change > 0 ? "text-emerald-600" : s.change < 0 ? "text-rose-600" : "text-muted-foreground"
                        )}
                      >
                        {s.change > 0 ? "+" : ""}
                        {s.change}%
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>集客経路の比率</CardTitle>
                <CardDescription>新患の流入元（全院集約）</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {REFERRAL_SOURCE.map((r) => (
                    <li key={r.source} className="flex items-center gap-3 text-sm">
                      <span className="w-32">{r.source}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky-500 to-primary" style={{ width: `${(r.pct / 35) * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono w-10 text-right">{r.pct}%</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>年齢層の分布</CardTitle>
                <CardDescription>来院患者の年齢構成</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 items-end h-40">
                  {AGE_DIST.map((a) => (
                    <div key={a.range} className="flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-primary to-sky-400 rounded-t"
                        style={{ height: `${(a.pct / 25) * 100}%` }}
                        title={`${a.range}: ${a.pct}%`}
                      />
                      <span className="text-[10px] text-muted-foreground">{a.range}</span>
                      <span className="text-[10px] font-mono">{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="area">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>地域別の平均月商</CardTitle>
              <CardDescription>都道府県別サンプル</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {BY_AREA.map((a) => {
                  const max = Math.max(...BY_AREA.map((x) => x.avgRev));
                  const pct = Math.round((a.avgRev / max) * 100);
                  return (
                    <li key={a.area} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{a.area}</span>
                        <span className="text-xs text-muted-foreground">{a.clinics}院</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-mono w-24 text-right">{formatCurrency(a.avgRev)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">平均LTV</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{formatCurrency(58_000)}</p>
                <p className="text-xs text-muted-foreground mt-1">全院サンプル 12ヶ月</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">平均来院回数</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">9.2<span className="text-sm text-muted-foreground ml-1">回</span></p>
                <p className="text-xs text-muted-foreground mt-1">初診〜離脱までの平均</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">離脱タイミング中央値</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">68<span className="text-sm text-muted-foreground ml-1">日</span></p>
                <p className="text-xs text-muted-foreground mt-1">最終来院からの経過</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid gap-4 lg:grid-cols-2">
            <InsightCard
              title="自費メニューが20%増えた院は再来院率が+8pt"
              body="骨盤矯正・産後ケアを中心に自費メニューを厚くした院では、保険単独時と比べて再来院率が明確に向上。"
              severity="positive"
            />
            <InsightCard
              title="キャンセル率が5%を超えると売上が12%下がる相関"
              body="リマインド通知の自動化を導入している院ではキャンセル率が平均3.1%に抑えられている。"
              severity="warning"
            />
            <InsightCard
              title="LINE連携済の患者は月間2.4倍来院している"
              body="再来院促進メッセージが自動で届く効果。60日超の離脱率も LINE連携患者は45%減少。"
              severity="positive"
            />
            <InsightCard
              title="夕方17-19時の予約枠がボトルネック"
              body="全国的に、会社員の来院希望が集中する時間帯。この時間帯のスタッフ配置で売上が大きく変わる。"
              severity="info"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BenchmarkCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}

function InsightCard({
  title,
  body,
  severity,
}: {
  title: string;
  body: string;
  severity: "positive" | "warning" | "info";
}) {
  const color =
    severity === "positive" ? "border-emerald-500/40 bg-emerald-500/5" : severity === "warning" ? "border-amber-500/40 bg-amber-500/5" : "border-sky-500/40 bg-sky-500/5";
  return (
    <div className={cn("rounded-lg border p-4", color)}>
      <p className="text-sm font-semibold mb-1">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
