import React, { useState } from 'react';
import { 
  useGetUsersQuery,
  useGetNewsletterHistoryQuery,
  useSendNewsletterMutation,
  useGetProfileQuery,
  useUpdateUsernameMutation,
  useUpdateEmailMutation,
  useUpdatePasswordMutation,
  User,
  Newsletter
} from '../../store/api/adminApi';
import { toast } from 'react-toastify';
import styles from './AdminDashboard.module.scss';

// Types pour les onglets
type TabType = 'overview' | 'users' | 'newsletter' | 'profile';

// Ajout des types et états pour le tri
type SortField = 'username' | 'email' | 'newsletter';
type SortOrder = 'asc' | 'desc';

// Type pour la réponse de l'API du profil
interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    username: string;
    email: string;
    role: string;
  };
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Ajout des types et états pour le tri
  const [sortField, setSortField] = useState<SortField>('username');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Ajout des states pour les modals d'édition
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Récupération des données
  const { 
    data: users = [], 
    isLoading: isLoadingUsers, 
    error: usersError 
  } = useGetUsersQuery();

  const {
    data: newsletterHistory,
    isLoading: isLoadingNewsletter,
    error: newsletterError
  } = useGetNewsletterHistoryQuery({ page, limit });

  const { 
    data: profileResponse,
    isLoading: isLoadingProfile,
    error: profileError
  } = useGetProfileQuery() as { 
    data: ProfileResponse | undefined; 
    isLoading: boolean; 
    error: unknown 
  };

  console.log('Profile data:', profileResponse); // Pour déboguer

  const [updateUsername] = useUpdateUsernameMutation();
  const [updateEmail] = useUpdateEmailMutation();
  const [updatePassword] = useUpdatePasswordMutation();
  const [sendNewsletter] = useSendNewsletterMutation();

  // Gestion des mises à jour du profil
  const handleUpdateUsername = async (username: string) => {
    try {
      await updateUsername({ username }).unwrap();
      toast.success("Username updated successfully");
    } catch (error) {
      toast.error("Failed to update username");
      console.error('Update username error:', error);
    }
  };

  const handleUpdateEmail = async (email: string) => {
    try {
      await updateEmail({ email }).unwrap();
      toast.success("Email updated successfully");
    } catch (error) {
      toast.error("Failed to update email");
      console.error('Update email error:', error);
    }
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await updatePassword({ currentPassword, newPassword }).unwrap();
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error("Failed to update password");
      console.error('Update password error:', error);
    }
  };

  // Gestion de l'envoi de newsletter
  const handleSendNewsletter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await sendNewsletter({
        subject: formData.get('subject') as string,
        content: formData.get('content') as string,
      }).unwrap();
      
      toast.success("Newsletter sent successfully");
      e.currentTarget.reset();
    } catch (error) {
      toast.error("Failed to send newsletter");
      console.error('Send newsletter error:', error);
    }
  };

  // Fonction de tri
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Fonction pour obtenir les utilisateurs triés
  const getSortedUsers = (users: User[]) => {
    return [...users].sort((a, b) => {
      const aValue = sortField === 'newsletter' ? a[sortField] : a[sortField].toLowerCase();
      const bValue = sortField === 'newsletter' ? b[sortField] : b[sortField].toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  };

  // Gestion du chargement et des erreurs
  if (isLoadingUsers || isLoadingNewsletter || isLoadingProfile) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (usersError || newsletterError || profileError) {
    const errorMessage = usersError 
      ? "Error loading users"
      : newsletterError
      ? "Error loading newsletter history"
      : "Error loading profile";
    return <div className={styles.error}>{errorMessage}</div>;
  }

  // Préparation des données
  const newsletters = newsletterHistory?.newsletters || [];
  const totalNewsletters = newsletterHistory?.pagination?.total || 0;
  const totalPages = newsletterHistory?.pagination?.pages || 1;
  const subscribedUsers = users.filter(user => user.newsletter).length;

  const filteredUsers = users.filter((user: User) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Composants des onglets
  const renderOverviewTab = () => (
    <div className={styles.overviewTab}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Users</h3>
          <div className={styles.statValue}>{users.length}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Newsletter Subscribers</h3>
          <div className={styles.statValue}>{subscribedUsers}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Newsletters Sent</h3>
          <div className={styles.statValue}>{totalNewsletters}</div>
        </div>
      </div>
    </div>
  );

  const renderUserDetails = (user: User) => (
    <div className={styles.userDetails}>
      <h3>User Details</h3>
      <div className={styles.detailsGrid}>
        <div className={styles.detailGroup}>
          <h4>Basic Information</h4>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Newsletter:</strong> {user.newsletter ? "Subscribed" : "Not subscribed"}</p>
          <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        {user.fullName && (
          <div className={styles.detailGroup}>
            <h4>Full Name</h4>
            <p><strong>Title:</strong> {user.fullName.honorificTitle || "N/A"}</p>
            <p><strong>First Name:</strong> {user.fullName.firstName}</p>
            <p><strong>Father's Name:</strong> {user.fullName.fatherName}</p>
            <p><strong>Family Name:</strong> {user.fullName.familyName}</p>
            <p><strong>Gender:</strong> {user.fullName.gender}</p>
          </div>
        )}

        {user.address && (
          <div className={styles.detailGroup}>
            <h4>Address</h4>
            <p><strong>Unit:</strong> {user.address.unit || "N/A"}</p>
            <p><strong>Building:</strong> {user.address.buildingName || "N/A"}</p>
            <p><strong>Street:</strong> {user.address.street || "N/A"}</p>
            <p><strong>Area:</strong> {user.address.dependentLocality || "N/A"}</p>
            <p><strong>PO Box:</strong> {user.address.poBox || "N/A"}</p>
            <p><strong>City:</strong> {user.address.city}</p>
            <p><strong>Emirate:</strong> {user.address.emirate}</p>
          </div>
        )}

        <div className={styles.detailGroup}>
          <h4>Contact</h4>
          <p><strong>Mobile:</strong> {user.mobilePhone || "N/A"}</p>
          <p><strong>Landline:</strong> {user.landline || "N/A"}</p>
        </div>
      </div>
      <button 
        onClick={() => setSelectedUser(null)}
        className={styles.closeButton}
      >
        Close
      </button>
    </div>
  );

  const renderUsersTab = () => {
    const sortedAndFilteredUsers = getSortedUsers(filteredUsers);
    
    return (
    <div className={styles.usersTab}>
      <div className={styles.searchBar}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('username')} className={styles.sortableHeader}>
                Username
                {sortField === 'username' && (
                  <span className={styles.sortIcon}>
                    {sortOrder === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('email')} className={styles.sortableHeader}>
                Email
                {sortField === 'email' && (
                  <span className={styles.sortIcon}>
                    {sortOrder === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('newsletter')} className={styles.sortableHeader}>
                Newsletter
                {sortField === 'newsletter' && (
                  <span className={styles.sortIcon}>
                    {sortOrder === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredUsers.map((user: User) => (
              <tr key={user.id}>
                <td data-label="Username">{user.username}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Newsletter">
                  <span className={user.newsletter ? styles.subscribed : styles.notSubscribed}>
                    {user.newsletter ? "Subscribed" : "Not subscribed"}
                  </span>
                </td>
                <td data-label="Actions">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className={styles.detailsButton}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            {renderUserDetails(selectedUser)}
          </div>
        </div>
      )}
    </div>
  );
  };

  // Composant Modal d'édition
  const EditModal = ({ 
    isOpen, 
    onClose, 
    title, 
    children 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode 
  }) => {
    if (!isOpen) return null;

    return (
      <div className={styles.modal} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <h3>{title}</h3>
          {children}
        </div>
      </div>
    );
  };

  // Composant de formulaire de mot de passe
  const PasswordForm = ({
    onSubmit,
    onCancel
  }: {
    onSubmit: (currentPassword: string, newPassword: string) => Promise<void>,
    onCancel: () => void
  }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
    };

    return (
      <form onSubmit={handleSubmit} className={styles.editForm}>
        <div className={styles.formGroup}>
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={styles.input}
            required
            autoComplete="current-password"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div className={styles.modalActions}>
          <button 
            type="button" 
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitButton}>
            Save Changes
          </button>
        </div>
      </form>
    );
  };

  const renderProfileTab = () => (
    <div className={styles.profileTab}>
      {profileResponse?.data ? (
        <>
          <div className={styles.profileHeader}>
            <h3>My Profile</h3>
            <p className={styles.subtitle}>Manage your account information</p>
          </div>

          <div className={styles.profileGrid}>
            <div className={styles.profileSection}>
              <h4>Basic Information</h4>
              <div className={styles.infoGroup}>
                <div className={styles.infoItem}>
                  <label>Username</label>
                  <div className={styles.infoValue}>
                    <span>{profileResponse.data.username}</span>
                    <button 
                      onClick={() => {
                        setNewUsername(profileResponse.data.username);
                        setIsEditingUsername(true);
                      }}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <label>Email</label>
                  <div className={styles.infoValue}>
                    <span>{profileResponse.data.email}</span>
                    <button 
                      onClick={() => {
                        setNewEmail(profileResponse.data.email);
                        setIsEditingEmail(true);
                      }}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <label>Role</label>
                  <div className={styles.infoValue}>
                    <span className={styles.roleTag}>{profileResponse.data.role}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.profileSection}>
              <h4>Security</h4>
              <div className={styles.infoGroup}>
                <button 
                  onClick={() => setIsEditingPassword(true)}
                  className={`${styles.editButton} ${styles.securityButton}`}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Modal pour modifier le username */}
          <EditModal
            isOpen={isEditingUsername}
            onClose={() => setIsEditingUsername(false)}
            title="Edit Username"
          >
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleUpdateUsername(newUsername);
              setIsEditingUsername(false);
            }} className={styles.editForm}>
              <div className={styles.formGroup}>
                <label htmlFor="username">New Username</label>
                <input
                  type="text"
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className={styles.input}
                  required
                  minLength={3}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsEditingUsername(false)} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Save Changes
                </button>
              </div>
            </form>
          </EditModal>

          {/* Modal pour modifier l'email */}
          <EditModal
            isOpen={isEditingEmail}
            onClose={() => setIsEditingEmail(false)}
            title="Edit Email"
          >
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleUpdateEmail(newEmail);
              setIsEditingEmail(false);
            }} className={styles.editForm}>
              <div className={styles.formGroup}>
                <label htmlFor="email">New Email</label>
                <input
                  type="email"
                  id="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsEditingEmail(false)} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Save Changes
                </button>
              </div>
            </form>
          </EditModal>

          {/* Modal pour modifier le mot de passe */}
          <EditModal
            isOpen={isEditingPassword}
            onClose={() => setIsEditingPassword(false)}
            title="Change Password"
          >
            <PasswordForm
              onSubmit={handleUpdatePassword}
              onCancel={() => setIsEditingPassword(false)}
            />
          </EditModal>
        </>
      ) : (
        <div className={styles.loading}>Loading profile information...</div>
      )}
    </div>
  );

  const renderNewsletterTab = () => (
    <div className={styles.newsletterTab}>
      <div className={styles.newNewsletter}>
        <h3>Send New Newsletter</h3>
        <form onSubmit={handleSendNewsletter} className={styles.newsletterForm}>
          <input
            type="text"
            name="subject"
            placeholder="Newsletter subject"
            required
            className={styles.input}
          />
          <textarea
            name="content"
            placeholder="Newsletter content"
            required
            className={styles.textarea}
          />
          <button type="submit" className={styles.submitButton} disabled>
            Send ({subscribedUsers} recipients)
          </button>
        </form>
      </div>

      <div className={styles.newsletterHistory}>
        <h3>Newsletter History</h3>
        {newsletters.length > 0 ? (
          <>
            <div className={styles.newsletterList}>
              {newsletters.map((newsletter: Newsletter) => (
                <div key={newsletter.id} className={styles.newsletterCard}>
                  <h4>{newsletter.subject}</h4>
                  <p>Sent by: {newsletter.sentBy?.username || "Unknown"}</p>
                  <p>Date: {new Date(newsletter.sentAt).toLocaleDateString()}</p>
                  <p>Recipients: {newsletter.recipientCount}</p>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={styles.pageButton}
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={styles.pageButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className={styles.emptyState}>No newsletters sent yet.</p>
        )}
      </div>
    </div>
  );

  const OrientationBanner = () => (
    <div className={styles.orientationBanner}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c-4.97 0-9-4.03-9-9m9 9a9 9 0 009-9m-9 9c4.97 0 9-4.03 9-9"/>
      </svg>
      For a better experience, please rotate your device to landscape mode
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      <OrientationBanner />
      <header className={styles.dashboardHeader}>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {profileResponse?.data?.username}</p>
      </header>

      <nav className={styles.tabsNav}>
        {[
          { id: "overview", label: "Overview" },
          { id: "users", label: "Users" },
          { id: "newsletter", label: "Newsletter" },
          { id: "profile", label: "My Profile" }
        ].map(tab => (
          <button 
            key={tab.id}
            className={activeTab === tab.id ? styles.active : ""}
            onClick={() => setActiveTab(tab.id as TabType)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className={styles.content}>
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "users" && renderUsersTab()}
        {activeTab === "newsletter" && renderNewsletterTab()}
        {activeTab === "profile" && renderProfileTab()}
      </main>
    </div>
  );
};

export default AdminDashboard; 