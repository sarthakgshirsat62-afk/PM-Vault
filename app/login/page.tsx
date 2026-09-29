import type { Metadata } from "next";
import { safeRelativePath } from "@/lib/url";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const next = safeRelativePath(typeof params.next === "string" ? params.next : undefined, "/");
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-ink-muted">We&apos;ll email you a secure, one-time sign-in link.</p>
        {error === "forbidden" && (
          <p role="alert" className="mt-4 rounded-lg border border-line bg-surface-muted p-3 text-sm">
            Your account doesn&apos;t have access to that page.
          </p>
        )}
        {error === "auth" && (
          <p role="alert" className="mt-4 rounded-lg border border-line bg-surface-muted p-3 text-sm">
            That sign-in link is invalid or has expired. Request a new one.
          </p>
        )}
        <div className="mt-6">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
