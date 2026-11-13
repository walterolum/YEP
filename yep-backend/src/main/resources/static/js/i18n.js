/**
 * YEP translations. The active language is stored in localStorage and applied by
 * translating interface labels as they render. Dynamic server content (names,
 * lesson bodies, notifications) stays in the language it was written in.
 */
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'sw', label: 'Kiswahili', native: 'Kiswahili' },
  { code: 'lg', label: 'Luganda', native: 'Luganda' },
  { code: 'rw', label: 'Kinyarwanda', native: 'Ikinyarwanda' },
];

const KEY = 'yep.lang';

const SW = {
  Dashboard: 'Dashibodi', Users: 'Watumiaji', Participants: 'Washiriki', Programmes: 'Programu',
  'Virtual Exchange': 'Ubadilishanaji Mtandaoni', 'Impact Projects': 'Miradi ya Athari',
  Assessments: 'Tathmini', Certificates: 'Vyeti', Reports: 'Ripoti', Settings: 'Mipangilio',
  'My Profile': 'Wasifu Wangu', 'Learning Hub': 'Kituo cha Kujifunza', 'My Projects': 'Miradi Yangu',
  'Sessions & Events': 'Vikao na Matukio', Notifications: 'Arifa', 'My Mentees': 'Wanafunzi Wangu',
  'Mentorship Requests': 'Maombi ya Ushauri', Sessions: 'Vikao', Resources: 'Rasilimali',
  'My Contributions': 'Michango Yangu', 'Impact Reports': 'Ripoti za Athari',
  Partnerships: 'Ushirikiano', Messages: 'Ujumbe', 'Sign out': 'Toka', 'Sign In': 'Ingia',
  'Join YEP': 'Jiunge na YEP', 'Welcome Back': 'Karibu Tena', 'Email address': 'Barua pepe',
  Password: 'Nenosiri', 'Remember me': 'Nikumbuke', 'Create Account': 'Fungua Akaunti',
  'Full name': 'Jina kamili', Phone: 'Simu', 'Date of birth': 'Tarehe ya kuzaliwa',
  Country: 'Nchi', District: 'Wilaya', Institution: 'Taasisi',
  'Field of study': 'Fani ya masomo', 'Confirm password': 'Thibitisha nenosiri',
  'Search…': 'Tafuta…', 'Loading…': 'Inapakia…', Actions: 'Vitendo', Name: 'Jina',
  Status: 'Hali', Date: 'Tarehe', 'Save changes': 'Hifadhi mabadiliko', Cancel: 'Ghairi',
  Close: 'Funga', Open: 'Fungua', Register: 'Jiandikishe', Join: 'Jiunge',
  'Download PDF': 'Pakua PDF', 'Level One': 'Ngazi ya Kwanza', 'Level Two': 'Ngazi ya Pili',
  Locked: 'Imefungwa', Unlocked: 'Imefunguliwa', 'Youth Empowerment Programme': 'Programu ya Uwezeshaji Vijana',
  'Sign in to your account': 'Ingia kwenye akaunti yako', Verify: 'Thibitisha',
  'Certificate code': 'Msimbo wa cheti', 'All users': 'Watumiaji wote',
  'User management': 'Usimamizi wa watumiaji', 'Create user': 'Unda mtumiaji',
  Mentors: 'Washauri', Facilitators: 'Wawezeshaji', Sponsors: 'Wafadhili', Admins: 'Wasimamizi',
  'Level Two is locked': 'Ngazi ya Pili imefungwa',
  'Complete 80% of Level One to open Level Two automatically':
    'Kamilisha 80% ya Ngazi ya Kwanza ili Ngazi ya Pili ifunguke kiotomatiki',
};

const LG = {
  Dashboard: 'Dashibodi', Users: 'Abakozesa', Participants: 'Abetabi', Programmes: 'Pulogulaamu',
  'Virtual Exchange': 'Enkyukakyuka ku Mutimbagano', 'Impact Projects': "Pulojekiti z'Enkyukakyuka",
  Assessments: 'Okukebera', Certificates: 'Satifiketi', Reports: 'Alipoota', Settings: 'Entegeka',
  'My Profile': 'Pulofaili Yange', 'Learning Hub': "Ekifo ky'Okuyiga", 'My Projects': 'Pulojekiti Zange',
  'Sessions & Events': "Enkuŋŋaana n'Emikolo", Notifications: 'Obubaka',
  'My Mentees': 'Abantu be Nnyigiriza', 'Mentorship Requests': 'Okusaba Obuyambi',
  Sessions: 'Enkuŋŋaana', Resources: "Eby'okukozesa", 'My Contributions': 'Emiraamo Gyange',
  'Impact Reports': "Alipoota z'Enkyukakyuka", Partnerships: 'Obukwanzi', Messages: 'Obubaka',
  'Sign out': 'Ffuluma', 'Sign In': 'Yingira', 'Join YEP': 'Weegatte ku YEP',
  'Welcome Back': 'Tukusanyukidde', 'Email address': 'Aderesi ya imeyili', Password: "Ekigambo ky'okuyingira",
  'Remember me': 'Nkijjukire', 'Create Account': 'Fungula Akaunti', 'Full name': 'Amannya gonna',
  Phone: 'Essimu', 'Date of birth': "Olunaku lw'okuzaalibwa", Country: 'Eggwanga',
  District: 'Disitulikiti', Institution: 'Ssettendekero', 'Field of study': "Ekitundu ky'okusoma",
  'Confirm password': "Kakasa ekigambo ky'okuyingira", 'Search…': 'Noonya…', 'Loading…': 'Kitegekeddwa…',
  Actions: 'Ebikolwa', Name: 'Erinnya', Status: 'Embeera', Date: 'Olunaku',
  'Save changes': 'Tereka enkyukakyuka', Cancel: 'Sazaamu', Close: 'Ggalawo', Open: 'Ggulawo',
  Register: 'Wewandise', Join: 'Weegatte', 'Download PDF': 'Yikula PDF',
  'Level One': "Ddaala ly'Olubereberye", 'Level Two': "Ddaala ly'Okubiri",
  Locked: 'Kisibiddwa', Unlocked: 'Kigguddwa', 'Youth Empowerment Programme': 'Pulogulaamu y’Okunyweza Abavubuka',
  'Sign in to your account': 'Yingira mu akaunti yo', Verify: 'Kakasa',
  'Certificate code': 'Koodi ya satifiketi', 'All users': 'Abakozesa bonna',
  'User management': 'Okuddukanya abakozesa', 'Create user': 'Kola omukozesa',
  Mentors: "Abawi b'amagezi", Facilitators: 'Abayigiriza', Sponsors: 'Abaddukanya emmaali', Admins: 'Abaddukanya',
  'Level Two is locked': "Ddaala ly'Okubiri kisibiddwa",
  'Complete 80% of Level One to open Level Two automatically':
    "Maliriza 80% ku Ddaala ly'Olubereberye okuggulawo Ddaala ly'Okubiri",
};

