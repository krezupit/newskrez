-- ============================================================================
-- NewsKrez Email Delivery & Notification Logs Table Migration
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient VARCHAR(191) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'sent',
  error_message TEXT,
  message_id VARCHAR(191),
  retry_count INT NOT NULL DEFAULT 0,
  metadata JSON,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_email_recipient (recipient),
  INDEX idx_email_type (email_type),
  INDEX idx_email_status (status),
  INDEX idx_email_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
