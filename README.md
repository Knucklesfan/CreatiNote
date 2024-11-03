# CreatiNote

A decentralized, encrypted, self-hosted note-taking app designed for collaboration and entertainment.

## Current Work

### DONE

- **Bold**
- **Italic**
- **Superscript**
- **Subscript**
- **Ordered list**
- **Unordered list**
- **Strikethrough**
- **Underline**
- **Redo and undo functions**
- **App name in the top left corner**
- **Tab key**
- **Placeholder text**
- **Text alignment**
- **Font Size**
- **Font Styles**
- **Hovering toolbar**
- **Text colors**
- **Emojis**
- **line spacing**

### HARDER

- **Database to store notes**: PRIORITY
- **Real-time collaboration**: Requires deployment for testing outside of the development environment. Slate might offer an implementation option for this.
- **Editor Area/ typing**: Implement pagination as the editor expands downwards when typing.
- **Share notes**: Implement sharing options later.
- **Join groups**: Allow users to join study groups.

### MEDIUM

- **Images** (from a file? Drag and drop? Link?)
- **Tables**: (size options?)
- **polls?**: Put in Hamburger
- **Dark mode**: Will need to be updated constantly
- **Lock mode**: Prevent notes from being edited using an option in hamburger
- **Links (clickable?)**

--------------------------------------------------------------------------------------------------------------------------------------------------------------

> **Note**: The following documentation serves as a project overview and initial concept for our class assignment (General ideas). It may not fully reflect the final version of the project.

## Project Overview

CreatiNote allows users to:

- **Form Study Groups**: Create or join groups based on subjects, courses, or interests.
- **Schedule Study Sessions**: Set reminders, schedule sessions, and join virtual rooms for real-time collaboration.
- **Collaborate on Notes**: Share and edit notes in real-time, with version history and export options.
- **Real-Time Communication**: Chat functionality within study groups and study sessions enables seamless communication.
- **Universal Note System**: Easily integrate media, content, and metadata. Users can drag and drop items into a list, automatically pulling metadata like descriptions and images. This system supports platforms such as YouTube, Wikipedia, and TheMovieDB, with additional optional integrations.
- **Interactive Media in Notes**: Enhance notes with polls, carousels, flashcards, and more. Widgets make note-taking interactive and engaging.
- **Custom Widgets**: Create custom widgets using JavaScript and our JS framework, allowing seamless integration into the notes system.
- **Universal Note Format**: Notes are extended markdown with JavaScript and CSS support, allowing for easy customization and modification. Markdown is simple to read and understand, even without a dedicated reader.
- **Decentralized Notes**: Users can host their own CreatiNote instances, yet still access shared content across the CreatiNote network if content is labeled as public.

## Additional Features to Consider

- **Task Management**: Include to-do lists within study groups for better organization.
- **Mobile Responsiveness**: Prioritize a mobile-friendly design or develop a PWA (Progressive Web App) for a native-like experience.
- **Security**: Implement robust security measures for authentication and data protection, given the decentralized nature of the platform.
- **User Onboarding**: Simplify the onboarding process to make it accessible for non-technical users setting up their own instances.

## Development Approach

- **MVP (Minimum Viable Product)**: Focus initially on core functionalities like group creation, and real-time chat.
- **Iterative Development**: Add features progressively, including note-sharing, and calendar integration.
- **Testing**: Utilize tools like Jest (for React) and Mocha/Chai (for Node.js) for unit testing, and Cypress for end-to-end testing.

## Technologies & Languages

### Frontend

- **React.js**: For building dynamic user interfaces.

### Backend

- **Node.js with Express**: Suitable for handling real-time data and WebSocket connections.
- **Flask (Alternative)**: For those preferring Python, Flask offers a lightweight framework for rapid development.
- **Go (Alternative)**: A strong option for performance, offering compiled benefits and low-level data handling.

### Database

- **Firebase**: For real-time capabilities and easy authentication, with a free tier available.
- **MongoDB (Alternative)**: A scalable NoSQL database that integrates well with Node.js.
- **MariaDB**: The dockerized container will include MariaDB for local user data storage, with optional NoSQL support for AWS.

### Real-Time Collaboration

- **WebSockets (Socket.IO)**: Enables real-time, bi-directional communication for chat, notifications, and collaboration.
- **Decentralized System**: The platform can be self-hosted but remains connected to a larger CreatiNote network for public content sharing.
- **Peer-to-Peer (P2P) Connections**: Consider WebRTC for direct video or voice communication between users.

### Authentication

- **Firebase Authentication**: Quick setup for various login methods.
- **JWT (JSON Web Tokens)**: For custom authentication solutions.
- **Google Authentication**: Direct integration for login options.

### Deployment & Hosting

- **Netlify**: Ideal for deploying the frontend with continuous integration.
- **Heroku**: Suitable for backend deployment with a user-friendly setup.
- **Custom Hosting**: Using an LXC Container in Proxmox, we can deploy a dockerized version of the project on a self-hosted server network.

### Additional Tools

- **GitHub**: Version control and collaboration. GitHub Actions can be used for CI/CD.
- **Docker**: To ensure consistency across development and production environments.
- **Curl**: For making API requests and testing endpoints.
