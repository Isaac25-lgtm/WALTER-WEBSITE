import type { Metadata } from "next";
import { ContactPage } from "../../../src/components/public/contact/ContactPage";
import { publicContent } from "../../../src/generated/public-content";

export const metadata: Metadata = {
  title: "Contact",
  description: publicContent.contact.introduction,
};

export default ContactPage;
