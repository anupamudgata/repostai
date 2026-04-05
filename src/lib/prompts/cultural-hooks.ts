/**
 * Returns relevant Indian cultural context for the current month.
 * Used to inject into regional language prompts for timely, authentic content.
 */
export function getCurrentCulturalHooks(): string {
  const month = new Date().getMonth();

  switch (month) {
    case 0: // January
      return "It's Makar Sankranti / Pongal / Lohri / Uttarayan season — kite festivals, sesame sweets, and harvest energy are everywhere. Republic Day (Jan 26) patriotic sentiment is building. Budget season is here: finance, taxes, and economic outlook are top-of-mind for Indian professionals and businesses.";

    case 1: // February
      return "Valentine's Day is approaching with an Indian twist — couples mixing romantic gestures with family sensibilities. Basant Panchami brings the arrival of spring, yellow everywhere, and Saraswati Puja vibes. Cricket season kicks off again, bringing sports excitement back into daily conversations.";

    case 2: // March
      return "Holi energy is in the air — colours, celebrations, and the spirit of letting loose after a long winter. Financial year-end rush is real: CA appointments, tax filing deadlines, last-minute investments. IPL auction buzz is growing, dominating sports discourse across the country.";

    case 3: // April
      return "IPL season is at its peak — every match is a conversation starter, from office fantasy leagues to roadside chai stall debates. Ugadi, Gudi Padwa, Vishu, and Baisakhi mark the New Year for multiple communities — a time for fresh starts and auspicious beginnings. New financial year has begun: budgets reset, targets refresh, and ambition is high.";

    case 4: // May
      return "Peak Indian summer is here — heat-wave jokes, mango season obsession, and AC-vs-cooler debates are very relatable. Board exam results are dropping: Class 10 and 12 results create enormous stress and celebration for families nationwide. IPL playoffs and finals are gripping the nation — every elimination creates viral moments.";

    case 5: // June
      return "Monsoon arrival anticipation is everything — the first rains after brutal heat are a near-spiritual experience for most Indians. Startup funding season picks up as investor calendars reset post-summer. Schools and colleges reopen, bringing back the anxiety and excitement of new academic years.";

    case 6: // July
      return "Monsoon is fully here — chai, pakodas, flooded roads, and rain-day content dominate social media. Startup fundraising announcements and Series A/B news are peaking as investors are active. Mid-year reflection is natural: six months in, everyone is evaluating goals, pivots, and H2 plans.";

    case 7: // August
      return "Independence Day (Aug 15) patriotic energy is at its highest — flag hoisting, national pride, and Har Ghar Tiranga moments. Raksha Bandhan brings sibling love and nostalgia front-and-center. Janmashtami celebrations (dahi handi, midnight pujas) bring community and devotion together. Patriotic content, desh-prem angles, and Made-in-India narratives resonate strongly right now.";

    case 8: // September
      return "Onam brings Kerala's harvest festival spirit — pookalam, Sadya feasts, and vallamkali boat races. Ganesh Chaturthi is a major street-level celebration, especially in Maharashtra and South India. The festive season has officially begun — Navratri is on the horizon, and consumer spending and gifting season kicks into gear.";

    case 9: // October
      return "Navratri garba nights, Dussehra Ravan-dahan spectacles, and Durga Puja pandal-hopping are happening right now. Diwali countdown is live — people are already shopping, gifting, and planning celebrations. Festive sales season (Flipkart Big Billion, Amazon Great Indian) is at full intensity — deals, discounts, and consumer excitement are everywhere.";

    case 10: // November
      return "Diwali energy is still glowing — post-Diwali warmth, family memories, and new beginnings after the festival. Chhath Puja devotion is deep and widespread across Bihar, UP, and the diaspora. Year-end planning is beginning: performance reviews, annual reports, and 2025 goal-setting are entering conversations. International cricket tours (India vs. Australia, etc.) are creating prime-time excitement.";

    case 11: // December
      return "Year-end reflection season — 'what I learned this year' and '2025 goals' content is peaking across every platform. New Year countdown energy is building: parties, resolutions, and year-wrap nostalgia. Wedding season is in full swing — destination weddings, shaadi content, and family celebrations dominate social feeds. India's cricket Australia tour is in full swing, giving sports-adjacent content massive reach.";

    default:
      return "Stay culturally tuned: reference relevant Indian festivals, cricket moments, or seasonal moments that your audience is already talking about to make the content feel timely and native.";
  }
}
