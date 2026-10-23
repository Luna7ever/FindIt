import { Item, UserProfile, NotificationItem, SchoolLocation } from '@/types';

export const SEED_ITEMS_EN: Record<string, Partial<Item>> = {
  item_malak_lost_calc: {
    title: 'Casio Scientific Calculator fx-991EX',
    locationDetails: 'Left on experiment table #3 in the chemistry lab after period 4',
    description: 'Black scientific calculator with protective cover and a blue planet Saturn sticker on the back.',
  },
  item_found_calc_lab: {
    title: 'Black Casio Scientific Calculator',
    locationDetails: 'Found in chemistry lab on the experiment table beside the microscope',
    description: 'Black Casio scientific calculator in excellent condition, locked in its original cover.',
    secretQuestion: 'What shape and color is the sticker on the back cover of the calculator?',
  },
  item_malak_lost_bottle: {
    title: 'Blue Hydro Flask Sports Water Bottle',
    locationDetails: 'Near the bench in the sports gymnasium during physical education class',
    description: '750ml blue water bottle with a black rubber strap handle.',
  },
  item_malak_reunited_notebook: {
    title: 'Advanced Mathematics Lecture Notebook',
    locationDetails: 'Classroom 11-A (Science)',
    description: 'Hardcover brown notebook containing calculus exercises and solutions.',
  },
  item_aseel_found_drawing_set: {
    title: 'Complete Rotring Technical Drawing Set',
    locationDetails: 'Found near the projector in the Computer Technology Lab',
    description: 'Black leather case containing precision compass, dividers, and rulers.',
    secretQuestion: 'What letter is engraved on the metal compass?',
  },
  item_found_airpods: {
    title: 'Apple AirPods Pro Wireless Earbuds',
    locationDetails: 'In the quiet reading pod on the 1st floor next to the window',
    description: 'Clean white AirPods case inside a transparent silicone protective sleeve.',
    secretQuestion: 'What small graphic or engraved icon is on the silicone case?',
  },
  item_found_watch: {
    title: 'Classic Silver Wristwatch',
    locationDetails: 'Near the main entrance of the athletic field',
    description: 'Stainless steel bracelet wristwatch with dark dial and blue hands.',
    secretQuestion: 'What is the color of the inner watch face dial?',
  },
  item_found_keys: {
    title: 'House Keys with Brown Leather Keychain',
    locationDetails: 'On cafeteria dining table #12',
    description: 'Keyring with two keys (one silver, one brass) attached to brown leather fob.',
    secretQuestion: 'How many keys are on the ring and what color is the leather fob?',
  },
  item_lost_pencil_case: {
    title: 'Navy Pencil Case with Orange Zipper',
    locationDetails: 'Classroom 10-B under the second desk',
    description: 'Fabric pencil pouch containing pencils, watercolor pens, and a 20cm ruler.',
  },
  item_found_backpack: {
    title: 'Black School Backpack',
    locationDetails: 'By the shoe rack in the school prayer hall',
    description: 'Medium-sized black backpack with side mesh pockets for water bottles.',
    secretQuestion: 'What is the title of the textbook inside the main compartment?',
  },
  item_found_usb: {
    title: 'SanDisk 64GB USB Flash Drive',
    locationDetails: 'Plugged into PC #7 in the computer technology lab',
    description: 'Emerald green metallic casing USB 3.0 flash memory drive.',
    secretQuestion: 'What is the name of the main root folder inside the USB drive?',
  },
  item_found_school_id: {
    title: 'Smart School ID Card - Student Fahad',
    locationDetails: 'Near the checkout counter in the cafeteria',
    description: 'Current academic year smart student identity card with embedded chip.',
    secretQuestion: 'What are the last 4 identification digits on the card?',
  },
};

export const DEMO_USERS_EN: Record<string, Partial<UserProfile>> = {
  user_malak: {
    name: 'Malak M. Farouk',
    grade: 'Grade 11 - Science',
  },
  user_aseel: {
    name: 'Aseel Ahmed',
    grade: 'Grade 11 - Science (Integrity Ambassador)',
  },
  user_moshira: {
    name: 'Ms. Moshira Mohamed',
    grade: 'School Principal & Custody Committee Head',
  },
  student_finder_sara: {
    name: 'Sara Ahmed',
    grade: 'Grade 10 - Section A',
  },
  student_khalid: {
    name: 'Khaled Mahmoud',
    grade: 'Grade 12 - Science',
  },
  student_reem: {
    name: 'Reem Mostafa',
    grade: 'Grade 11 - Science',
  },
  student_fahad: {
    name: 'Ziad Tarek',
    grade: 'Grade 10 - Section B',
  },
  student_nour: {
    name: 'Nour Ibrahim',
    grade: 'Grade 12 - Arts',
  },
  student_omar: {
    name: 'Omar Hassan',
    grade: 'Grade 10 - Section B',
  },
};

