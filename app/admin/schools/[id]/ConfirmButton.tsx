"use client";

export function ConfirmButton({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <button type="submit" className="btn danger" onClick={(e) => !confirm(message) && e.preventDefault()}>
      {children}
    </button>
  );
}
