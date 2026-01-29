// Image service for fetching food photos
// Uses curated Unsplash images for reliable, high-quality food photos

// HIGH PRIORITY: Specific dish types (check these first)
const DISH_TYPE_IMAGES: Record<string, string[]> = {
  // Pasta dishes – match specific stuffed-shell dishes before generic "shells" or "chicken"
  'chicken and spinach stuffed shells': [
    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&h=600&fit=crop',
  ],
  'stuffed shells': [
    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&h=600&fit=crop',
  ],
  'shells': [
    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&h=600&fit=crop',
  ],
  'lasagna': [
    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1619895092538-128341789043?w=800&h=600&fit=crop',
  ],
  'pasta': [
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=600&fit=crop',
  ],
  'spaghetti': [
    'https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&h=600&fit=crop',
  ],
  'penne': [
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=600&fit=crop',
  ],
  'macaroni': [
    'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&h=600&fit=crop',
  ],
  'mac and cheese': [
    'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&h=600&fit=crop',
  ],
  'fettuccine': [
    'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&h=600&fit=crop',
  ],
  'alfredo': [
    'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&h=600&fit=crop',
  ],
  'carbonara': [
    'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=600&fit=crop',
  ],
  'ravioli': [
    'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=800&h=600&fit=crop',
  ],
  'tortellini': [
    'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=800&h=600&fit=crop',
  ],
  'risotto': [
    'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop',
  ],
  'gnocchi': [
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop',
  ],

  // Asian dishes
  'stir fry': [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop',
  ],
  'stir-fry': [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
  ],
  'fried rice': [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop',
  ],
  'noodles': [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&h=600&fit=crop',
  ],
  'lo mein': [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
  ],
  'chow mein': [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
  ],
  'ramen': [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&h=600&fit=crop',
  ],
  'pho': [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop',
  ],
  'sushi': [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop',
  ],
  'teriyaki': [
    'https://images.unsplash.com/photo-1609183480237-ccfa070f3193?w=800&h=600&fit=crop',
  ],
  'dumpling': [
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop',
  ],
  'curry': [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop',
  ],
  'tikka masala': [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop',
  ],
  'pad thai': [
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
  ],
  'kung pao': [
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop',
  ],
  'orange chicken': [
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop',
  ],
  'general tso': [
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop',
  ],
  'sweet and sour': [
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop',
  ],

  // Mexican dishes
  'tacos': [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop',
  ],
  'taco': [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
  ],
  'burrito': [
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
  ],
  'enchilada': [
    'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=800&h=600&fit=crop',
  ],
  'quesadilla': [
    'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&h=600&fit=crop',
  ],
  'fajita': [
    'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=800&h=600&fit=crop',
  ],
  'nachos': [
    'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&h=600&fit=crop',
  ],

  // American/comfort food
  'burger': [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
  ],
  'hamburger': [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  ],
  'pizza': [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
  ],
  'sandwich': [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800&h=600&fit=crop',
  ],
  'hot dog': [
    'https://images.unsplash.com/photo-1612392062631-94f87f2f4de9?w=800&h=600&fit=crop',
  ],
  'casserole': [
    'https://images.unsplash.com/photo-1619895092538-128341789043?w=800&h=600&fit=crop',
  ],
  'pot pie': [
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
  ],
  'meatloaf': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
  ],
  'meatball': [
    'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&h=600&fit=crop',
  ],

  // Soups and salads
  'soup': [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=800&h=600&fit=crop',
  ],
  'stew': [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  ],
  'chili': [
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop',
  ],
  'salad': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop',
  ],

  // Grilled/BBQ
  'grill': [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
  ],
  'grilled': [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
  ],
  'bbq': [
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop',
  ],
  'barbecue': [
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop',
  ],
  'kebab': [
    'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=600&fit=crop',
  ],
  'skewer': [
    'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=600&fit=crop',
  ],

  // Roasted/baked
  'roast': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
  ],
  'roasted': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
  ],
  'baked': [
    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  ],

  // Wraps and bowls
  'wrap': [
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
  ],
  'bowl': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  ],
  'rice bowl': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  ],
  'grain bowl': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  ],

  // Additional common dishes
  'fried chicken': [
    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  ],
  'wings': [
    'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&h=600&fit=crop',
  ],
  'nuggets': [
    'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop',
  ],
  'chicken breast': [
    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=600&fit=crop',
  ],
  'chicken thigh': [
    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  ],
  'pork chop': [
    'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&h=600&fit=crop',
  ],
  'pork tenderloin': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800&h=600&fit=crop',
  ],
  'tenderloin': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800&h=600&fit=crop',
  ],
  'herb crusted': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
  ],
  'herb-crusted': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
  ],
  'ribs': [
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop',
  ],
  'pulled pork': [
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop',
  ],
  'bacon': [
    'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800&h=600&fit=crop',
  ],
  'sausage': [
    'https://images.unsplash.com/photo-1587334207407-daa6d1d4a1e2?w=800&h=600&fit=crop',
  ],
  'ground beef': [
    'https://images.unsplash.com/photo-1551360374-84b8a21e8a1e?w=800&h=600&fit=crop',
  ],
  'tuna': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  ],
  'cod': [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
  ],
  'tilapia': [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
  ],
  'crab': [
    'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800&h=600&fit=crop',
  ],
  'lobster': [
    'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800&h=600&fit=crop',
  ],
  'scallop': [
    'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800&h=600&fit=crop',
  ],

  // More international dishes
  'paella': [
    'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&h=600&fit=crop',
  ],
  'jambalaya': [
    'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&h=600&fit=crop',
  ],
  'gumbo': [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  ],
  'etouffee': [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  ],
  'spring roll': [
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop',
  ],
  'egg roll': [
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop',
  ],
  'wonton': [
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop',
  ],
  'gyoza': [
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop',
  ],
  'tempura': [
    'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=800&h=600&fit=crop',
  ],
  'katsu': [
    'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=800&h=600&fit=crop',
  ],
  'udon': [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
  ],
  'soba': [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
  ],
  'yakitori': [
    'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=600&fit=crop',
  ],
  'satay': [
    'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=600&fit=crop',
  ],

  // Vegetarian/vegan options
  'veggie': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
  ],
  'vegetable': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
  ],
  'vegan': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
  ],
  'vegetarian': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
  ],
  'quinoa': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  ],
  'lentil': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  ],
  'chickpea': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  ],
  'falafel': [
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  ],
  'hummus': [
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  ],
};

