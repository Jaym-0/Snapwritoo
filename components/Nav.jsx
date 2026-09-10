import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/" className="name">
        Snapwritoo
      </Link>
      <div className="links">
        <Link href="/">Home</Link>
        <Link href="/poems">Poems</Link>
        <Link href="/cricket">Pitch</Link>
        <Link href="/photography">Frames</Link>
      </div>
    </nav>
  );
}
