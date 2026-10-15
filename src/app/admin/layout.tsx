import { AppShell } from "@/components/app-shell/app-shell"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell area="admin">{children}</AppShell>
}
