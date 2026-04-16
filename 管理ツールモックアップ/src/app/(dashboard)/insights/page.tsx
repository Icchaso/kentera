"use client";

import * as React from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Send,
  RefreshCw,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { useWorkspace } from "@/hooks/use-workspace-store";
import { tenants, tenantGroup, getKpis } from "@/lib/data/seed";
import { cn, formatCurrency } from "@/lib/utils";

type Insight = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  severity: "positive" | "warning" | "info";
  title: string;
  body: string;
  action?: string;
};

const SAMPLE_QUESTIONS = [
  "離脱傾向の患者への施策は？",
  "今月の売上目標達成にはあと何必要？",
  "指名率が低いスタッフの改善ポイント",
  "メニュー別の収益性を比較したい",
];

export default function InsightsPage() {
  const { currentTenantId } = useWorkspace();
  const kpi = getKpis(currentTenantId);
  const [question, setQuestion] = React.useState("");
  const [analyzing, setAnalyzing] = React.useState(false);

  const currentTenant = tenants.find((t) => t.id === currentTenantId);
  const scopeLabel =
    currentTenantId === "all"
      ? `${tenantGroup.name}（全${tenants.length}店舗）`
      : currentTenant?.name ?? "—";

  const insights: Insight[] = [
    {
      id: "i1",
      icon: TrendingUp,
      severity: "positive",
      title: "指名予約率がグループ平均を6pt上回っています",
      body: `${scopeLabel}の指名予約率は${kpi.designatedRate}%で、業界平均（48%）を大きく上回っています。スタッフの信頼度が高く、リピーター施策が功を奏しています。`,
      action: "スタッフの指名率トップ3へ報奨金制度を検討",
    },
    {
      id: "i2",
      icon: AlertTriangle,
      severity: "warning",
      title: "45日以上来院していない患者が12名います",
      body: "離脱予兆の患者のうち、VIPタグ3名・回数券保有2名を含みます。LINE再来院促進メッセージを個別送信することで、過去データから約35%が来院に繋がる見込みです。",
      action: "一括LINE配信を実行（12名）",
    },
    {
      id: "i3",
      icon: Target,
      severity: "warning",
      title: "今月の売上目標達成が遅れ気味",
      body: `月次目標に対する進捗率が${Math.round((kpi.totalRevenue30 / (currentTenantId === "all" ? 9_700_000 : 4_500_000)) * 100)}%。残り13営業日で日次+¥${Math.round((4_500_000 - kpi.totalRevenue30) / 13).toLocaleString()}が必要。自費メニューへの誘導を強化すると達成可能性が高まります。`,
      action: "骨盤矯正キャンペーンを開始",
    },
    {
      id: "i4",
      icon: Lightbulb,
      severity: "info",
      title: "水曜 17-19時の予約枠に空きが目立ちます",
      body: "時間帯ヒートマップ分析から、水曜夕方のスタッフ配置を見直すか、この枠限定の特別メニュー（ショートケア30分）を導入すると稼働率が改善します。",
      action: "水曜限定メニューを企画",
    },
    {
      id: "i5",
      icon: TrendingDown,
      severity: "warning",
      title: "Web経由の新患コンバージョンが下降傾向",
      body: "過去3ヶ月でWeb経由の新患が-18%。LIFFネット予約のUX改善余地あり。特にメニュー選択画面の離脱率が高いと推測されます。",
      action: "予約導線のA/Bテストを提案",
    },
    {
      id: "i6",
      icon: TrendingUp,
      severity: "positive",
      title: "産後骨盤ケアの症状改善率が全体トップ",
      body: "産後骨盤ケア受講者の痛みスケール改善は平均-4.2で、全メニュー中最高。このエビデンスを院内SNSで発信することで新患獲得に繋がります。",
      action: "症例記事をHPに掲載",
    },
  ];

  const handleAsk = () => {
    if (!question.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="AI経営分析"
        description={`${scopeLabel}・院の状況をAIが自動分析し、改善アクションを提案`}
        badge={
          <Badge variant="default" className="text-[10px] bg-gradient-to-r from-violet-500 to-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Beta
          </Badge>
        }
        actions={
          <Button variant="outline" disabled>
            <RefreshCw className="h-4 w-4" />
            再分析
          </Button>
        }
      />

      <Card className="bg-gradient-to-br from-primary/5 via-card to-sky-500/5 border-primary/30">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-1">本日の経営サマリー（AI生成）</p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {scopeLabel}の直近30日は、売上 <strong>{formatCurrency(kpi.totalRevenue30)}</strong>・
                新患 <strong>{kpi.newPatients30}名</strong>・再来院率 <strong>{kpi.repeatRate}%</strong>。
                指名率が業界平均を上回る一方、<strong>離脱予備軍</strong>への再来院促進が不十分です。
                本日は <strong>LINE一括配信</strong> と <strong>水曜夕方枠の稼働改善</strong> を最優先で着手することを推奨します。
              </p>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
                <span>生成: {new Date("2026-04-16T08:45:00+09:00").toLocaleString("ja-JP")}</span>
                <span>・</span>
                <span>信頼度 高</span>
                <span>・</span>
                <button className="text-primary hover:underline">詳細レポートを開く</button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((ins) => {
          const toneClass =
            ins.severity === "positive"
              ? "border-emerald-500/30 bg-emerald-500/5"
              : ins.severity === "warning"
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-sky-500/30 bg-sky-500/5";
          const iconClass =
            ins.severity === "positive"
              ? "bg-emerald-500 text-white"
              : ins.severity === "warning"
              ? "bg-amber-500 text-white"
              : "bg-sky-500 text-white";
          return (
            <Card key={ins.id} className={cn("border", toneClass)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full shrink-0", iconClass)}>
                    <ins.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold leading-snug">{ins.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{ins.body}</p>
                {ins.action && (
                  <Button size="sm" variant="outline" className="w-full justify-between">
                    {ins.action}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle>AIに質問する</CardTitle>
          </div>
          <CardDescription>経営・患者データに基づいた自然言語での質問が可能（Phase 3）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例：今月の売上を目標達成するにはどうすればいい？"
            rows={3}
          />
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-muted transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAsk} disabled={!question.trim() || analyzing}>
              {analyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  AI に質問
                </>
              )}
            </Button>
          </div>
          {analyzing && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0 animate-pulse" />
              <p className="text-muted-foreground">
                直近90日の予約・カルテ・売上データを解析し、経営指標と照らし合わせて回答を生成しています...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>最近のレポート履歴</CardTitle>
          <CardDescription>AIが自動生成した日次・週次・月次レポート</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {[
              { date: "2026-04-16", type: "日次", title: "本日の経営サマリー" },
              { date: "2026-04-14", type: "週次", title: "先週の患者動態分析（4/8〜4/14）" },
              { date: "2026-04-01", type: "月次", title: "3月度 経営レポート" },
              { date: "2026-03-31", type: "特別", title: "Q1 振り返り：施術メニュー効果分析" },
            ].map((r, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground">{r.date}</p>
                </div>
                <Badge variant="muted" className="text-[10px]">
                  {r.type}
                </Badge>
                <Button variant="ghost" size="sm">
                  閲覧
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
