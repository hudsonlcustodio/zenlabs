import type { ReactNode } from 'react';
import './globals.css';

/**
 * Root layout — apps/web, architecture.md §2.1 (Next.js App Router, ADR-0003).
 *
 * The first operational surface uses project-owned native CSS and mock data.
 */
export const metadata = {
  title: 'ZENLABS | Laboratório de Clones',
  description: 'ZENLABS | Laboratório de Clones.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
