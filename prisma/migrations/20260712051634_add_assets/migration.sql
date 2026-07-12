-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'Employee',
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_name` VARCHAR(255) NOT NULL,
    `department_head_id` INTEGER NULL,
    `parent_department_id` INTEGER NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_department_name_key`(`department_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `warranty_period` INTEGER NULL,
    `depreciation_years` INTEGER NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `asset_categories_category_name_key`(`category_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,
    `employee_code` VARCHAR(50) NOT NULL,
    `designation` VARCHAR(255) NOT NULL DEFAULT 'Employee',
    `phone` VARCHAR(50) NOT NULL DEFAULT '',
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employees_user_id_key`(`user_id`),
    UNIQUE INDEX `employees_employee_code_key`(`employee_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_tag` VARCHAR(50) NOT NULL,
    `asset_name` VARCHAR(255) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `serial_number` VARCHAR(255) NOT NULL,
    `purchase_date` DATETIME(3) NULL,
    `purchase_cost` DOUBLE NULL,
    `condition` VARCHAR(50) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `department_id` INTEGER NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(255) NULL,
    `is_shared` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Available',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assets_asset_tag_key`(`asset_tag`),
    UNIQUE INDEX `assets_serial_number_key`(`serial_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `asset_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
