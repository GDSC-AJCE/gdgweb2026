# GDSC AJCE - Current Website Content & Assets Archive

> Extracted from the live site: [https://gdsc-ajce.github.io/home/](https://gdsc-ajce.github.io/home/)  
> Source Repository: [GDSC-AJCE/home](https://github.com/GDSC-AJCE/home)  
> Chapter: **Google Developer Student Clubs – Amal Jyothi College of Engineering (Kanjirappally)**

---

## 1. General Organization & Contact Details

| Attribute | Details |
| :--- | :--- |
| **Organization Name** | Google Developer Student Clubs - Amal Jyothi College of Engineering (GDSC AJCE) |
| **Official Chapter Page** | [gdsc.community.dev/amal-jyothi-college-of-engineering-kanjirappally](https://gdsc.community.dev/amal-jyothi-college-of-engineering-kanjirappally/) |
| **Email** | [dsc@amaljyothi.ac.in](mailto:dsc@amaljyothi.ac.in) |
| **Phone** | +91 9778 130 551 |
| **WhatsApp Community** | [Join Community](https://chat.whatsapp.com/I283WPrqz0yGAfmqL1Bb8o) |
| **Instagram** | [@gdscajce](https://www.instagram.com/gdscajce/?utm_source=ig_web_button_share_sheet&igshid=OGQ5ZDc2ODk2ZA==) |
| **LinkedIn** | [GDSC Amal Jyothi](https://www.linkedin.com/in/gdsc-amal-jyothi-a74979256/) |
| **Institution** | Amal Jyothi College of Engineering, Kanjirappally, Kerala, India |

---

## 2. Navigation Architecture

- **Home** (`/#hero-m`)
- **About Us** (`/#about`)
- **Newsletter** (`/#newsletter` & `/newsletter.html`)
- **Gallery** (`/#gallery`)
- **Events** (`/event.html`)
- **GCSJ Leaderboard** (Google Cloud Study Jams):
  - *Individual Leaderboard* (`/individual.html`)
  - *Group Leaderboard* (`/group.html`)
- **Contact** (`/#contact`)
- **CTA Button**: `Join Us` (Links to official Bevy/Community Dev platform)

---

## 3. Homepage Content (`index.html`)

### 3.1 Hero Section
- **Brand Headline**: `GDSC AJCE` (Styled in Google primary colors: G - Blue `#4285F4`, D - Red `#EA4335`, S - Yellow `#F9AB00`, C - Green `#34A853`)
- **Hero Banners (Carousel, 3000ms interval)**:
  - Yellow Banner: `assets/img/icons/Banner Yellow L.jpg` (Desktop) / `Banner Yellow S.jpg` (Mobile)
  - Red Banner: `assets/img/icons/Banner Red L.jpg` (Desktop) / `Banner Red S.jpg` (Mobile)
  - Blue Banner: `assets/img/icons/Banner Blue L.jpg` (Desktop) / `Banner Blue S.jpg` (Mobile)
  - Green Banner: `assets/img/icons/Banner Green L.jpg` (Desktop) / `Banner Green S.jpg` (Mobile)
- **Primary CTA**:
  - Label: `Join Us!`
  - URL: `https://gdsc.community.dev/amal-jyothi-college-of-engineering-kanjirappally`

---

### 3.2 About Us Section
- **Section Title**: `About Us`
- **Mission Statement**:
  > "Build solutions using Google technology for regional companies and communities while networking and learning with other aspiring developers."

- **Three Core Pillars**:
  1. **CONNECT**:
     > Meet pupils at your institution or university who are enthusiastic about developer tools. Everyone is invited, regardless of their academic specialisation.
  2. **LEARN**:
     > Through practical seminars, events, lectures, and project-building activities, you can learn about a variety of technical subjects and acquire new skills.
  3. **GROW**:
     > Build excellent solutions to neighbourhood issues using new knowledge. Expand your network and job opportunities. Help others learn as a way to give back to your neighbourhood.

- **Community Description**:
  > "We are a collection of tech enthusiasts interested in learning about technology, sharing expertise, and collaborating to create something to enhance the future. We hold talks, workshops, and other events on a variety of tech-related topics to help you learn more about technology. With weekly activities that are filled with knowledge that is typically not taught within the four walls of a classroom, we teach computer enthusiasts the fundamental learning skills they need to succeed."

- **Action CTA**:
  - Button text: `Learn More`
  - URL: `https://gdsc.community.dev/amal-jyothi-college-of-engineering-kanjirappally/`

---

### 3.3 Newsletter Teaser Section
- **Section Title**: `Newsletter`
- **Graphic Asset**: `assets/img/news.png`
- **Body Copy**:
  > "Welcome to our newsletter for tech enthusiasts! Delve into the ever-evolving realm of computer science, where we unravel the latest trends and breakthroughs. Stay ahead with valuable insights into emerging technologies, ensuring you're primed for the future. Whether you're a seasoned coder or just starting out, our curated content has something for everyone. Join us on this exciting journey at the forefront of technology!"
- **Action CTA**:
  - Button text: `Read More`
  - URL: `newsletter.html`

---

### 3.4 Gallery Section
- **Section Title**: `Gallery`
- **Subtitle**: `Get a glimpse of our previous events`
- **Display Format**: Lightbox grid (`baguetteBox.js`)
- **Images**:
  - `gallery-photos/top (2) (Medium).JPG`
  - `gallery-photos/top (3) (Medium).JPG`
  - `gallery-photos/side (3) (Medium).JPG`
  - `gallery-photos/portrait (2)(1) (Medium).jpg`
  - `gallery-photos/side (1) (Medium).jpg`

---

### 3.5 Frequently Asked Questions (FAQ)
- **Section Title**: `Frequently Asked Questions`
- **Subtitle**: `Questions you might have and their answers`

1. **What is GDSC?**
   > Google Developer Student Clubs are university based community groups for students interested in Google developer technologies. Students from all undergraduate or postgraduate programs with an interest in growing as a developer can join GDSC.

2. **What are the benefits of joining GDSC?**
   > Professional growth: It includes having access to technical expertise and community management training.  
   > Network growth: Access to a global network of student leaders, professional community organizers, industry experts.

3. **Is GDSC only for students in computer science?**
   > No! Students from all programs who are interested in growing as a developer can join GDSC.

4. **How do I join GDSC AJCE and is it free?**
   > You can join GDSC AJCE by filling out this form and it is free of cost.

---

### 3.6 Contact Section
- **Section Title**: `Contact`
- **Contact Channels**:
  - **Email**: `dsc@amaljyothi.ac.in`
  - **Phone**: `+91 9778 130 551`
  - **WhatsApp Community**: [Join here](https://chat.whatsapp.com/I283WPrqz0yGAfmqL1Bb8o)
- **Contact Form Fields**:
  - Full Name (`name`)
  - Email Address (`email`)
  - Subject (`subject`)
  - Message (`message`)
  - Endpoint: `forms/contact.php`

---

### 3.7 Footer Section
- **Brand Info**: GDSC AJCE
- **Email**: `dsc@amaljyothi.ac.in`
- **Quick Links**:
  - Home (`#home`)
  - About us (`#about`)
  - Events (`event.html`)
  - Gallery (`#gallery`)
- **Social Handles**:
  - Instagram: `https://www.instagram.com/gdscajce/`
  - LinkedIn: `https://www.linkedin.com/in/gdsc-amal-jyothi-a74979256/`

---

## 4. Events Page Content (`event.html`)

### Featured Event: GDSC Solution Challenge 2024 Kickoff
- **Title**: `GDSC Solution Challenge 2024 Kickoff`
- **Date & Time**: `Jan 11, 2024, 8:30 - 10:00 PM`
- **Event Type**: Virtual Event
- **Registration Deadline**: `Jan 11, 2024`
- **RSVP Link**: [https://rebrand.ly/pkuhtfd](https://rebrand.ly/pkuhtfd)
- **Event QR Code**: `https://envs.sh/uMT.png`
- **Slide Banners**:
  - Slide 1: `https://envs.sh/uMW.webp`
  - Slide 2: `https://envs.sh/uMn.webp`
- **Introductory Video**:
  - YouTube Embed: `https://www.youtube.com/embed/duP_AI2B2XM`

#### Event Description:
> "Join us for the GDSC Solution Challenge Kickoff 2024. We will provide an overview of the Solution Challenge, the United Nations Sustainable Development Goals, the Google products you can use for your project, and you'll get the chance to network with others."

#### About the United Nations SDGs:
> "The 2030 Agenda for Sustainable Development, adopted by all United Nations Member States in 2015, provides a shared blueprint for peace and prosperity for people and the planet, now and into the future. At its heart are the 17 Sustainable Development Goals (SDGs), which are an urgent call for action by all countries - developed and developing - in a global partnership. They recognize that ending poverty and other deprivations must go hand-in-hand with strategies that improve health and education, reduce inequality, and spur economic growth - all while tackling climate change and working to preserve our oceans and forests."

#### What to Expect:
- Learn about the Google Solution Challenge 2024.
- Discover the exciting opportunities and challenges it presents.
- Win exciting prizes and have an opportunity to display your project globally.
- Gain insights into the competition structure and guidelines.

#### RSVP Details & Inquiries:
> "Secure your spot by RSVPing to the event. This info session is your gateway to unlocking the full potential of the Google Solution Challenge 2024. Whether you're a seasoned coder or just getting started, this is an opportunity you won't want to miss!  
> For updates and further information, keep an eye on our GDSC-AJCE page.  
> Contact us at dsc@amaljyothi.ac.in for any queries."

#### Legacy / Archived Event Templates (Found in HTML):
- **Python Workshop**:
  - Capacity: 40 seats
  - Date & Time: 24th March, 4:00 PM - 5:00 PM
  - Image: `gallery-photos/side (1) (Medium).jpg`

---

## 5. Newsletter Publication (`newsletter.html`)

- **Page Title**: `GDSC AJCE - Newsletter`
- **Format**: Interactive Canva Digital Flipbook / Presentation
- **Reader Prompt**: *"👇 Swipe to Read More! 👇"*
- **Canva Embed URL**:
  - [https://www.canva.com/design/DAFwFureLzg/view?embed](https://www.canva.com/design/DAFwFureLzg/view?embed)
- **Direct Canva Link**:
  - [Canva Newsletter Document](https://www.canva.com/design/DAFwFureLzg/view?utm_content=DAFwFureLzg&utm_campaign=designshare&utm_medium=embeds&utm_source=link)
- **Credits**: "Newsletter by Developer Student Club AJCE"

---

## 6. Google Cloud Study Jams (GCSJ) Leaderboards (`individual.html` & `group.html`)

- **Program**: Google Cloud Study Jams (GCSJ)
- **Live Search**: Client-side dynamic search by player name or group
- **Leaderboard Table Structure**:
  1. `Sl. No.`
  2. `Name`
  3. `Group`
  4. `Score`
  5. `Status`

---

## 7. Core Team Members Roster (`team_members.js`)

| Name | Role / Position | LinkedIn | GitHub | Profile Image |
| :--- | :--- | :--- | :--- | :--- |
| **Jonat J Mathew** | President | [LinkedIn](https://www.linkedin.com/in/jonat-j-mathew06/) | [GitHub](https://github.com/SoulReaper06) | `Jonat J.jpg` |
| **Hazna R Mohammed** | Vice President | — | — | `Abishek R Paleri.jpg` |
| **Vivek Nair** | Technical Lead | [LinkedIn](https://www.linkedin.com/in/vivek-nair-63b63a20b/) | [GitHub](https://github.com/Vivek0306) | `Vivek Nair.jpg` |
| **Akhil L** | Web Lead | [LinkedIn](https://www.linkedin.com/in/akhil-l-7a2551219/) | [GitHub](https://github.com/AkhilLV) | `Akhil L.jpeg` |
| **Zameel Hassan** | Python Lead | [LinkedIn](https://www.linkedin.com/in/zameel-hassan-83016420b/) | [GitHub](https://github.com/Zameelhassan) | `Zameel Hassan.png` |
| **Abishek R Paleri** | Design Lead | — | — | `Abishek R Paleri.jpg` |
| **Ria Mariam Mathews** | Design Team | [LinkedIn](https://www.linkedin.com/in/ria-mariam-mathews-721571207/) | — | `Screenshot_..._Ria Mariam Mathews.jpg` |
| **Sam Stephen Thomas** | Management Lead | — | — | `P1050059 (3) - Sam Stephen Thomas.jpg` |
| **Joshwa Thomas** | Management Team | [LinkedIn](https://www.linkedin.com/in/joshwa-thomas-67b64a206) | [GitHub](https://github.com/Jtc345) | `JOSHWA THOMAS.png` |
| **Sebin Thomas** | Management Team | [LinkedIn](https://www.linkedin.com/in/sebin-thomas-44a6231b0/) | — | `Remini... - Sebin Thomas.jpg` |
| **Nikitha Mary Varghese** | Management Team | — | — | `Nikitha Mary Varghese.jpg` |
| **Asif Shereef** | Management Team | — | — | `asif shereef.jpg` |
| **Melvin Tom Varghese** | Marketing Team | — | — | `Melvin Tom Varghese.jpg` |
| **SUMAYYA MAHEEN** | Marketing Team | [LinkedIn](https://www.linkedin.com/in/sumayya-maheen-7a1b74218) | [GitHub](https://github.com/Sumayya-Maheen) | `SumayyaMaheen...jpg` |
| **Earwin Joseph** | Core Member | — | — | `EARWIN JOSEPH.jpg` |
| **Sharon Baby Thomas** | Core Member | [LinkedIn](https://www.linkedin.com/in/sharon-baby-thomas-a411a5228) | — | `IMG_... - Sketch Sharon.jpg` |
| **Jibu K Samuel** | Core Member | [LinkedIn](https://www.linkedin.com/in/jibu-k-samuel/) | — | `JIBU K SAMUEL.jpg` |
| **Neha Samson** | Core Member | — | — | `Neha Samson.jpg` |

---

## 8. Brand Identity, Fonts & Design Assets

### 8.1 Google Brand Color Palette
- **Google Blue**: `#4285F4`
- **Google Red**: `#EA4335`
- **Google Yellow**: `#FBBC04` / `#F9AB00`
- **Google Green**: `#34A853`

### 8.2 Typography
- Headings: `Product Sans`, `Rubik`, `Poppins`, `Raleway`
- Body Text: `Open Sans`, `Segoe UI`, system sans-serif

### 8.3 Core Icons & External CDNs
- Logo: `assets/img/icons/logo.svg`
- Icon packs: `Phosphor Icons`, `Bootstrap Icons` (`bi`), `Boxicons` (`bx`), `Remix Icons` (`ri`)
- Third-party widgets: Tally embed (`https://tally.so/widgets/embed.js`), Canva Viewer, YouTube Embed Player
