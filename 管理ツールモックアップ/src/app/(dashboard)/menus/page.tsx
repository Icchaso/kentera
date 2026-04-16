"use client";

import { Plus, Ticket, Clock, ArrowUpDown, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { menus, coupons } from "@/lib/data/seed";
import { formatCurrency } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  insurance: "保険施術",
  self_pay: "自費施術",
  product: "物販",
};

const CATEGORY_VARIANT: Record<string, "secondary" | "default" | "muted"> = {
  insurance: "secondary",
  self_pay: "default",
  product: "muted",
};

export default function MenusPage() {
  const sorted = [...menus].sort((a, b) => a.sortOrder - b.sortOrder);
  const couponTypes = Array.from(
    new Map(coupons.map((c) => [c.name, { name: c.name, count: c.totalCount, price: c.price }])).values()
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="メニュー管理"
        description={`メニュー ${menus.length}種・回数券テンプレート ${couponTypes.length}種`}
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            メニュー追加
          </Button>
        }
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">メニュー一覧</TabsTrigger>
          <TabsTrigger value="coupons">回数券テンプレート</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>登録メニュー</CardTitle>
              <CardDescription>ドラッグで並び替え（ネット予約ページでの表示順）</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </TableHead>
                    <TableHead>メニュー名</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead className="text-right">料金</TableHead>
                    <TableHead className="text-right">所要時間</TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead className="text-center">表示</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-center text-muted-foreground cursor-move">⋮⋮</TableCell>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>
                        <Badge variant={CATEGORY_VARIANT[m.category]} className="text-[10px]">
                          {CATEGORY_LABEL[m.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(m.price)}</TableCell>
                      <TableCell className="text-right text-sm">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {m.durationMinutes}分
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{m.description ?? "—"}</TableCell>
                      <TableCell className="text-center">
                        {m.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <Eye className="h-3 w-3" />
                            表示
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <EyeOff className="h-3 w-3" />
                            非表示
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">編集</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3 mt-6">
            {(["insurance", "self_pay", "product"] as const).map((cat) => {
              const count = menus.filter((m) => m.category === cat).length;
              const avg = Math.round(menus.filter((m) => m.category === cat).reduce((s, m) => s + m.price, 0) / Math.max(count, 1));
              return (
                <Card key={cat}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[cat]}</p>
                        <p className="text-2xl font-bold">{count}種</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">平均単価</p>
                        <p className="text-sm font-medium">{formatCurrency(avg)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="coupons">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>回数券テンプレート</CardTitle>
                <CardDescription>よく発行する回数券セットの定義</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                テンプレート追加
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {couponTypes.map((c) => (
                  <div
                    key={c.name}
                    className="rounded-lg border border-border p-4 flex items-center gap-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.count}回分・有効180日</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{formatCurrency(c.price)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatCurrency(Math.round(c.price / c.count))}/回</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
