import type { Metadata } from "next";
import { ThankYouPage } from "../../../src/components/public/thank-you/ThankYouPage";
import { publicContent } from "../../../src/generated/public-content";

export const metadata: Metadata = {
  title: "Thank you",
  description: publicContent.thankYou.supporting,
};

export default ThankYouPage;
