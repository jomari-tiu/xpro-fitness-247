import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Sign in" }

export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-xp-ink text-xp-bone lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/images/gallery-dumbbells.jpg" alt="" fill priority sizes="55vw" className="object-cover object-[50%_60%]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,9,.95),rgba(10,10,9,.3)_60%,rgba(10,10,9,.6))]" />
        <div className="absolute right-12 bottom-12 left-12 flex flex-col gap-4">
          <span className="xp-eyebrow text-xp-amber">XPRO Fitness 24/7 · General Trias</span>
          <h1 className="xp-display text-[clamp(48px,6vw,96px)] leading-[.86] tracking-[-.03em]">
            Train <span className="xp-gradient-text">any</span>
            <br />
            hour.
          </h1>
          <p className="max-w-[40ch] text-lg text-xp-stone">
            One login for gym staff, trainers and members. Manage memberships, plans, sessions and progress.
          </p>
        </div>
      </div>
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Link href="/" className="xp-eyebrow self-start text-xp-smoke hover:text-xp-amber">
          ← Back to site
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 py-10">
          <div className="flex flex-col gap-2">
            <h2 className="xp-display text-4xl leading-none">Sign in</h2>
            <p className="text-sm text-xp-ash">Use one of the demo accounts below. No backend yet: data is saved in this browser.</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
