<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $header = $_POST['header'] ?? '';
    $main = $_POST['main'] ?? '';
    $footer = $_POST['footer'] ?? '';
    $page = $_POST['page'] ?? 'home'; // default to 'home'
    $website = $_POST['website'] ?? 'default';
    $menuJson = $_POST['menu'] ?? '';

    $safeWebsite = basename($website);
    $safePage = basename($page);

    // Remove <script> tags for security
    $header = preg_replace('#<script\b[^>]*>(.*?)</script>#is', '', $header);
    $main = preg_replace('#<script\b[^>]*>(.*?)</script>#is', '', $main);
    $footer = preg_replace('#<script\b[^>]*>(.*?)</script>#is', '', $footer);

    $dir = "Websites/$safeWebsite";
    if (!is_dir($dir)) {
        if (!mkdir($dir, 0755, true)) {
            echo json_encode(['status' => 'error', 'message' => "Failed to create directory: $safeWebsite"]);
            exit;
        }
    }

    $pagesDir = "$dir/pages";
    if (!is_dir($pagesDir)) {
        if (!mkdir($pagesDir, 0755, true)) {
            echo json_encode(['status' => 'error', 'message' => "Failed to create pages dir"]);
            exit;
        }
    }

    $headerFile = "$dir/header.php";
    $footerFile = "$dir/footer.php";
    $mainFile = "$pagesDir/{$safePage}.php";  // Save the correct page file

    $menuFile = "$dir/menu.json";

    if ($menuJson !== '') {
        $decodedMenu = json_decode($menuJson, true);
        if ($decodedMenu === null && json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid menu JSON']);
            exit;
        }
    }

    $headerSaved = file_put_contents($headerFile, $header);
    $mainSaved = file_put_contents($mainFile, $main);
    $footerSaved = file_put_contents($footerFile, $footer);
    $menuSaved = file_put_contents($menuFile, $menuJson);

    if ($headerSaved !== false && $mainSaved !== false && $footerSaved !== false && $menuSaved !== false) {
        echo json_encode(['status' => 'success', 'message' => "Page '<strong>$safePage</strong>' saved successfully in '<strong>$safeWebsite</strong>' ✅"]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to save files.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'No data received.']);
}
?>