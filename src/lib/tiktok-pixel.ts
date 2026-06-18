type TikTokEvent =
  | "PageView" | "ViewContent" | "Search"
  | "AddToCart" | "InitiateCheckout" | "CompleteRegistration"
  | "SubmitForm" | "Contact" | "ClickButton"
  | "Purchase" | "Subscribe" | "Login";

interface TikTokEventParams {
  value?: number;
  currency?: string;
  content_id?: string;
  content_name?: string;
  content_type?: string;
  content_category?: string;
  quantity?: number;
  price?: number;
  order_id?: string;
  search_string?: string;
  email?: string;
  phone_number?: string;
  [key: string]: string | number | boolean | undefined;
}

interface Ttq {
  page: () => void;
  track: (event: string, params?: TikTokEventParams) => void;
  [key: string]: unknown;
}

function getTtq(): Ttq | undefined {
  return (window as unknown as Record<string, unknown>).ttq as Ttq | undefined;
}

function track(event: TikTokEvent, params?: TikTokEventParams) {
  const ttq = getTtq();
  if (ttq?.track) {
    ttq.track(event, params);
  }
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

  submitForm() {
    track("SubmitForm");
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

  purchase(params?: TikTokEventParams) {
    track("Purchase", params);
  },

  subscribe() {
    track("Subscribe");
  },
};
