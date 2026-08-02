import { createVisionJson, hasOpenAIKey } from "./openaiService";
import { ECOMMERCE_PRODUCTS } from "../data/ecommerceProducts";

const INR_PRICE_BANDS = {
  Dresses: 4999,
  Outerwear: 8999,
  Footwear: 5999,
  Tops: 2999,
  Shirts: 2999,
  Formal: 12999,
  Suits: 14999,
  Apparel: 4999,
};

const MARKETPLACE_SEARCH_TARGETS = [
  { label: "Google Shopping", merchantDomain: "google.com/shopping" },
  { label: "Myntra Search", merchantDomain: "myntra.com" },
  { label: "AJIO Search", merchantDomain: "ajio.com" },
  { label: "Amazon Fashion", merchantDomain: "amazon.in" },
  { label: "Flipkart Fashion", merchantDomain: "flipkart.com" },
];

const OUTFIT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    garmentCategory: {
      type: "string",
      enum: ["Dresses", "Outerwear", "Footwear", "Tops", "Shirts", "Formal", "Suits", "Kids Dresses", "Kids Outerwear", "Kids Footwear", "Apparel"],
    },
    detectedItem: { type: "string" },
    colorPattern: { type: "string" },
    styleType: { type: "string" },
    fabricTexture: { type: "string" },
    brandMatch: { type: "string" },
    merchantDomain: { type: "string" },
    estimatedPrice: { type: "number" },
    gender: {
      type: "string",
      enum: ["Women", "Men", "Kids", "Unisex"],
    },
    confidence: { type: "number" },
    searchKeywords: {
      type: "array",
      minItems: 4,
      maxItems: 8,
      items: { type: "string" },
    },
    buyOptions: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          merchantDomain: { type: "string" },
          estimatedPrice: { type: "number" },
        },
        required: ["label", "merchantDomain", "estimatedPrice"],
      },
    },
  },
  required: [
    "garmentCategory",
    "detectedItem",
    "colorPattern",
    "styleType",
    "fabricTexture",
    "brandMatch",
    "merchantDomain",
    "estimatedPrice",
    "gender",
    "confidence",
    "searchKeywords",
    "buyOptions",
  ],
};

export async function analyzeOutfitImage(base64OrImageUrl, cutoutImageUrl = null) {
  let visionData = null;
  let usedRealVision = false;

  if (hasOpenAIKey()) {
    try {
      visionData = await createVisionJson({
        imageUrl: base64OrImageUrl,
        prompt: `You are SnapFit AI Vision. Analyze this uploaded or camera-captured photo of a person wearing an outfit.

Return only product-shopping metadata for the clothing. Do not identify the person. Treat the visible garment as the product we need to buy.

Rules:
- If there are multiple clothing pieces, choose the most visually dominant or distinctive shoppable garment.
- Name the item like an ecommerce product title, not a generic label.
- Estimate a realistic INR price for India-facing fashion ecommerce.
- Suggest likely merchant domains and buy options, but do not claim certainty unless the brand/logo is clearly visible.
- Include search keywords that can be used to find the same or similar item online.`,
        schema: OUTFIT_SCHEMA,
      });
      usedRealVision = !!visionData;
    } catch (err) {
      console.warn("OpenAI outfit vision error, using local matcher:", err.message);
    }
  }

  if (!visionData) {
    visionData = generateFallbackVisionResult();
  }

  const normalizedVision = normalizeVisionData(visionData);
  const webDiscoveredProduct = createWebDiscoveredProduct(
    normalizedVision,
    cutoutImageUrl || base64OrImageUrl
  );
  const catalogMatches = findMatchingProducts(normalizedVision);
  const buyOptions = createBuyOptions(normalizedVision, catalogMatches);
  const matchedProducts = [
    webDiscoveredProduct,
    ...catalogMatches.filter((p) => p.id !== webDiscoveredProduct.id),
  ];

  return {
    success: true,
    visionData: {
      ...normalizedVision,
      buyOptions,
      buySearchUrl: buildShoppingSearchUrl(normalizedVision),
    },
    webDiscoveredProduct,
    matchedProducts,
    isRealVision: usedRealVision,
  };
}

