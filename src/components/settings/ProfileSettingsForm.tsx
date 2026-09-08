"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ExternalLink, Loader2 } from "lucide-react";
import { updateProfile, type UserProfileData } from "@/lib/actions/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { FormAlert } from "@/components/ui/form-alert";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

export function ProfileSettingsForm({
  userId,
  initial,
}: {
  userId: string;
  initial: UserProfileData;
}) {
  const router = useRouter();
  const { update } = useSession();

  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [fullName, setFullName] = useState(initial.fullName);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [linkedin, setLinkedin] = useState(initial.linkedin ?? "");
  const [github, setGithub] = useState(initial.github ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("avatarUrl", avatarUrl);
    formData.set("fullName", fullName);
    formData.set("bio", bio);
    formData.set("location", location);
    formData.set("website", website);
    formData.set("linkedin", linkedin);
    formData.set("github", github);

    const result = await updateProfile(userId, formData);

    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    if ("profile" in result && result.profile) {
      setFullName(result.profile.fullName);
      setBio(result.profile.bio ?? "");
      setLocation(result.profile.location ?? "");
      setWebsite(result.profile.website ?? "");
      setLinkedin(result.profile.linkedin ?? "");
      setGithub(result.profile.github ?? "");
      setAvatarUrl(result.profile.avatarUrl ?? "");
    }

    setSuccess(true);
    await update();
    router.refresh();
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Profile settings"
        description="Update how you appear across UjuziLab."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href={`/profile/${initial.username}`} target="_blank">
              View public profile
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <Card className="max-w-lg" padding="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <FormAlert variant="error">{error}</FormAlert>}
          {success && <FormAlert variant="success">Profile saved successfully.</FormAlert>}

          <ImageUploadField
            label="Profile photo"
            value={avatarUrl}
            onChange={setAvatarUrl}
            hint="JPG or PNG — shown on your profile and in discussions."
          />

          <Divider label="Basic info" />

          <Input
            name="fullName"
            label="Full name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Username"
            value={initial.username}
            disabled
            hint="Username cannot be changed."
          />

          <Textarea
            name="bio"
            label="Bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell learners about yourself…"
          />

          <Input
            name="location"
            label="Location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Dar es Salaam, Tanzania"
          />

          <Divider label="Links" />

          <Input
            name="website"
            label="Website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yoursite.com"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="linkedin"
              label="LinkedIn"
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/…"
            />
            <Input
              name="github"
              label="GitHub"
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="github.com/…"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
