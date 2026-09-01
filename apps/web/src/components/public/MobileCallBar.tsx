import { publicContent } from "../../generated/public-content";

export function MobileCallBar() {
  return (
    <a
      className="mobile-call-bar"
      href={publicContent.contacts.primaryPhoneHref}
      aria-label={`Call Us Now, ${publicContent.contacts.primaryPhone}`}
    >
      Call Us Now
    </a>
  );
}
