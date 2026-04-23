import type { CommunityCard } from "@qahal/shared";

export interface SeedLocation {
  key: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  communities: CommunityCard[];
  people: SeedPerson[];
}

export type SeedBadge =
  | { kind: "emunah"; label: "Emunah" }
  | { kind: "kehilah"; label: "Kehilah" }
  | { kind: "years"; label: "Years in Emunah"; years: number }
  | { kind: "messenger"; label: "Messenger" }
  | { kind: "hebrew-teacher"; label: "Hebrew Teacher" }
  | { kind: "hebrew-student"; label: "Hebrew Student" };

export interface SeedPerson {
  id: number;
  name: string;
  city: string;
  locationKey: string;
  badges: SeedBadge[];
}

const toRadians = (value: number): number => value * (Math.PI / 180);

const distanceKm = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const seedLocations: SeedLocation[] = [
  {
    key: "buenos-aires",
    city: "Buenos Aires",
    country: "Argentina",
    latitude: -34.6037,
    longitude: -58.3816,
    communities: [
      {
        id: 1,
        name: "Emet",
        city: "Buenos Aires",
        distanceKm: 0.5,
        memberState: "not_member",
      },
      {
        id: 2,
        name: "Emunah",
        city: "Buenos Aires",
        distanceKm: 1.5,
        memberState: "requested",
      },
      {
        id: 3,
        name: "Beitlejem",
        city: "Buenos Aires",
        distanceKm: 10,
        memberState: "member",
      },
    ],
    people: [
      {
        id: 101,
        name: "Ruth bat Naomi",
        city: "Buenos Aires",
        locationKey: "buenos-aires",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "years", label: "Years in Emunah", years: 2 },
          { kind: "hebrew-student", label: "Hebrew Student" },
        ],
      },
      {
        id: 102,
        name: "Boaz ben Salmon",
        city: "Buenos Aires",
        locationKey: "buenos-aires",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "kehilah", label: "Kehilah" },
          { kind: "messenger", label: "Messenger" },
        ],
      },
      {
        id: 103,
        name: "Hannah bat Eli",
        city: "Buenos Aires",
        locationKey: "buenos-aires",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "hebrew-teacher", label: "Hebrew Teacher" },
        ],
      },
      {
        id: 104,
        name: "Elijah ben Tishbi",
        city: "Buenos Aires",
        locationKey: "buenos-aires",
        badges: [
          { kind: "kehilah", label: "Kehilah" },
          { kind: "years", label: "Years in Emunah", years: 3 },
        ],
      },
    ],
  },
  {
    key: "mar-de-ajo",
    city: "Mar de Ajo",
    country: "Argentina",
    latitude: -36.721,
    longitude: -56.684,
    communities: [
      {
        id: 4,
        name: "Qahal Shalom",
        city: "Mar de Ajo",
        distanceKm: 0.6,
        memberState: "not_member",
      },
      {
        id: 5,
        name: "Miqra Fellowship",
        city: "Mar de Ajo",
        distanceKm: 2.1,
        memberState: "requested",
      },
      {
        id: 6,
        name: "Derekh Emet",
        city: "Mar de Ajo",
        distanceKm: 4.8,
        memberState: "member",
      },
    ],
    people: [
      {
        id: 201,
        name: "Abraham ben Terah",
        city: "Mar de Ajo",
        locationKey: "mar-de-ajo",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "years", label: "Years in Emunah", years: 5 },
        ],
      },
      {
        id: 202,
        name: "Sarah bat Haran",
        city: "Mar de Ajo",
        locationKey: "mar-de-ajo",
        badges: [
          { kind: "kehilah", label: "Kehilah" },
          { kind: "hebrew-teacher", label: "Hebrew Teacher" },
        ],
      },
      {
        id: 203,
        name: "Rebekah bat Bethuel",
        city: "Mar de Ajo",
        locationKey: "mar-de-ajo",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "hebrew-student", label: "Hebrew Student" },
        ],
      },
      {
        id: 204,
        name: "Leah bat Laban",
        city: "Mar de Ajo",
        locationKey: "mar-de-ajo",
        badges: [
          { kind: "kehilah", label: "Kehilah" },
          { kind: "messenger", label: "Messenger" },
        ],
      },
    ],
  },
  {
    key: "lima",
    city: "Lima",
    country: "Peru",
    latitude: -12.0464,
    longitude: -77.0428,
    communities: [
      {
        id: 7,
        name: "Kefa House",
        city: "Lima",
        distanceKm: 0.9,
        memberState: "not_member",
      },
      {
        id: 8,
        name: "Miryam Circle",
        city: "Lima",
        distanceKm: 2.6,
        memberState: "requested",
      },
      {
        id: 9,
        name: "Shaliach Lima",
        city: "Lima",
        distanceKm: 6.3,
        memberState: "member",
      },
    ],
    people: [
      {
        id: 301,
        name: "Peter",
        city: "Lima",
        locationKey: "lima",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "messenger", label: "Messenger" },
          { kind: "years", label: "Years in Emunah", years: 8 },
        ],
      },
      {
        id: 302,
        name: "John",
        city: "Lima",
        locationKey: "lima",
        badges: [
          { kind: "kehilah", label: "Kehilah" },
          { kind: "years", label: "Years in Emunah", years: 4 },
        ],
      },
      {
        id: 303,
        name: "Mary Magdalene",
        city: "Lima",
        locationKey: "lima",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "hebrew-student", label: "Hebrew Student" },
        ],
      },
      {
        id: 304,
        name: "Joanna",
        city: "Lima",
        locationKey: "lima",
        badges: [
          { kind: "kehilah", label: "Kehilah" },
          { kind: "hebrew-teacher", label: "Hebrew Teacher" },
        ],
      },
    ],
  },
  {
    key: "madrid",
    city: "Madrid",
    country: "Spain",
    latitude: 40.4168,
    longitude: -3.7038,
    communities: [
      {
        id: 10,
        name: "Bnei Yisrael Madrid",
        city: "Madrid",
        distanceKm: 0.7,
        memberState: "not_member",
      },
      {
        id: 11,
        name: "House of Judah",
        city: "Madrid",
        distanceKm: 1.8,
        memberState: "requested",
      },
      {
        id: 12,
        name: "Daughters of Zion",
        city: "Madrid",
        distanceKm: 5.2,
        memberState: "member",
      },
    ],
    people: [
      {
        id: 401,
        name: "Reuben",
        city: "Madrid",
        locationKey: "madrid",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "kehilah", label: "Kehilah" },
        ],
      },
      {
        id: 402,
        name: "Judah",
        city: "Madrid",
        locationKey: "madrid",
        badges: [
          { kind: "messenger", label: "Messenger" },
          { kind: "years", label: "Years in Emunah", years: 6 },
        ],
      },
      {
        id: 403,
        name: "Miriam",
        city: "Madrid",
        locationKey: "madrid",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "hebrew-teacher", label: "Hebrew Teacher" },
        ],
      },
      {
        id: 404,
        name: "Dinah",
        city: "Madrid",
        locationKey: "madrid",
        badges: [
          { kind: "kehilah", label: "Kehilah" },
          { kind: "hebrew-student", label: "Hebrew Student" },
        ],
      },
    ],
  },
  {
    key: "ciudad-de-mexico",
    city: "Ciudad de Mexico",
    country: "Mexico",
    latitude: 19.4326,
    longitude: -99.1332,
    communities: [
      {
        id: 13,
        name: "Exile Return House",
        city: "Ciudad de Mexico",
        distanceKm: 1.2,
        memberState: "not_member",
      },
      {
        id: 14,
        name: "Nehemiah Builders",
        city: "Ciudad de Mexico",
        distanceKm: 3.4,
        memberState: "requested",
      },
      {
        id: 15,
        name: "Esther Assembly",
        city: "Ciudad de Mexico",
        distanceKm: 7.9,
        memberState: "member",
      },
    ],
    people: [
      {
        id: 501,
        name: "Daniel",
        city: "Ciudad de Mexico",
        locationKey: "ciudad-de-mexico",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "years", label: "Years in Emunah", years: 9 },
        ],
      },
      {
        id: 502,
        name: "Esther",
        city: "Ciudad de Mexico",
        locationKey: "ciudad-de-mexico",
        badges: [
          { kind: "messenger", label: "Messenger" },
          { kind: "kehilah", label: "Kehilah" },
        ],
      },
      {
        id: 503,
        name: "Mordecai",
        city: "Ciudad de Mexico",
        locationKey: "ciudad-de-mexico",
        badges: [
          { kind: "kehilah", label: "Kehilah" },
          { kind: "hebrew-student", label: "Hebrew Student" },
        ],
      },
      {
        id: 504,
        name: "Nehemiah",
        city: "Ciudad de Mexico",
        locationKey: "ciudad-de-mexico",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "hebrew-teacher", label: "Hebrew Teacher" },
        ],
      },
    ],
  },
  {
    key: "jacksonville",
    city: "Jacksonville",
    country: "USA",
    latitude: 30.3322,
    longitude: -81.6557,
    communities: [
      {
        id: 16,
        name: "Prophets Gate",
        city: "Jacksonville",
        distanceKm: 0.8,
        memberState: "not_member",
      },
      {
        id: 17,
        name: "Deborah Circle",
        city: "Jacksonville",
        distanceKm: 2.3,
        memberState: "requested",
      },
      {
        id: 18,
        name: "Isaiah Fellowship",
        city: "Jacksonville",
        distanceKm: 6.1,
        memberState: "member",
      },
    ],
    people: [
      {
        id: 601,
        name: "Isaiah",
        city: "Jacksonville",
        locationKey: "jacksonville",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "years", label: "Years in Emunah", years: 7 },
        ],
      },
      {
        id: 602,
        name: "Jeremiah",
        city: "Jacksonville",
        locationKey: "jacksonville",
        badges: [
          { kind: "kehilah", label: "Kehilah" },
          { kind: "messenger", label: "Messenger" },
        ],
      },
      {
        id: 603,
        name: "Deborah",
        city: "Jacksonville",
        locationKey: "jacksonville",
        badges: [
          { kind: "emunah", label: "Emunah" },
          { kind: "hebrew-teacher", label: "Hebrew Teacher" },
        ],
      },
      {
        id: 604,
        name: "Huldah",
        city: "Jacksonville",
        locationKey: "jacksonville",
        badges: [
          { kind: "kehilah", label: "Kehilah" },
          { kind: "hebrew-student", label: "Hebrew Student" },
        ],
      },
    ],
  },
];

