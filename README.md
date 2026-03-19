# IC Lab – Digital Logic Circuit Simulator

**IC Lab** is a professional‑grade, browser‑based digital logic simulator that replicates the experience of building circuits on a real breadboard. Designed for students, hobbyists, and engineers, it lets you place 7400‑series ICs, LEDs, switches, and a clock, connect them with virtual wires, and simulate their behaviour in real time. The app integrates cloud storage, community‑shared circuits, and AI‑powered challenge verification.

---

## ✨ Features

- **Virtual Breadboard** – Accurately models breadboard connectivity (rows, columns, power rails).  
- **Component Library** – Includes 7400‑series ICs (NAND, NOR, NOT, AND, OR, XOR, counter, flip‑flop), LEDs, toggle switches, and a clock generator.  
- **Real‑time Simulation** – Watch logic levels propagate as you run the simulation.  
- **Intuitive Wiring** – Click holes to start/complete wires; delete wires by selecting them.  
- **Component Management** – Place, move, and label components; edit pin labels via a sidebar.  
- **Save & Load** – Store circuits locally (JSON) or in the cloud (Firebase). Public circuits appear in the **Samples** registry.  
- **Challenges** – Accept predefined logic puzzles, build the solution, and let **Gemini AI** verify your work.  
- **Responsive UI** – Works on desktop and mobile with a futuristic, theme‑aware design.  
- **Authentication** – Sign in with email/password; user data and circuits are stored per account.  
- **Dark / Light Mode** – Toggle between themes; preference is persisted.

---

## 🛠️ Technology Stack