// LOWER PRIORITY: Protein-based images (only used if no dish type matches)
const PROTEIN_IMAGES: Record<string, string[]> = {
  'chicken': [
    'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&h=600&fit=crop',
  ],
  'beef': [
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&h=600&fit=crop',
  ],
  'steak': [
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop',
  ],
  'pork': [
    'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&h=600&fit=crop',
  ],
  'fish': [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop',
  ],
  'salmon': [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&h=600&fit=crop',
  ],
  'shrimp': [
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=800&h=600&fit=crop',
  ],
  'turkey': [
    'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=800&h=600&fit=crop',
  ],
  'lamb': [
    'https://images.unsplash.com/photo-1514516345957-556ca7c90a29?w=800&h=600&fit=crop',
  ],
  'tofu': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  ],
};

// Cuisine-based images as fallback
const CUISINE_IMAGES: Record<string, string[]> = {
  'Italian': [
    'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&h=600&fit=crop',
  ],
  'Mexican': [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&h=600&fit=crop',
  ],
  'Chinese': [
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
  ],
  'Japanese': [
    'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&h=600&fit=crop',
  ],
  'Indian': [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop',
  ],
  'Thai': [
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&h=600&fit=crop',
  ],
  'Mediterranean': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  ],
  'American': [
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
  ],
  'French': [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop',
  ],
  'Korean': [
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop',
  ],
  'Greek': [
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  ],
  'Asian': [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
  ],
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
];

// Additional specific dish mappings for common recipes
const SPECIFIC_DISHES: Record<string, string> = {
  'honey garlic': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'lemon herb': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'parmesan': 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&h=600&fit=crop',
  'creamy': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&h=600&fit=crop',
  'crispy': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'glazed': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'braised': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
  'pan seared': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
  'sheet pan': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'one pot': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  'slow cooker': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  'instant pot': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  'air fryer': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'balsamic': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
  'mediterranean': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  'greek': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  'tuscan': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'cajun': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop',
  'buffalo': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'marinara': 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&h=600&fit=crop',
  'pesto': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
  'primavera': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
  'piccata': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'marsala': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'cacciatore': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'milanese': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'schnitzel': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'stroganoff': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  'wellington': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
  'gyro': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  'shawarma': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  'biryani': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  'korma': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  'vindaloo': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  'butter chicken': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop',
  'tandoori': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop',
  'sesame': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop',
  'mongolian': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop',
  'szechuan': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop',
  'hunan': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop',
  'katsu': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'tonkatsu': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop',
  'bulgogi': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
  'bibimbap': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
  'kimchi': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
  'carnitas': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop',
  'al pastor': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop',
  'asada': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop',
  'carne': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop',
  'pozole': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  'menudo': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  'mole': 'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=800&h=600&fit=crop',
};

