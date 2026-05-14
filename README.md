# Ashish Dabhi - Personal Portfolio
> A stunning, high-performance 3D interactive portfolio built with React and Three.js.

## 🚀 Live Demo
[https://www.ashishdabhi.in]

---

## 🛠️ Built With

This project uses a modern web development stack to achieve dynamic 3D rendering and glassmorphism UI:

- **Framework:** React 18 & Vite
- **Styling:** Vanilla CSS (Glassmorphism, CSS Variables, Flexbox/Grid)
- **3D Graphics:** 
  - `three` (WebGL engine)
  - `@react-three/fiber` (React layer for Three.js)
  - `@react-three/drei` (Useful helpers for R3F)
  - `@react-three/rapier` (3D Physics)
- **Animations:** GSAP (GreenSock Animation Platform) & React Fast Marquee
- **Icons:** React Icons
- **Email Integration:** `@emailjs/browser` (Direct browser-to-email contact form)
- **Analytics:** Vercel Analytics

---

## 💻 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites
Make sure you have Node.js installed (v18 or higher recommended).
- [Download Node.js](https://nodejs.org/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashishdabhi019/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   *(Note: This project uses `emailjs-browser`, `three`, and `gsap` as core components)*

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will automatically open or be available at `http://localhost:5173`.

---

## 🎨 How to Customize for Yourself

If you want to use this portfolio as a template for your own site, follow these steps to replace my data with yours:

### 1. Update Personal Data
Open `src/data/` (or the respective component files) and update the text, links, and project details:
- **`About.tsx`**: Update your bio and background.
- **`Career.tsx` / `Work.tsx`**: Add your own project images and descriptions.
- **`SocialIcons.tsx` & `Contact.tsx`**: Replace my GitHub, LinkedIn, Twitter, and Instagram URLs with your own.

### 2. Configure the Contact Form (EmailJS)
The contact form works without a backend! You just need to link it to your own email address.

1. Go to [EmailJS](https://www.emailjs.com/) and create a free account.
2. Add a new **Email Service** (e.g., connect your Gmail) and note the `Service ID`.
3. Create an **Email Template** using these exact variables: `{{from_name}}`, `{{from_email}}`, `{{mobile}}`, `{{location}}`, `{{message}}`. Note the `Template ID`.
4. Go to **Account → API Keys** and copy your `Public Key`.
5. Open `src/components/ContactForm.tsx` and paste these 3 IDs at the top of the file:
   ```typescript
   const SERVICE_ID = "YOUR_SERVICE_ID";
   const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
   const PUBLIC_KEY = "YOUR_PUBLIC_KEY";
   ```

### 3. Change Colors & Theming
The entire site is themed using CSS variables. To change the primary accent color (currently Teal/Cyan) or background:

Open `src/index.css` and locate the `:root` variables block at the top:
```css
:root {
  --accentColor: #5eead4; /* Change this hex to your preferred brand color */
  --backgroundColor: #0a0e17; /* Change the dark background theme */
}
```

### 4. 3D Elements & Physics
The interactive 3D elements are handled by `@react-three/fiber` and `@react-three/rapier`. You can modify the models, physics boundaries, or lighting in the `TechStack` component or any specific 3D component files inside `src/`.

---

## 📦 Deployment

When you're ready to deploy to production (Vercel, Netlify, GitHub Pages, etc.):

1. Run the build command:
   ```bash
   npm run build
   ```
2. The optimized production-ready files will be generated in the `dist/` folder.
3. Deploy the `dist/` folder to your hosting provider.

---

## 📄 License
This project is open-source and available under the MIT License. You are free to use it, modify it, and distribute it as long as you provide attribution.

---

*Designed and Developed by [Ashish Dabhi](https://github.com/ashishdabhi019)*
