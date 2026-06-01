import { Service, Dentist, Review, FAQ } from './types';

export const SERVICES_DATA: Service[] = [
  {
    id: 'general',
    name: 'General Dentistry',
    description: 'Routine checkups, deep dental cleaning, dental fillings, and minor preventive procedures.',
    longDescription: 'Comprehensive oral care focused on prevention and maintenance. From advanced cavity diagnosis and clinical cleanings to composite fillings, our general treatments keep your mouth healthy and plaque-free.',
    category: 'Preventative Care',
    benefits: ['Prevent tooth decay and gum disease', 'Fresh breath and stain removal', 'Early detection of oral issues'],
    duration: '45 - 60 mins',
    priceEstimate: '$100 - $250',
    iconName: 'Activity'
  },
  {
    id: 'cosmetic',
    name: 'Cosmetic Dentistry',
    description: 'Custom porcelain veneers, aesthetic bonding, and comprehensive smile design adjustments.',
    longDescription: 'Revitalize your visual confidence. Our cosmetic options correct tooth shape, alignments, spacing gaps, and chips using state-of-the-art porcelain materials customized for your distinct facial shape.',
    category: 'Aesthetic Adjustments',
    benefits: ['Natural-looking porcelain composite materials', 'Instantly corrects gaps, chips, and wear', 'Boosts self-confidence and youthfulness'],
    duration: '1 - 2 hours',
    priceEstimate: '$800 - $1,500 per tooth',
    iconName: 'Sparkles'
  },
  {
    id: 'ortho',
    name: 'Orthodontics',
    description: 'Modern clear aligners and subtle traditional braces for effective teeth alignment.',
    longDescription: 'Orthodontic therapy using the latest modern clear systems (Invisalign) or standard aesthetic low-profile metal brackets. Perfect for treating overbites, underbites, crowding, and misalignments.',
    category: 'Structural Alignment',
    benefits: ['Virtually invisible clear aligner options', 'Improves bite mechanics and overall posture', 'Easier daily dental hygiene access'],
    duration: '12 - 24 months (Therapy)',
    priceEstimate: '$3,500 - $6,000 total',
    iconName: 'Workflow'
  },
  {
    id: 'root-canal',
    name: 'Root Canal Treatment',
    description: 'Advanced painless treatments designed to save severe teeth infections.',
    longDescription: 'Advanced, completely painless endodontic procedures designed to clean deep pulp nerve infections, sterilize root canal systems, and protect teeth structure with protective dental crowns.',
    category: 'Endodontics',
    benefits: ['Rapidly stops intense, pulsing tooth pain', 'Avoids the necessity for tooth extraction', 'Fully restores chewing force capability'],
    duration: '60 - 90 mins',
    priceEstimate: '$600 - $1,200',
    iconName: 'ShieldAlert'
  },
  {
    id: 'implants',
    name: 'Dental Implants',
    description: 'Lifetime permanent tooth replacement using advanced titanium foundations.',
    longDescription: 'State-of-the-art implants surgically anchored into the bone foundation. Completed with custom ceramic crowns, implants mimic the precise strength, density, and natural aesthetic of original teeth.',
    category: 'Reconstructive Surgery',
    benefits: ['Prevents facial structure sag and bone loss', 'Permanent solution that doesn\'t slip or shift', 'Completely normal chewing and clear speech'],
    duration: '2 - 3 visits (Completed)',
    priceEstimate: '$1,800 - $3,500 per unit',
    iconName: 'Hammer'
  },
  {
    id: 'pediatric',
    name: 'Pediatric Dentistry',
    description: 'Specialized gentle dental care custom designed for children in a happy setting.',
    longDescription: 'A warm, playful environment designed strictly for kids. We focus on gentle cleanings, dental crack sealants, fluoridation, and building high-trust dental habits that prevent childhood dental anxiety.',
    category: 'Pediatric Care',
    benefits: ['Fun, non-threatening clinic visits', 'Protects early baby teeth guide alignment', 'Preventative fissure sealants protect enamel'],
    duration: '30 - 45 mins',
    priceEstimate: '$90 - $180',
    iconName: 'HeartHandshake'
  },
  {
    id: 'oral-surgery',
    name: 'Oral Surgery',
    description: 'Safe surgical wisdom teeth extractions and general pre-implant socket therapies.',
    longDescription: 'Safe, carefully planned surgical tooth extractions, bone grafting procedures, and soft tissue corrective surgeries performed under precise computerized local or moderate sedation.',
    category: 'Surgical Procedures',
    benefits: ['Prevents wisdom tooth crowding and damage', 'Maintains bone ridge density via grafting', 'Short recovery times with expert guidance'],
    duration: '45 - 90 mins',
    priceEstimate: '$200 - $600 per tooth',
    iconName: 'Scissors'
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    description: 'Professional medical laser whitening that lifts enamel shades up to 8 shades.',
    longDescription: 'Safe, premium clinical whitening that eliminates years of severe coffee, smoking, and age stains. Utilizing specialized medical-grade active gels accelerated by protective clinical laser sweeps.',
    category: 'Enamel Brightening',
    benefits: ['Results in just 1 single clinical visit', 'Advanced formula reduces tooth sensitivity', 'Long-lasting, safe uniform finish'],
    duration: '60 mins',
    priceEstimate: '$250 - $450',
    iconName: 'Sun'
  }
];

