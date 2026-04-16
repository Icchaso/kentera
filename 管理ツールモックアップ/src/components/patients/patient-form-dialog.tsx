"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePatientsStore } from "@/hooks/use-patients-store";
import { staffList } from "@/lib/data/seed";
import type { Patient, PatientTag } from "@/types";

const schema = z.object({
  lastName: z.string().min(1, "姓は必須です"),
  firstName: z.string().min(1, "名は必須です"),
  lastNameKana: z.string().min(1, "セイは必須です"),
  firstNameKana: z.string().min(1, "メイは必須です"),
  gender: z.enum(["male", "female", "other"]),
  birthDate: z.string().min(1, "生年月日は必須です"),
  phone: z.string().min(1, "電話番号は必須です"),
  email: z.string().email("メールアドレスの形式が不正です").or(z.literal("")).optional(),
  occupation: z.string().optional(),
  referralSource: z.enum(["referral", "flyer", "web", "sns", "walk_in", "other"]),
  preferredStaffId: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const ALL_TAGS: PatientTag[] = ["VIP", "紹介", "保険", "自費", "要観察"];

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient;
}

export function PatientFormDialog({ open, onOpenChange, patient }: PatientFormDialogProps) {
  const { addPatient, updatePatient } = usePatientsStore();
  const [tags, setTags] = React.useState<PatientTag[]>(patient?.tags ?? []);
  const isEdit = Boolean(patient);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      lastName: patient?.lastName ?? "",
      firstName: patient?.firstName ?? "",
      lastNameKana: patient?.lastNameKana ?? "",
      firstNameKana: patient?.firstNameKana ?? "",
      gender: patient?.gender ?? "female",
      birthDate: patient?.birthDate ?? "",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      occupation: patient?.occupation ?? "",
      referralSource: patient?.referralSource ?? "web",
      preferredStaffId: patient?.preferredStaffId ?? "none",
      medicalHistory: patient?.medicalHistory ?? "",
      allergies: patient?.allergies ?? "",
      notes: patient?.notes ?? "",
    },
  });

  React.useEffect(() => {
    if (open) {
      setTags(patient?.tags ?? []);
      form.reset({
        lastName: patient?.lastName ?? "",
        firstName: patient?.firstName ?? "",
        lastNameKana: patient?.lastNameKana ?? "",
        firstNameKana: patient?.firstNameKana ?? "",
        gender: patient?.gender ?? "female",
        birthDate: patient?.birthDate ?? "",
        phone: patient?.phone ?? "",
        email: patient?.email ?? "",
        occupation: patient?.occupation ?? "",
        referralSource: patient?.referralSource ?? "web",
        preferredStaffId: patient?.preferredStaffId ?? "none",
        medicalHistory: patient?.medicalHistory ?? "",
        allergies: patient?.allergies ?? "",
        notes: patient?.notes ?? "",
      });
    }
  }, [open, patient, form]);

  const onSubmit = (values: FormValues) => {
    const { occupation: occupationLabel, ...rest } = values;
    const base = {
      ...rest,
      preferredStaffId: values.preferredStaffId === "none" ? undefined : values.preferredStaffId,
      email: values.email || undefined,
      occupation: undefined,
      occupationLabel: occupationLabel || undefined,
      medicalHistory: values.medicalHistory || undefined,
      allergies: values.allergies || undefined,
      notes: values.notes || undefined,
      tags,
    };

    if (isEdit && patient) {
      updatePatient(patient.id, base);
      toast.success("患者情報を更新しました", { description: `${values.lastName} ${values.firstName} 様` });
    } else {
      addPatient({ ...base, postalCode: undefined, address: undefined, familyGroupId: undefined });
      toast.success("新しい患者を登録しました", { description: `${values.lastName} ${values.firstName} 様` });
    }
    onOpenChange(false);
  };

  const toggleTag = (tag: PatientTag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "患者情報の編集" : "新規患者登録"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "基本情報・既往歴・タグを更新します" : "基本情報を入力してください。後から編集できます。"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="姓" error={form.formState.errors.lastName?.message}>
              <Input {...form.register("lastName")} placeholder="山田" />
            </FormField>
            <FormField label="名" error={form.formState.errors.firstName?.message}>
              <Input {...form.register("firstName")} placeholder="太郎" />
            </FormField>
            <FormField label="セイ" error={form.formState.errors.lastNameKana?.message}>
              <Input {...form.register("lastNameKana")} placeholder="ヤマダ" />
            </FormField>
            <FormField label="メイ" error={form.formState.errors.firstNameKana?.message}>
              <Input {...form.register("firstNameKana")} placeholder="タロウ" />
            </FormField>
            <FormField label="性別">
              <Select value={form.watch("gender")} onValueChange={(v) => form.setValue("gender", v as FormValues["gender"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">女性</SelectItem>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="生年月日" error={form.formState.errors.birthDate?.message}>
              <Input type="date" {...form.register("birthDate")} />
            </FormField>
            <FormField label="電話番号" error={form.formState.errors.phone?.message}>
              <Input {...form.register("phone")} placeholder="090-1234-5678" />
            </FormField>
            <FormField label="メール" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} placeholder="任意" />
            </FormField>
            <FormField label="職業">
              <Input {...form.register("occupation")} placeholder="会社員" />
            </FormField>
            <FormField label="集客経路">
              <Select
                value={form.watch("referralSource")}
                onValueChange={(v) => form.setValue("referralSource", v as FormValues["referralSource"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web検索</SelectItem>
                  <SelectItem value="sns">SNS</SelectItem>
                  <SelectItem value="flyer">チラシ</SelectItem>
                  <SelectItem value="referral">紹介</SelectItem>
                  <SelectItem value="walk_in">飛び込み</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="担当スタッフ">
              <Select
                value={form.watch("preferredStaffId")}
                onValueChange={(v) => form.setValue("preferredStaffId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="未設定" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未設定</SelectItem>
                  {staffList
                    .filter((s) => s.roleLabel !== "受付" && s.role !== "group_owner")
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.displayName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="タグ">
            <div className="flex flex-wrap gap-3 pt-1">
              {ALL_TAGS.map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox checked={tags.includes(t)} onCheckedChange={() => toggleTag(t)} />
                  {t}
                </label>
              ))}
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="既往歴">
              <Textarea rows={2} {...form.register("medicalHistory")} placeholder="椎間板ヘルニア 他" />
            </FormField>
            <FormField label="アレルギー">
              <Textarea rows={2} {...form.register("allergies")} placeholder="花粉、そば 等" />
            </FormField>
          </div>
          <FormField label="特記事項">
            <Textarea rows={2} {...form.register("notes")} placeholder="セルフケア熱心、再来院意欲高い 等" />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit">{isEdit ? "更新する" : "登録する"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
