const TIKTOK_EVENTS = {
  PageView: "PageView",
  ViewContent: "ViewContent",
  Search: "Search",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  CompleteRegistration: "CompleteRegistration",
  SubmitForm: "SubmitForm",
  Contact: "Contact",
  ClickButton: "ClickButton",
  Purchase: "Purchase",
  Subscribe: "Subscribe",
  Login: "Login",
} as const;

type TikTokEvent = keyof typeof TIKTOK_EVENTS;

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

function getTtq(): any {
  return (window as any).ttq;
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
