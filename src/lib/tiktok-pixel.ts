type TikTokEvent =
  | "PageView" | "ViewContent" | "Search"
  | "AddToCart" | "AddToWishlist" | "InitiateCheckout"
  | "CompleteRegistration" | "Contact"
  | "ClickButton" | "Lead" | "Purchase"
  | "Subscribe" | "Login" | "PlaceAnOrder";

interface TikTokContent {
  content_id: string;
  content_type: string;
  content_name: string;
  quantity?: number;
  price?: number;
}

interface TikTokEventParams {
  value?: number;
  currency?: string;
  content_id?: string;
  content_name?: string;
  content_type?: string;
  content_category?: string;
  contents?: TikTokContent[];
  quantity?: number;
  price?: number;
  order_id?: string;
  search_string?: string;
  email?: string;
  phone_number?: string;
  event_id?: string;
  [key: string]: string | number | boolean | TikTokContent[] | undefined;
}

interface TikTokIdentifyParams {
  email?: string[];
  phone_number?: string[];
  external_id?: string[];
}

interface Ttq {
  page: () => void;
  track: (event: string, params?: TikTokEventParams) => void;
  identify: (params: TikTokIdentifyParams | string) => void;
  [key: string]: unknown;
}

function getTtq(): Ttq | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as Record<string, unknown>).ttq as Ttq | undefined;
}

function track(event: TikTokEvent, params?: TikTokEventParams) {
  const ttq = getTtq();
  if (ttq?.track) {
    ttq.track(event, params);
  }
}

function callIdentify(params: TikTokIdentifyParams) {
  const ttq = getTtq();
  if (ttq?.identify) {
    ttq.identify(params);
  }
}

export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const ttqEvent = {
  page() {
    const ttq = getTtq();
    if (ttq?.page) {
      ttq.page();
    }
  },

  viewContent(params?: TikTokEventParams) {
    track("ViewContent", params);
  },

  search(searchString: string) {
    track("Search", { search_string: searchString });
  },

  contact() {
    track("Contact");
  },

  clickButton(params?: TikTokEventParams) {
    track("ClickButton", params);
  },

  completeRegistration() {
    track("CompleteRegistration");
  },

  login() {
    track("Login");
  },

  addToCart(params?: TikTokEventParams) {
    track("AddToCart", params);
  },

  initiateCheckout(params?: TikTokEventParams) {
    track("InitiateCheckout", params);
  },

  lead(params?: TikTokEventParams) {
    track("Lead", params);
  },

  purchase(params?: TikTokEventParams) {
    track("Purchase", params);
  },

  subscribe() {
    track("Subscribe");
  },

  placeAnOrder(params: TikTokEventParams) {
    track("PlaceAnOrder", params);
  },

  identify(params: TikTokIdentifyParams) {
    callIdentify(params);
  },
};
