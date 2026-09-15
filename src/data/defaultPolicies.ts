import { StudioPoliciesData } from '../types';

export const DEFAULT_POLICIES_DATA: StudioPoliciesData = {
  businessName: 'Sushil Photography Jhar',
  ownerName: 'Sushil Meher – Professional Photographer & Photo Editor',
  location: 'Jhar, Sohela, Bargarh, Odisha, India',
  email: 'sushilmeher947@gmail.com',
  phoneNumbers: ['7608814804', '7735045136'],
  lastUpdated: 'September 14, 2026',
  sections: [
    {
      id: 'sec-terms',
      title: '1. Terms & Conditions',
      slug: 'terms-and-conditions',
      category: 'terms',
      order: 1,
      isPublished: true,
      summary: 'Essential studio terms regarding bookings, payments, event coverage, album design, selection, and final delivery.',
      content: `### 1.1 Booking & Date Confirmation
* A booking is officially confirmed only after the required advance booking payment (typically 30%–50%) is received and verified.
* Date availability is strictly subject to written confirmation by Sushil Photography Jhar.
* Dates cannot be held or reserved without advance payment.

### 1.2 Advance Payment
* Advance payment is required to lock event dates, reserve high-end camera equipment, and assign specialized photography and cinematography crew.
* Payment modes accepted include Direct UPI (7608814804@hdfc), Bank Transfer (HDFC Bank Ltd.), Credit/Debit cards, Net Banking, and studio counter cash.

### 1.3 Cancellation & Rescheduling
* If a customer requests date rescheduling, advance payments can be transferred to an alternate available date with at least 15 days prior written notice.
* Cancellations made within 7 days of the reserved event date are non-refundable as gear and crew are exclusively blocked.
* In the rare event of severe studio emergencies or unforeseen equipment failure, 100% of monies received will be refunded within 3–5 business days.

### 1.4 Photography & Videography Services
* The studio provides professional photography, 4K cinematic wedding films, highlight teasers, traditional video, pre-wedding coverage, drone aerials, and event shoots as specified in the agreed package.
* Standard turnaround for initial edited previews is 7–14 days, and full wedding film/album completion is 3–6 weeks depending on package scope.

### 1.5 Album Design & Customization
* 12x36 luxury wedding albums include custom sheet layout, color grading, page composition, and title typography.
* One round of comprehensive customer revision is included prior to final offset printing and thermal binding.

### 1.6 Photo & Video Selection Process
* Clients are provided private gallery access or digital proofs to select their preferred photos for album printing and final retouching.
* Prompt selection by clients ensures timely album binding and final delivery.

### 1.7 Final Delivery
* Final deliverables include high-resolution master photos, edited printable files, 4K video exports, and luxury albums.
* Final digital delivery or physical album dispatch is released upon clearance of all outstanding account dues.`,
    },
    {
      id: 'sec-usage',
      title: '2. Photo & Video Usage Policy',
      slug: 'photo-video-usage',
      category: 'usage',
      order: 2,
      isPublished: true,
      summary: 'Guidelines on how studio-created media can be used by clients for personal enjoyment and studio showcase rights.',
      content: `### 2.1 Personal & Family Usage
* Clients are granted full non-commercial personal usage rights to share, print, and post their wedding and portrait photos across social media, family albums, and personal archives.
* High-resolution files are suitable for large-format wall frames, canvas prints, and family keepsakes.

### 2.2 Studio Portfolio & Creative Showcase
* Sushil Photography Jhar reserves the right to display selected artistic photographs and video highlights on our official website, verified social channels (Instagram, Facebook, YouTube), and printed studio portfolio for promotional and artistic showcase purposes.
* Clients with special privacy preferences or private wedding requirements may request private non-showcase coverage by submitting a prior written request before the event.`,
    },
    {
      id: 'sec-upload',
      title: '3. Customer Content & Upload Policy',
      slug: 'customer-content-upload',
      category: 'upload',
      order: 3,
      isPublished: true,
      summary: 'Rules for client photo uploads for custom editing, frame printing, and album selection.',
      content: `### 3.1 Permitted Upload Content
* Clients may upload original high-resolution photos (JPG, PNG, HEIC, WEBP) for photo retouching, background enhancement, wedding card designing, and album creation.
* Clients must have rightful ownership or permission to upload the submitted media.

### 3.2 Content Restrictions
* Uploading unlawful, defamatory, infringing, or inappropriate material is strictly prohibited.
* Uploaded files undergo automatic security validation and virus integrity checks.`,
    },
    {
      id: 'sec-privacy',
      title: '4. Privacy Policy',
      slug: 'privacy-policy',
      category: 'privacy',
      order: 4,
      isPublished: true,
      summary: 'How customer personal data, phone numbers, booking details, and media are safely stored and protected.',
      content: `### 4.1 Data We Collect
* Contact Details: Name, mobile number, email address, and event venue location.
* Booking Details: Event dates, package choices, service requirements, and guest count.
* Payment Verification: Transaction reference numbers, UTR IDs, payment date, and invoice logs. We NEVER collect or store UPI PINs or card CVVs.

### 4.2 How We Use Your Information
* To manage and confirm your photoshoot bookings and coordinate shoot logistics.
* To generate official tax invoices, digital receipts, and booking vouchers.
* To communicate shoot status, editing progress, and album delivery tracking.

### 4.3 Data Protection & Storage
* All customer booking details and appointment records are securely stored with cloud infrastructure (including Supabase Cloud Database with 256-bit encryption).
* Customer personal information is never sold, rented, or shared with unauthorized third-party advertisers.`,
    },
    {
      id: 'sec-payment',
      title: '5. Payment Policy',
      slug: 'payment-policy',
      category: 'payment',
      order: 5,
      isPublished: true,
      summary: 'Accepted payment methods, advance milestones, UPI guidelines, and bank transfer verification.',
      content: `### 5.1 Accepted Payment Options
* Direct UPI (Google Pay, PhonePe, Paytm, BHIM, Cred) via UPI ID: **7608814804@hdfc**
* Direct Bank Transfer (NEFT / RTGS / IMPS) to **HDFC BANK LTD.**
* Credit Cards, Debit Cards, Net Banking, and digital wallets.
* Studio Counter Cash / Offline payment with official receipt.

### 5.2 Payment Milestones
* **Advance Deposit (30%–50%):** At the time of booking to confirm and lock the event date.
* **Event Day Stage:** Part payment upon completion of live event shooting.
* **Final Balance:** Upon final album approval prior to physical dispatch or full 4K film master download.

### 5.3 Bank Transfer & UPI Verification
* After making a direct transfer or UPI payment, customers must provide the 12-digit transaction UTR / reference number via our Payment Portal or WhatsApp (+91 7608814804) to receive an instant verified digital e-receipt.`,
    },
    {
      id: 'sec-refund',
      title: '6. Refund & Rescheduling Policy',
      slug: 'refund-policy',
      category: 'refund',
      order: 6,
      isPublished: true,
      summary: 'Clear guidelines on deposit refunds, date transfers, and studio commitments.',
      content: `### 6.1 Date Rescheduling
* We understand that family circumstances and dates may shift. Date changes requested with at least 15 days written notice will have 100% of the advance credited toward the new available date.

### 6.2 Cancellation Policy
* Cancellations submitted more than 15 days before the event: 50% of the advance deposit is refundable or 100% convertible into studio credit for photo framing, album prints, or future shoots.
* Cancellations within 7 days of event: Non-refundable due to blocked dates, declined inquiries, and reserved crew.

### 6.3 Studio Service Guarantee
* If the studio is unable to deliver coverage due to unforeseen equipment malfunction or extraordinary studio emergencies, a 100% full refund of all amounts paid is guaranteed within 3–5 working days.`,
    },
    {
      id: 'sec-security',
      title: '7. Website & Account Security',
      slug: 'website-account-security',
      category: 'security',
      order: 7,
      isPublished: true,
      summary: 'Security standards protecting our online platform, customer logins, and financial interactions.',
      content: `### 7.1 Secure Connection
* The Sushil Photography website employs modern HTTPS / TLS 1.3 encryption across all browsing, order tracking, and media viewing sessions.

### 7.2 Zero Credential Retention
* Our platform strictly adheres to RBI and international security norms. We never store, process, or view client UPI PINs, banking passwords, or card CVVs. All gateway transactions are processed via PCI-DSS compliant payment infrastructure.`,
    },
    {
      id: 'sec-gallery',
      title: '8. Private Wedding Gallery Policy',
      slug: 'private-wedding-gallery',
      category: 'gallery',
      order: 8,
      isPublished: true,
      summary: 'Access control, download validity, and security for private client wedding galleries.',
      content: `### 8.1 Dedicated Client Access
* Every couple receives an exclusive Order ID and access credential to view their private wedding highlights, full photo gallery, and album sheet drafts.

### 8.2 Media Cloud Retention
* Client galleries remain hosted in active cloud storage for a minimum of 12 months after delivery, with cloud backup archives maintained for peace of mind.`,
    },
    {
      id: 'sec-ip',
      title: '9. Intellectual Property Rights',
      slug: 'intellectual-property',
      category: 'ip',
      order: 9,
      isPublished: true,
      summary: 'Copyright ownership and trademark protection for studio creative works and branding.',
      content: `* All photographs, cinematic compositions, video edits, website designs, logos, and custom album templates created by Sushil Photography Jhar are the copyrighted intellectual property of Sushil Meher.
* Clients enjoy unrestricted personal printing and social sharing rights. Commercial resale or third-party advertising without prior written consent is prohibited.`,
    },
    {
      id: 'sec-thirdparty',
      title: '10. Third-Party Services & Integrations',
      slug: 'third-party-services',
      category: 'thirdparty',
      order: 10,
      isPublished: true,
      summary: 'Usage of verified third-party tools such as Supabase Database, Razorpay Gateway, and HDFC Bank infrastructure.',
      content: `* We utilize trusted industry services such as Supabase Cloud Database for real-time booking synchronization and secure cloud storage, Razorpay / HDFC UPI for instant banking settlements, and cloud CDNs for fast high-resolution photo rendering.
* Third-party services comply with their respective data protection and security certifications.`,
    },
    {
      id: 'sec-forcemajeure',
      title: '11. Service Interruptions & Force Majeure',
      slug: 'force-majeure',
      category: 'forcemajeure',
      order: 11,
      isPublished: true,
      summary: 'Protocols regarding natural events, venue restrictions, electrical outages, or extreme weather.',
      content: `* The studio shall not be held liable for coverage delays caused by force majeure events including extreme weather, floods, earthquakes, regional power outages, road closures, or venue-imposed restrictions.
* In any such event, the studio will make every professional effort to adapt and continue shooting safely or reschedule coverage.`,
    },
    {
      id: 'sec-responsibilities',
      title: '12. Customer Responsibilities',
      slug: 'customer-responsibilities',
      category: 'responsibilities',
      order: 12,
      isPublished: true,
      summary: 'Client duties regarding shoot schedule, venue permissions, and timely photo selection.',
      content: `* **Schedule Coordination:** Inform the photography team of key ceremony timing (Baraat arrival, Varmala, Mandap muhurat, Reception stage).
* **Venue Clearances:** Obtain necessary venue permissions for flash photography and drone aerial filming where applicable.
* **Selection Deadlines:** Submit preferred album photos within 30 days of receiving initial proofs for expedited album binding.`,
    },
    {
      id: 'sec-updates',
      title: '13. Policy Updates & Modifications',
      slug: 'policy-updates',
      category: 'terms',
      order: 13,
      isPublished: true,
      summary: 'Notice of periodic reviews and updates to studio terms and policies.',
      content: `* Sushil Photography Jhar reserves the right to periodically update these policies to reflect regulatory changes or service enhancements.
* The "Last Updated" date at the top of this document indicates when the latest revisions took effect.`,
    },
    {
      id: 'sec-contact',
      title: '14. Contact for Policy Questions',
      slug: 'contact-for-policy-questions',
      category: 'terms',
      order: 14,
      isPublished: true,
      summary: 'Official studio communication channels for any legal, policy, booking, or privacy inquiries.',
      content: `For any questions, clarifications, or custom agreement requests regarding our Terms & Conditions or Policies, please reach out directly:

* **Studio:** Sushil Photography Jhar
* **Owner & Chief Artist:** Sushil Meher – Professional Photographer & Photo Editor
* **Location:** Jhar, Sohela, Bargarh District, Odisha, India – 768033
* **Primary Phone:** [+91 7608814804](tel:7608814804)
* **Secondary Phone / WhatsApp:** [+91 7735045136](tel:7735045136)
* **Official Email:** [sushilmeher947@gmail.com](mailto:sushilmeher947@gmail.com)`,
    },
  ],
};