| Layer          | Technology                                                                 |
|----------------|----------------------------------------------------------------------------|
| Framework      | [Next.js 15+](https://nextjs.org/) (App Router, React 19)                 |
| Language       | TypeScript                                                                 |
| Canvas         | [Konva](https://konvajs.org/) / `react-konva`                             |
| Styling        | Tailwind CSS + custom CSS variables                                       |
| Animations     | [Framer Motion](https://www.framer.com/motion/)                           |
| Authentication | Firebase Authentication (Email/Password)                                  |
| Database       | Cloud Firestore (user profiles, public circuits, challenges)              |
| AI Integration | [Google Generative AI (Gemini)](https://ai.google.dev/) for challenge checking |
| Icons          | Lucide React                                                              |
| Utilities      | clsx, tailwind-merge                                                      |

---

## 📁 Folder Structure

```
iclab/
├── app/                    # Next.js App Router pages
│   ├── challenge/          # Challenge listing page
│   ├── help/               # User manual / help page
│   ├── lab/                # Alias for simulator (redirects to homepage)
│   ├── login/              # Authentication page
│   ├── samples/            # Public circuit registry
│   ├── team/               # Team information page
│   ├── global.css          # Global styles & theme variables
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Homepage (loads Simulator)
├── components/
│   ├── Navbar.tsx          # Navigation bar with auth and theme toggle
│   └── Simulator.tsx       # Main breadboard simulator component
├── hooks/
│   ├── use-auth.tsx        # Firebase auth context provider
│   ├── use-breadboard.ts   # Custom hook managing holes, circuit state, history
│   ├── use-mobile.ts       # Mobile detection hook
│   └── use-theme.tsx       # Theme context provider
├── lib/
│   ├── circuit-types.ts    # TypeScript definitions (Hole, Component, Wire, etc.)
│   ├── connectivity.ts     # Union‑find algorithm for electrical nets
│   ├── firebase.ts         # Firebase initialization and config
│   ├── simulation-engine.ts# IC definitions and logic functions
│   └── utils.ts            # Utility functions (cn for class merging)
└── README.md
```

---

## 🔧 How It Works

### 1. Breadboard Model
The board consists of **holes** – either in the **main area** (rows 0‑9, columns 0‑29) or **power rails** (four rows at the top and bottom).  
- **Main area:** Each column has two separate strips: rows 0‑4 are internally connected, rows 5‑9 are internally connected.  
- **Power rails:** Each rail row is horizontally connected across all columns; top rails are `VCC (+)` and `GND (-)`.

Holes are stored as objects with coordinates, and connectivity is computed using a **union‑find (disjoint set)** algorithm that groups holes into **nets** based on:
- Internal breadboard connections (strips)
- Wires placed by the user
- Closed switches (when toggled on)

### 2. Components
Components are placed by selecting a tool from the toolbar and clicking holes:
- **LEDs and Switches** require two holes (legs).
- **ICs** are placed on a single main‑area hole; the component automatically spans 14 pins across the centre gap.
- **Clock** generates a square wave when simulation is running.

Each component has a unique ID, a type, an optional model (for ICs), and positions.

### 3. Simulation Engine
When the user clicks **Run**, a simulation loop runs every 100 ms:
1. **Net states** are initialised from power rails (`VCC` → `HIGH`, `GND` → `LOW`) and the clock output.
2. For each IC, the engine checks if power is supplied (pin 14 `HIGH`, pin 7 `LOW`). If not, all outputs are forced `FLOATING`.
3. Input states are read from the nets connected to each input pin.
4. The IC’s logic function (defined in `simulation-engine.ts`) is called with the inputs and any internal state (for counters, flip‑flops). It returns the output level(s) and optionally a new internal state.
5. Output levels are written back to the nets.

LEDs light up when one leg is `HIGH` and the other `LOW` (i.e., current flows).

### 4. Challenges & AI Verification
- Challenges are stored in Firestore (`challenge` collection). Each challenge contains a name, instructions, an expected solution circuit, and an optional image.
- When a user accepts a challenge, the challenge data is saved in `sessionStorage` and the user is redirected to the Lab.
- A challenge HUD appears; clicking **Check Solution** sends the user’s current circuit and the expected solution to **Gemini AI** with a detailed prompt instructing the AI to compare electrical nets (not physical coordinates) and return a pass/fail verdict with educational feedback.

### 5. Cloud Integration
- Authenticated users have a Firestore document in `users/{uid}` containing their profile and a `circuits` object (map of circuit IDs to circuit data).
- Saving a circuit to the cloud stores it in the user’s document. If marked **Public**, a copy is also added to the `circuits` collection for the Samples page.
- The Samples page queries all public circuits from all users and displays them with author information.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- A Firebase project (with Authentication and Firestore enabled)
- A Google Gemini API key (for challenge checking)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/majzoub-alsiddig/iclab.git
   cd iclab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env.local` file in the root directory and add your Firebase and Gemini keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the app.

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## 📖 Usage Guide

### Placing Components
- **LED / Switch / Clock**: Click the corresponding tool in the toolbar, then click two different holes to place the two legs.
- **IC**: Click an IC tool (e.g., `7400`), then click a hole in the main area. A preview shows the 14 pins; click **ADD HERE** to confirm.

### Wiring
1. Click a hole – it turns black.
2. Click another hole – a wire is created between them.
3. To delete a wire, click on it to select it, then click the red **X** that appears.

### Simulation
- Click the **Play** button to start the simulation; click **Stop** (square) to pause.
- While running, switches can be toggled by clicking them, and LEDs light up according to the logic.

### Saving & Loading
- **Save**: Opens a modal. Choose **Local Export** to download a JSON file, or fill in a name and choose **Private**/**Public** to save to the cloud.
- **Load**: Opens a modal with options to **Local Import** (upload a JSON file) or browse your cloud archives.

### Challenges
- Go to the **Challenge** page, pick a challenge, and click **Accept Challenge**.
- Build the required circuit in the Lab, then click **Check Solution**. The AI will evaluate your work and tell you if you passed.

---

## 🧠 Design Deep Dive

### Connectivity (`lib/connectivity.ts`)
The `calculateNets` function uses a union‑find data structure to merge holes into nets. It first unions holes that are internally connected (main area strips, rails), then adds wires, and finally closed switches. The returned `find` function allows any hole ID to be mapped to its net root in O(α(n)) time.

### IC Definitions (`lib/simulation-engine.ts`)
Each IC model exports an object conforming to `ICDefinition`:
- `pins`: array of pin objects with number, type, and optional `gateId`.
- `logic`: a function that receives an array of input logic levels and an optional current state, and returns `{ output, newState }`. Output can be a single level or an array (for multi‑output gates).

### State Management (`hooks/use-breadboard.ts`)
- `holes` are generated once and memoised.
- `circuit` holds components and wires.
- `history` tracks the last added items (wire or component) to support undo.
- `addWire`, `addComponent`, `undo`, `reset` update the circuit and history.

### Simulation Loop (`components/Simulator.tsx`)
The loop runs only when `isRunning` is true. It:
1. Sets rail and clock states.
2. Iterates several times (to allow propagation) over all ICs, computing outputs from inputs.
3. Updates `netStates` (a map from net root to logic level) and `icStates` (internal IC state).

### Challenge AI Prompt
The prompt sent to Gemini is carefully crafted to ensure the AI:
- Understands breadboard connectivity rules (strips, rails).
- Converts both the expected solution and the user’s circuit into electrical nets.
- Compares logical behaviour, not physical layout.
- Returns a strict JSON with `status` and `message`.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

- Built with [Next.js](https://nextjs.org/), [React Konva](https://konvajs.org/docs/react/), and [Tailwind CSS](https://tailwindcss.com/).
- Icons by [Lucide](https://lucide.dev/).
- AI verification powered by [Google Gemini](https://ai.google.dev/).
- Inspired by real‑world electronics education and the desire to make digital logic accessible to everyone.

---

**Happy building!**  
If you have any questions or feedback, feel free to open an issue or contact the team.