import { publicContent } from "../../../generated/public-content";

export function ContactIntroduction() {
  const { contact } = publicContent;
  return (
    <div className="contact-intro">
      <h1>{contact.heading}</h1>
      <p>{contact.introduction}</p>
    </div>
  );
}
