export function RightPanel() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b border-border flex items-center px-4 shrink-0">
        <h3 className="font-medium text-sm text-foreground">Details</h3>
      </div>
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-muted-foreground text-sm">
        <p>Right Panel Content</p>
      </div>
    </div>
  );
}
