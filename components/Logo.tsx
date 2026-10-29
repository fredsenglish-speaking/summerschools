import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo">
      <img src="/logo-mark.png" alt="" width={61} height={48} className="logo-img" />
      <span className="logo-text" lang="en">
        <b>International</b>
        <small>Summer Schools</small>
      </span>
    </Link>
  );
}
