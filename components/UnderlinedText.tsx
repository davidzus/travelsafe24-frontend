export default function UnderlinedText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="before:content-[''] before:-bottom-0.5 before:absolute before:block before:w-full before:h-1.5 before:rounded-sm inline-block relative before:bg-accent">
      {children}
    </span>
  );
}
