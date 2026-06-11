-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 09, 2026 at 10:50 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bakeryorder`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Roti', 'Berbagai pilihan roti segar dipanggang setiap hari', '2026-06-09 08:50:26'),
(2, 'Kue', 'Kue lezat dengan bahan berkualitas premium', '2026-06-09 08:50:26'),
(3, 'Minuman', 'Minuman segar untuk menemani santapan Anda', '2026-06-09 08:50:26');

-- --------------------------------------------------------

--
-- Stand-in structure for view `daily_stats`
-- (See below for the actual view)
--
CREATE TABLE `daily_stats` (
`tanggal` date
,`total_pesanan` bigint(21)
,`pesanan_selesai` decimal(22,0)
,`pendapatan` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `harga` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id`, `nama`, `harga`) VALUES
(1, 'Croissant', 15000),
(2, 'Donat Coklat', 12000),
(3, 'Cheese Cake', 25000),
(4, 'Brownies', 20000),
(5, 'Kopi Latte', 18000);

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` enum('roti','kue','minuman') NOT NULL DEFAULT 'roti',
  `emoji` varchar(10) DEFAULT '??',
  `price` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `badge` varchar(30) DEFAULT '',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `name`, `category`, `emoji`, `price`, `description`, `badge`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Croissant Butter', 'roti', '??', 18000, 'Croissant renyah dengan mentega premium', 'bestseller', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(2, 'Roti Tawar Gandum', 'roti', '??', 12000, 'Roti tawar lembut dari tepung gandum pilihan', '', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(3, 'Baguette Klasik', 'roti', '??', 22000, 'Baguette renyah ala Perancis', '', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(4, 'Roti Coklat Keju', 'roti', '??', 16000, 'Perpaduan coklat dan keju yang sempurna', 'new', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(5, 'Kue Tart Stroberi', 'kue', '??', 25000, 'Tart lembut dengan selai stroberi segar', 'bestseller', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(6, 'Black Forest Slice', 'kue', '??', 28000, 'Kue coklat dengan krim dan ceri asli', '', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(7, 'Macaron Assorted', 'kue', '??', 20000, 'Macaron aneka rasa isi 3 pcs', 'promo', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(8, 'Tiramisu Cup', 'kue', '??', 22000, 'Tiramisu creamy dengan espresso Italia', '', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(9, 'Cappuccino', 'minuman', '?', 28000, 'Cappuccino susu berbusa lembut', '', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(10, 'Matcha Latte', 'minuman', '??', 30000, 'Green tea Jepang dengan susu segar', 'bestseller', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(11, 'Fresh Orange Juice', 'minuman', '??', 20000, 'Jus jeruk segar diperas langsung', '', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31'),
(12, 'Es Coklat Belgia', 'minuman', '??', 26000, 'Minuman coklat premium dengan es batu', 'new', 1, '2026-06-09 14:49:31', '2026-06-09 14:49:31');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `category_id`, `name`, `description`, `price`, `image_url`, `is_available`, `created_at`, `updated_at`) VALUES
(1, 1, 'Roti Tawar Premium', 'Roti tawar lembut dengan tekstur sempurna, cocok untuk sarapan', 25000.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(2, 1, 'Roti Gandum Spesial', 'Roti gandum utuh kaya serat, pilihan sehat dan lezat', 32000.00, 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(3, 1, 'Croissant Butter', 'Croissant berlapis mentega pilihan, renyah di luar lembut di dalam', 28000.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(4, 1, 'Roti Coklat', 'Roti manis dengan isian coklat premium yang meleleh', 22000.00, 'https://images.unsplash.com/photo-1606101273945-e9eba71c5e76?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(5, 1, 'Baguette Prancis', 'Roti khas Prancis dengan kulit renyah dan bagian dalam lembut', 35000.00, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(6, 1, 'Roti Kayu Manis', 'Roti gulung kayu manis dengan glasur manis yang menggugah selera', 26000.00, 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(7, 2, 'Black Forest Cake', 'Kue black forest klasik dengan ceri segar dan krim lembut', 65000.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(8, 2, 'Tiramisu', 'Tiramisu Italia autentik dengan espresso dan mascarpone premium', 55000.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(9, 2, 'Red Velvet Slice', 'Potongan kue red velvet dengan cream cheese frosting yang kaya', 48000.00, 'https://images.unsplash.com/photo-1586788224331-947f68671cf1?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(10, 2, 'Muffin Blueberry', 'Muffin lembut penuh buah blueberry segar dan topping crumble', 22000.00, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(11, 2, 'Cheesecake Strawberry', 'Cheesecake lembut dengan topping strawberry segar yang menggoda', 58000.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(12, 2, '?clair Coklat', '?clair klasik Prancis dengan krim vanilla dan glasur coklat gelap', 30000.00, 'https://images.unsplash.com/photo-1624371414361-e670edf4b252?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(13, 3, 'Kopi Susu Gula Aren', 'Espresso segar dengan susu segar dan gula aren pilihan', 28000.00, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(14, 3, 'Matcha Latte', 'Matcha Jepang premium dengan susu oat yang creamy', 32000.00, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(15, 3, 'Hot Chocolate', 'Coklat panas kaya dengan busa susu lembut di atasnya', 25000.00, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26'),
(16, 3, 'Lemon Tea Segar', 'Teh hitam segar dengan perasan lemon dan madu alami', 18000.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', 1, '2026-06-09 08:50:26', '2026-06-09 08:50:26');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `table_number` varchar(30) NOT NULL,
  `note` text DEFAULT NULL,
  `payment_method` varchar(50) NOT NULL,
  `subtotal` int(11) NOT NULL DEFAULT 0,
  `tax` int(11) NOT NULL DEFAULT 0,
  `total` int(11) NOT NULL DEFAULT 0,
  `status` enum('pending','confirmed','ready','done','cancelled') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `menu_name` varchar(100) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pesanan`
--

CREATE TABLE `pesanan` (
  `id` int(11) NOT NULL,
  `total` int(11) DEFAULT NULL,
  `tanggal` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(80) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `role` enum('admin','kasir','pelayan','dapur') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `role`, `is_active`, `created_at`) VALUES
(1, 'admin', '$2b$10$rOzJqQMYWmHkBmHk8tXlAuGqk6xqhqhxqhqhxqhqhxqhqhxqhqhx', 'Admin BakeryOrder', 'admin', 1, '2026-06-09 08:50:26'),
(2, 'kasir1', '$2b$10$rOzJqQMYWmHkBmHk8tXlAuGqk6xqhqhxqhqhxqhqhxqhqhxqhqhx', 'Kasir Satu', 'kasir', 1, '2026-06-09 08:50:26');

-- --------------------------------------------------------

--
-- Structure for view `daily_stats`
--
DROP TABLE IF EXISTS `daily_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `daily_stats`  AS SELECT cast(`orders`.`created_at` as date) AS `tanggal`, count(0) AS `total_pesanan`, sum(case when `orders`.`status` = 'done' then 1 else 0 end) AS `pesanan_selesai`, sum(case when `orders`.`status` = 'done' then `orders`.`total` else 0 end) AS `pendapatan` FROM `orders` GROUP BY cast(`orders`.`created_at` as date) ORDER BY cast(`orders`.`created_at` as date) DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pesanan`
--
ALTER TABLE `pesanan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
