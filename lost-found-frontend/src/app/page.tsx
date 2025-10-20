import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[70vh] grid place-items-center text-center">
      <div>
        <h1 className="text-3xl font-bold">Lost & Found</h1>
        <p className="text-gray-600 mt-2">Choose a page to get started.</p>
        <div className="mt-6 flex gap-4 justify-center">
          <Link className="underline" href="/items">Items</Link>
          <Link className="underline" href="/post">Post</Link>
          <Link className="underline" href="/admin">Admin</Link>
        </div>
      </div>
    </main>
  );
}

