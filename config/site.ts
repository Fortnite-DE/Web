export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Fortnite Deutschland Discord",
  description: "Der offizielle Fortnite Deutschland Discord Server",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
    },
  ],
  navMenuItems: [
    {
      label: "Leaderboard",
      href: "/leaderboard",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
  },
};
