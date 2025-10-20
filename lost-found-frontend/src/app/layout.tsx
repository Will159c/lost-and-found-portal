import "./styles/globals.css";

export const metadata = {
  title: "Lost & Found",
  description: "Simple Next.js frontend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="p-4 bg-white shadow">
          <h1 className="text-xl font-semibold text-center">Lost & Found</h1>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
