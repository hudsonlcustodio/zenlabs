import type { ReactNode } from 'react';

/**
 * Root layout — apps/web, architecture.md §2.1 (Next.js App Router, ADR-0003).
 *
 * Process shell only (P1.02 AC-4). No design system, no Tailwind, no shadcn/ui
 * primitives and no product chrome: `packages/ui` is vendored and owned by
 * P18, and the Portal / Studio / Control surfaces are P15 onward. Adding any of
 * that here would anticipate those epics.
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
