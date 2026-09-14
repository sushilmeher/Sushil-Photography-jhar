import { ServiceItem, PackageItem, ReviewItem, GalleryItem, Order, Booking } from '../types';

export const BUSINESS_INFO = {
  name: 'Sushil Photography Jhar',
  tagline: 'Capturing Your Beautiful Moments',
  subtitle: 'Professional Photography, Cinematography, Album Design & Photo Editing',
  owner: 'Sushil Meher',
  ownerRole: 'Founder & Lead Artist',
  founderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  location: 'Jhar, Sohela, Bargarh, Odisha, India',
  phone: '7608814804',
  secondaryPhone: '7735045136',
  email: 'sushilphotographyjhar@gmail.com',
  website: 'sushilphotographyjhar.com',
  instagram: 'https://instagram.com/sushil_photography_jhar',
  facebook: 'https://facebook.com/sushilphotographyjhar',
  youtube: 'https://youtube.com',
  whatsappNumber: '917608814804',
  whatsappLink: 'https://wa.me/917608814804?text=Hello%20Sushil%20Photography%20Jhar,%20I%20would%20like%20to%20inquire%20about%20your%20services.',
  googleMapUrl: 'https://maps.google.com/?q=Sohela+Bargarh+Odisha',
  workingHours: '9:00 AM - 9:00 PM (Monday - Sunday)',
};

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'wedding-photography',
    title: 'Wedding Photography',
    category: 'photography',
    shortDescription: 'Cinematic, regal wedding coverage capturing all sacred rituals, laughter and emotional moments.',
    fullDescription: 'Comprehensive full-day coverage with dual full-frame mirrorless gear, cinematic lighting, and dedicated ritual coverage designed to preserve your most sacred family milestone forever.',
    startingPrice: 5000,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    features: ['High-Res Digital Delivery', 'Full Ceremony & Reception', 'Master Color Grading', 'Drone Aerial Highlights']
  },
  {
    id: 'wedding-cinematography',
    title: 'Wedding Cinematography',
    category: 'cinematography',
    shortDescription: 'Hollywood-style 4K cinematic wedding films and emotional teaser highlight reels.',
    fullDescription: 'Our cinematic film crew captures your wedding like a motion picture film with 4K 60fps slow motion, gimbal stabilization, wireless audio recording, and custom sound design.',
    startingPrice: 8000,
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
    features: ['4K Ultra HD Teaser', 'Full Length Feature Film', 'Gimbal & Drone Shots', 'Licensed Soundtrack Score']
  },
  {
    id: 'pre-wedding-photography',
    title: 'Pre-Wedding Photography',
    category: 'photography',
    shortDescription: 'Romantic outdoor & heritage location shoots celebrating your unique love story.',
    fullDescription: 'Creative outdoor couple shoot across scenic locations in Odisha (waterfalls, historic temples, rivers, and sunset points) with artistic costume guidance and cinematic lighting.',
    startingPrice: 4000,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    features: ['Multiple Outfit Changes', 'Scenic Outdoor Locations', 'Signature Retouched Portraits', 'Instagram Reel Ready']
  },
  {
    id: 'birthday-photography',
    title: 'Birthday Photography',
    category: 'photography',
    shortDescription: 'Vibrant and joyful coverage of first birthdays, kids parties, and milestone anniversaries.',
    fullDescription: 'Capture your little one’s precious giggles, cake smashing, family cheers, and party excitement with vibrant, candid event photography.',
    startingPrice: 2500,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    features: ['Cake Smash Portraits', 'Party Decor & Candids', 'Instant Digital Gallery', 'Custom Photo Book Option']
  },
  {
    id: 'event-photography',
    title: 'Event Photography',
    category: 'photography',
    shortDescription: 'Professional coverage for cultural gatherings, corporate launches, thread ceremonies, and pujas.',
    fullDescription: 'Crisp, high-definition documentation for Upanayana (thread ceremony), corporate meets, baby showers, school functions, and public festivals across Bargarh and Western Odisha.',
    startingPrice: 3000,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    features: ['Punctual Coverage', 'Stage & Audience Shots', 'Rapid Turnaround Delivery', 'Batch Digital Download']
  },
  {
    id: 'traditional-photography',
    title: 'Traditional Photography',
    category: 'photography',
    shortDescription: 'Classic stage, family portraits, and all traditional customs captured with crisp clarity.',
    fullDescription: 'Essential traditional photography focusing on all family members, stage portraits with guests, ritual details, and traditional Odia customs with perfect lighting.',
    startingPrice: 3500,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    features: ['Every Guest Covered', 'Sharp Stage Group Shots', 'Custom Album Ready', 'Even Studio Strobe Lighting']
  },
  {
    id: 'candid-photography',
    title: 'Candid Photography',
    category: 'photography',
    shortDescription: 'Unposed, authentic smiles, joyful tears, and real heartfelt moments frozen in time.',
    fullDescription: 'We blend into the background with telephoto prime lenses to catch genuine emotions, tender glances, sudden laughter, and soulful interactions without disturbing the atmosphere.',
    startingPrice: 4500,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    features: ['Prime Lens Bokeh', 'Natural Ambient Light', 'Zero Forced Poses', 'High Emotional Storytelling']
  },
  {
    id: 'photo-editing',
    title: 'Photo Editing',
    category: 'editing',
    shortDescription: 'Precision exposure correction, tone adjustment, and creative color grading.',
    fullDescription: 'From raw camera file processing to warm film looks and high dynamic range optimization, our studio editing turns raw captures into art.',
    startingPrice: 20,
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
    features: ['Lightroom RAW Processing', 'Exposure & White Balance', 'Noise Reduction', 'Bulk Batch Delivery']
  },
  {
    id: 'photo-retouching',
    title: 'Photo Retouching',
    category: 'editing',
    shortDescription: 'High-end beauty skin retouching, blemish removal, and magazine-quality finishing.',
    fullDescription: 'Professional frequency separation, micro-contrast enhancement, hair cleanup, digital eye brightening, and natural texture preservation for stunning close-ups.',
    startingPrice: 50,
    image: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=800&q=80',
    features: ['Texture Preservation', 'Blemish & Wrinkle Smoothing', 'Dodge & Burn Sculpting', 'Teeth & Eye Enhancement']
  },
  {
    id: 'wedding-album-design',
    title: 'Wedding Album Design',
    category: 'albums',
    shortDescription: 'Luxurious panoramic lay-flat album design with gold-embossed covers and velvet finish.',
    fullDescription: 'Custom graphic page layouts curated chronologically with elegant Sambalpuri & modern royal motifs, premium feather-touch coating, and metallic foil stamping.',
    startingPrice: 3500,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    features: ['12x36 & 12x30 Formats', 'Lay-Flat Seamless Binding', 'Silk & Matte Lamination', 'Personalized Gold Embossing']
  },
  {
    id: 'photo-album-design',
    title: 'Photo Album Design',
    category: 'albums',
    shortDescription: 'Custom designed albums for birthdays, anniversaries, baby milestones, and trips.',
    fullDescription: 'Celebrate any life milestone with a professionally curated coffee table photobook with bespoke themes, typography, and durable archival quality.',
    startingPrice: 2000,
    image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=800&q=80',
    features: ['Hardcover & Leatherette', 'Custom Story Pages', 'UV Proof Print Paper', 'Gift Box Packaging']
  },
  {
    id: 'wedding-card-design',
    title: 'Wedding Card Design',
    category: 'design',
    shortDescription: 'Traditional Odia, Sambalpuri, Royal & Minimal digital invitations and printable cards.',
    fullDescription: 'Custom personalized wedding invitation cards with cultural motifs, regional languages (Odia, Hindi, English), bride & groom illustrations, and PDF/JPEG formats.',
    startingPrice: 500,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    features: ['Odia & English Languages', 'Print-Ready 300 DPI CMYK', 'WhatsApp Video Card Version', 'Unlimited Minor Revisions']
  },
  {
    id: 'photo-printing',
    title: 'Photo Printing',
    category: 'printing',
    shortDescription: 'Lab-grade photo printing on metallic, glossy, matte, and luster photographic papers.',
    fullDescription: 'Precision 12-color archival pigment printing that guarantees color brilliance and fade-resistance up to 100 years. Sizes from 4x6 up to 24x36 poster prints.',
    startingPrice: 15,
    image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80',
    features: ['Epson UltraChrome HDX Inks', 'Matte, Glossy, Canvas & Metallic', 'Color-Calibrated Profiles', 'Same-Day Fast Dispatch']
  },
  {
    id: 'photo-frame',
    title: 'Photo Frame',
    category: 'printing',
    shortDescription: 'Elegant synthetic, teak wood, acrylic, and floating glass wall frames in all standard sizes.',
    fullDescription: 'Turn your favorite memories into home decor with museum-grade acrylic glass, premium wooden moldings, dust-proof backing, and sturdy mounting hooks.',
    startingPrice: 350,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    features: ['A4, A3, 12x18 & Custom Sizes', 'Shatter-Resistant Glass', 'Gold, Black & Walnut Borders', 'Protective Bubble Packaging']
  },
  {
    id: 'passport-size-photo',
    title: 'Passport Size Photo',
    category: 'printing',
    shortDescription: 'Instant compliant biometric passport, visa, stamp, and government exam photos.',
    fullDescription: 'Strictly compliant photos with crisp white, blue, or light gray backgrounds, calibrated facial proportions for Indian Passport, US Visa, OPSC, SSC, and school admissions.',
    startingPrice: 50,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    features: ['Instant 5-Minute Print', 'Digital Copy by WhatsApp/Email', 'Official Biometric Guidelines', '8, 16, or 32 Copies Sheet']
  },
  {
    id: 'video-editing',
    title: 'Video Editing',
    category: 'editing',
    shortDescription: 'High-end post-production for events, reels, YouTube vlogs, and family archives.',
    fullDescription: 'Color grading in DaVinci Resolve, dynamic title animations, audio noise reduction, seamless transitions, and licensed background music.',
    startingPrice: 1500,
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    features: ['DaVinci Color Correction', 'Sound Equalization & Denoising', 'Custom Motion Graphics', '1080p & 4K Output']
  },
  {
    id: 'wedding-highlight-video',
    title: 'Wedding Highlight Video',
    category: 'cinematography',
    shortDescription: 'A 3-5 minute emotional cinematic story summarizing the best highlights of your wedding.',
    fullDescription: 'Set to your favorite songs, this cinematic recap features vows, garland exchange, pheras, emotional bidaai, and joyful dance moments in one masterpiece.',
    startingPrice: 3000,
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    features: ['3 to 5 Minutes Storyline', 'Slow-Motion Highlights', 'Vertical Reel Cut Included', 'Quick Social Media Delivery']
  },
  {
    id: 'invitation-card-design',
    title: 'Invitation Card Design',
    category: 'design',
    shortDescription: 'Graphic invitations for housewarming, birthday, thread ceremony, and anniversaries.',
    fullDescription: 'Unique artistic invitation cards with custom themes, caricatures, calendar countdowns, and venue QR code maps.',
    startingPrice: 400,
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
    features: ['Venue Google Maps QR Code', 'Custom Typography', 'High-Res Ready to Send on WhatsApp', 'Multi-Language Support']
  },
  {
    id: 'banner-design',
    title: 'Banner Design',
    category: 'design',
    shortDescription: 'Large-scale outdoor flex banners for wedding stages, welcome gates, and festivals.',
    fullDescription: 'High-resolution graphic banners for wedding entry archways, welcome boards, birthday backdrops, and political or festival pandals.',
    startingPrice: 600,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    features: ['Huge Format Sharp Vectors', 'Custom Odia & Hindi Fonts', 'Print-Shop Ready Format', 'Fast Turnaround']
  },
  {
    id: 'poster-design',
    title: 'Poster Design',
    category: 'design',
    shortDescription: 'Eye-catching artistic posters for sports meets, cultural nights, and announcements.',
    fullDescription: 'Dramatic lighting, dynamic compositions, and impactful typography for posters that captivate viewers both in print and on digital platforms.',
    startingPrice: 500,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    features: ['Creative Conceptual Artwork', 'Modern Clean Typography', 'Social Media & Print Sizes', 'Editable Source File Option']
  },
  {
    id: 'social-media-design',
    title: 'Social Media Design',
    category: 'design',
    shortDescription: 'Instagram reels cover, wedding announcement graphics, stories, and carousels.',
    fullDescription: 'Elevate your online presence with tailored social media templates, countdown graphics, save-the-date carousels, and aesthetic stories.',
    startingPrice: 350,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    features: ['1080x1920 Reel / Story Size', 'Grid Aesthetic Planning', 'Engaging Call to Action', 'Fast Delivery']
  },
  {
    id: 'psd-editing',
    title: 'PSD Editing',
    category: 'editing',
    shortDescription: 'Advanced Adobe Photoshop project editing, template adjustments, and layer composites.',
    fullDescription: 'Professional editing of PSD templates, album master sheets, multi-layer photo composites, and custom graphic modifications by master photo editors.',
    startingPrice: 150,
    image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=800&q=80',
    features: ['Complex Layer Adjustments', 'Smart Object Integration', 'Clipping Mask Precision', 'Export in Multiple Formats']
  }
];

