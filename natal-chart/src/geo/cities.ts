/**
 * Built-in gazetteer: major cities with coordinates and IANA time zones.
 * Lookup is case-insensitive and accepts Russian and English names plus
 * common aliases. For places not listed here, callers can always pass
 * explicit latitude/longitude/timezone.
 */

export interface City {
  /** Russian display name. */
  name: string;
  nameEn: string;
  country: string;
  lat: number;
  lon: number;
  tz: string;
  aliases?: string[];
}

const C = (
  name: string,
  nameEn: string,
  country: string,
  lat: number,
  lon: number,
  tz: string,
  aliases?: string[],
): City => ({ name, nameEn, country, lat, lon, tz, aliases });

export const CITIES: City[] = [
  // Россия
  C("Москва", "Moscow", "Россия", 55.7558, 37.6173, "Europe/Moscow"),
  C("Санкт-Петербург", "Saint Petersburg", "Россия", 59.9343, 30.3351, "Europe/Moscow", [
    "спб",
    "spb",
    "питер",
    "петербург",
    "ленинград",
    "st petersburg",
    "petersburg",
  ]),
  C("Новосибирск", "Novosibirsk", "Россия", 55.0084, 82.9357, "Asia/Novosibirsk"),
  C("Екатеринбург", "Yekaterinburg", "Россия", 56.8389, 60.6057, "Asia/Yekaterinburg", [
    "свердловск",
    "ekaterinburg",
  ]),
  C("Казань", "Kazan", "Россия", 55.7963, 49.1088, "Europe/Moscow"),
  C("Нижний Новгород", "Nizhny Novgorod", "Россия", 56.3269, 44.0059, "Europe/Moscow", ["горький"]),
  C("Самара", "Samara", "Россия", 53.1959, 50.1002, "Europe/Samara", ["куйбышев"]),
  C("Омск", "Omsk", "Россия", 54.9885, 73.3242, "Asia/Omsk"),
  C("Челябинск", "Chelyabinsk", "Россия", 55.1644, 61.4368, "Asia/Yekaterinburg"),
  C("Ростов-на-Дону", "Rostov-on-Don", "Россия", 47.2357, 39.7015, "Europe/Moscow", ["ростов"]),
  C("Уфа", "Ufa", "Россия", 54.7388, 55.9721, "Asia/Yekaterinburg"),
  C("Красноярск", "Krasnoyarsk", "Россия", 56.0153, 92.8932, "Asia/Krasnoyarsk"),
  C("Пермь", "Perm", "Россия", 58.0105, 56.2502, "Asia/Yekaterinburg"),
  C("Воронеж", "Voronezh", "Россия", 51.672, 39.1843, "Europe/Moscow"),
  C("Волгоград", "Volgograd", "Россия", 48.708, 44.5133, "Europe/Volgograd", ["сталинград"]),
  C("Краснодар", "Krasnodar", "Россия", 45.0355, 38.9753, "Europe/Moscow"),
  C("Саратов", "Saratov", "Россия", 51.5924, 46.0348, "Europe/Saratov"),
  C("Тюмень", "Tyumen", "Россия", 57.1522, 65.5272, "Asia/Yekaterinburg"),
  C("Ижевск", "Izhevsk", "Россия", 56.8527, 53.2115, "Europe/Samara"),
  C("Барнаул", "Barnaul", "Россия", 53.3606, 83.7636, "Asia/Barnaul"),
  C("Иркутск", "Irkutsk", "Россия", 52.2869, 104.305, "Asia/Irkutsk"),
  C("Хабаровск", "Khabarovsk", "Россия", 48.4802, 135.0719, "Asia/Vladivostok"),
  C("Владивосток", "Vladivostok", "Россия", 43.1155, 131.8855, "Asia/Vladivostok"),
  C("Калининград", "Kaliningrad", "Россия", 54.7104, 20.4522, "Europe/Kaliningrad", ["кенигсберг"]),
  C("Сочи", "Sochi", "Россия", 43.6028, 39.7342, "Europe/Moscow"),
  C("Мурманск", "Murmansk", "Россия", 68.9585, 33.0827, "Europe/Moscow"),
  C("Архангельск", "Arkhangelsk", "Россия", 64.5401, 40.5433, "Europe/Moscow"),
  C("Якутск", "Yakutsk", "Россия", 62.0355, 129.6755, "Asia/Yakutsk"),
  C("Владимир", "Vladimir", "Россия", 56.1291, 40.4066, "Europe/Moscow"),
  C("Тула", "Tula", "Россия", 54.1961, 37.6182, "Europe/Moscow"),
  C("Ярославль", "Yaroslavl", "Россия", 57.6261, 39.8845, "Europe/Moscow"),
  C("Тверь", "Tver", "Россия", 56.8587, 35.9176, "Europe/Moscow", ["калинин"]),
  C("Рязань", "Ryazan", "Россия", 54.6295, 39.7425, "Europe/Moscow"),
  // Ближнее зарубежье
  C("Киев", "Kyiv", "Украина", 50.4501, 30.5234, "Europe/Kyiv", ["kiev", "київ"]),
  C("Харьков", "Kharkiv", "Украина", 49.9935, 36.2304, "Europe/Kyiv", ["харків"]),
  C("Одесса", "Odesa", "Украина", 46.4825, 30.7233, "Europe/Kyiv", ["odessa", "одеса"]),
  C("Львов", "Lviv", "Украина", 49.8397, 24.0297, "Europe/Kyiv", ["львів"]),
  C("Днепр", "Dnipro", "Украина", 48.4647, 35.0462, "Europe/Kyiv", ["днепропетровск", "дніпро"]),
  C("Минск", "Minsk", "Беларусь", 53.9006, 27.559, "Europe/Minsk"),
  C("Гомель", "Gomel", "Беларусь", 52.4345, 30.9754, "Europe/Minsk"),
  C("Брест", "Brest", "Беларусь", 52.0976, 23.7341, "Europe/Minsk"),
  C("Алматы", "Almaty", "Казахстан", 43.222, 76.8512, "Asia/Almaty", ["алма-ата"]),
  C("Астана", "Astana", "Казахстан", 51.1605, 71.4704, "Asia/Almaty", ["нур-султан", "целиноград"]),
  C("Ташкент", "Tashkent", "Узбекистан", 41.2995, 69.2401, "Asia/Tashkent"),
  C("Бишкек", "Bishkek", "Киргизия", 42.8746, 74.5698, "Asia/Bishkek", ["фрунзе"]),
  C("Душанбе", "Dushanbe", "Таджикистан", 38.5598, 68.787, "Asia/Dushanbe"),
  C("Ашхабад", "Ashgabat", "Туркменистан", 37.9601, 58.3261, "Asia/Ashgabat"),
  C("Ереван", "Yerevan", "Армения", 40.1792, 44.4991, "Asia/Yerevan"),
  C("Тбилиси", "Tbilisi", "Грузия", 41.7151, 44.8271, "Asia/Tbilisi"),
  C("Баку", "Baku", "Азербайджан", 40.4093, 49.8671, "Asia/Baku"),
  C("Кишинев", "Chisinau", "Молдова", 47.0105, 28.8638, "Europe/Chisinau", ["кишинёв"]),
  C("Рига", "Riga", "Латвия", 56.9496, 24.1052, "Europe/Riga"),
  C("Вильнюс", "Vilnius", "Литва", 54.6872, 25.2797, "Europe/Vilnius"),
  C("Таллин", "Tallinn", "Эстония", 59.437, 24.7536, "Europe/Tallinn", ["таллинн"]),
  // Европа
  C("Лондон", "London", "Великобритания", 51.5074, -0.1278, "Europe/London"),
  C("Париж", "Paris", "Франция", 48.8566, 2.3522, "Europe/Paris"),
  C("Берлин", "Berlin", "Германия", 52.52, 13.405, "Europe/Berlin"),
  C("Мюнхен", "Munich", "Германия", 48.1351, 11.582, "Europe/Berlin"),
  C("Мадрид", "Madrid", "Испания", 40.4168, -3.7038, "Europe/Madrid"),
  C("Барселона", "Barcelona", "Испания", 41.3874, 2.1686, "Europe/Madrid"),
  C("Рим", "Rome", "Италия", 41.9028, 12.4964, "Europe/Rome"),
  C("Милан", "Milan", "Италия", 45.4642, 9.19, "Europe/Rome"),
  C("Лиссабон", "Lisbon", "Португалия", 38.7223, -9.1393, "Europe/Lisbon"),
  C("Амстердам", "Amsterdam", "Нидерланды", 52.3676, 4.9041, "Europe/Amsterdam"),
  C("Брюссель", "Brussels", "Бельгия", 50.8503, 4.3517, "Europe/Brussels"),
  C("Вена", "Vienna", "Австрия", 48.2082, 16.3738, "Europe/Vienna"),
  C("Прага", "Prague", "Чехия", 50.0755, 14.4378, "Europe/Prague"),
  C("Варшава", "Warsaw", "Польша", 52.2297, 21.0122, "Europe/Warsaw"),
  C("Будапешт", "Budapest", "Венгрия", 47.4979, 19.0402, "Europe/Budapest"),
  C("Стокгольм", "Stockholm", "Швеция", 59.3293, 18.0686, "Europe/Stockholm"),
  C("Осло", "Oslo", "Норвегия", 59.9139, 10.7522, "Europe/Oslo"),
  C("Хельсинки", "Helsinki", "Финляндия", 60.1699, 24.9384, "Europe/Helsinki"),
  C("Копенгаген", "Copenhagen", "Дания", 55.6761, 12.5683, "Europe/Copenhagen"),
  C("Цюрих", "Zurich", "Швейцария", 47.3769, 8.5417, "Europe/Zurich"),
  C("Женева", "Geneva", "Швейцария", 46.2044, 6.1432, "Europe/Zurich"),
  C("Афины", "Athens", "Греция", 37.9838, 23.7275, "Europe/Athens"),
  C("Стамбул", "Istanbul", "Турция", 41.0082, 28.9784, "Europe/Istanbul"),
  C("Белград", "Belgrade", "Сербия", 44.7866, 20.4489, "Europe/Belgrade"),
  C("София", "Sofia", "Болгария", 42.6977, 23.3219, "Europe/Sofia"),
  C("Бухарест", "Bucharest", "Румыния", 44.4268, 26.1025, "Europe/Bucharest"),
  // Азия и Ближний Восток
  C("Дубай", "Dubai", "ОАЭ", 25.2048, 55.2708, "Asia/Dubai"),
  C("Тель-Авив", "Tel Aviv", "Израиль", 32.0853, 34.7818, "Asia/Jerusalem", ["тель авив"]),
  C("Иерусалим", "Jerusalem", "Израиль", 31.7683, 35.2137, "Asia/Jerusalem"),
  C("Каир", "Cairo", "Египет", 30.0444, 31.2357, "Africa/Cairo"),
  C("Пекин", "Beijing", "Китай", 39.9042, 116.4074, "Asia/Shanghai"),
  C("Шанхай", "Shanghai", "Китай", 31.2304, 121.4737, "Asia/Shanghai"),
  C("Гонконг", "Hong Kong", "Китай", 22.3193, 114.1694, "Asia/Hong_Kong"),
  C("Токио", "Tokyo", "Япония", 35.6762, 139.6503, "Asia/Tokyo"),
  C("Сеул", "Seoul", "Южная Корея", 37.5665, 126.978, "Asia/Seoul"),
  C("Сингапур", "Singapore", "Сингапур", 1.3521, 103.8198, "Asia/Singapore"),
  C("Бангкок", "Bangkok", "Таиланд", 13.7563, 100.5018, "Asia/Bangkok"),
  C("Дели", "Delhi", "Индия", 28.7041, 77.1025, "Asia/Kolkata", ["нью-дели", "new delhi"]),
  C("Мумбаи", "Mumbai", "Индия", 19.076, 72.8777, "Asia/Kolkata", ["бомбей"]),
  // Америка
  C("Нью-Йорк", "New York", "США", 40.7128, -74.006, "America/New_York", ["нью йорк", "nyc"]),
  C("Лос-Анджелес", "Los Angeles", "США", 34.0522, -118.2437, "America/Los_Angeles", ["la"]),
  C("Чикаго", "Chicago", "США", 41.8781, -87.6298, "America/Chicago"),
  C("Сан-Франциско", "San Francisco", "США", 37.7749, -122.4194, "America/Los_Angeles"),
  C("Майами", "Miami", "США", 25.7617, -80.1918, "America/New_York"),
  C("Торонто", "Toronto", "Канада", 43.6532, -79.3832, "America/Toronto"),
  C("Ванкувер", "Vancouver", "Канада", 49.2827, -123.1207, "America/Vancouver"),
  C("Мехико", "Mexico City", "Мексика", 19.4326, -99.1332, "America/Mexico_City"),
  C("Сан-Паулу", "Sao Paulo", "Бразилия", -23.5505, -46.6333, "America/Sao_Paulo"),
  C("Рио-де-Жанейро", "Rio de Janeiro", "Бразилия", -22.9068, -43.1729, "America/Sao_Paulo", ["рио"]),
  C("Буэнос-Айрес", "Buenos Aires", "Аргентина", -34.6037, -58.3816, "America/Argentina/Buenos_Aires"),
  C("Лима", "Lima", "Перу", -12.0464, -77.0428, "America/Lima"),
  // Океания и Африка
  C("Сидней", "Sydney", "Австралия", -33.8688, 151.2093, "Australia/Sydney"),
  C("Мельбурн", "Melbourne", "Австралия", -37.8136, 144.9631, "Australia/Melbourne"),
  C("Окленд", "Auckland", "Новая Зеландия", -36.8509, 174.7645, "Pacific/Auckland"),
  C("Йоханнесбург", "Johannesburg", "ЮАР", -26.2041, 28.0473, "Africa/Johannesburg"),
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,]/g, " ")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cityKeys(city: City): string[] {
  return [city.name, city.nameEn, ...(city.aliases ?? [])].map(normalize);
}

/** Exact (normalized) lookup by Russian/English name or alias. */
export function findCity(query: string): City | null {
  const q = normalize(query);
  if (!q) {
    return null;
  }
  for (const city of CITIES) {
    if (cityKeys(city).includes(q)) {
      return city;
    }
  }
  return null;
}

/** Prefix-based suggestions for error messages. */
export function suggestCities(query: string, limit = 5): City[] {
  const q = normalize(query);
  if (!q) {
    return [];
  }
  const starts = CITIES.filter((c) => cityKeys(c).some((k) => k.startsWith(q.slice(0, 3))));
  return starts.slice(0, limit);
}
