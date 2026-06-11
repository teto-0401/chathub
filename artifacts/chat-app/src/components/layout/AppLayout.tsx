import { ReactNode } from "react";

export function AppLayout({
  sidebar,
  chatArea,
  rightPanel
}: {
  sidebar: ReactNode;
  chatArea: ReactNode;
  rightPanel?: ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar - fixed width */}
      <div className="w-[280px] shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col z-10">
        {sidebar}
      </div>

      {/* Main Chat Area - flex 1 */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
        {chatArea}
      </div>

      {/* Right Panel - fixed width, optional */}
      {rightPanel && (
        <div className="w-[280px] shrink-0 border-l border-border bg-card flex flex-col z-10 hidden lg:flex">
          {rightPanel}
        </div>
      )}
    </div>
  );
}
