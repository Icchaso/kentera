"use client";

import { MessageCircle, Bell, Building2, Clock, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/layout/page-header";
import { tenant } from "@/lib/data/seed";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="院設定"
        description={`${tenant.name} の基本設定・連携・通知`}
        badge={
          <Badge variant="default" className="text-[10px]">
            {tenant.plan.toUpperCase()} プラン
          </Badge>
        }
      />

      <Tabs defaultValue="clinic">
        <TabsList>
          <TabsTrigger value="clinic">
            <Building2 className="h-4 w-4 mr-1" />
            院情報
          </TabsTrigger>
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-1" />
            営業時間
          </TabsTrigger>
          <TabsTrigger value="line">
            <MessageCircle className="h-4 w-4 mr-1" />
            LINE連携
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-1" />
            通知
          </TabsTrigger>
          <TabsTrigger value="template">
            <FileText className="h-4 w-4 mr-1" />
            カルテ/レシート
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-1" />
            セキュリティ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>院の基本情報</CardTitle>
              <CardDescription>名刺・レシート・ネット予約ページに表示されます</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="院名">
                  <Input defaultValue={tenant.name} />
                </Field>
                <Field label="代表者名">
                  <Input defaultValue="山田 健一" />
                </Field>
                <Field label="電話番号">
                  <Input defaultValue={tenant.phone} />
                </Field>
                <Field label="メール">
                  <Input type="email" defaultValue={tenant.email} />
                </Field>
                <Field label="郵便番号">
                  <Input defaultValue="154-0024" />
                </Field>
                <Field label="住所">
                  <Input defaultValue={tenant.address} />
                </Field>
              </div>
              <Field label="院の紹介文">
                <Textarea
                  rows={3}
                  defaultValue="地域密着の整骨院として、肩こり・腰痛・スポーツ外傷までトータルに対応しています。"
                />
              </Field>
              <div className="flex justify-end">
                <Button>保存する</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>営業時間・予約枠</CardTitle>
              <CardDescription>ネット予約の受付可能時間とベッド数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-3">曜日別の営業時間</p>
                <div className="space-y-2">
                  {["月", "火", "水", "木", "金", "土", "日"].map((d, i) => {
                    const closed = i === 6;
                    return (
                      <div key={d} className="flex items-center gap-3">
                        <Checkbox defaultChecked={!closed} />
                        <span className="w-8 text-sm font-medium">{d}</span>
                        <Input defaultValue={closed ? "" : "09:00"} disabled={closed} className="w-28" />
                        <span className="text-muted-foreground">〜</span>
                        <Input defaultValue={closed ? "" : "20:00"} disabled={closed} className="w-28" />
                        {closed && (
                          <Badge variant="muted" className="text-[10px]">
                            休診
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="ベッド数（同時施術上限）">
                  <Input type="number" defaultValue={tenant.bedCount} />
                </Field>
                <Field label="予約枠（分）">
                  <Input type="number" defaultValue={tenant.reservationSlotMinutes} />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button>保存する</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="line">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>LINE公式アカウント連携</CardTitle>
                  <CardDescription>前日リマインド・再来院促進・ネット予約通知</CardDescription>
                </div>
                <Badge variant="warning" className="text-[10px]">
                  近日公開
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-4 flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">LINE Messaging API に接続</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    LINE Developers で取得した Channel ID / Channel Secret / アクセストークンを入力すると、
                    <br />
                    リマインド配信や再来院促進メッセージが自動で送信されるようになります。
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Channel ID">
                  <Input placeholder="1234567890" disabled />
                </Field>
                <Field label="Channel Secret">
                  <Input type="password" placeholder="••••••••" disabled />
                </Field>
                <Field label="チャネルアクセストークン" className="col-span-2">
                  <Textarea rows={3} placeholder="eyJhbGciOi..." disabled />
                </Field>
                <Field label="Webhook URL" className="col-span-2">
                  <Input value="https://cureboard.app/api/line/webhook/demo" readOnly />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button disabled>接続テスト</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>患者向け自動送信のタイミング</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationRow
                title="予約前日のリマインド"
                desc="前日18時にLINE/メールで送信"
                enabled
              />
              <NotificationRow
                title="予約当日のリマインド"
                desc="予約時刻の3時間前に送信"
                enabled
              />
              <NotificationRow
                title="再来院促進メッセージ"
                desc="最終来院から45日経過で自動送信"
                enabled
              />
              <NotificationRow
                title="誕生日メッセージ"
                desc="お誕生日月の1日にクーポン付きで送信"
                enabled={false}
              />
              <NotificationRow
                title="院長への日報メール"
                desc="毎日21時に本日サマリーを送信"
                enabled
              />
              <div className="flex justify-end">
                <Button>保存する</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>カルテテンプレート</CardTitle>
                <CardDescription>SOAP各項目の定型文</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["初診用テンプレート", "再診用テンプレート", "スポーツ外傷用", "産後ケア用"].map((t) => (
                  <div key={t} className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm">
                    <span>{t}</span>
                    <Button size="sm" variant="ghost">編集</Button>
                  </div>
                ))}
                <Button size="sm" className="w-full" variant="outline">
                  テンプレート追加
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>レシート設定</CardTitle>
                <CardDescription>印字される院情報・ロゴ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="印字する院名">
                  <Input defaultValue={tenant.name} />
                </Field>
                <Field label="フッター文言">
                  <Textarea rows={2} defaultValue="ご来院ありがとうございました。次回のご予約もお待ちしております。" />
                </Field>
                <Field label="ロゴ画像">
                  <Input type="file" disabled />
                </Field>
                <div className="flex justify-end">
                  <Button size="sm" disabled>保存（Phase 1）</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>セキュリティ・アクセス制限</CardTitle>
              <CardDescription>スタッフアカウントの権限管理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SecurityRow title="二段階認証（MFA）" desc="院長のログイン時にSMS/認証アプリで追加認証" enabled={false} />
              <SecurityRow title="IPアドレス制限" desc="院内ネットワークからのみログイン許可" enabled={false} />
              <SecurityRow title="カルテ閲覧ログ" desc="誰がいつどのカルテを見たか記録" enabled />
              <SecurityRow title="自動ログアウト" desc="無操作30分で自動ログアウト" enabled />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function NotificationRow({ title, desc, enabled }: { title: string; desc: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Button variant={enabled ? "default" : "outline"} size="sm">
        {enabled ? "ON" : "OFF"}
      </Button>
    </div>
  );
}

function SecurityRow({ title, desc, enabled }: { title: string; desc: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Badge variant={enabled ? "success" : "muted"} className="text-[10px]">
        {enabled ? "有効" : "無効"}
      </Badge>
    </div>
  );
}
