/** Shared Tanzania branch map. Used by the contact page and the homepage. */
import { publicContent } from "../../generated/public-content";

export function LocationMap() {
  const { map, contact } = publicContent;

  return (
    <div className="contact-map">
      <div className="contact-map__frame">
        <iframe
          src={map.embedUrl}
          title={map.title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <p className="contact-map__caption">
        <span>{map.label}</span>
        <a
          className="contact-map__link"
          href={map.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {map.linkLabel}
        </a>
      </p>
      <p className="visually-hidden">{contact.tanzaniaBranchLabel}</p>
    </div>
  );
}