export const DENTISTS_DATA: Dentist[] = [
  {
    id: 'dr-johnson',
    name: 'Dr. Sarah Johnson',
    role: 'Lead Orthodontist & Smile Designer',
    specialty: 'Orthodontics & Clear Aligner therapy',
    experience: '12 Years Experience',
    education: 'DDS, Harvard School of Dental Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
  },
  {
    id: 'dr-chen',
    name: 'Dr. Robert Chen',
    role: 'Senior Dental Surgeon & Implant Specialist',
    specialty: 'Reconstructive Implants & Oral Surgery',
    experience: '15 Years Experience',
    education: 'DDS, Columbia University Dental Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
    rating: 5.0,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday']
  },
  {
    id: 'dr-reyes',
    name: 'Dr. Amanda Reyes',
    role: 'Specialist Pediatric Dentist',
    specialty: 'Pediatric Care & Dental Anxiety Relief',
    experience: '10 Years Experience',
    education: 'DDS, University of Pennsylvania Clinical Dentistry',
    imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    availableDays: ['Tuesday', 'Thursday', 'Friday']
  },
  {
    id: 'dr-miller',
    name: 'Dr. David Miller',
    role: 'Expert Endodontist & Micro-Dentist',
    specialty: 'Pain-Free Root Canal therapy & Restorations',
    experience: '14 Years Experience',
    education: 'DDS, University of California (UCSF)',
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday']
  }
];

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    name: 'Jessica Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    treatmentName: 'Teeth Alignment (Invisalign)',
    comment: 'The absolute best experience I’ve had. Dr. Sarah Johnson spent so much time custom designing my Invisalign program. No one can even tell I’m wearing them, and my teeth are shifting into place beautifully!',
    date: '3 weeks ago',
    verified: true
  },
  {
    id: 'rev-2',
    name: 'Marcus Brody',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    treatmentName: 'Dental Implants',
    comment: 'I was terrifed of dental implants, but Dr. Robert Chen and the team made the entire surgical stage a breeze. Pain was minimal, and the replacement implant tooth looks and feels exactly like my original tooth.',
    date: '1 month ago',
    verified: true
  },
  {
    id: 'rev-3',
    name: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    treatmentName: 'Porcelain Veneers',
    comment: 'Overwhelmed by how gorgeous my dental veneers came out! They aligned the minor chips perfectly and gave me a radiant smile that looks completely natural. Thank you DentalDemoByNabin team!',
    date: '2 months ago',
    verified: true
  },
  {
    id: 'rev-4',
    name: 'Tariq Malik',
    avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    treatmentName: 'Painless Root Canal',
    comment: 'I walked in with an emergency toothache that kept me awake all night. Dr. David Miller took me in right away and performed a root canal in under an hour. I literally felt zero pain. An absolute life-saver doctor.',
    date: '1 week ago',
    verified: true
  },
  {
    id: 'rev-5',
    name: 'Sophie & Leo (Age 6)',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    treatmentName: 'Pediatric Cleanings & Sealants',
    comment: 'My kids actually look forward to visiting Dr. Amanda Reyes. The pediatric lounge is full of soft interactive play mats, and her kid-focused explanations completely make them curious rather than scared of checkups!',
    date: '2 weeks ago',
    verified: true
  },
  {
    id: 'rev-6',
    name: 'Benjamin Cole',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    treatmentName: 'Laser Teeth Whitening',
    comment: 'Quick and remarkable results! Stains from my heavy coffee drinking and red wine are entirely gone in one laser whitening session. Friendly clinic specialists, nice quiet environment.',
    date: '1 month ago',
    verified: true
  }
];

