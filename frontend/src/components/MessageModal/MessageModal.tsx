import React, { useState } from 'react';
import { Message, MessageStatus, Admin } from '../../store/api/adminApi';
import styles from './MessageModal.module.scss';

type ViewMessageProps = {
  mode: 'view';
  message: Message;
  onClose: () => void;
  onUpdateStatus: (messageId: string, status: MessageStatus) => Promise<void>;
  onReply: (messageId: string, content: string) => Promise<void>;
};

type NewMessageProps = {
  mode: 'new';
  admins: Admin[];
  onClose: () => void;
  onSend: (to: string, subject: string, content: string) => Promise<void>;
};

type Props = ViewMessageProps | NewMessageProps;

const MessageModal: React.FC<Props> = (props) => {
  const [replyContent, setReplyContent] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (props.mode === 'view') {
      if (!replyContent.trim()) return;
      setIsSubmitting(true);
      try {
        await props.onReply(props.message.id, replyContent);
        setReplyContent('');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!selectedAdmin || !subject.trim() || !replyContent.trim()) return;
      setIsSubmitting(true);
      try {
        await props.onSend(selectedAdmin, subject, replyContent);
        setReplyContent('');
        setSubject('');
        setSelectedAdmin('');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (props.mode === 'view') {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h3>{props.message.subject}</h3>
            <button onClick={props.onClose} className={styles.closeButton}>×</button>
          </div>

          <div className={styles.content}>
            <div className={styles.messageInfo}>
              <p><strong>From:</strong> {props.message.name} ({props.message.email})</p>
              <p><strong>Date:</strong> {new Date(props.message.createdAt).toLocaleString()}</p>
              <div className={styles.statusSection}>
                <strong>Status:</strong>
                <select
                  value={props.message.status}
                  onChange={(e) => props.onUpdateStatus(props.message.id, e.target.value as MessageStatus)}
                  className={styles.statusSelect}
                >
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className={styles.messageContent}>
              <p>{props.message.content}</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.replyForm}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={4}
              />
              <button type="submit" disabled={isSubmitting || !replyContent.trim()}>
                {isSubmitting ? 'Sending...' : 'Reply'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>New Internal Message</h3>
          <button onClick={props.onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit} className={styles.newMessageForm}>
            <div className={styles.formGroup}>
              <label>To:</label>
              <select
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
                required
              >
                <option value="">Select recipient</option>
                {props.admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.username}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Message:</label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your message..."
                rows={4}
                required
              />
            </div>

            <button type="submit" disabled={isSubmitting || !selectedAdmin || !subject.trim() || !replyContent.trim()}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessageModal; 