export const NOTIFICATIONS_EN: Record<string, { title: string; message: string }> = {
  notif_match_calc: {
    title: '🎯 88% Smart Match Found!',
    message: 'A black Casio calculator matching your lost item specs was found in the Science & Chemistry Lab!',
  },
  notif_claim_pin: {
    title: '📜 Claim Approved & Ready',
    message: 'Your claim request has been approved! Use secret handover PIN (4826) when receiving your item from the administration office.',
  },
  notif_points_silver: {
    title: '🌟 Silver Integrity Ambassador Badge',
    message: 'Congratulations! You earned 100 integrity points and advanced to official Silver Ambassador tier.',
  },
  notif_integrity_challenge: {
    title: '🏆 Weekly Integrity Challenge Live',
    message: '5 new ethical scenarios await you this week to test your integrity and earn school recognition points.',
  },
};

export const LOCATIONS_EN: Record<string, Partial<SchoolLocation>> = {
  science_lab: {
    name: 'Science & Chemistry Lab',
    building: 'Science Building',
    floor: '2nd Floor',
  },
  library: {
    name: 'School Main Library',
    building: 'Main Building',
    floor: '1st Floor',
  },
  cafeteria: {
    name: 'Main Cafeteria & Dining Hall',
    building: 'Student Services',
    floor: 'Ground Floor',
  },
  gym: {
    name: 'Indoor Sports Gymnasium',
    building: 'Sports Complex',
    floor: 'Ground Floor',
  },
  playground: {
    name: 'Sports Field & Courtyard',
    building: 'Central Courtyard',
    floor: 'Outdoor',
  },
  classrooms_g1: {
    name: 'Grade 10 & 11 Classrooms',
    building: 'Academic Wing A',
    floor: '1st Floor',
  },
  classrooms_g2: {
    name: 'Grade 12 Classrooms',
    building: 'Academic Wing B',
    floor: '2nd Floor',
  },
  computer_lab: {
    name: 'Computer & Tech Lab',
    building: 'Science Building',
    floor: '1st Floor',
  },
  admin_office: {
    name: 'Administration & Custody Office',
    building: 'Main Building',
    floor: 'Ground Floor',
  },
  prayer_room: {
    name: 'School Prayer Hall / Mosque',
    building: 'Main Building',
    floor: 'Ground Floor',
  },
};

export function getLocalizedItem(item: Item, lang: 'ar' | 'en' = 'ar'): Item {
  if (lang !== 'en') return item;
  const en = SEED_ITEMS_EN[item.id];
  const user = item.reportedBy ? getLocalizedUser(item.reportedBy, lang) : item.reportedBy;
  if (!en) {
    return { ...item, reportedBy: user };
  }
  return {
    ...item,
    title: en.title || item.title,
    description: en.description || item.description,
    locationDetails: en.locationDetails || item.locationDetails,
    secretQuestion: en.secretQuestion || item.secretQuestion,
    reportedBy: user,
  };
}

export function getLocalizedUser(user: UserProfile, lang: 'ar' | 'en' = 'ar'): UserProfile {
  if (lang !== 'en') return user;
  const en = DEMO_USERS_EN[user.id];
  if (!en) return user;
  return {
    ...user,
    name: en.name || user.name,
    grade: en.grade || user.grade,
  };
}

export function getLocalizedNotification(
  notif: NotificationItem,
  lang: 'ar' | 'en' = 'ar'
): NotificationItem {
  if (lang !== 'en') return notif;
  const en = NOTIFICATIONS_EN[notif.id];
  if (!en) return notif;
  return {
    ...notif,
    title: en.title || notif.title,
    message: en.message || notif.message,
  };
}

