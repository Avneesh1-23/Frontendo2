-- Create database
CREATE DATABASE IF NOT EXISTS secrets_management;
USE secrets_management;

-- Users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('super', 'admin', 'end') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Roles mapping table
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    assigned_by INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

-- Applications table
CREATE TABLE applications (
    app_id INT PRIMARY KEY AUTO_INCREMENT,
    app_name VARCHAR(100) NOT NULL,
    app_url VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Secrets table
CREATE TABLE secrets (
    secret_id INT PRIMARY KEY AUTO_INCREMENT,
    secret_name VARCHAR(100) NOT NULL,
    secret_value TEXT NOT NULL,
    secret_type ENUM('password', 'api_key', 'certificate', 'other') NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Application-Secrets mapping table
CREATE TABLE application_secrets (
    app_id INT,
    secret_id INT,
    assigned_by INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (app_id, secret_id),
    FOREIGN KEY (app_id) REFERENCES applications(app_id) ON DELETE CASCADE,
    FOREIGN KEY (secret_id) REFERENCES secrets(secret_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

-- Application Entitlements table
CREATE TABLE app_entitlements (
    entitlement_id INT PRIMARY KEY AUTO_INCREMENT,
    app_id INT,
    role_id INT,
    permission_level ENUM('read', 'write', 'admin') NOT NULL,
    assigned_by INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES applications(app_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

-- Secret Access Log table
CREATE TABLE secret_access (
    access_id INT PRIMARY KEY AUTO_INCREMENT,
    secret_id INT,
    user_id INT,
    access_type ENUM('view', 'modify', 'delete') NOT NULL,
    access_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (secret_id) REFERENCES secrets(secret_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Insert sample data

-- Sample Users
INSERT INTO users (username, email, password_hash, user_type) VALUES
('superadmin', 'super@example.com', 'hashed_password_1', 'super'),
('admin1', 'admin1@example.com', 'hashed_password_2', 'admin'),
('enduser1', 'enduser1@example.com', 'hashed_password_3', 'end');

-- Sample Roles
INSERT INTO roles (role_name, description) VALUES
('Application Admin', 'Full access to manage applications'),
('Application User', 'Basic access to use applications'),
('Secret Manager', 'Can manage secrets'),
('Viewer', 'Read-only access');

-- Sample Applications
INSERT INTO applications (app_name, app_url, description, created_by) VALUES
('HR Portal', 'https://hr.example.com', 'Human Resources Management System', 2),
('Finance App', 'https://finance.example.com', 'Financial Management System', 2),
('DevOps Dashboard', 'https://devops.example.com', 'Development Operations Dashboard', 2);

-- Sample Secrets
INSERT INTO secrets (secret_name, secret_value, secret_type, created_by) VALUES
('HR API Key', 'encrypted_api_key_1', 'api_key', 2),
('Finance DB Password', 'encrypted_password_1', 'password', 2),
('DevOps Certificate', 'encrypted_cert_1', 'certificate', 2);

-- Sample User-Roles assignments
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(2, 1, 1), -- admin1 as Application Admin
(3, 2, 2); -- enduser1 as Application User

-- Sample Application-Secrets assignments
INSERT INTO application_secrets (app_id, secret_id, assigned_by) VALUES
(1, 1, 2), -- HR Portal with HR API Key
(2, 2, 2); -- Finance App with Finance DB Password

-- Sample Application Entitlements
INSERT INTO app_entitlements (app_id, role_id, permission_level, assigned_by) VALUES
(1, 1, 'admin', 2), -- Application Admin role for HR Portal
(1, 2, 'read', 2),  -- Application User role for HR Portal
(2, 1, 'admin', 2); -- Application Admin role for Finance App

-- Sample Secret Access Logs
INSERT INTO secret_access (secret_id, user_id, access_type, ip_address) VALUES
(1, 2, 'view', '192.168.1.1'),
(2, 2, 'modify', '192.168.1.2'),
(1, 3, 'view', '192.168.1.3'); 