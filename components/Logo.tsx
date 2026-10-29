import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo">
      <img src="/logo-mark.png" alt="" width={84} height={40} className="logo-img" />
      <span>
        International
        <br />
        Summer Schools in Baku
      </span>
    </Link>
  );
}
