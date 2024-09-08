# CreatiNote
A decentralized, encrypted, self-hosted notes taking app designed for collaboration and entertainment

The following was written up as a documentation of our work for class, and does not fully represent that which the final project will be.

# Project Overview:
The platform will allow users to:
- **Form Study Groups**: Students can create or join study groups based on subjects, courses, or interests.
- **Schedule Study Sessions**: Group members can schedule sessions, set reminders, and join virtual rooms for real-time collaboration.
- **Collaborate on Notes**: Group members can share and edit notes in real-time, with version history and the ability to export notes.
- **Real-Time Communication**: Enable chat functionality within study groups and during study sessions for seamless communication.
- **Universal Note System**: Media, content and metadata is to be seamlessly combined in a manner that means that the user can drag and drop anything into a list. Want to make a list of films you enjoy? Just drag the film into the list and all of the metadata and whatnot is automatically handled for you for your ease of use, formatted in a way that there’s no blue text or URLS visible to the user, while advanced users can still access the direct markdown, giving power users a great deal of control over how their notes look and the formatting. Our system can generate metadata that looks good and fits documents with no lines of code from the user, and supports platforms like Youtube, Wikipedia, TheMovieDB with optional support
- **Notes as interactive media**: Want to add something to your notes to really make them interesting? Drop in a poll or a wheel or a carousel of images. Widgets are designed to give the user the ability to really make their notes have interesting content, be it flashcards or polls, notes have the ability to go beyond just being a system for note taking.
- **Custom Widgets**: The note user also will have the ability to create their own widgets using Javascript and our JS framework to allow easy and seamless integration into the notes system
- **Universal Note format**: Notes are ultimately universal; they are, after all, just extended markdown with some javascript and css support. Since they are markdown, they are extremely easy to customize and modify, and alongside this Markdown is very easy to read without even a reader.
- **Decentralized Notes**: Everyone can host their own CreatiNote system, so what makes us so special? Well, the CreatiNote platform and servers can communicate between eachother, allowing for users to easily and seamlessly to access content from across the entire CreatiNote network if content is labeled as public, regardless of who hosts what on their server.

### Additional Features to Consider:
- **Task Management**: Add simple task management or to-do lists within study groups.
- **Mobile Responsiveness**: Ensure the platform is mobile-friendly, or develop a PWA (Progressive Web App) for a native-like experience.Since collaboration often happens on-the-go, prioritizing mobile responsiveness is key.
- **Security**: Given the decentralized nature and real-time collaboration, ensure robust security measures are in place, especially for authentication and data protection.
- **User** Onboarding: Decentralized systems can be tricky for non-technical users. Consider an easy onboarding process to guide users on how to set up their own instances.

### Development Approach:
- **MVP (Minimum Viable Product)**: Start with basic functionality – creating/joining groups, scheduling sessions, and real-time chat.
- **Iterative Development**: Add features incrementally, such as note-sharing, video calls, and calendar integration.
- **Testing**: Use tools like Jest (for React) and Mocha/Chai (for Node.js) for unit testing, and Cypress for end-to-end testing.

## Technologies & Languages option 1:
### Frontend:
React.js: A JavaScript library for building user interfaces.
Tailwind CSS or Bootstrap: Tailwind provides utility-first CSS for rapid UI development, while Bootstrap offers pre-built components for a clean and responsive design. 
Bootstrap is literally the only option that we should consider (but this is because im biased and think tailwind’s ugly lol)
### Backend:
Node.js with Express: Ideal for handling real-time data and WebSocket connections. It’s non-blocking and event-driven, which is perfect for chat and collaboration features.
Flask (Alternative): A lightweight Python framework, good for rapid development. You can choose Flask if you prefer Python over JavaScript for the backend.
Despite all of it’s problems, I think that we’ll either have to stick with Node.js, but if you guys would be okay with learning a new language, I’d love to develop this in Go instead, as Go is likely the best choice for a platform like this since it’s 
A: compiled, not interpreted (thus having significant performance benefits)
B: gives us low-level access on how our data is sent
C: Still has libraries to support the tech that we need to use
### Database:
Firebase: Provides real-time database capabilities and easy-to-use authentication, perfect for building chat and collaboration tools. The free tier works.
MongoDB (Alternative): A NoSQL database that scales well and is easy to integrate with Node.js. MongoDB Atlas offers a free tier.
In favor of ease of deployment, the dockerized container that we will develop on top of will have it’s own MariaDB (MySQL but actually open source) for storing localized user data, alongside optional support for NoSQL for easy deployment to AWS.
### Real-Time Collaboration:
**WebSockets (Socket.IO)**: Socket.IO is a JavaScript library for real-time web applications. It enables real-time, bi-directional communication between web clients and servers, which is perfect for chat, notifications, and live collaboration features.
**Decentralized system**: One of the most important, and most interesting to me features is that this system should be capable of being decentralized. Not only does this provide us a monetization platform (have a service that we host ourselves, and have people who cannot host their own server pay us to use ours and give out a small amount of free storage to free users), but alongside this, decentralizing the project allows people from anywhere, anytime and any place to share and collaborate on the type of content that this platform serves and creates. Alongside this, decentralizing the project also brings benefits from allowing us to open source our work while still having a monetization plan. Open Source brings more eyes onto the project, and allows us to have basically free work on top of our project
**Peer-to-Peer (P2P) Connection (Optional)**: For video or voice communication, you can consider WebRTC, which allows direct communication between browsers.
### Authentication:
**Firebase Authentication**: Easy-to-implement, secure authentication for various login methods (email, Google, Facebook, etc.).
**JWT (JSON Web Tokens)**: If you go with a custom authentication solution, JWT can be used for secure user sessions.
**Google Authentication**: Instead of using Firebase, you can just use the Google API instead for connections.
### Deployment & Hosting:
**Netlify**: Ideal for deploying the frontend. It integrates well with GitHub and supports continuous deployment.
**Heroku**: Perfect for deploying the backend. It’s easy to set up and offers a free tier for small projects.
For deployment, (Since this is a small time project just for school) I can lend compute from my server network for our project, so for hosting instead we will use an LXC Container in Proxmox running a dockerized container of our project.
### Additional Tools:
**GitHub**: For version control and collaboration. You can also use GitHub Actions for continuous integration.  We probably won’t need github actions since all of our code will be written in React/Springboot regardless.
**Docker (Optional)**: Containerizes the application to ensure consistency across different environments.
**Postman**: Useful for testing and documenting your API endpoints. We can literally just use curl to make api requests, no need for anything like this in our project
**Curl**: Making API requests and testing the system




