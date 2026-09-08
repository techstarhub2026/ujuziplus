export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full px-4 py-6 pb-20 lg:px-8 lg:py-8 lg:pb-8">
      {children}
    </div>
  );
}
