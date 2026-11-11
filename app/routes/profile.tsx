import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "use-intl";
import { PageHeader } from "~/components/layout/page-header";
import { Button } from "~/components/ui/button";
import { ErrorState } from "~/components/ui/error-state";
import { Skeleton } from "~/components/ui/skeleton";
import { UrlTabs } from "~/components/ui/tabs";
import type { InstructorProfile } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { useMeQuery } from "~/features/auth/api";
import { profileApi, useGetInstructorQuery } from "~/features/profile/api";
import { AccountTab } from "~/features/profile/tabs/account-tab";
import { BioTab } from "~/features/profile/tabs/bio-tab";
import { CertificationsTab } from "~/features/profile/tabs/certifications-tab";
import { ContactTab } from "~/features/profile/tabs/contact-tab";
import { JourneyTab } from "~/features/profile/tabs/journey-tab";
import { PersonalTab } from "~/features/profile/tabs/personal-tab";
import { StatsTab } from "~/features/profile/tabs/stats-tab";
import { websiteHomeUrl } from "~/lib/website-url";
import { store } from "~/store/store";

const TABS = [
  "personal",
  "contact",
  "bio",
  "stats",
  "certifications",
  "journey",
  "account",
] as const;
type Tab = (typeof TABS)[number];

export async function clientLoader() {
  store.dispatch(profileApi.endpoints.getInstructor.initiate(undefined, { subscribe: false }));
  return null;
}

function InstructorTab({
  tab,
  profile,
}: {
  tab: Exclude<Tab, "account">;
  profile: InstructorProfile;
}) {
  switch (tab) {
    case "contact":
      return <ContactTab profile={profile} />;
    case "bio":
      return <BioTab profile={profile} />;
    case "stats":
      return <StatsTab profile={profile} />;
    case "certifications":
      return <CertificationsTab profile={profile} />;
    case "journey":
      return <JourneyTab profile={profile} />;
    default:
      return <PersonalTab profile={profile} />;
  }
}

/**
 * Profile — "What do students see about me, and is it right?" (SRS §4.10, DUS-22…24).
 * Each tab saves on its own; saving makes the change live on the Website (DAC-08).
 */
export default function Profile() {
  const t = useTranslations("profile");
  const tp = useTranslations("pages.profile");
  const locale = useLocale() as Locale;
  const { data: user } = useMeQuery();
  const { data: profile, error, isLoading, refetch } = useGetInstructorQuery();

  return (
    <>
      <PageHeader
        title={tp("title")}
        description={tp("description")}
        actions={
          <Button asChild variant="secondary">
            <a href={websiteHomeUrl(locale)} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" />
              {t("viewOnWebsite")}
            </a>
          </Button>
        }
      />
      <UrlTabs
        label={t("tabsLabel")}
        defaultTab={"personal" as Tab}
        tabs={TABS.map((tab) => ({ value: tab, label: t(`tabs.${tab}`) }))}
      >
        {(tab) => {
          if (tab === "account") return user ? <AccountTab user={user} /> : null;
          if (isLoading)
            return (
              <div aria-hidden="true" className="flex flex-col gap-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            );
          if (error || !profile) return <ErrorState error={error} onRetry={refetch} />;
          return <InstructorTab tab={tab} profile={profile} />;
        }}
      </UrlTabs>
    </>
  );
}
