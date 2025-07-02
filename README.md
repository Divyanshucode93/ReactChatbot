# ReactBot

A modern, stylish chatbot application built with React, TypeScript, and Bootstrap.

## Features
- Beautiful, responsive chat UI with gradients and avatars
- User and bot messages styled differently
- Built using React functional components and hooks
- Bootstrap and custom CSS for a modern look
- Easily extendable for real backend or AI integration

## Getting Started

### Prerequisites
- Node.js (v16 or newer recommended)
- npm (comes with Node.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Divyanshucode93/ReactChatbot.git
   cd ReactChatbot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the development server:
```bash
npm start
```
The app will open in your browser at [http://localhost:3000](http://localhost:3000).

### Building for Production
To build the app for production:
```bash
npm run build
```
The output will be in the `dist/` folder.

## Project Structure
```
ReactBot/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Chat.tsx
│   │   └── Chat.css
│   ├── App.tsx
│   └── index.tsx
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

## Customization
- To change the bot's response logic, edit `src/components/Chat.tsx`.
- To update styles, edit `src/components/Chat.css`.
- To connect to a real backend or AI, replace the simulated response in `Chat.tsx` with an API call.

## License
This project is licensed under the ISC License.

---
Feel free to reach out if you have questions or want to contribute!
