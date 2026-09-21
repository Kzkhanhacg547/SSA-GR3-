import { Card, PageTitle } from "@/components/ui";
import { AppNav } from "@/components/AppNav";

export default function Stub({ title }: { title?: string }) {
  return (
    <div className="space-y-4">
      <AppNav />
      <PageTitle title={title ?? "Coming in its phase"} subtitle="This route exists so navigation never hits a dead button." />
      <Card><p className="text-sm">NOT IMPLEMENTED in Phase 1. Later phases will replace this stub with real database-backed functionality.</p></Card>
    </div>
  );
}
