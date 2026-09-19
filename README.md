# Neon Gears

Create a fully-functional, ultra-modern Cyberpunk-themed Gaming Laptop Store web application with a secure admin system. The UI must feature a pitch-black background (#000000) with glowing RGB neon accent lights (Neon Pink, Electric Cyan, and Lime Green) applied to borders, card edges, and text highlights. At the top, implement a responsive glowing navbar with a futuristic logo 'PROFESSIONAL STORE'. The hero section must feature a giant bold animated header: 'LEVEL UP YOUR GEAR'. Below the hero, add a highly-responsive search bar and clean category filters (e.g., Ultra Gaming, Mid-Range, Budget) optimized to filter an inventory of 20 to 30 laptops seamlessly. Below the controls, render a responsive dynamic grid of Laptop Cards that fetches data from a Supabase backend. Each card must have a glowing border on hover and display: a high-quality laptop image, the specific model name, price, and a bulleted list of specifications (CPU, GPU, RAM, Storage). Underneath the specs in each card, place a prominent neon green gradient WhatsApp button with an icon. When clicked, it must open a pre-filled message via https://wa.me stating: 'Hello Professional Store, I want to order the [Insert Laptop Model Name here]'. Implement a secure authentication login page using Supabase. If a user logs in with the admin email 'a16268455@gmail.com', grant full access to a private Admin Dashboard. Inside this Dashboard, create a 'Manage Catalog' view with a secure dashboard table displaying all inventory, and fully functional forms to: 1) Add a new laptop with image URL and specs, 2) Edit existing laptop details/prices, and 3) Delete a laptop. Ensure any dashboard update instantly reflects on the public gaming storefront layout.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://gamercastle.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ee69e2ec-904e-4d96-a658-df3218112edb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
