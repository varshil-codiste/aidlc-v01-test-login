import { SignupForm } from '@/forms/signup-form';
import { BrandPanel } from '@/components/brand-panel';
import { BrandLogo } from '@/components/brand-logo';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      <BrandPanel
        heading="Create your Merchant Profile"
        subtitle="Sign up to start using Zone POS. Use your work email."
        cta={null}
      />
      <section className="flex-1 flex flex-col items-center justify-center p-8 gap-8 bg-neutral-0">
        <BrandLogo />
        <SignupForm />
      </section>
    </main>
  );
}
