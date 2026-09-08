"use client";

import Link from "next/link";
import { PLATFORM } from "@/lib/constants";
import { UjuziLogo } from "@/components/brand/UjuziLogo";
export function PublicFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4">
              <UjuziLogo variant="full" theme="on-dark" logoHeight={48} href="/" />
            </div>
            <p className="text-sm text-gray-400">{PLATFORM.tagline}</p>
            <p className="mt-4 text-sm text-gray-400">
              Updates and org plans —{" "}
              <Link href="/contact" className="font-medium text-white hover:underline">
                contact us
              </Link>
            </p>
            <p className="mt-4 text-sm text-gray-400">
              <Link href="/auth/login" className="font-medium text-white hover:underline">
                Log in
              </Link>
              {" · "}
              <Link href="/auth/register" className="font-medium text-white hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses" className="hover:text-white">Courses</Link></li>
              <li><Link href="/programs" className="hover:text-white">Programs</Link></li>
              <li><Link href="/kits" className="hover:text-white">Learning Kits</Link></li>
              <li><Link href="/solutions" className="hover:text-white">Solutions</Link></li>
              <li><Link href="/lab-resources" className="hover:text-white">Lab Resources</Link></li>
              <li><Link href="/open-knowledge" className="hover:text-white">Open Knowledge</Link></li>
              <li><Link href="/projects" className="hover:text-white">Projects</Link></li>
              <li><Link href="/competitions" className="hover:text-white">Competitions</Link></li>
              <li><Link href="/community" className="hover:text-white">Community</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/verify-certificate" className="hover:text-white">Verify Certificate</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TechStar {PLATFORM.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