export interface SeedCongregationLeader {
  communityId: number;
  personId: number;
}

export const seedCongregationLeaders: SeedCongregationLeader[] = [
  { communityId: 1, personId: 102 },
  { communityId: 4, personId: 202 },
  { communityId: 7, personId: 301 },
  { communityId: 10, personId: 402 },
  { communityId: 13, personId: 502 },
  { communityId: 16, personId: 602 },
];

export const getSeedLeadersByCity = (city: string) => {
  const location = getSeedLocationByCity(city);
  if (!location) {
    return [];
  }

  const peopleById = new Map(
    location.people.map((person) => [person.id, person]),
  );
  const communityById = new Map(
    location.communities.map((community) => [community.id, community]),
  );

  return seedCongregationLeaders
    .filter(
      (entry) =>
        communityById.has(entry.communityId) && peopleById.has(entry.personId),
    )
    .map((entry) => {
      const person = peopleById.get(entry.personId);
      const community = communityById.get(entry.communityId);
      return {
        communityId: entry.communityId,
        communityName: community?.name ?? "",
        personId: entry.personId,
        leaderName: person?.name ?? "",
      };
    });
};

export const getNearestSeedLocation = (
  latitude: number,
  longitude: number,
): SeedLocation => {
  if (seedLocations.length === 0) {
    throw new Error("seed locations are not configured");
  }

  let nearest = seedLocations[0]!;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const location of seedLocations) {
    const d = distanceKm(
      latitude,
      longitude,
      location.latitude,
      location.longitude,
    );
    if (d < nearestDistance) {
      nearestDistance = d;
      nearest = location;
    }
  }

  return nearest;
};

export const getSeedLocationByCity = (
  city: string,
): SeedLocation | undefined => {
  const normalized = city.trim().toLowerCase();
  return seedLocations.find(
    (location) => location.city.toLowerCase() === normalized,
  );
};
