"use client";

import * as React from "react";
import { Hash, Lock, Megaphone, BookOpen, Pin, Send, Paperclip, AtSign, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { chatChannels, chatMessages, type ChatMessage } from "@/lib/data/messages";
import { staffList, tenants } from "@/lib/data/seed";
import { useWorkspace } from "@/hooks/use-workspace-store";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  hash: Hash,
  lock: Lock,
  megaphone: Megaphone,
  book: BookOpen,
};

function formatRelative(iso: string): string {
  const now = new Date("2026-04-16T09:00:00+09:00").getTime();
  const then = new Date(iso).getTime();
  const min = Math.floor((now - then) / 60_000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  return `${day}日前`;
}

export default function MessagesPage() {
  const { currentTenantId, actingStaffId } = useWorkspace();
  const actingStaff = staffList.find((s) => s.id === actingStaffId);

  const visibleChannels = React.useMemo(() => {
    return chatChannels.filter((c) => {
      if (actingStaff && !c.memberIds.includes(actingStaff.id)) return false;
      if (currentTenantId !== "all" && c.tenantId && c.tenantId !== currentTenantId) return false;
      return true;
    });
  }, [currentTenantId, actingStaff]);

  const [activeId, setActiveId] = React.useState<string>(visibleChannels[0]?.id ?? chatChannels[0].id);
  React.useEffect(() => {
    if (!visibleChannels.find((c) => c.id === activeId)) {
      setActiveId(visibleChannels[0]?.id ?? chatChannels[0].id);
    }
  }, [visibleChannels, activeId]);

  const active = chatChannels.find((c) => c.id === activeId) ?? chatChannels[0];
  const messages = chatMessages
    .filter((m) => m.channelId === active.id)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  const pinned = messages.filter((m) => m.pinned);
  const thread = messages.filter((m) => !m.pinned);

  const [draft, setDraft] = React.useState("");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="院内メッセージ"
        description="スタッフ間の連絡・ノウハウ共有・店舗運営チャット"
        actions={
          <Button variant="outline" disabled>
            <Plus className="h-4 w-4" />
            チャンネル作成
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[260px_1fr] min-h-[600px]">
          {/* チャンネル一覧 */}
          <aside className="border-r border-border bg-muted/30">
            <div className="p-3 border-b border-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">チャンネル</p>
              <ul className="space-y-0.5">
                {visibleChannels.map((c) => {
                  const Icon = ICON_MAP[c.icon];
                  const branch = c.tenantId ? tenants.find((t) => t.id === c.tenantId)?.branchName : null;
                  const lastMsg = chatMessages
                    .filter((m) => m.channelId === c.id)
                    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setActiveId(c.id)}
                        className={cn(
                          "w-full text-left rounded-md px-2.5 py-2 transition-colors",
                          c.id === activeId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-sm font-medium truncate">{c.name}</span>
                          {branch && (
                            <span className={cn("text-[9px] ml-auto", c.id === activeId ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {branch}
                            </span>
                          )}
                        </div>
                        {lastMsg && (
                          <p className={cn("text-[11px] truncate mt-0.5", c.id === activeId ? "text-primary-foreground/75" : "text-muted-foreground")}>
                            {lastMsg.body.slice(0, 30)}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">DM（近日）</p>
              <p className="text-xs text-muted-foreground px-1">個別メッセージ機能は Phase 1 で公開予定</p>
            </div>
          </aside>

          {/* メッセージエリア */}
          <div className="flex flex-col min-h-[600px]">
            <header className="px-4 sm:px-6 py-3 border-b border-border flex items-center gap-2 flex-wrap">
              {(() => {
                const Icon = ICON_MAP[active.icon];
                return <Icon className="h-4 w-4 text-muted-foreground shrink-0" />;
              })()}
              <div className="min-w-0">
                <p className="font-semibold text-sm">{active.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{active.description}</p>
              </div>
              <Badge variant="muted" className="text-[10px] ml-auto">
                {active.memberIds.length}名
              </Badge>
              {active.isPrivate && (
                <Badge variant="warning" className="text-[10px]">
                  <Lock className="h-2.5 w-2.5 mr-0.5" />
                  非公開
                </Badge>
              )}
            </header>

            {pinned.length > 0 && (
              <div className="px-4 sm:px-6 py-2 bg-amber-50 border-b border-amber-200">
                <div className="flex items-start gap-2 text-xs">
                  <Pin className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-amber-700">ピン留め</p>
                    {pinned.map((m) => (
                      <p key={m.id} className="text-amber-900 leading-relaxed">
                        {m.body}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-4 space-y-4">
              {thread.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">まだメッセージはありません</p>
              )}
              {thread.map((m) => {
                const sender = staffList.find((s) => s.id === m.senderId);
                const isSelf = m.senderId === actingStaffId;
                return <MessageBubble key={m.id} message={m} sender={sender} isSelf={isSelf} />;
              })}
            </div>

            <div className="border-t border-border p-3 sm:p-4">
              <div className="rounded-md border border-border bg-card focus-within:border-primary transition-colors">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`#${active.name} にメッセージを投稿`}
                  rows={2}
                  className="border-0 focus-visible:ring-0 shadow-none"
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
                      <Paperclip className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
                      <AtSign className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button size="sm" disabled={!draft.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    送信
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                💡 /ai [質問] でAIアシスタントに質問できます（Phase 3）
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({
  message,
  sender,
  isSelf,
}: {
  message: ChatMessage;
  sender?: (typeof staffList)[number];
  isSelf: boolean;
}) {
  if (!sender) return null;
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback
          className="text-xs"
          style={{ backgroundColor: sender.color + "22", color: sender.color }}
        >
          {sender.displayName.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-sm font-semibold">{sender.displayName}</p>
          <span className="text-[10px] text-muted-foreground">
            {sender.roleLabel ?? sender.role}
          </span>
          <span className="text-[10px] text-muted-foreground">{formatRelative(message.sentAt)}</span>
          {isSelf && <Badge variant="muted" className="text-[9px] py-0">自分</Badge>}
        </div>
        <p className="text-sm leading-relaxed mt-0.5 whitespace-pre-wrap">{message.body}</p>
      </div>
    </div>
  );
}
