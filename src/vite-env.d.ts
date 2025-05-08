
/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_TWILIO_ACCOUNT_SID?: string;
    readonly VITE_TWILIO_AUTH_TOKEN?: string;
    readonly VITE_TWILIO_SERVICE_SID?: string;
    readonly VITE_VONAGE_API_KEY?: string;
    readonly VITE_VONAGE_API_SECRET?: string;
    readonly VITE_VONAGE_BRAND_NAME?: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly BASE_URL: string;
    readonly [key: string]: string | boolean | undefined;
  };
}

declare module "*.svg" {
  import React = require("react");
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}
