# CS 260 Notes

[My startup - Recipe Master](https://www.google.com/search?q=https://recipe.cs260.click)

## Helpful links

* [Course instruction](https://github.com/webprogramming260)
* [Canvas](https://byu.instructure.com)
* [MDN](https://developer.mozilla.org)

## AWS

My IP address is: [98.94.239.65](http://98.94.239.65/)
Launching my AMI I initially put it on a private subnet. Even though it had a public IP address and the security group was right, I wasn't able to connect to it.

## Caddy

No problems worked just like it said in the [instruction](https://byu.instructure.com/courses/32210/pages/caddy).

## HTML

This was not hard, but it was interesting to learn the proper structure and then reimplement everything using industry standards. Moving from plain HTML to a more organized architectural mindset helped clarify how content should be delivered to the user.

For this deliverable, I successfully built the fundamental structure of my startup application. I focused on semantic HTML5 to ensure the site is accessible and well-organized.

* **Structure**: I used semantic elements like `<header>`, `<main>`, `<section>`, and `<footer>` to define the layout.

* **Navigation**: Implemented a functional navigation bar with placeholders for user profiles and favorites.

* **Content**: Created a hero section, feature cards, and a "How It Works" guide to clearly communicate the app's purpose.

* **Typography**: Integrated Google Fonts (Poppins) to ensure a professional and modern look.

* **Placeholders**:
    * **Login**: Added buttons in the header and CTA section for user authentication.
    * **Database**: Designed the feature grid to represent data that will eventually be pulled from my recipe database.
    * **WebSocket**: Added a "Share" feature card which will eventually utilize WebSockets for real-time recipe sharing notifications.

* **Responsiveness**: Included basic CSS media queries to ensure the structure remains intact on mobile devices.

## CSS

Reimplementing the styling wasn't difficult, but it was a great exercise in following modern standards for responsiveness. Starting with basic CSS and moving toward a professional look ensured the application remained clean across different screen sizes.

## JavaScript

I spent a lot of time making the website fully functional and adding the necessary APIs to ensure the frontend connects seamlessly to my database. This layer handles all the core logic, such as recipe and ingredient management, that makes the application more than just a static page.

## React Part 1: Routing

This deliverable was significantly more challenging than the previous ones. Transitioning from plain HTML/CSS to a fully bundled React application took nearly full days of work and resulted in way more Git commits than I initially expected.

The hardest part was breaking down the original monolithic HTML files into separate, reusable components and making sure they all "talked" to each other correctly. Dealing with file imports, exports, and ensuring the directory structure matched the logic was tricky.

However, it was extremely fulfilling to see it finally working—especially when the routing started clicking, and I could navigate between the Landing Page, Login, and Dashboard without the page refreshing.

### Key Learnings:
* **Vite vs CRA:** I learned how to set up a project using Vite, which is much faster than Create React App. I had to learn how to configure `vite.config.js` to handle proxies and custom entry points.
* **Component Architecture:** Moving from copying code to reusing components (like the Header and Footer) saved a lot of time in the long run, even if setting it up was hard.
* **Routing:** Understanding how `react-router-dom` wraps the application to simulate navigation in a Single Page Application (SPA).

## React Part 2: Reactivity

For this part, I focused on making the application interactive and ensuring all views were fully implemented. Although it was hard to see everything not working in the beginning, getting used to passing data between components took some time but was rewarding in the end, and most pages require a valid user to be logged in for security reasons.

I built out specific components for the Dashboard, Recipe Cards, and Authentication forms to mock the complete app functionality. I also spent significant time ensuring the state management aligned with industry standards.

### Key Learnings:
**TODO!!! (Imcomplete!) Mocking with LocalStorage:** I learned how to use `localStorage` to mock a database connection. By saving the user's login state and theme preference to the browser's storage, the app "remembers" the user even after a page refresh, satisfying the persistence requirement.
* **Hooks (`useState`):** I used `useState` extensively to make forms responsive, allowing the app to capture user input for recipes and login credentials in real-time.
* **Side Effects (`useEffect`):** I learned how to use `useEffect` to handle the initial page load state and check for user authentication when the component mounts.
