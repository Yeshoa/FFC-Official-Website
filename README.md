# Forestian Foobtall Confederation (FFC) - Astro Project

Website built with **Astro**. Showcases tournaments, match details, and national federations of the FFC.

---

## 🗃️ Backend

- [ ] **Migrate existing TypeScript collections to Markdown**  
&nbsp;&nbsp;&nbsp;&nbsp;Use Astro’s Content Collections for better content organization and markdown-powered routing. _(High priority, in progress)_

- [ ] **Create dynamic pages for each tournament (by ID/slug)**  
&nbsp;&nbsp;&nbsp;&nbsp;Needs collections in Markdown first. Each tournament should have its own route like `/tournament/fc-2022`.

---

## 🧠 General Tasks

- [ ] **Create "sign up" form**  
&nbsp;&nbsp;&nbsp;&nbsp;A simple form to join the FFC (email submission only, not user login). Previously done with Google Forms. (Keep the google form as alternative)  

- [ ] **Add "Sponsor Registration" page**  
&nbsp;&nbsp;&nbsp;&nbsp;Link to this form from the navbar. Name, Logo and... what else?.

- [ ] **Landing Page**  
&nbsp;&nbsp;&nbsp;&nbsp;Add content to the landing page, maybe changing the "grid hero" with a full width React carousel.

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
