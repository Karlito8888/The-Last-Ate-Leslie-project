import mongoose from "mongoose";
import dotenv from "dotenv";
import { Newsletter } from "../models/Newsletter";
import { User } from "../models/User";

dotenv.config();

const newslettersData = [
  {
    subject: "Bienvenue à notre nouvelle galerie d'art !",
    content: `
      <h2>Chers amateurs d'art,</h2>
      <p>Nous sommes ravis de vous annoncer l'ouverture de notre nouvelle galerie au cœur de la ville.</p>
      <p>Venez découvrir notre première exposition mettant en vedette les artistes locaux les plus talentueux.</p>
      <p>Date d'ouverture : 15 juin 2024</p>
    `,
    recipients: ["art@example.com", "culture@example.com", "news@example.com"],
  },
  {
    subject: "Exposition spéciale : L'Art Digital",
    content: `
      <h2>L'avenir de l'art est numérique</h2>
      <p>Cette semaine, nous explorons les frontières entre l'art traditionnel et digital.</p>
      <p>Au programme :</p>
      <ul>
        <li>Démonstrations de NFT</li>
        <li>Ateliers de création numérique</li>
        <li>Conférences sur l'art digital</li>
      </ul>
    `,
    recipients: ["digital@example.com", "tech@example.com", "art@example.com"],
  },
  {
    subject: "Workshop : Techniques de Photographie",
    content: `
      <h2>Perfectionnez votre art photographique</h2>
      <p>Rejoignez-nous pour une série de workshops exceptionnels :</p>
      <ul>
        <li>Composition avancée</li>
        <li>Éclairage naturel vs artificiel</li>
        <li>Post-traitement professionnel</li>
      </ul>
      <p>Places limitées, réservez maintenant !</p>
    `,
    recipients: [
      "photo@example.com",
      "workshop@example.com",
      "learning@example.com",
    ],
  },
];

async function initNewsletters() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connecté à MongoDB");

    // Trouver un admin pour l'associer aux newsletters
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      throw new Error("Aucun administrateur trouvé dans la base de données");
    }

    // Supprimer toutes les newsletters existantes
    await Newsletter.deleteMany({});
    console.log("Newsletters existantes supprimées");

    // Créer les nouvelles newsletters
    for (const data of newslettersData) {
      const newsletter = new Newsletter({
        ...data,
        sentBy: admin._id,
        recipientCount: data.recipients.length,
        sentAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ), // Date aléatoire dans les 30 derniers jours
      });
      await newsletter.save();
    }

    console.log("Newsletters créées avec succès");
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de l'initialisation des newsletters:", error);
    process.exit(1);
  }
}

initNewsletters();
