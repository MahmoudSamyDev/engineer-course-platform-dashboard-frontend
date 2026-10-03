import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode (SRS DC-01): no runtime server. `react-router build` pre-renders the root
  // route into build/client/index.html; deploy build/client to any static host with
  // all paths rewritten to index.html.
  ssr: false,
} satisfies Config;