export const INITIAL_PACKAGES: PackageItem[] = [
  {
    id: 'pkg-1',
    name: 'PACKAGE 1',
    price: 5000,
    subtitle: 'Basic Photography',
    photographers: '1 Traditional Photographer',
    videoCoverage: 'Not Included (Add-on available)',
    album: 'Not Included (Digital only)',
    editing: 'Basic Exposure & Color Balancing',
    highlightVideo: 'Not Included',
    deliveryDetails: 'Soft copies on Pen Drive / Google Drive within 7 days',
    includedServices: [
      '1 Professional Photographer with DSLR Gear',
      'Coverage for up to 6 hours',
      'All Raw + 100 Selected Color-Tuned Photos',
      'Google Drive cloud backup for 30 days',
      'Suitable for small engagement, birthday or puja'
    ]
  },
  {
    id: 'pkg-2',
    name: 'PACKAGE 2',
    price: 8000,
    subtitle: 'Photography + Basic Editing',
    photographers: '1 Senior Photographer',
    videoCoverage: 'HD Video Recording (Main Rituals)',
    album: 'Mini Photobook (20 Pages)',
    editing: 'Full Color Correction + Skin Polish',
    highlightVideo: 'Short 60-Second Social Media Reel',
    deliveryDetails: 'Delivered in 10-14 days with high-speed digital link',
    includedServices: [
      '1 Senior Photographer with Prime & Zoom Lenses',
      'Full Day Coverage (Up to 10 hours)',
      '150 Master Retouched Photographs',
      'Mini Photobook (20 Pages High Quality)',
      '1 Cinematic 60-Second Instagram Reel',
      'All original high-resolution captures delivered'
    ]
  },
  {
    id: 'pkg-3',
    name: 'PACKAGE 3',
    price: 12000,
    subtitle: 'Photography + Cinematography',
    popular: true,
    photographers: '1 Traditional Photographer + 1 Candid Photographer',
    videoCoverage: 'Full HD / 4K Cinematic Videography',
    album: 'Premium 12x30 Velvet Album (30 Pages)',
    editing: 'Advanced Retouching + Color Grading',
    highlightVideo: '3-5 Minute Cinematic Wedding Film',
    deliveryDetails: 'Delivered in 21 days with Premium Wooden Box Pen Drive',
    includedServices: [
      '2 Dedicated Crew: 1 Candid Photographer + 1 Cinematographer',
      'Full Event Coverage (Haldi, Barat, Varmala, Pheras, Bidaai)',
      '3-5 Minute Cinematic Highlight Film with Audio Vows',
      'Premium 12x30 Hardcover Velvet Layflat Album',
      '250 Master Retouched Print-Ready Photographs',
      'Wooden Box Pen Drive with Sushil Photography Branding'
    ]
  },
  {
    id: 'pkg-4',
    name: 'PACKAGE 4',
    price: 15000,
    subtitle: 'Premium Wedding Package',
    photographers: '2 Photographers (Candid + Traditional)',
    videoCoverage: 'Full 4K Cinematic Video + Drone Coverage',
    album: 'Luxury 12x36 Feather Touch Album (40 Pages)',
    editing: 'Magazine Beauty Retouching + Master Grade',
    highlightVideo: '5 Minute Cinematic Teaser + Traditional Full Video',
    deliveryDetails: 'Delivered in 25 days with Custom Leather Album Suitcase',
    includedServices: [
      '3 Crew Members: 2 Photographers + 1 Cinematographer',
      'Aerial Drone Drone Footage of Venue & Barat (Subject to weather)',
      'Luxury 12x36 Layflat Album with Gold Metal Embossing',
      'Mini Parent Album Included Free (10x15)',
      'Pre-Wedding Photo Shoot Session Included (Half Day)',
      'Complete Full Video + 5-Minute Cinematic Master Cut'
    ]
  },
  {
    id: 'pkg-5',
    name: 'PACKAGE 5',
    price: 20000,
    subtitle: 'Complete Wedding Package',
    photographers: '3 Professional Crew Members (2 Photographers + 1 Drone/Candid)',
    videoCoverage: 'Dual 4K Cinematography + Aerial Drone + Live Feed Support',
    album: 'Ultra-Luxury 12x36 Royal Sambalpuri Theme Album (50 Pages)',
    editing: 'Supreme AI Retouching + Cinematic Color Mastering',
    highlightVideo: 'Grand Wedding Film + 3 Social Media Teasers + Full Documentation',
    deliveryDetails: 'Delivered in 30 days with Luxury Acrylic Box, 64GB Metal Drive',
    includedServices: [
      'Full Team Coverage: Senior Photographers & Dedicated Cinematographers',
      'Complete Pre-Wedding Shoot with 2 Drone Videos & 30 Fine Art Prints',
      'Ultra Luxury 12x36 Embossed Album (50 Pages, Scratch Resistant)',
      'Two 8x12 Parent Albums for Bride & Groom Families',
      'Big 16x24 Premium Wooden Framing of Best Couple Portrait',
      '1 Wedding Card Design & Digital Invitation Video included',
      'Priority Delivery & Lifetime Cloud Storage Backup'
    ]
  }
];

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    customerName: 'Priyabrata Sahoo & Sunita',
    serviceUsed: 'Complete Wedding Package',
    rating: 5,
    review: 'Sushil Bhai and his team were absolutely magical for our wedding in Bargarh! The candid shots captured our natural smiles without feeling staged at all. The 12x36 album design with golden lettering is now our family’s pride. Highly recommend Sushil Photography Jhar!',
    photo: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=200&q=80',
    date: '2026-02-18',
    isVerified: true,
    isApproved: true,
    orderId: 'SPJ-ORD-1001'
  },
  {
    id: 'rev-2',
    customerName: 'Amit Meher',
    serviceUsed: 'Pre-Wedding Photography',
    rating: 5,
    review: 'Superb photo editing and creative angles! Sushil Meher guided us so comfortably during our pre-wedding shoot near Debrigarh and Hirakud. The cinematic teaser video went viral among our friends. Best photographer in Sohela!',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    date: '2026-03-04',
    isVerified: true,
    isApproved: true,
    orderId: 'SPJ-ORD-1002'
  },
  {
    id: 'rev-3',
    customerName: 'Rajesh & Ankita Dash',
    serviceUsed: 'Wedding Album Design',
    rating: 5,
    review: 'I uploaded my wedding photos online through their portal. The turnaround was lightning fast. The album layout they prepared was clean, modern, and perfectly aligned with traditional vibes. Excellent customer service and tracking!',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    date: '2026-01-22',
    isVerified: true,
    isApproved: true,
    orderId: 'SPJ-ORD-1003'
  },
  {
    id: 'rev-4',
    customerName: 'Deepak Patel',
    serviceUsed: 'Photo Retouching & Frame',
    rating: 5,
    review: 'Brought old damaged photos of my grandparents. Sushil Bhai restored the scratches and face details with mind-blowing clarity. The 12x18 synthetic frame looks stunning in our living room. Top class craftsmanship!',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    date: '2026-02-28',
    isVerified: true,
    isApproved: true,
    orderId: 'SPJ-ORD-1004'
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Royal Mandap Garland Exchange',
    category: 'Wedding',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    location: 'Bargarh, Odisha',
    description: 'Golden hour rituals celebrating sacred vows with traditional floral garlands.'
  },
  {
    id: 'gal-2',
    title: 'Sunset Whispers Pre-Wedding',
    category: 'Pre-Wedding',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    location: 'Sohela Countryside',
    description: 'Tender candid moments framed against the golden rays of sunset.'
  },
  {
    id: 'gal-3',
    title: 'The Joyful Haldi Splashes',
    category: 'Candid',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    location: 'Jhar Village',
    description: 'Pure spontaneous laughter as family bathes the groom in yellow turmeric.'
  },
  {
    id: 'gal-4',
    title: 'Sacred Pheras Around Agni',
    category: 'Traditional',
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
    location: 'Bargarh Town Hall',
    description: 'The ancient seven steps of union documented with solemn reverence.'
  },
  {
    id: 'gal-5',
    title: 'First Birthday Fairy Castle',
    category: 'Birthday',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    location: 'Sohela Celebration Hall',
    description: 'Adorable candid portraits during the birthday cake smash.'
  },
  {
    id: 'gal-6',
    title: 'Upanayana Sacred Thread Ritual',
    category: 'Events',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    location: 'Jhar, Bargarh',
    description: 'Traditional Vedic rites captured with dignity and sharp lighting.'
  },
  {
    id: 'gal-7',
    title: 'Bespoke Velvet Wedding Photobook',
    category: 'Album Design',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    location: 'Sushil Studio Lab',
    description: 'Gold-embossed leatherette cover with scratch-proof matte lay-flat sheets.'
  },
  {
    id: 'gal-8',
    title: 'Editorial High-Fashion Beauty Retouch',
    category: 'Photo Editing',
    image: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1200&q=80',
    location: 'Sushil Editing Suite',
    description: 'Natural pore preservation, dodge & burn skin sculpting and color grading.'
  },
  {
    id: 'gal-9',
    title: 'Museum Glass Couple Wall Frame',
    category: 'Photo Frames',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    location: 'Client Living Room',
    description: '12x18 matte black border with non-reflective acrylic front.'
  },
  {
    id: 'gal-10',
    title: 'Eternal Love - 4K Wedding Cinema',
    category: 'Cinematic Videos',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    location: 'Debrigarh Wildlife Sanctuary',
    description: 'A cinematic teaser featuring heartfelt vows and cinematic aerial drone sequences.'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SPJ-ORD-1001',
    bookingId: 'SPJ-BK-8012',
    customerName: 'Priyabrata Sahoo',
    phone: '7608814804',
    email: 'priyabrata@gmail.com',
    service: 'Complete Wedding Package',
    package: 'PACKAGE 5 (₹20,000)',
    amount: 20000,
    advancePaid: 10000,
    remainingAmount: 10000,
    paymentStatus: 'Advance Paid',
    orderStatus: 'Album Designing',
    bookingDate: '2026-01-15',
    eventDate: '2026-02-14',
    uploadStatus: 'Verified',
    editingStatus: 'Completed',
    deliveryStatus: 'Processing',
    notes: 'Bride requested golden border on page 14.',
    uploadedFilesCount: 420,
    createdAt: '2026-01-15T10:00:00Z',
    statusHistory: [
      { status: 'Booking Received', timestamp: '2026-01-15 10:30 AM', note: 'Booking accepted by Sushil Meher' },
      { status: 'Payment Confirmed', timestamp: '2026-01-15 11:45 AM', note: 'Advance of ₹10,000 received via UPI' },
      { status: 'Photos Received', timestamp: '2026-02-15 04:00 PM', note: 'Raw camera cards transferred to editing storage' },
      { status: 'Editing Started', timestamp: '2026-02-18 09:00 AM', note: 'Batch grading and high-res culling' },
      { status: 'Editing Completed', timestamp: '2026-02-26 06:30 PM', note: 'Selected 250 photos master retouched' },
      { status: 'Album Designing', timestamp: '2026-03-02 02:00 PM', note: 'Currently arranging 12x36 royal layout' }
    ]
  },
  {
    id: 'SPJ-ORD-1002',
    customerName: 'Amit Meher',
    phone: '7735045136',
    email: 'amit.meher@gmail.com',
    service: 'Pre-Wedding Photography',
    package: 'PACKAGE 3 (₹12,000)',
    amount: 12000,
    advancePaid: 12000,
    remainingAmount: 0,
    paymentStatus: 'Paid Full',
    orderStatus: 'Delivered',
    bookingDate: '2026-02-10',
    eventDate: '2026-02-25',
    uploadStatus: 'Verified',
    editingStatus: 'Completed',
    deliveryStatus: 'Delivered',
    deliveredFilesLink: 'https://drive.google.com/drive/folders/demo-sushil-photography',
    uploadedFilesCount: 180,
    createdAt: '2026-02-10T14:30:00Z',
    statusHistory: [
      { status: 'Booking Received', timestamp: '2026-02-10 02:30 PM' },
      { status: 'Payment Confirmed', timestamp: '2026-02-10 03:00 PM' },
      { status: 'Photos Received', timestamp: '2026-02-25 08:00 PM' },
      { status: 'Editing Completed', timestamp: '2026-03-01 11:00 AM' },
      { status: 'Delivered', timestamp: '2026-03-04 05:00 PM', note: 'High speed Google Drive link sent via WhatsApp' }
    ]
  },
  {
    id: 'SPJ-ORD-1003',
    customerName: 'Rajesh Dash',
    phone: '9861234567',
    email: 'rajesh.dash@gmail.com',
    service: 'Photo Album Design',
    amount: 3500,
    advancePaid: 2000,
    remainingAmount: 1500,
    paymentStatus: 'Advance Paid',
    orderStatus: 'Printing',
    bookingDate: '2026-02-20',
    eventDate: '2026-02-20',
    uploadStatus: 'Photos Uploaded',
    editingStatus: 'Completed',
    deliveryStatus: 'Processing',
    uploadedFilesCount: 85,
    createdAt: '2026-02-20T11:20:00Z',
    statusHistory: [
      { status: 'Booking Received', timestamp: '2026-02-20 11:20 AM' },
      { status: 'Payment Confirmed', timestamp: '2026-02-20 11:45 AM' },
      { status: 'Photos Received', timestamp: '2026-02-20 12:00 PM' },
      { status: 'Album Designing', timestamp: '2026-02-24 04:00 PM' },
      { status: 'Customer Approval', timestamp: '2026-02-28 01:15 PM', note: 'Customer approved digital PDF draft' },
      { status: 'Printing', timestamp: '2026-03-05 10:00 AM', note: 'Sent to lab for 12x30 matte thermal lamination' }
    ]
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'SPJ-BK-8012',
    customerName: 'Priyabrata Sahoo',
    phone: '7608814804',
    whatsapp: '7608814804',
    email: 'priyabrata@gmail.com',
    weddingDate: '2026-02-14',
    eventDate: '2026-02-14',
    venue: 'Royal Palace Banquet Hall',
    city: 'Bargarh',
    eventType: 'Wedding & Reception',
    guestCount: '600+',
    requiredServices: ['Wedding Photography', 'Wedding Cinematography', 'Wedding Album Design'],
    budget: '₹20,000 - ₹30,000',
    additionalMessage: 'Need full coverage from groom morning barat to late night pheras and next day morning bidai.',
    status: 'confirmed',
    createdAt: '2026-01-15T10:00:00Z',
    assignedOrderNumber: 'SPJ-ORD-1001'
  },
  {
    id: 'SPJ-BK-8015',
    customerName: 'Kishore Pradhan',
    phone: '7735045136',
    whatsapp: '7735045136',
    email: 'kishore.p@gmail.com',
    weddingDate: '2026-11-28',
    eventDate: '2026-11-28',
    venue: 'Kalyan Mandap',
    city: 'Sohela',
    eventType: 'Wedding',
    guestCount: '400',
    requiredServices: ['Wedding Photography', 'Candid Photography'],
    budget: '₹15,000',
    additionalMessage: 'Want traditional plus artistic candid shots of bride and groom.',
    status: 'pending',
    createdAt: '2026-03-01T15:00:00Z'
  }
];
