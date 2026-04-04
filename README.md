# Forestian Foobtall Confederation (FFC) - Astro Project

Website built with **Astro**. Showcases tournaments, match details, and national federations of the FFC.

---
## 📰 Articles

* **To do articles:**
  <!-- * “Presenting Achievements” -->
  * "FC 2022 summary" and other FC 22 articles (Prizes: Vela, Dartmouth, best goal)
  * "FC 2024 summary" and other FC 24 articles (Prizes: Tarasov, Nysnub, best goal)

---

## ⚙️ Should Do (Medium Priority)

* **Add stadiums to all matches possible, and show them in match cards**
* **Create “About Us” page**
  Explain the NationStates community, the Forest lore, and why/how the FFC was founded.

---

## 🎨 Nice to Have (Low Priority)

* **Bracket Component Rewrite**
  Fully remake the knockout bracket UI from scratch for clarity and responsiveness.

---

## 🔮 Medium‑Term Future

* **Search Bar Component**
  Build a searchbar (Articles, Members, Tournaments) for a later release.

---

## 🌌 Long‑Term Future

* **Champions League Support**
  Adapt match cards, tournaments pages, etc., to also handle Forestian Champions League editions.
* **Player content collection**
  Include them in 'members/[slug]/squad', make playercards with name, rating, team, age, image, etc.

---

## 🎖 Achievements

* **Create Icons for Each Achievement**
  Design small SVG or PNG badges for every achievement type.
* **Create More Achievements**
  Expand achievement library with new conditions.
* **Stylish Achievements Page (test.astro)**
  A page with all the achievements of the FFC. Organized by Category->Subcategory. Should show:
  - Owners
  - Not unlocked achievements should not be showed, instead, a mystery card
  
---

## 🗃️ Backend

- [ ] **Complete match data**  
&nbsp;&nbsp;&nbsp;&nbsp;Use Astro’s Content Collections for better content organization and markdown-powered routing.
  - [ ] `Lineups` for each team
  - [ ] `Cards` for each team
  - [ ] `Substitutions` from each team
  - [ ] `Stats` for each team
  - [ ] `Details` for each match
  
- [ ] **Add assists to all 2022 matches**

---

## ❌ Discarded

* **Create “Sign Up” form**_Discarded because google forms doesn't accept HTML embedding with file uploads_
  A simple email‑only form (with Google Forms fallback) that also lets existing teams update their info.

- ❌ **Create dynamic pages for each tournament (by ID/slug)** _Discarded: Using static versions instead_ 
&nbsp;&nbsp;&nbsp;&nbsp;Needs collections in Markdown first. Each tournament should have its own route like `/tournament/fc-2022`.

---