## ALTERNATIVE option 2:
### Java-Based Stack:
### Frontend:
- **Thymeleaf with Spring Boot**: Instead of using React.js, you can create your frontend with Thymeleaf, which is a server-side Java template engine. This integrates seamlessly with Spring Boot, allowing you to build dynamic and interactive web pages.
- **Bootstrap or Tailwind CSS**: You can still use these for styling the frontend, making it responsive and visually appealing.
### Backend:
- **Spring Boot**: production-ready framework for building Java applications. Spring Boot simplifies the development of RESTful services and can easily handle the backend logic, including user authentication, session management, and API endpoints.
- **WebSocket with Spring Boot**: Java’s Spring framework supports WebSockets, allowing you to implement real-time features like chat and live collaboration.
### Database:
- **H2 Database**: An in-memory database that works well with Spring Boot for development purposes. It’s lightweight and doesn’t require complex setup.
- **MySQL or PostgreSQL**: For production, you might want to use a more robust relational database. Both MySQL and PostgreSQL have free versions.
- **MongoDB**: If you prefer a NoSQL database, you can use MongoDB with Java, thanks to the Spring Data MongoDB project.
### Real-Time Communication & Collaboration:
- **Spring WebSocket**: Use Spring’s WebSocket support to enable real-time communication. This can handle chat, notifications, and live updates during study sessions.
- **Java WebRTC (Optional)**: If you want to add video or audio calling, you can use WebRTC with Java for peer-to-peer communication.
### Authentication:
- **Spring Security**: Provides comprehensive security services for Java applications, including authentication and authorization. You can integrate it with basic auth and OAuth2 if you want to allow login via Google, Facebook, etc.
### Deployment & Hosting:
- **Heroku or AWS Free Tier**: You can deploy your Spring Boot application on Heroku or AWS, both of which offer free tiers suitable for small projects.
- **Tomcat**: If you’re looking for a Java-specific hosting environment, you can deploy your Spring Boot application on a Tomcat server.
### Development Tools:
- **IntelliJ IDEA**: For Java development, IntelliJ IDEA is an IDE that you can use with Spring Boot.
- **Maven or Gradle**: For dependency management and project build, you can use Maven or Gradle with Spring Boot.




### NERDY IMPLEMENTATION DETAILS:

On the backend of this project, it’s actually surprisingly simple: Metadata is handled and parsed on the user’s end, but the actual generation of metadata is done server-side.

- **Metadata Handling**:
Metadata parsing and implementation scripts are stored on the server-side, and are grabbed nightly from a git repo containing all of the metadata scraping scripts
Metadata outlines are just python scripts ran on the serverside that take in a url and return parsed metadata, including images which are cached serverside and destroyed after 4 days
Metadata outlines store their cached data for 4 days, after which the cached data is labeled as deprecated, and will be destroyed in 8 days if not reverted to.

- **Fallback Mechanism**:
If metadata fails to grab for a certain piece of content that is known to be from a working metadata server, then this data will revert to the old version that was functional.
Metadata is handed to the client with JSON once requested for rendering by the HTML frontend.
This request is done only upon site load, or changing in the actual text.

- **Widgets and Content**:
Widgets and Content are effectively seen as the same thing; Widgets are, after all, just complex interactive content.

- **Markdown Format**:
Markdown begins always with a block that looks like this ${}.
Once entered into this mode, the interpreter can go multiple different ways with it’s next course of action:\
'@'- defines that this content is actually





