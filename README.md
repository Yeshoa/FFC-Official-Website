# Forestian Foobtall Confederation (FFC) - Astro Project

Website built with **Astro**. Showcases tournaments, match details, and national federations of the FFC.

---

## 🧠 General Tasks

- [ ] **Landing Page**  
&nbsp;&nbsp;&nbsp;&nbsp;Add content to the landing page, maybe changing the "grid hero" with a full width React carousel.
  - [ ] Display last news
  - [ ] Display last official matches

- ✅ **Elaborate the Members page (by slug)**  
&nbsp;&nbsp;&nbsp;&nbsp;Collection by markdown DONE✅. ⚠ Components need to be in /components. Page should look like a profile with all this info:
  - ✅ Set up `render` content
  - [ ] ~~Upcoming matches~~
  - ⚠ Show a component for **last matches played**
  - ⚠ Component showing **head-to-head stats** against other national teams (only those they've played)
  - ✅ Show **Forest Cup history** [Example](https://es.wikipedia.org/wiki/Selección_de_fútbol_de_Argentina#Estadísticas)
  - ✅ **Records section** [Example](https://es.wikipedia.org/wiki/Selección_de_fútbol_de_Argentina#Récords_y_notas)
  - ❌ ~~**Achievements section**~~ _discarded_
  - [ ] Display `roster` with their numbers
  - ✅ Work on score calculations

- [ ] **Elaborate the Tournaments page**  
&nbsp;&nbsp;&nbsp;&nbsp;Improve Tournaments pages:
  - [ ] `Banner`: An image of the champions, with their flag-name and maybe the trophy
  - ✅ `Headlines`: A component with relevant media.
  - ✅ `Brackets`: Improve bracket match card
  - ✅ `Groups and Matches`
  - ✅ `Knockout Matches`
  - ✅ `Individual Prizes`
  - ✅ `Overall Table`
  - [ ] `Team of the Tournament`
  - [ ] `Minor Stats or gallery`

- [ ] **Elaborate the Matches page (by slug)**  
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
  - ⚠ Forest Cup (`/forest-cup`)
    - [ ] FC 2020 (`/forest-cup/2020`)
    - [ ] FC 2022 (`/forest-cup/2022`)
    - [ ] FC 2024 (`/forest-cup/2024`)
  - [ ] Members (`/members`)
    - ✅ Member detail (`/members/[slug]`)
  - [ ] Ranking (`/ranking`)
  - [ ] Sponsor (`/sponsor`)

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