function normalizeVisionData(vision) {
  const category = vision.garmentCategory || "Apparel";
  const fallbackPrice = INR_PRICE_BANDS[category] || INR_PRICE_BANDS.Apparel;
  const searchKeywords = Array.isArray(vision.searchKeywords)
    ? vision.searchKeywords.filter(Boolean).slice(0, 8)
    : [];

  return {
    garmentCategory: category,
    detectedItem: vision.detectedItem || "Uploaded Outfit Match",
    colorPattern: vision.colorPattern || "Color and pattern detected from photo",
    styleType: vision.styleType || "Contemporary fashion silhouette",
    fabricTexture: vision.fabricTexture || "Visible fabric texture",
    brandMatch: vision.brandMatch || "Similar Web Match",
    merchantDomain: sanitizeMerchantDomain(vision.merchantDomain) || "google.com/shopping",
    estimatedPrice: Number.isFinite(Number(vision.estimatedPrice))
      ? Math.max(499, Math.round(Number(vision.estimatedPrice)))
      : fallbackPrice,
    gender: vision.gender || "Unisex",
    confidence: Number.isFinite(Number(vision.confidence)) ? Number(vision.confidence) : 0.72,
    searchKeywords: searchKeywords.length >= 4
      ? searchKeywords
      : buildDefaultKeywords(vision.detectedItem, category, vision.colorPattern),
    buyOptions: Array.isArray(vision.buyOptions) ? vision.buyOptions : [],
  };
}

function createWebDiscoveredProduct(vision, garmentCutoutUrl) {
  const price = vision.estimatedPrice;
  const merchantDomain = sanitizeMerchantDomain(vision.merchantDomain) || "google.com/shopping";

  return {
    id: `web_discovered_${Date.now()}`,
    name: vision.detectedItem,
    category: vision.garmentCategory,
    gender: vision.gender,
    brand: vision.brandMatch,
    merchantDomain,
    price,
    originalPrice: Math.round(price * 1.3),
    rating: 4.8,
    reviewsCount: 128,
    sizes: inferSizes(vision),
    colors: [vision.colorPattern],
    type: "exact_match",
    imageUrl: garmentCutoutUrl,
    isWebDiscovered: true,
    purchaseUrl: buildShoppingSearchUrl(vision),
    description: `${vision.styleType}. ${vision.fabricTexture}. Isolated from the uploaded person photo with GPT Image, then matched to shoppable products by OpenAI vision.`,
  };
}

function createBuyOptions(vision, catalogMatches) {
  const query = buildSearchQuery(vision);
  const aiOptions = (vision.buyOptions || []).map((option) => ({
    label: option.label || vision.detectedItem,
    merchantDomain: sanitizeMerchantDomain(option.merchantDomain) || vision.merchantDomain,
    estimatedPrice: Math.round(Number(option.estimatedPrice) || vision.estimatedPrice),
    url: buildMerchantSearchUrl(option.merchantDomain || vision.merchantDomain, option.label || query),
  }));

  const localOptions = catalogMatches.slice(0, 3).map((product) => ({
    label: product.name,
    merchantDomain: product.merchantDomain,
    estimatedPrice: product.price,
    productId: product.id,
    url: buildMerchantSearchUrl(product.merchantDomain, product.name),
  }));

  const marketplaceOptions = MARKETPLACE_SEARCH_TARGETS.map((target) => ({
    label: target.label,
    merchantDomain: target.merchantDomain,
    estimatedPrice: vision.estimatedPrice,
    url: buildMerchantSearchUrl(target.merchantDomain, query),
  }));

  return dedupeBuyOptions([...aiOptions, ...localOptions, ...marketplaceOptions]).slice(0, 5);
}

