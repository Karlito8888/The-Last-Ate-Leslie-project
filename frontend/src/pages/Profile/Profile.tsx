import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateUsernameMutation,
  useUpdateEmailMutation,
  useUpdateNewsletterMutation,
  useDeleteProfileMutation,
} from "../../store/api/profileApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Profile.module.scss";

// Fonctions de validation
const isValidNamePart = (name: string): boolean => {
  const MIN_LENGTH = 2;
  const MAX_LENGTH = 50;
  const ALLOWED_CHARS = /^[a-zA-Z\s\-']+$/;

  return (
    name.length >= MIN_LENGTH &&
    name.length <= MAX_LENGTH &&
    ALLOWED_CHARS.test(name)
  );
};

const isValidMobilePhone = (phone: string): boolean => {
  const MOBILE_REGEX = /^\+971-?5[0-9]-?[0-9]{7}$/;
  return !phone || MOBILE_REGEX.test(phone);
};

const isValidLandline = (phone: string): boolean => {
  const LANDLINE_REGEX = /^\+971-?[0-9]-?[0-9]{7}$/;
  return !phone || LANDLINE_REGEX.test(phone);
};

const isValidAddress = (address: IAddress): boolean => {
  if (!address) return true;

  // Validation des longueurs
  if (address.unit && address.unit.length > 50) return false;
  if (address.buildingName && address.buildingName.length > 100) return false;
  if (address.street && address.street.length > 100) return false;
  if (address.dependentLocality && address.dependentLocality.length > 100)
    return false;
  if (address.city && address.city.length > 50) return false;

  // Validation du PO Box (numérique uniquement)
  if (address.poBox && !/^[0-9]{1,10}$/.test(address.poBox)) return false;

  // Validation de l'émirat
  if (
    address.emirate &&
    !["AD", "DU", "SH", "AJ", "UAQ", "RAK", "FJR"].includes(address.emirate)
  )
    return false;

  return true;
};

const isValidDate = (date: string): boolean => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

interface IUserName {
  honorificTitle?: string;
  firstName?: string;
  fatherName?: string;
  familyName?: string;
  gender?: "male" | "female";
}

interface IAddress {
  unit?: string;
  buildingName?: string;
  street?: string;
  dependentLocality?: string;
  poBox?: string;
  city?: string;
  emirate?: string;
}

interface UserInfo {
  username: string;
  email: string;
  mobilePhone: string;
  landline: string;
  newsletter: boolean;
  fullName?: IUserName;
  birthDate?: string;
  address?: IAddress;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    data: userData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useGetProfileQuery();

  // Logs détaillés pour le debugging
  console.log("🔍 État complet du profil:", {
    userData,
    isLoadingProfile,
    profileError,
  });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [updateUsername, { isLoading: isUpdatingUsername }] =
    useUpdateUsernameMutation();
  const [updateEmail, { isLoading: isUpdatingEmail }] =
    useUpdateEmailMutation();
  const [updateNewsletter] = useUpdateNewsletterMutation();
  const [deleteProfile, { isLoading: isDeleting }] = useDeleteProfileMutation();

  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const [userInfo, setUserInfo] = useState<UserInfo>({
    username: "",
    email: "",
    mobilePhone: "",
    landline: "",
    newsletter: false,
    fullName: {
      honorificTitle: "",
      firstName: "",
      fatherName: "",
      familyName: "",
      gender: undefined,
    },
    birthDate: "",
    address: {
      unit: "",
      buildingName: "",
      street: "",
      dependentLocality: "",
      poBox: "",
      city: "",
      emirate: undefined,
    },
  });

  // Ajout des états pour le focus des champs de téléphone
  const [isMobilePhoneFocused, setIsMobilePhoneFocused] = useState(false);
  const [isLandlineFocused, setIsLandlineFocused] = useState(false);

  useEffect(() => {
    console.log("🔄 useEffect déclenché avec userData:", userData);

    if (userData) {
      console.log("📥 Données brutes reçues:", userData);
      console.log("📋 Structure de fullName:", userData.fullName);
      console.log("🏠 Structure de address:", userData.address);

      setUserInfo((prevState) => {
        const newState = {
          ...prevState,
          username: userData.username,
          email: userData.email,
          newsletter: userData.newsletter ?? false,
          mobilePhone: userData.mobilePhone || "",
          landline: userData.landline || "",
          fullName: {
            honorificTitle: userData.fullName?.honorificTitle || "",
            firstName: userData.fullName?.firstName || "",
            fatherName: userData.fullName?.fatherName || "",
            familyName: userData.fullName?.familyName || "",
            gender: userData.fullName?.gender,
          },
          birthDate: userData.birthDate || "",
          address: {
            unit: userData.address?.unit || "",
            buildingName: userData.address?.buildingName || "",
            street: userData.address?.street || "",
            dependentLocality: userData.address?.dependentLocality || "",
            poBox: userData.address?.poBox || "",
            city: userData.address?.city || "",
            emirate: userData.address?.emirate || "",
          },
        };

        console.log("📤 Nouveau state calculé:", newState);
        return newState;
      });
    } else {
      console.log("⚠️ Pas de données dans userData");
    }
  }, [userData]);

  const handleUserInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Gestion des champs imbriqués (fullName et address)
    if (name.startsWith("fullName.")) {
      const field = name.split(".")[1];
      setUserInfo((prev) => ({
        ...prev,
        fullName: {
          ...prev.fullName,
          [field]: value,
        },
      }));
    } else if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setUserInfo((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      // Gestion des champs de premier niveau
      setUserInfo((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Fonction utilitaire pour nettoyer les objets
    const cleanObject = (obj: any) => {
      const cleaned: any = {};
      Object.keys(obj).forEach((key) => {
        if (
          obj[key] !== undefined &&
          obj[key] !== "" &&
          (typeof obj[key] !== "object" || Object.keys(obj[key]).length > 0)
        ) {
          if (typeof obj[key] === "object") {
            const cleanedNested = cleanObject(obj[key]);
            if (Object.keys(cleanedNested).length > 0) {
              cleaned[key] = cleanedNested;
            }
          } else {
            cleaned[key] = obj[key];
          }
        }
      });
      return cleaned;
    };

    // Validation du nom complet
    if (userInfo.fullName) {
      if (
        userInfo.fullName.firstName &&
        !isValidNamePart(userInfo.fullName.firstName)
      ) {
        toast.error("Format de prénom invalide");
        return;
      }
      if (
        userInfo.fullName.familyName &&
        !isValidNamePart(userInfo.fullName.familyName)
      ) {
        toast.error("Format de nom de famille invalide");
        return;
      }
      if (
        userInfo.fullName.fatherName &&
        !isValidNamePart(userInfo.fullName.fatherName)
      ) {
        toast.error("Format de nom du père invalide");
        return;
      }
    }

    // Validation des numéros de téléphone
    if (userInfo.mobilePhone && !isValidMobilePhone(userInfo.mobilePhone)) {
      toast.error("Format de numéro de mobile invalide (+971-5X-XXXXXXX)");
      return;
    }
    if (userInfo.landline && !isValidLandline(userInfo.landline)) {
      toast.error("Format de numéro fixe invalide (+971-X-XXXXXXX)");
      return;
    }

    // Validation de l'adresse
    if (userInfo.address && !isValidAddress(userInfo.address)) {
      toast.error("Format d'adresse invalide");
      return;
    }

    // Validation de la date de naissance
    if (userInfo.birthDate && !isValidDate(userInfo.birthDate)) {
      toast.error("Format de date de naissance invalide");
      return;
    }

    // Préparer les données à envoyer en nettoyant les valeurs vides et undefined
    const rawData = {
      fullName: userInfo.fullName,
      birthDate: userInfo.birthDate,
      mobilePhone: userInfo.mobilePhone,
      landline: userInfo.landline,
      address: userInfo.address,
      newsletter: userInfo.newsletter,
    };

    const profileData = cleanObject(rawData);

    console.log("Données nettoyées à envoyer:", profileData);

    try {
      const response = await updateProfile(profileData).unwrap();
      console.log("Réponse du serveur:", response);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      const errorMessage = err.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  const handleNewsletterChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.checked;
    try {
      await updateNewsletter(newValue).unwrap();
      setUserInfo((prev) => ({ ...prev, newsletter: newValue }));
      toast.success("Newsletter preference updated successfully");
    } catch (err) {
      console.error("Failed to update newsletter preference:", err);
      toast.error("Failed to update newsletter preference");
      // Revert the checkbox state on error
      setUserInfo((prev) => ({ ...prev, newsletter: !newValue }));
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUsername({ username: userInfo.username }).unwrap();
      toast.success("Username updated successfully");
    } catch (err) {
      console.error("Failed to update username:", err);
      toast.error("Failed to update username");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmail({ email: userInfo.email }).unwrap();
      toast.success("Email updated successfully");
    } catch (err) {
      console.error("Failed to update email:", err);
      toast.error("Failed to update email");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to delete your account");
      return;
    }

    try {
      await deleteProfile({ password: deletePassword }).unwrap();

      // Créer une promesse pour gérer la redirection de manière synchrone
      await new Promise<void>((resolve) => {
        // Nettoyer l'authentification
        dispatch(logout());
        localStorage.removeItem("token");

        // Attendre un court instant pour s'assurer que le state est mis à jour
        setTimeout(() => {
          navigate("/");
          toast.success("Account deleted successfully");
          resolve();
        }, 100);
      });
    } catch (err) {
      console.error("Failed to delete account:", err);
      toast.error("Failed to delete account");
    }
  };

  // Empêcher la soumission du formulaire avec la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  if (isLoadingProfile) {
    return <div>Loading...</div>;
  }

  if (profileError) {
    return <div>Error loading profile</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <form
        onSubmit={handleUserInfoSubmit}
        className={styles.profileForm}
        onKeyDown={handleKeyDown}
      >
        <h2>Profile Information</h2>

        {/* Basic Information */}
        <div className={styles.section}>
          <h3>Basic Information</h3>

          {/* Username with separate submit */}
          <div className={styles.formGroupWithButton}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="username"
                value={userInfo.username}
                onChange={handleUserInfoChange}
                placeholder="Username"
              />
              <label className={styles.floatingLabel}>Username</label>
            </div>
            <button
              type="button"
              onClick={handleUsernameSubmit}
              disabled={isUpdatingUsername}
              className={styles.updateButton}
            >
              {isUpdatingUsername ? "Updating..." : "Update Username"}
            </button>
          </div>

          {/* Email with separate submit */}
          <div className={styles.formGroupWithButton}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleUserInfoChange}
                placeholder="Email"
              />
              <label className={styles.floatingLabel}>Email</label>
            </div>
            <button
              type="button"
              onClick={handleEmailSubmit}
              disabled={isUpdatingEmail}
              className={styles.updateButton}
            >
              {isUpdatingEmail ? "Updating..." : "Update Email"}
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div className={styles.section}>
          <h3>Full Name</h3>
          <div className={styles.formGroup}>
            <select
              name="fullName.honorificTitle"
              value={userInfo.fullName?.honorificTitle || ""}
              onChange={handleUserInfoChange}
            >
              <option value="">Select Title</option>
              <option value="Sheikh">Sheikh</option>
              <option value="Sayyid">Sayyid</option>
              <option value="Al Haj">Al Haj</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="fullName.firstName"
              value={userInfo.fullName?.firstName || ""}
              onChange={handleUserInfoChange}
              placeholder="First Name"
            />
            <label className={styles.floatingLabel}>First Name</label>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="fullName.fatherName"
              value={userInfo.fullName?.fatherName || ""}
              onChange={handleUserInfoChange}
              placeholder="Father's Name"
            />
            <label className={styles.floatingLabel}>Father's Name</label>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="fullName.familyName"
              value={userInfo.fullName?.familyName || ""}
              onChange={handleUserInfoChange}
              placeholder="Family Name"
            />
            <label className={styles.floatingLabel}>Family Name</label>
          </div>

          <div className={styles.formGroup}>
            <select
              name="fullName.gender"
              value={userInfo.fullName?.gender || ""}
              onChange={handleUserInfoChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <div className={styles.section}>
          <h3>Contact Information</h3>
          <div className={styles.formGroup}>
            <input
              type="tel"
              name="mobilePhone"
              value={userInfo.mobilePhone}
              onChange={handleUserInfoChange}
              onFocus={() => setIsMobilePhoneFocused(true)}
              onBlur={() => setIsMobilePhoneFocused(false)}
              placeholder="Mobile Phone"
            />
            <label className={styles.floatingLabel}>Mobile Phone</label>
            {isMobilePhoneFocused && (
              <span className={styles.helpText}>(e.g. +971-50-1234567)</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="tel"
              name="landline"
              value={userInfo.landline}
              onChange={handleUserInfoChange}
              onFocus={() => setIsLandlineFocused(true)}
              onBlur={() => setIsLandlineFocused(false)}
              placeholder="Landline"
            />
            <label className={styles.floatingLabel}>Landline</label>
            {isLandlineFocused && (
              <span className={styles.helpText}>(e.g. +971-4-1234567)</span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className={styles.section}>
          <h3>Address</h3>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="address.unit"
              value={userInfo.address?.unit || ""}
              onChange={handleUserInfoChange}
              placeholder="Unit"
            />
            <label className={styles.floatingLabel}>Unit</label>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="address.buildingName"
              value={userInfo.address?.buildingName || ""}
              onChange={handleUserInfoChange}
              placeholder="Building Name"
            />
            <label className={styles.floatingLabel}>Building Name</label>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="address.street"
              value={userInfo.address?.street || ""}
              onChange={handleUserInfoChange}
              placeholder="Street"
            />
            <label className={styles.floatingLabel}>Street</label>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="address.dependentLocality"
              value={userInfo.address?.dependentLocality || ""}
              onChange={handleUserInfoChange}
              placeholder="Area/District"
            />
            <label className={styles.floatingLabel}>Area/District</label>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="address.poBox"
              value={userInfo.address?.poBox || ""}
              onChange={handleUserInfoChange}
              placeholder="P.O. Box"
            />
            <label className={styles.floatingLabel}>P.O. Box</label>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="address.city"
              value={userInfo.address?.city || ""}
              onChange={handleUserInfoChange}
              placeholder="City"
            />
            <label className={styles.floatingLabel}>City</label>
          </div>

          <div className={styles.formGroup}>
            <select
              name="address.emirate"
              value={userInfo.address?.emirate || ""}
              onChange={handleUserInfoChange}
            >
              <option value="">Select Emirate</option>
              <option value="AD">Abu Dhabi</option>
              <option value="DU">Dubai</option>
              <option value="SH">Sharjah</option>
              <option value="AJ">Ajman</option>
              <option value="UAQ">Umm Al Quwain</option>
              <option value="RAK">Ras Al Khaimah</option>
              <option value="FJR">Fujairah</option>
            </select>
          </div>
        </div>

        {/* Newsletter */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="newsletter"
              checked={userInfo.newsletter}
              onChange={handleNewsletterChange}
            />
            Subscribe to newsletter
          </label>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {/* Delete Account Section */}
      <div className={styles.dangerZone}>
        <h3>Danger Zone</h3>
        {!deleteConfirmation ? (
          <button
            type="button"
            onClick={() => setDeleteConfirmation(true)}
            className={styles.deleteButton}
          >
            Delete Account
          </button>
        ) : (
          <div className={styles.deleteConfirmation}>
            <p>Please enter your password to confirm account deletion:</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div className={styles.deleteActions}>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={styles.confirmDeleteButton}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmation(false);
                  setDeletePassword("");
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
