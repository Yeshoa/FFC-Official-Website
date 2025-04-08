# Forestian Foobtall Confederation (FFC) - Astro Project

Website built with **Astro**. Showcases tournaments, match details, and national federations of the FFC.

---

## 🧠 General Tasks

- [ ] **Elaborate the Members page (by slug)**  
&nbsp;&nbsp;&nbsp;&nbsp;Collection by markdown DONE✅. Page should look like a profile with all this info:
  - [ ] Display `code`
  - [x] Display `name`
  - [ ] Display `nslink` (NationStates link)
  - [ ] Display `federation` as a link to the Federation Dispatch
  - [ ] Display `flag` image
  - [ ] Display `logo` image
  - [x] Display `region`
  - [ ] Display `founded date`
  - [ ] Display `affiliation date`
  - [ ] ~~Display score~~
  - [ ] If `verification` is true, show a badge with a tick ✅
  - [ ] Show a component for **last matches played**
  - [ ] ~~Upcoming matches~~
  - [ ] Show **Forest Cup history** [Example](https://es.wikipedia.org/wiki/Selección_de_fútbol_de_Argentina#Estadísticas)
  - [ ] ~~Uniform image~~
  - [ ] ~~Sponsor list~~
  - [ ] Component showing **head-to-head stats** against other national teams (only those they've played)
  - [ ] **Records section** [Example](https://es.wikipedia.org/wiki/Selección_de_fútbol_de_Argentina#Récords_y_notas)
  - [ ] **Achievements section** (only Forest Cup for now)
  - [ ] Render custom **text content** from the Markdown file

- [ ] **Elaborate the Matches page (by slug)**  
&nbsp;&nbsp;&nbsp;&nbsp;Collection by markdown DONE✅. Page should show all the match info: [Example](https://www.promiedos.com.ar/game/borussia-dortmund-vs-real-madrid/ebcejgh)

- [ ] **Create "sign up" form**  
&nbsp;&nbsp;&nbsp;&nbsp;A simple form to join the FFC (email submission only, not user login). Previously done with Google Forms. (Keep the google form as alternative)  

- [ ] **Add "Sponsor Registration" page**  
&nbsp;&nbsp;&nbsp;&nbsp;Link to this form from the navbar. Name, Logo and... what else?.

- [ ] **Landing Page**  
&nbsp;&nbsp;&nbsp;&nbsp;Add content to the landing page, maybe changing the "grid hero" with a full width React carousel.

---

## 🗃️ Backend

- [ ] **Migrate existing TypeScript collections to Markdown**  
&nbsp;&nbsp;&nbsp;&nbsp;Use Astro’s Content Collections for better content organization and markdown-powered routing. _(High priority, in progress)_
  - [x] Members
  - [x] Matches
  - [ ] Tournaments - Should have a type and edition (FC uses years: 2020, 2022, 2024, 2026)
  - [ ] ~~Flags~~
  
- [ ] **Create dynamic pages for each tournament (by ID/slug)**  
&nbsp;&nbsp;&nbsp;&nbsp;Needs collections in Markdown first. Each tournament should have its own route like `/tournament/fc-2022`.

---

## 🎨 Frontend Tasks

- [ ] **Make Tailwind designs more responsive**  
&nbsp;&nbsp;&nbsp;&nbsp;Improve layout for various screen sizes, mobile and tablets.

- [ ] **Use `<Image />` component where possible**  
&nbsp;&nbsp;&nbsp;&nbsp;Try to optimize image rendering. If issues arise, consider moving image directories to `public/`.

- [ ] **Build reusable components for tournament pages**  
&nbsp;&nbsp;&nbsp;&nbsp;Standings tables, brackets, match grids — all should be modular to simplify future tournament additions.

- [ ] **Improve match cards**  
&nbsp;&nbsp;&nbsp;&nbsp;Match card having a button to display goal scorers instead of hovering.

---
