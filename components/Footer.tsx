export default function Footer() {
  return (
    <section className="px-4 md:px-8 bg-accent py-6">
      <footer className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground text-sm">
        <span className="font-semibold text-background text-xl">
          Stadtteil-Match
        </span>
        <p className="text-background font-medium">
          © {new Date().getFullYear()} Stadtteil-Match. All rights reserved.
        </p>
      </footer>
    </section>
  );
}
