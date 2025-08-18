// src/config/links.ts

export const LINKS = {
  forms: {
    newMember: "https://docs.google.com/forms/d/e/1FAIpQLScR44EQbFVoiMEaVJKN8tOy2JiNISN_OUTtorWkOUR6pAc6Xg/viewform?usp=dialog",
    ffcMember: "https://docs.google.com/forms/d/e/1FAIpQLSeRMcQ7UNr0wXewbL6OMqv60DMpvHTuA8XRclmYljGunNX-Ng/viewform?usp=dialog",
    sponsor: "https://docs.google.com/forms/d/e/1FAIpQLSfKC5ptPjarwqpH0_KkGyhXrgB2ekWj6fHyMbhGyqf0pjDzsA/viewform?usp=dialog",
  },
  nationStates: {
    forest: "https://www.nationstates.net/region=forest",
    bilsa: "https://www.nationstates.net/nation=bilsa",
  },
  social: {
    discordFFC: "https://discord.com/invite/EX4sGhjbgU",
    discordForest: "https://discord.com/invite/c2Uw6MN",
    youtube: "https://www.youtube.com/@Bolbon",
    twitch: "https://www.twitch.tv/bolbon_",
    kick: "https://kick.com/bolbon",
  },
  donations: {
    paypal: import.meta.env.PUBLIC_PAYPAL_LINK,
    mercadopago: import.meta.env.PUBLIC_MERCADOPAGO_LINK
  }
} as const;
