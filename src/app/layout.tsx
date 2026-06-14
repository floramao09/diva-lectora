import type { Metadata } from "next";
import "./globals.css";
import { ProfileProvider } from "@/lib/ProfileContext";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Diva Lectora",
  description: "Lee. Sueña. Conversa. Crece.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ProfileProvider>
          <AppShell>{children}</AppShell>
        </ProfileProvider>
      </body>
    </html>
  );
}
