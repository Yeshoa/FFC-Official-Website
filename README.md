# Forestian Foobtall Confederation (FFC) - Astro Project

Website built with **Astro**. Showcases tournaments, match details, and national federations of the FFC.

---

## 🚨 Must Do (High Priority)

* **Create “About Us” page**
  Explain the NationStates community, the Forest lore, and why/how the FFC was founded.

* **Create key Articles**
  * “How the Website Works” (actual article is a placeholder)
  * “How to Participate and Sign Up”
  * “How the Ranking Works & How to Earn Points”
  * “Presenting Achievements”
* **TournamentGrid.astro: Mobile Fix**
  Make the tournament grid relative? and visually coherent on phones.
* **Add Ranking Explanation Above Table**
  A short intro with link to the full “How the Ranking Works” article.
* **Change Forest Cups heroImg's**
  The current ones are placeholders and not very appealing. (Think of adding images about the Host Nation instead)

---

## ⚙️ Should Do (Medium Priority)

* **Add Sponsor Registration page/form**
  Name, logo upload, roleplay pitch—link it from the navbar.
* **Fix /forest-cup Hero**
  Brainstorm and implement a compelling hero component for `/forest-cup`.
* **Bracket Component Rewrite**
  Fully remake the knockout bracket UI from scratch for clarity and responsiveness.
* **Stylish Achievements Page (test.astro)**
  A page with all the achievements of the FFC. Organized by Category->Subcategory. Should show:
  - Owners
  - Not unlocked achievements should not be showed, instead, a mystery card

---

## 🎨 Nice to Have (Low Priority)

* **Think of a Roleplay‑Friendly Sponsor Intake**
  A fun “in‑universe” form or ID‑based method to recruit sponsors.
* **Create Icons for Each Achievement**
  Design small SVG or PNG badges for every achievement type.
* **Create More Achievements**
  Expand achievement library with new conditions.

---

## 🔮 Medium‑Term Future

* **Search Bar Component**
  Build a React‑powered search (Articles, Members, Tournaments) for a later release.

---

## 🌌 Long‑Term Future

* **Champions League Support**
  Adapt match cards, tournaments pages, etc., to also handle Forestian Champions League editions.

---

## ❌ Discarded

* **Create “Sign Up” form**_Discarded because google forms doesn't accept HTML embedding with file uploads_
  A simple email‑only form (with Google Forms fallback) that also lets existing teams update their info.

---

## 🧠 General Tasks

- ✅ **Landing Page**  
&nbsp;&nbsp;&nbsp;&nbsp;Add content to the landing page, maybe changing the "grid hero" with a full width React carousel.
  - ✅ Banner links to about us, fc, ~~CL~~, members, rankings, forms (sign up)
  - ✅ Display last news
  - ❌ Display last official matches _discarded_

- ✅ **Elaborate the Members page (by slug)**  
&nbsp;&nbsp;&nbsp;&nbsp;Collection by markdown DONE✅. ⚠ Components need to be in /components. Page should look like a profile with all this info:  
  - ❌️ Set up `render` content _discarded_
  - ❌️ ~~Upcoming matches~~ _discarded_
  - ✅ Show a component for **last matches played**
  - ⚠ Component showing **head-to-head stats** against other national teams (only those they've played)
  - ✅ Show **Forest Cup history** [Example](https://es.wikipedia.org/wiki/Selección_de_fútbol_de_Argentina#Estadísticas)
  - ✅ **Records section** [Example](https://es.wikipedia.org/wiki/Selección_de_fútbol_de_Argentina#Récords_y_notas)
  - ✅ **Achievements**
  - ❌ Display `roster` with their numbers _discarded_
  - ✅ Work on score calculations

- ✅️ **Elaborate the Tournaments page**  
&nbsp;&nbsp;&nbsp;&nbsp;Improve Tournaments pages:
  - ✅ `Banner`: An image of the champions, with their flag-name and maybe the trophy
  - ✅ `Headlines`: A component with relevant media.
  - ✅ `Brackets`: Improve bracket match card
  - ✅ `Groups and Matches`
  - ⚠ `Knockout Matches`
  - ✅ `Individual Prizes`
  - ✅ `Overall Table`
  - ❌️ `Team of the Tournament`
  - ❌️ `Minor Stats or gallery`
  - [ ] `Related News`

 - ⛔️**Elaborate the Matches page (by slug)**_discarded: too heavy for deploy_
&nbsp;&nbsp;&nbsp;&nbsp;Collection by markdown DONE✅. Page should show all the match info: [Example](https://www.promiedos.com.ar/game/borussia-dortmund-vs-real-madrid/ebcejgh)

- [ ] **Create "sign up" form**  
&nbsp;&nbsp;&nbsp;&nbsp;A simple form to join the FFC (email submission only, not user login). Previously done with Google Forms. (Keep the google form as alternative). Also it should be an "update info" for already registered teams.

- [ ] **Add "Sponsor Registration" page**  
&nbsp;&nbsp;&nbsp;&nbsp;Link to this form from the navbar. Name, Logo and... what else?.

- ✅ **Add Rankings page**  
&nbsp;&nbsp;&nbsp;&nbsp;Create a page with all the national federations rankings. A table based on points earned during different parameters.

- ❌ **Add Champions League page** _Discarded: For another time_ 
&nbsp;&nbsp;&nbsp;&nbsp;Make a page for the Champions League. It should have a new Layout background, passed through props to define tailwind classes.

---


## 🎨 Frontend Tasks

- ✅ **Make only one theme, no dark mode**  
&nbsp;&nbsp;&nbsp;&nbsp;Remove the dark: in tailwind classes.

- [ ] **Make Tailwind designs more responsive**  
&nbsp;&nbsp;&nbsp;&nbsp;Improve layout for various screen sizes, mobile and tablets.
  - ✅ Home (`/`)
  - ✅ Forest Cup (`/forest-cup`)
    - [ ] FC 2020 (`/forest-cup/2020`)
    - [ ] FC 2022 (`/forest-cup/2022`)
    - [ ] FC 2024 (`/forest-cup/2024`)
  - ✅ Members (`/members`)
    - ✅ Member detail (`/members/[slug]`)
  - ✅️ Ranking (`/ranking`)

- ✅ **Use `<Image />` component where possible and optimize their size**  
&nbsp;&nbsp;&nbsp;&nbsp;Try to optimize image rendering.

---

## 🗃️ Backend

- [ ] **Complete match data**  
&nbsp;&nbsp;&nbsp;&nbsp;Use Astro’s Content Collections for better content organization and markdown-powered routing.
  - [ ] `Lineups` for each team
  - [ ] `Cards` for each team
  - [ ] `Substitutions` from each team
  - [ ] `Stats` for each team
  - [ ] `Details` for each match
  
- ❌ **Create dynamic pages for each tournament (by ID/slug)** _Discarded: Using static versions instead_ 
&nbsp;&nbsp;&nbsp;&nbsp;Needs collections in Markdown first. Each tournament should have its own route like `/tournament/fc-2022`.
  
- [ ] **Add assists to all 2022 matches**

---
