export const publicContent = {
  "identity": {
    "publicName": "Active Technical Services",
    "abbreviation": "ATS",
    "mark": "Gift of God",
    "legalFooterName": "Active Technical Services (U) Ltd",
    "tanzaniaBranchLegalName": "Active Technical Services Ltd",
    "shortDescription": "Active Technical Services (ATS) is an East African engineering, civil-construction, fabrication and industrial-services company based in Jinja, Uganda, with a branch in Dodoma, Tanzania.",
    "primaryOperation": {
      "role": "primary_operation",
      "id": "loc-jinja-primary",
      "displayName": "Jinja, Uganda",
      "country": "Uganda",
      "physicalAddress": "Plot 23A, Lubas Road, Jinja, Uganda",
      "postalAddress": "P.O. Box 122, Jinja, Uganda"
    },
    "branch": {
      "role": "branch",
      "id": "loc-dodoma-branch",
      "displayName": "Dodoma, Tanzania",
      "country": "Tanzania",
      "publicLabel": "Tanzania branch",
      "postalAddress": "P.O. Box 551, Dodoma, Tanzania"
    }
  },
  "logo": {
    "headerSrc": "/media/brand/ats-logo-header.png",
    "footerSrc": "/media/brand/ats-logo-footer.png",
    "alt": "Active Technical Services"
  },
  "contacts": {
    "primaryPhone": "+256 782 318 727",
    "primaryPhoneHref": "tel:+256782318727",
    "secondaryPhone": "+256 755 318 727",
    "tanzaniaLocalPhone": "+255 764 306 184",
    "email": "activetechnicalservices@gmail.com"
  },
  "services": [
    {
      "id": "svc-civil-construction",
      "slug": "civil-and-construction",
      "name": "Civil and construction",
      "shortDescription": "Foundations, ground beams, column bases, machine pits and factory building works."
    },
    {
      "id": "svc-mechanical-plant",
      "slug": "mechanical-and-plant-installation",
      "name": "Mechanical and plant installation",
      "shortDescription": "Machine installation, plant assembly and related mechanical engineering."
    },
    {
      "id": "svc-welding-fabrication",
      "slug": "welding-and-fabrication",
      "name": "Welding and fabrication",
      "shortDescription": "On-site and workshop welding, plate work and fabricated structures."
    },
    {
      "id": "svc-structural-warehouses",
      "slug": "structural-steel-and-warehouses",
      "name": "Structural steel and warehouses",
      "shortDescription": "Steel column erection, sheeting, overhead cranes and warehouse buildings."
    },
    {
      "id": "svc-pipework",
      "slug": "pipework",
      "name": "Mild-steel and stainless-steel pipework",
      "shortDescription": "Process pipework in mild steel and stainless steel."
    },
    {
      "id": "svc-tanks",
      "slug": "industrial-storage-tanks",
      "name": "Industrial storage tanks",
      "shortDescription": "Fabrication and installation of oil, storage and process tanks."
    },
    {
      "id": "svc-labour-supply",
      "slug": "labour-supply",
      "name": "Labour supply",
      "shortDescription": "Skilled and semi-skilled manpower for industrial and construction work."
    },
    {
      "id": "svc-insulation",
      "slug": "insulation-and-lagging",
      "name": "Insulation and lagging",
      "shortDescription": "Industrial insulation (lagging)."
    },
    {
      "id": "svc-maintenance-commissioning",
      "slug": "maintenance-and-commissioning",
      "name": "Plant maintenance and commissioning",
      "shortDescription": "Maintenance during plant work and commissioning after completion."
    }
  ],
  "projects": [],
  "projectMedia": [],
  "people": [],
  "latestWork": [],
  "clientNames": [],
  "clientLogos": [],
  "testimonials": [],
  "socialLinks": [],
  "mapCoordinates": [],
  "prices": [],
  "pricingMode": "quote_only",
  "homepage": {
    "heroHeading": "Engineering, fabrication and construction solutions",
    "heroSupporting": "Active Technical Services provides civil, mechanical, fabrication and industrial support from Jinja, Uganda, with a branch in Dodoma, Tanzania.",
    "servicesHeading": "What do we do?",
    "servicesIntroduction": "ATS delivers nine documented engineering and construction services from Jinja, with branch support in Dodoma.",
    "aboutEyebrow": "ATS · Gift of God",
    "aboutHeading": "Active Technical Services",
    "aboutParagraphs": [
      "Active Technical Services (ATS) is an East African engineering, civil-construction, fabrication and industrial-services company based in Jinja, Uganda, with a branch in Dodoma, Tanzania.",
      "ATS supplies skilled labour and delivers welding and fabrication, structural steelwork, plant and machine installation, pipework, insulation, maintenance and commissioning, together with civil foundations, warehouses, factory buildings and production-line bases."
    ],
    "portfolioCtaLabel": "View Portfolio",
    "closingCtaHeading": "Request a quotation",
    "closingCtaSupporting": "Contact Active Technical Services about civil, fabrication or plant-installation work.",
    "contactCtaLabel": "Contact us"
  },
  "contact": {
    "heading": "Contact Us",
    "introduction": "For project enquiries and quotation requests, complete the form below or contact Active Technical Services by email or telephone.",
    "telephoneAlternativeText": "Call Active Technical Services",
    "emailAlternativeText": "Email Active Technical Services",
    "formUnavailableMessage": "Online inquiry submission is being prepared. Please contact us by telephone or email.",
    "jinjaLocationLabel": "Jinja, Uganda",
    "tanzaniaBranchLabel": "Tanzania branch: Dodoma, Tanzania",
    "formRateLimitedMessage": "Too many inquiry attempts. Try again later, or contact us by telephone or email.",
    "formAttachmentUnavailableMessage": "File upload is not available yet. Remove the file to send your message, or contact us by telephone or email.",
    "formInvalidMessage": "Check your details and try again, or contact us by telephone or email.",
    "formInternalErrorMessage": "The inquiry could not be sent. Please try again, or contact us by telephone or email.",
    "formTimeoutMessage": "The request timed out. Please try again, or contact us by telephone or email.",
    "formNetworkErrorMessage": "A network error occurred. Please try again, or contact us by telephone or email.",
    "formSubmittingMessage": "Submitting…"
  },
  "thankYou": {
    "heading": "Thank you",
    "supporting": "We will be in touch.",
    "otherWork": "In the meantime, please take a look at some of our other work.",
    "returnHomeLabel": "Return home",
    "returnContactLabel": "Return to contact"
  },
  "navigation": [
    {
      "label": "Services",
      "href": "/#what-we-do"
    },
    {
      "label": "Portfolio",
      "href": "/portfolio/"
    },
    {
      "label": "Contact",
      "href": "/contact/"
    }
  ],
  "routes": [
    "/",
    "/contact/",
    "/portfolio/",
    "/thank-you/"
  ]
} as const;

export type PublicContent = typeof publicContent;
