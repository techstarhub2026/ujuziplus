"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Divider } from "@/components/ui/divider";
import { FormAlert } from "@/components/ui/form-alert";
import { PageHeader } from "@/components/shared/PageHeader";
import { changePassword } from "@/lib/actions/auth";
import { useAppStore } from "@/store/appStore";

export function AccountSettingsForm({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const showToast = useAppStore((s) => s.showToast);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const updatePassword = () => {
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    startTransition(async () => {
      const res = await changePassword(userId, { currentPassword, newPassword });
      if (res.error) showToast(res.error, "error");
      else {
        showToast("Password updated", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Account"
        description="Manage your login credentials and account security."
      />
      <Card className="max-w-lg space-y-5" padding="md">
        <Input label="Email" type="email" value={email} disabled hint="Contact support to change your email address." />

        <Divider label="Password" />

        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          hint="At least 8 characters."
          autoComplete="new-password"
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Button
          disabled={isPending || !currentPassword || !newPassword}
          onClick={updatePassword}
        >
          {isPending ? "Updating…" : "Update password"}
        </Button>

        <Divider />

        <FormAlert variant="info">
          To delete your account, contact{" "}
          <a href="mailto:support@ujuzilab.com" className="font-semibold underline underline-offset-2">
            support@ujuzilab.com
          </a>
          .
        </FormAlert>
      </Card>
    </div>
  );
}