// Simple hash function for consistent but varied image selection
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getFoodImageUrl(searchTerm: string, cuisine?: string): string {
  const lowerSearch = searchTerm.toLowerCase();

  // FIRST PRIORITY: Match dish types (pasta, tacos, soup, etc.)
  // Sort by keyword length (longer = more specific) to match "stuffed shells" before "shells"
  const dishKeywords = Object.keys(DISH_TYPE_IMAGES).sort((a, b) => b.length - a.length);
  for (const keyword of dishKeywords) {
    if (lowerSearch.includes(keyword)) {
      const images = DISH_TYPE_IMAGES[keyword];
      const index = hashString(searchTerm) % images.length;
      return images[index];
    }
  }

  // SECOND PRIORITY: Match specific dish styles/preparations
  const specificKeywords = Object.keys(SPECIFIC_DISHES).sort((a, b) => b.length - a.length);
  for (const keyword of specificKeywords) {
    if (lowerSearch.includes(keyword)) {
      return SPECIFIC_DISHES[keyword];
    }
  }

  // THIRD PRIORITY: Match proteins (chicken, beef, etc.)
  for (const [keyword, images] of Object.entries(PROTEIN_IMAGES)) {
    if (lowerSearch.includes(keyword)) {
      const index = hashString(searchTerm) % images.length;
      return images[index];
    }
  }

  // FOURTH PRIORITY: Match by cuisine
  if (cuisine && CUISINE_IMAGES[cuisine]) {
    const images = CUISINE_IMAGES[cuisine];
    const index = hashString(searchTerm) % images.length;
    return images[index];
  }

  // FIFTH PRIORITY: Use Unsplash source with food-specific search
  // This provides dynamic images based on the dish name
  const cleanedSearch = searchTerm
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .slice(0, 3) // Take first 3 words to avoid too specific queries
    .join(',');

  // Add "food,dish" to help Unsplash return food images
  const searchQuery = `${cleanedSearch},food,dish`;

  // Use a hash to get consistent images for the same dish
  const hash = hashString(searchTerm);

  // Use specific Unsplash photo IDs for more reliable results
  // These are high-quality food photos that work as good fallbacks
  const fallbackPhotoIds = [
    'photo-1546069901-ba9599a7e63c', // colorful healthy bowl
    'photo-1540189549336-e6e99c3679fe', // vegetable dish
    'photo-1567620905732-2d1ec7ab7445', // pancakes
    'photo-1565299624946-b28f40a0ae38', // pizza
    'photo-1504674900247-0877df9cc836', // meat dish
    'photo-1555939594-58d7cb561ad1', // grilled meat
    'photo-1473093295043-cdd812d0e601', // pasta
    'photo-1476124369491-e7addf5db371', // rice dish
    'photo-1547592166-23ac45744acd', // soup
    'photo-1512621776951-a57141f2eefd', // salad
  ];

  const photoIndex = hash % fallbackPhotoIds.length;
  return `https://images.unsplash.com/${fallbackPhotoIds[photoIndex]}?w=800&h=600&fit=crop`;
}

export function getCuisineFallbackImage(cuisine: string): string {
  if (CUISINE_IMAGES[cuisine]) {
    const images = CUISINE_IMAGES[cuisine];
    const index = hashString(cuisine + Date.now().toString()) % images.length;
    return images[index];
  }
  return DEFAULT_IMAGES[0];
}

// Generate a search URL for finding similar recipes online
export function getRecipeSearchUrl(recipeTitle: string): string {
  const searchQuery = encodeURIComponent(recipeTitle + ' recipe');
  return `https://www.google.com/search?q=${searchQuery}`;
}

// --- Unsplash Search API: fetch recipe-matched images from online search ---
const IMAGE_CACHE_MAX = 500;
const IMAGE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const imageCache = new Map<string, { url: string; expiry: number }>();

function pruneCache(): void {
  if (imageCache.size <= IMAGE_CACHE_MAX) return;
  const now = Date.now();
  for (const [key, entry] of imageCache.entries()) {
    if (entry.expiry < now) imageCache.delete(key);
  }
  if (imageCache.size > IMAGE_CACHE_MAX) {
    const entries = [...imageCache.entries()].sort((a, b) => a[1].expiry - b[1].expiry);
    for (let i = 0; i < entries.length && imageCache.size > IMAGE_CACHE_MAX; i++) {
      imageCache.delete(entries[i][0]);
    }
  }
}

async function fetchRecipeImageFromUnsplash(query: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || !query.trim()) return null;
  const searchQuery = encodeURIComponent(`${query.trim()} food dish`);
  const url = `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=1&orientation=landscape`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: Array<{ urls?: { regular?: string } }> };
    const first = data.results?.[0]?.urls?.regular;
    if (!first) return null;
    return `${first}&w=800&h=600&fit=crop`;
  } catch {
    return null;
  }
}

/**
 * Returns a recipe-matched image URL by searching Unsplash for the dish name.
 * Uses in-memory cache to avoid rate limits. Falls back to curated keyword match if API is not configured or fails.
 * Call from server components or API routes only (uses env and fetch).
 */
export async function getFoodImageUrlAsync(searchTerm: string, cuisine?: string): Promise<string> {
  const cacheKey = `${searchTerm.toLowerCase()}|${cuisine ?? ''}`;
  const cached = imageCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) return cached.url;

  const fromApi = await fetchRecipeImageFromUnsplash(searchTerm);
  if (fromApi) {
    imageCache.set(cacheKey, { url: fromApi, expiry: Date.now() + IMAGE_CACHE_TTL_MS });
    pruneCache();
    return fromApi;
  }

  return getFoodImageUrl(searchTerm, cuisine);
}
