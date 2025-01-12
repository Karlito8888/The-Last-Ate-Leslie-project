import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import contactRoutes from "./routes/contactRoutes";

// Configuration des variables d'environnement
dotenv.config();

export const app = express();

// Options de connexion MongoDB optimisées
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true, // Indexation automatique en production
  connectTimeoutMS: 10000, // Timeout de connexion à 10s
  socketTimeoutMS: 45000, // Timeout des opérations à 45s
  // Configuration du pool de connexions
  minPoolSize: 5,
  maxPoolSize: 10,
  // Gestion des tentatives de reconnexion
  retryWrites: true,
  retryReads: true,
  serverSelectionTimeoutMS: 30000, // 30 secondes
  heartbeatFrequencyMS: 10000, // 10 secondes
};

// Configuration CORS optimisée
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://creative-vision-project.netlify.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600, // Cache les résultats du preflight pendant 10 minutes
};

// Middleware optimisés
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "10mb" })); // Limite la taille des requêtes
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);

// Route de healthcheck pour Render
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Gestion des erreurs globale améliorée
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(`[${new Date().toISOString()}] Error:`, err);
    res.status(500).json({
      success: false,
      message: "An error occurred!",
      errors: [{ field: "server", message: err.message }],
    });
  }
);

// Gestion des routes non trouvées
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Fonction de connexion MongoDB avec retry
const connectWithRetry = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/ate-leslie-db";
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      console.log(
        `[${new Date().toISOString()}] Tentative de connexion à MongoDB...`
      );
      await mongoose.connect(MONGODB_URI, mongooseOptions);
      console.log(
        `[${new Date().toISOString()}] Connecté à MongoDB avec succès`
      );
      break;
    } catch (error) {
      retries++;
      console.error(
        `[${new Date().toISOString()}] Erreur de connexion (tentative ${retries}/${MAX_RETRIES}):`,
        error
      );
      if (retries === MAX_RETRIES) {
        console.error(
          `[${new Date().toISOString()}] Échec de la connexion après ${MAX_RETRIES} tentatives`
        );
        process.exit(1);
      }
      // Attente exponentielle entre les tentatives
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 10000))
      );
    }
  }
};

// Keep-alive pour éviter le cold start sur Render
const keepAlive = () => {
  const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
  setInterval(() => {
    console.log(`[${new Date().toISOString()}] Ping de maintien en vie`);
    app.get("/health", (_req, res) => res.status(200).send("OK"));
  }, PING_INTERVAL);
};

// Démarrage du serveur uniquement si non en mode test
if (process.env.NODE_ENV !== "test") {
  // Connexion à MongoDB
  connectWithRetry().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(
        `[${new Date().toISOString()}] Serveur démarré sur le port ${PORT}`
      );
      keepAlive(); // Démarrage du keep-alive
    });
  });

  // Gestion des erreurs de connexion MongoDB
  mongoose.connection.on("error", (error) => {
    console.error(`[${new Date().toISOString()}] Erreur MongoDB:`, error);
  });

  mongoose.connection.on("disconnected", () => {
    console.log(`[${new Date().toISOString()}] Déconnecté de MongoDB`);
    connectWithRetry(); // Tentative de reconnexion
  });

  // Gestion propre de la fermeture
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      console.log(`[${new Date().toISOString()}] Connexion MongoDB fermée`);
      process.exit(0);
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Erreur lors de la fermeture:`,
        error
      );
      process.exit(1);
    }
  });
}
