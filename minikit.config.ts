const ROOT_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Bit AI",
    subtitle: "Build Your Personal Branding",
    description: "Bit AI is an AI-powered platform that helps you generate high-quality Farcaster posts and build your personal brand effortlessly.",
    screenshotUrls: [
      `${ROOT_URL}/assets/Send_Feature_Scan.png`,
      `${ROOT_URL}/assets/Receive_Feature.png`,
      `${ROOT_URL}/assets/Swap_Feature.png`
    ],
    iconUrl: `${ROOT_URL}/logoPolos.png`,
    splashImageUrl: `${ROOT_URL}/assets/banner.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["ai", "branding", "farcaster", "content", "generator"],
    heroImageUrl: `${ROOT_URL}/assets/banner.png`,
    tagline: "Generate. Post. Grow. Powered by AI.",
    ogTitle: "Bit AI - Personal Branding Assistant",
    ogDescription: "Build your personal brand on Farcaster with AI-driven content generation and IDRX credits.",
    ogImageUrl: `${ROOT_URL}/assets/banner.png`,
  },
} as const;

