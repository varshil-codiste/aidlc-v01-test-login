'use client';
import Link from 'next/link';
import { BrandPanel } from '@/components/brand-panel';
import { BrandLogo } from '@/components/brand-logo';
import { OutlinedButton } from '@/components/outlined-button';
import { SignInForm } from '@/forms/sign-in-form';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      <BrandPanel
        heading="Become A Merchant"
        subtitle="Register to become a Merchant on the Zone POS platform. Register and upload all necessary requirements without leaving your comfort zone."
        cta={
          <Link href="/signup" passHref legacyBehavior>
            <OutlinedButton data-testid="landing-signup-cta" as-child="true">
              Sign Up
            </OutlinedButton>
          </Link>
        }
      />
      <section className="flex-1 flex flex-col items-center justify-center p-8 gap-8 bg-neutral-0">
        <BrandLogo data-testid="landing-logo" />
        <SignInForm />
      </section>
    </main>
  );
}
