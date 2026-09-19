export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // pb-24 on every breakpoint: the chat launcher is fixed 20px above the bottom
  // edge and stands 56px tall, so the smaller desktop inset left the last
  // element of a page — often a submit button — sitting underneath it.
  return (
    <div className="min-h-full px-4 py-6 pb-24 lg:px-8 lg:py-8">
      {children}
    </div>
  );
}
