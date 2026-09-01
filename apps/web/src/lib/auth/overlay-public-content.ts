import type { ContentDraftItem, ContentDraftKey } from "@ats/contracts";
import { publicContent } from "../../generated/public-content";

export type PublicContentPreview = {
  homepage: {
    heroHeading: string;
    heroSupporting: string;
    servicesHeading: string;
    servicesIntroduction: string;
    aboutEyebrow: string;
    aboutHeading: string;
    aboutParagraphs: [string, string];
    closingCtaHeading: string;
    closingCtaSupporting: string;
  };
  contact: {
    heading: string;
    introduction: string;
  };
  thankYou: {
    heading: string;
    supporting: string;
  };
};

const CANONICAL: PublicContentPreview = {
  homepage: {
    heroHeading: publicContent.homepage.heroHeading,
    heroSupporting: publicContent.homepage.heroSupporting,
    servicesHeading: publicContent.homepage.servicesHeading,
    servicesIntroduction: publicContent.homepage.servicesIntroduction,
    aboutEyebrow: publicContent.homepage.aboutEyebrow,
    aboutHeading: publicContent.homepage.aboutHeading,
    aboutParagraphs: [
      publicContent.homepage.aboutParagraphs[0],
      publicContent.homepage.aboutParagraphs[1],
    ],
    closingCtaHeading: publicContent.homepage.closingCtaHeading,
    closingCtaSupporting: publicContent.homepage.closingCtaSupporting,
  },
  contact: {
    heading: publicContent.contact.heading,
    introduction: publicContent.contact.introduction,
  },
  thankYou: {
    heading: publicContent.thankYou.heading,
    supporting: publicContent.thankYou.supporting,
  },
};

function valueFor(values: Partial<Record<ContentDraftKey, string>>, key: ContentDraftKey, fallback: string): string {
  return values[key] ?? fallback;
}

export function overlayPublicContent(values: Partial<Record<ContentDraftKey, string>>): PublicContentPreview {
  return {
    homepage: {
      heroHeading: valueFor(values, "homepage.heroHeading", CANONICAL.homepage.heroHeading),
      heroSupporting: valueFor(values, "homepage.heroSupporting", CANONICAL.homepage.heroSupporting),
      servicesHeading: valueFor(values, "homepage.servicesHeading", CANONICAL.homepage.servicesHeading),
      servicesIntroduction: valueFor(
        values,
        "homepage.servicesIntroduction",
        CANONICAL.homepage.servicesIntroduction,
      ),
      aboutEyebrow: valueFor(values, "homepage.aboutEyebrow", CANONICAL.homepage.aboutEyebrow),
      aboutHeading: valueFor(values, "homepage.aboutHeading", CANONICAL.homepage.aboutHeading),
      aboutParagraphs: [
        valueFor(values, "homepage.aboutParagraph1", CANONICAL.homepage.aboutParagraphs[0]),
        valueFor(values, "homepage.aboutParagraph2", CANONICAL.homepage.aboutParagraphs[1]),
      ],
      closingCtaHeading: valueFor(values, "homepage.closingCtaHeading", CANONICAL.homepage.closingCtaHeading),
      closingCtaSupporting: valueFor(
        values,
        "homepage.closingCtaSupporting",
        CANONICAL.homepage.closingCtaSupporting,
      ),
    },
    contact: {
      heading: valueFor(values, "contact.heading", CANONICAL.contact.heading),
      introduction: valueFor(values, "contact.introduction", CANONICAL.contact.introduction),
    },
    thankYou: {
      heading: valueFor(values, "thankYou.heading", CANONICAL.thankYou.heading),
      supporting: valueFor(values, "thankYou.supporting", CANONICAL.thankYou.supporting),
    },
  };
}

export function draftValuesFromItems(drafts: ContentDraftItem[]): Partial<Record<ContentDraftKey, string>> {
  const values: Partial<Record<ContentDraftKey, string>> = {};
  for (const draft of drafts) {
    values[draft.key] = draft.value;
  }
  return values;
}

export function canonicalPublicContentPreview(): PublicContentPreview {
  return overlayPublicContent({});
}
