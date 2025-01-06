import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

// Configuration des variables d'environnement
dotenv.config();

const users = [
  {
    username: "john_doe",
    email: "john.doe@example.com",
    password: "User123!",
    newsletter: true,
    fullName: {
      honorificTitle: "Sheikh",
      firstName: "John",
      fatherName: "James",
      familyName: "Doe",
      gender: "male"
    },
    birthDate: "1990-01-15",
    mobilePhone: "+971-50-1234567",
    landline: "+971-4-1234567",
    address: {
      unit: "42",
      buildingName: "Marina Heights",
      street: "Dubai Marina Street",
      dependentLocality: "Dubai Marina",
      poBox: "12345",
      city: "Dubai",
      emirate: "DU"
    }
  },
  {
    username: "sarah_smith",
    email: "sarah.smith@example.com",
    password: "User123!",
    newsletter: true,
    fullName: {
      honorificTitle: "Sayyid",
      firstName: "Sarah",
      fatherName: "Michael",
      familyName: "Smith",
      gender: "female"
    },
    birthDate: "1992-03-20",
    mobilePhone: "+971-50-2345678",
    landline: "+971-4-2345678",
    address: {
      unit: "15",
      buildingName: "Palm Residences",
      street: "Palm Jumeirah",
      dependentLocality: "Palm Jumeirah",
      poBox: "23456",
      city: "Dubai",
      emirate: "DU"
    }
  },
  {
    username: "ahmed_hassan",
    email: "ahmed.hassan@example.com",
    password: "User123!",
    newsletter: false,
    fullName: {
      honorificTitle: "Al Haj",
      firstName: "Ahmed",
      fatherName: "Hassan",
      familyName: "Ali",
      gender: "male"
    },
    birthDate: "1988-07-10",
    mobilePhone: "+971-50-3456789",
    landline: "+971-2-3456789",
    address: {
      unit: "7",
      buildingName: "Etihad Towers",
      street: "Corniche Road",
      dependentLocality: "Al Khubeirah",
      poBox: "34567",
      city: "Abu Dhabi",
      emirate: "AD"
    }
  },
  {
    username: "fatima_abdullah",
    email: "fatima.abdullah@example.com",
    password: "User123!",
    newsletter: true,
    fullName: {
      firstName: "Fatima",
      fatherName: "Abdullah",
      familyName: "Rahman",
      gender: "female"
    },
    birthDate: "1995-11-25",
    mobilePhone: "+971-50-4567890",
    address: {
      buildingName: "Al Majaz Tower",
      street: "Corniche Street",
      city: "Sharjah",
      emirate: "SH"
    }
  },
  {
    username: "omar_khalil",
    email: "omar.khalil@example.com",
    password: "User123!",
    newsletter: true,
    fullName: {
      honorificTitle: "Sheikh",
      firstName: "Omar",
      fatherName: "Khalil",
      familyName: "Ibrahim",
      gender: "male"
    },
    birthDate: "1987-09-03",
    mobilePhone: "+971-50-5678901",
    landline: "+971-6-5678901",
    address: {
      unit: "23",
      buildingName: "RAK Tower",
      street: "Al Qawasim Corniche",
      city: "Ras Al Khaimah",
      emirate: "RAK"
    }
  },
  {
    username: "layla_mohammed",
    email: "layla.mohammed@example.com",
    password: "User123!",
    newsletter: false,
    fullName: {
      firstName: "Layla",
      fatherName: "Mohammed",
      familyName: "Saeed",
      gender: "female"
    },
    birthDate: "1993-05-17",
    mobilePhone: "+971-50-6789012",
    address: {
      buildingName: "Fujairah Tower",
      street: "Hamad Bin Abdullah Street",
      city: "Fujairah",
      emirate: "FJR"
    }
  },
  {
    username: "karim_ahmad",
    email: "karim.ahmad@example.com",
    password: "User123!",
    newsletter: true,
    fullName: {
      honorificTitle: "Al Haj",
      firstName: "Karim",
      fatherName: "Ahmad",
      familyName: "Qasim",
      gender: "male"
    },
    birthDate: "1991-12-08",
    mobilePhone: "+971-50-7890123",
    landline: "+971-7-7890123",
    address: {
      unit: "12",
      buildingName: "UAQ Marina",
      street: "King Faisal Street",
      city: "Umm Al Quwain",
      emirate: "UAQ"
    }
  },
  {
    username: "nadia_salem",
    email: "nadia.salem@example.com",
    password: "User123!",
    newsletter: true,
    fullName: {
      firstName: "Nadia",
      fatherName: "Salem",
      familyName: "Mansour",
      gender: "female"
    },
    birthDate: "1994-08-22",
    mobilePhone: "+971-50-8901234",
    address: {
      buildingName: "Ajman One",
      street: "Sheikh Khalifa Bin Zayed Street",
      city: "Ajman",
      emirate: "AJ"
    }
  },
  {
    username: "yusuf_ibrahim",
    email: "yusuf.ibrahim@example.com",
    password: "User123!",
    newsletter: false,
    fullName: {
      honorificTitle: "Sayyid",
      firstName: "Yusuf",
      fatherName: "Ibrahim",
      familyName: "Malik",
      gender: "male"
    },
    birthDate: "1989-04-14",
    mobilePhone: "+971-50-9012345",
    landline: "+971-4-9012345",
    address: {
      unit: "31",
      buildingName: "Business Bay Tower",
      street: "Business Bay",
      dependentLocality: "Business Bay",
      poBox: "45678",
      city: "Dubai",
      emirate: "DU"
    }
  },
  {
    username: "zainab_ali",
    email: "zainab.ali@example.com",
    password: "User123!",
    newsletter: true,
    fullName: {
      firstName: "Zainab",
      fatherName: "Ali",
      familyName: "Hassan",
      gender: "female"
    },
    birthDate: "1996-02-28",
    mobilePhone: "+971-50-0123456",
    address: {
      buildingName: "Al Taawun Mall",
      street: "Al Taawun Street",
      city: "Sharjah",
      emirate: "SH"
    }
  },
  {
    username: "hassan_ahmed",
    email: "hassan.ahmed@example.com",
    password: "User123!",
    newsletter: true,
    fullName: {
      honorificTitle: "Sheikh",
      firstName: "Hassan",
      fatherName: "Ahmed",
      familyName: "Mahmoud",
      gender: "male"
    },
    birthDate: "1986-06-19",
    mobilePhone: "+971-51-1234567",
    landline: "+971-2-1234567",
    address: {
      unit: "9",
      buildingName: "World Trade Center",
      street: "Khalifa Street",
      dependentLocality: "Al Markaziyah",
      poBox: "56789",
      city: "Abu Dhabi",
      emirate: "AD"
    }
  },
  {
    username: "amira_khalid",
    email: "amira.khalid@example.com",
    password: "User123!",
    newsletter: false,
    fullName: {
      firstName: "Amira",
      fatherName: "Khalid",
      familyName: "Omar",
      gender: "female"
    },
    birthDate: "1997-10-05",
    mobilePhone: "+971-51-2345678",
    address: {
      buildingName: "Corniche Tower",
      street: "Corniche Street",
      city: "Ajman",
      emirate: "AJ"
    }
  },
  {
    username: "rami_saeed",
    email: "rami.saeed@example.com",
    password: "User123!",
    newsletter: true,
    fullName: {
      honorificTitle: "Al Haj",
      firstName: "Rami",
      fatherName: "Saeed",
      familyName: "Nasser",
      gender: "male"
    },
    birthDate: "1990-08-12",
    mobilePhone: "+971-51-3456789",
    landline: "+971-7-3456789",
    address: {
      unit: "5",
      buildingName: "Al Hamra Mall",
      street: "Al Hamra Street",
      city: "Ras Al Khaimah",
      emirate: "RAK"
    }
  },
  {
    username: "leila_faisal",
    email: "leila.faisal@example.com",
    password: "User123!",
    newsletter: true,
    fullName: {
      firstName: "Leila",
      fatherName: "Faisal",
      familyName: "Kareem",
      gender: "female"
    },
    birthDate: "1993-12-30",
    mobilePhone: "+971-51-4567890",
    address: {
      buildingName: "City Center",
      street: "Sheikh Zayed Street",
      city: "Fujairah",
      emirate: "FJR"
    }
  },
  {
    username: "malik_rahman",
    email: "malik.rahman@example.com",
    password: "User123!",
    newsletter: false,
    fullName: {
      honorificTitle: "Sayyid",
      firstName: "Malik",
      fatherName: "Rahman",
      familyName: "Aziz",
      gender: "male"
    },
    birthDate: "1988-03-25",
    mobilePhone: "+971-51-5678901",
    landline: "+971-6-5678901",
    address: {
      unit: "18",
      buildingName: "Gold Souk",
      street: "King Faisal Street",
      city: "Umm Al Quwain",
      emirate: "UAQ"
    }
  }
];

async function initUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connecté à MongoDB');

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`Utilisateur créé : ${userData.email}`);
      } else {
        console.log(`Utilisateur existe déjà : ${userData.email}`);
      }
    }

    console.log('Initialisation des utilisateurs terminée');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initUsers(); 