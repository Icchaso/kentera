import { patients as seedPatients } from "@/lib/data/seed";
import { PatientDetailClient } from "./patient-detail-client";

export function generateStaticParams() {
  return seedPatients.map((p) => ({ id: p.id }));
}

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientDetailClient id={id} />;
}