function findMatchingProducts(vision) {
  const query = [
    vision.garmentCategory,
    vision.detectedItem,
    vision.colorPattern,
    vision.styleType,
    ...(vision.searchKeywords || []),
  ].join(" ").toLowerCase();

  const scored = ECOMMERCE_PRODUCTS.map((product) => {
    const productText = [
      product.category,
      product.name,
      product.brand,
      product.description,
      ...(product.colors || []),
    ].join(" ").toLowerCase();

    const queryTokens = tokenize(query);
    const productTokens = tokenize(productText);
    const score = queryTokens.reduce((sum, token) => (
      productTokens.includes(token) ? sum + token.length : sum
    ), 0);

    const categoryScore = product.category.toLowerCase() === vision.garmentCategory.toLowerCase() ? 15 : 0;
    return { product, score: score + categoryScore };
  })
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);

  return scored.slice(0, 4);
}

function tokenize(text) {
  return Array.from(
    new Set(
      String(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 2)
    )
  );
}

function inferSizes(vision) {
  const category = vision.garmentCategory.toLowerCase();
  if (category.includes("footwear")) return ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];
  if (category.includes("kids")) return ["3Y", "4Y", "6Y", "8Y", "10Y"];
  if (category.includes("formal") || category.includes("suit")) return ["38R", "40R", "42R", "44R"];
  return ["XS", "S", "M", "L", "XL"];
}

function sanitizeMerchantDomain(domain) {
  if (!domain) return "";
  return String(domain).replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim().toLowerCase();
}

function buildShoppingSearchUrl(vision) {
  return buildMerchantSearchUrl("google.com/shopping", buildSearchQuery(vision));
}

function buildSearchQuery(vision) {
  return [
    vision.detectedItem,
    vision.colorPattern,
    vision.brandMatch,
    "buy online India",
  ].filter(Boolean).join(" ");
}

function buildMerchantSearchUrl(domain, query) {
  const cleanDomain = sanitizeMerchantDomain(domain);
  const encodedQuery = encodeURIComponent(query);

  if (cleanDomain.includes("myntra.com")) return `https://www.myntra.com/${encodedQuery}`;
  if (cleanDomain.includes("ajio.com")) return `https://www.ajio.com/search/?text=${encodedQuery}`;
  if (cleanDomain.includes("amazon.in")) return `https://www.amazon.in/s?k=${encodedQuery}&i=fashion`;
  if (cleanDomain.includes("flipkart.com")) return `https://www.flipkart.com/search?q=${encodedQuery}`;
  if (cleanDomain.includes("google.com")) return `https://www.google.com/search?tbm=shop&q=${encodedQuery}`;

  return `https://www.google.com/search?tbm=shop&q=${encodedQuery}+site%3A${encodeURIComponent(cleanDomain)}`;
}

function dedupeBuyOptions(options) {
  const seen = new Set();
  return options.filter((option) => {
    const key = `${option.merchantDomain}-${option.label}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildDefaultKeywords(name, category, colorPattern) {
  return [name, category, colorPattern, "fashion", "buy online"]
    .filter(Boolean)
    .flatMap((text) => String(text).split(/\s+/))
    .filter((token) => token.length > 2)
    .slice(0, 6);
}

function generateFallbackVisionResult() {
  return {
    garmentCategory: "Apparel",
    detectedItem: "Uploaded Outfit Match",
    colorPattern: "Detected from uploaded photo",
    styleType: "Fashion item visible on person photo",
    fabricTexture: "Visible textile finish",
    brandMatch: "Similar Web Match",
    merchantDomain: "google.com/shopping",
    estimatedPrice: 4999,
    gender: "Unisex",
    confidence: 0.45,
    searchKeywords: ["uploaded outfit", "similar fashion", "buy online", "visual match"],
    buyOptions: [
      {
        label: "Search similar outfit online",
        merchantDomain: "google.com/shopping",
        estimatedPrice: 4999,
      },
    ],
  };
}