export function getLocalizedLocation(
  loc: SchoolLocation,
  lang: 'ar' | 'en' = 'ar'
): SchoolLocation {
  if (lang !== 'en') return loc;
  const en = LOCATIONS_EN[loc.id];
  if (!en) return loc;
  return {
    ...loc,
    name: en.name || loc.name,
    building: en.building || loc.building,
    floor: en.floor || loc.floor,
  };
}

export const CATEGORY_DESCRIPTIONS_EN: Record<string, string> = {
  electronics: 'Calculators, earbuds, smartwatches, chargers',
  books: 'Textbooks, lecture notebooks, study binders',
  stationery: 'Pencil cases, pens, geometry sets, rulers',
  bottles: 'Water flasks, thermal tumblers, cups',
  keys: 'Home keys, locker keys, keychains',
  bags: 'School backpacks, sports and tote bags',
  clothing: 'Jackets, school uniforms, winter scarves',
  wallets_cards: 'Student IDs, transit and bank cards',
  sports: 'Sports balls, tracksuits, athletic shoes',
  personal: 'Eyeglasses, wristwatches, accessories',
};

export const COLOR_NAMES_EN: Record<string, string> = {
  'أسود': 'Black',
  'أزرق': 'Blue',
  'فضي / رمادي': 'Silver / Grey',
  'أبيض': 'White',
  'كحلي': 'Navy Blue',
  'أخضر': 'Green',
  'أحمر': 'Red',
  'بني': 'Brown',
  'أخرى': 'Other',
};

export function getLocalizedColorName(color: string, lang: 'ar' | 'en' = 'ar'): string {
  if (lang !== 'en') return color;
  return COLOR_NAMES_EN[color] || color;
}

export const ACTIVITIES_EN: Record<string, { title: string; description: string }> = {
  act_eco_clean: {
    title: 'Classroom & School Cleanliness 🌱',
    description: 'Help keep the classroom and school yard tidy by placing wrappers and recyclables in bins.',
  },
  act_library_books: {
    title: 'Picture Books & Stories Organization 📚',
    description: 'Assist the teacher in placing storybooks and illustrated books neatly on library shelves.',
  },
  act_break_custody: {
    title: 'Recess Lost & Found Check 🎒',
    description: 'Check the playground after recess to ensure no school bags or supplies are forgotten, returning them safely.',
  },
  act_gym_organization: {
    title: 'Sports Balls & Games Tidy-up ⚽',
    description: 'Help gather balls, cones, and sports gear after gym and physical activity periods.',
  },
  act_prayer_room_care: {
    title: 'Prayer Hall Care & Serenity 🌙',
    description: 'Arrange prayer rugs and keep the school prayer room clean, peaceful, and reverent.',
  },
  act_peer_tutoring: {
    title: 'Play & Learn with Friends 🤝',
    description: 'Cooperate with classmates in drawing, fun learning games, and sharing supplies with kindness.',
  },
};

export const BADGES_EN: Record<string, { title: string; description: string }> = {
  badge_volunteer_star: {
    title: 'Volunteer Star',
    description: 'Awarded for exceptional contributions to school volunteering and community service.',
  },
  badge_lab_guardian: {
    title: 'Lab & Equipment Guardian',
    description: 'Awarded for excellence in organizing and safeguarding science labs, library, and campus facilities.',
  },
  badge_eco_ambassador: {
    title: 'Eco & Order Ambassador',
    description: 'Awarded for leadership in school environmental conservation and campus orderliness.',
  },
  badge_integrity_champion: {
    title: 'Integrity Champion',
    description: 'Awarded for outstanding dedication to safeguarding lost property and promoting an honest school culture.',
  },
};

export function getLocalizedActivity<T extends { id: string; title: string; description: string }>(
  activity: T,
  lang: 'ar' | 'en' = 'ar'
): T {
  if (lang !== 'en') return activity;
  const en = ACTIVITIES_EN[activity.id];
  if (!en) return activity;
  return {
    ...activity,
    title: en.title || activity.title,
    description: en.description || activity.description,
  };
}

export function getLocalizedBadge<T extends { id: string; title: string; description: string }>(
  badge: T,
  lang: 'ar' | 'en' = 'ar'
): T {
  if (lang !== 'en') return badge;
  const en = BADGES_EN[badge.id];
  if (!en) return badge;
  return {
    ...badge,
    title: en.title || badge.title,
    description: en.description || badge.description,
  };
}

