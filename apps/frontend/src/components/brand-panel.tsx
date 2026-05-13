interface Props {
  heading: string;
  subtitle: string;
  cta: React.ReactNode;
}

export function BrandPanel({ heading, subtitle, cta }: Props) {
  return (
    <section
      aria-labelledby="brand-heading"
      className="hidden md:flex md:w-2/5 lg:w-1/2 bg-brand flex-col items-center justify-center text-white p-12 gap-6"
    >
      <h2 id="brand-heading" className="text-4xl font-extrabold text-center max-w-lg">
        {heading}
      </h2>
      <p className="text-base text-center max-w-md leading-relaxed">{subtitle}</p>
      <div className="pt-2">{cta}</div>
    </section>
  );
}
