import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import Reveal from "@/components/Reveal";
import AvatarPicker from "./_components/AvatarPicker";
import ProfileForm from "./_components/ProfileForm";
import PasswordForm from "./_components/PasswordForm";

export default async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user) {
        return redirect("/");
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-6">
            <div className="space-y-2">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-sm text-grey transition hover:text-clay"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to my learning
                </Link>
                <h1 className="font-serif text-2xl font-semibold md:text-[28px]">
                    Profile
                </h1>
                <p className="text-sm text-grey">
                    Your details and how you appear across the academy.
                </p>
            </div>

            <Reveal>
                <section className="rounded-2xl border border-beige bg-card p-6">
                    <AvatarPicker
                        imageUrl={user.imageUrl}
                        name={user.name}
                        email={user.email}
                    />
                </section>
            </Reveal>

            <Reveal delay={70}>
                <section className="rounded-2xl border border-beige bg-card p-6">
                    <h2 className="mb-5 font-serif text-lg font-semibold">
                        Personal details
                    </h2>
                    <ProfileForm
                        initialData={{
                            name: user.name,
                            dateOfBirth: user.dateOfBirth
                                ? user.dateOfBirth.toISOString().slice(0, 10)
                                : null,
                            phone: user.phone,
                            gender: user.gender,
                            bio: user.bio,
                        }}
                    />
                </section>
            </Reveal>

            <Reveal delay={140}>
                <section className="rounded-2xl border border-beige bg-card p-6">
                    <h2 className="mb-1 font-serif text-lg font-semibold">Security</h2>
                    <p className="mb-5 text-sm text-grey">
                        Signed in as{" "}
                        <span className="font-medium text-ink">{user.email}</span>
                    </p>
                    <PasswordForm hasPassword={!!user.passwordHash} email={user.email} />
                </section>
            </Reveal>
        </div>
    );
}
