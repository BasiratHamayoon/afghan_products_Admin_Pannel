"use client";

export default function Footer() {
  return (
    <footer className="border-t border-border py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Afghan Products. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Version 1.0.0
        </p>
      </div>
    </footer>
  );
}