const RW = {
  Dashboard: 'Imbonerahamwe', Users: 'Abakoresha', Participants: 'Abitabiriye', Programmes: 'Gahunda',
  'Virtual Exchange': 'Guhana ku murongo', 'Impact Projects': "Imishinga y'Ingaruka",
  Assessments: 'Isuzuma', Certificates: 'Ibyemezo', Reports: 'Raporo', Settings: 'Igenamiterere',
  'My Profile': 'Umwirondoro Wanjye', 'Learning Hub': "Ikigo cy'Imyigire", 'My Projects': 'Imishinga Yanjye',
  'Sessions & Events': "Inama n'Ibirori", Notifications: 'Amatangazo', 'My Mentees': 'Abanyeshuri Banjye',
  'Mentorship Requests': 'Gusaba Ubufasha', Sessions: 'Inama', Resources: 'Ibikoresho',
  'My Contributions': 'Umusanzu Wanjye', 'Impact Reports': "Raporo z'Ingaruka",
  Partnerships: 'Ubufatanye', Messages: 'Ubutumwa', 'Sign out': 'Sohoka', 'Sign In': 'Injira',
  'Join YEP': 'Jyamo YEP', 'Welcome Back': 'Murakaza neza', 'Email address': 'Aderesi imeyili',
  Password: "Ijambo ry'ibanga", 'Remember me': 'Unyibuke', 'Create Account': 'Fungura Konti',
  'Full name': 'Amazina yose', Phone: 'Telefone', 'Date of birth': "Itariki y'amavuko",
  Country: 'Igihugu', District: 'Akarere', Institution: 'Ikigo', 'Field of study': 'Ishami wiga',
  'Confirm password': "Emeza ijambo ry'ibanga", 'Search…': 'Shakisha…', 'Loading…': 'Biratangira…',
  Actions: 'Ibikorwa', Name: 'Izina', Status: 'Imiterere', Date: 'Itariki',
  'Save changes': 'Bika impinduka', Cancel: 'Hagarika', Close: 'Funga', Open: 'Fungura',
  Register: 'Iyandikishe', Join: 'Injira', 'Download PDF': 'Kuramo PDF',
  'Level One': 'Urwego rwa mbere', 'Level Two': 'Urwego rwa kabiri',
  Locked: 'Bifunze', Unlocked: 'Bifunguye', 'Youth Empowerment Programme': "Gahunda y'Ukwiyubaka kw'Urubyiruko",
  'Sign in to your account': 'Injira mu konti yawe', Verify: 'Emeza',
  'Certificate code': 'Kode y’icyemezo', 'All users': 'Abakoresha bose',
  'User management': 'Gucunga abakoresha', 'Create user': 'Kora umukoresha',
  Mentors: 'Abajyanama', Facilitators: 'Abarimu', Sponsors: 'Abaterankunga', Admins: 'Abayobozi',
  'Level Two is locked': 'Urwego rwa kabiri rufunze',
  'Complete 80% of Level One to open Level Two automatically':
    'Uzuza 80% by’Urwego rwa mbere kugira ngo urwego rwa kabiri rufunguke',
};

const DICT = { sw: SW, lg: LG, rw: RW };

export function getLanguage() {
  const code = localStorage.getItem(KEY);
  return LANGUAGES.some((language) => language.code === code) ? code : 'en';
}

export function setLanguage(code) {
  localStorage.setItem(KEY, LANGUAGES.some((language) => language.code === code) ? code : 'en');
  document.documentElement.lang = getLanguage();
  window.dispatchEvent(new CustomEvent('yep:lang', { detail: getLanguage() }));
}

/** Translates an interface label; unknown text is returned unchanged. */
export function t(text) {
  const code = getLanguage();
  if (code === 'en' || typeof text !== 'string') return text;
  return DICT[code]?.[text] || text;
}

export function languageSelect() {
  const current = getLanguage();
  return `<select class="lang" data-lang aria-label="Language">
    ${LANGUAGES.map((language) => `<option value="${language.code}" ${language.code === current ? 'selected' : ''}>${language.native}</option>`).join('')}
  </select>`;
}
