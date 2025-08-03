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
* **Change Forest Cups heroImg's**
  The current ones are placeholders and not very appealing. (Think of adding images about the Host Nation instead)
* **Adapt the web for supporting a Forest Cup before being played**
  - Member Participation Table: It should show "Qualified" of "To be determined" instead of "Didn't participate"
  - Maybe work in how to include the Qualifiers
  - In /forest-cup, the history table should show "To be disputed" in future editions
  - In /forest-cup/2026 there should be a hero adapted to the new edition, showing an image of the host nation
  - Headlines should be about: the ball, the venues, or news, that link to articles?
  - There should not be any stats untill the tournament starts
  - Groups and Knockout Matches should show default placeholders

---

## ⚙️ Should Do (Medium Priority)

* **Create Sponsor Registration form**
  Name, logo upload, roleplay.
* **Fix /forest-cup Hero**
  Brainstorm and implement a compelling hero component for `/forest-cup`.
* **Bracket Component Rewrite**
  Fully remake the knockout bracket UI from scratch for clarity and responsiveness.
* **Change "join us" button in the main hero**
  It should link to somewhere presentating the whole thing, or something like that.
* **Change the "FC24 all goals" hero**
  There should be a different hero more intuitive.
---

## 🎨 Nice to Have (Low Priority)

* **Think of a Roleplay‑Friendly Sponsor Intake**
  A fun “in‑universe” form or ID‑based method to recruit sponsors.
* **Create Icons for Each Achievement**
  Design small SVG or PNG badges for every achievement type.
* **Create More Achievements**
  Expand achievement library with new conditions.
* **Add stadiums to all matches possible, and show them in match cards**
* **Stylish Achievements Page (test.astro)**
  A page with all the achievements of the FFC. Organized by Category->Subcategory. Should show:
  - Owners
  - Not unlocked achievements should not be showed, instead, a mystery card

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
  - ✅ Component showing **head-to-head stats** against other national teams (only those they've played)
  - ✅ Show **Forest Cup history** [Example](https://es.wikipedia.org/wiki/Selección_de_fútbol_de_Argentina#Estadísticas)
  - ✅ **Records section** [Example](https://es.wikipedia.org/wiki/Selección_de_fútbol_de_Argentina#Récords_y_notas)
  - ✅ **Achievements**
  - ❌ Display `roster` with their numbers _discarded_
  - ✅ Work on score calculations

- ✅️ **Elaborate the Tournaments page**  
&nbsp;&nbsp;&nbsp;&nbsp;Improve Tournaments pages:
  - ✅ `Banner`: An image of the champions, with their flag-name and maybe the trophy
  - ✅ `Headlines`: A component with relevant media.
  - ✅ `Individual Prizes`
  - ✅ `Groups and Matches`
  - ✅ `Knockout Matches`
  - ❌️ `Brackets`: Improve bracket match card
  - ✅ `Overall Table`
  - ❌️ `Team of the Tournament`
  - ❌️ `Minor Stats or gallery`
  - [ ] `Related News`

 - ⛔️**Elaborate the Matches page (by slug)**_discarded: too heavy for deploy_
&nbsp;&nbsp;&nbsp;&nbsp;Collection by markdown DONE✅. Page should show all the match info: [Example](https://www.promiedos.com.ar/game/borussia-dortmund-vs-real-madrid/ebcejgh)

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
    - ✅ FC 2020 (`/forest-cup/2020`)
    - ✅ FC 2022 (`/forest-cup/2022`)
    - ✅ FC 2024 (`/forest-cup/2024`)
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