export const GALLERY_DATA = [
  {
    id: 'g-1',
    treatment: 'Full Smile Alignment (Ortho)',
    description: 'Corrected severe overcrowding and front tooth overlap in an 18-month clear aligner therapy.',
    beforeImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80', 
    afterImage: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=600&auto=format&fit=crop&q=80',
    duration: '18 Months',
    specialist: 'Dr. Sarah Johnson'
  },
  {
    id: 'g-2',
    treatment: 'Laser Enamel Whitening',
    description: 'Removed age discoloration and deep caffeine stains, boosting white index by 8 dental shades.',
    beforeImage: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&auto=format&fit=crop&q=80',
    afterImage: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80',
    duration: '1 Session (60 mins)',
    specialist: 'Dr. Robert Chen'
  },
  {
    id: 'g-3',
    treatment: 'Cosmetic Porcelain Veneers',
    description: 'Closed wide front gaps and leveled uneven edges with custom translucent veneers.',
    beforeImage: 'https://images.unsplash.com/photo-1542884748-2b87b36c6b90?w=600&auto=format&fit=crop&q=80',
    afterImage: 'https://images.unsplash.com/photo-1513223038308-024e821dbb94?w=600&auto=format&fit=crop&q=80',
    duration: '2 Clinic Visits',
    specialist: 'Dr. Sarah Johnson'
  }
];

export const FAQS_DATA: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How often should I visit a dentist?',
    answer: 'For optimal dental prevention, we highly recommend scheduling a professional dental exam and thorough cleaning every 6 months. Patients with active gum histories or high cavity-risks might need visits every 3 to 4 months.',
    category: 'General Care'
  },
  {
    id: 'faq-2',
    question: 'Do dental implants hurt?',
    answer: 'The actual implant surgery is performed under localized clinic anesthesia, meaning you won\'t feel any discomfort during the process. Post-procedure soreness is minor and can be managed effectively with absolute ease using standard mild over-the-counter painkillers within 3-4 days.',
    category: 'Surgery'
  },
  {
    id: 'faq-3',
    question: 'How long does teeth whitening last?',
    answer: 'Under correct aftercare, the brilliant results of professional dental whitening can endure from 1 to 3 years. Avoiding severe yellowing staining agents like black coffee, red wine, tea, and tobacco plays a massive role in maintaining your tooth’s radiant white glare.',
    category: 'Cosmetic'
  },
  {
    id: 'faq-4',
    question: 'Do you accept insurance?',
    answer: 'Yes! We recognize and process claims with almost all chief dental PPO insurance plans. Our front-desk coordinator will handle claims directly and help you fully understand your policy’s preventive care copays.',
    category: 'Insurance & Pricing'
  },
  {
    id: 'faq-5',
    question: 'What should I do during a dental emergency?',
    answer: 'Contact our emergency treatment team immediately. If a tooth gets fully knocked out, rinse it quickly in clean water (do not scrub the root) and place it in a cup of clean cold milk or inside your cheek, then reach our studio within 1 hour.',
    category: 'Emergency'
  },
  {
    id: 'faq-6',
    question: 'How long does treatment take?',
    answer: 'While routine cleanings are completed in under 1 hour, customized restorative treatments are highly variable. Clear aligners average 12-18 months, whereas ceramic veneer adjustments require just two visits spanning 10 days.',
    category: 'Treatments'
  }
];
