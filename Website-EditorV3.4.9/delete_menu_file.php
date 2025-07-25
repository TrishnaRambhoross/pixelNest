<?php
header('Content-Type: application/json');

// Input
$slug = $_POST['slug'] ?? '';
$website = $_POST['website'] ?? 'default';
$mode = $_POST['mode'] ?? 'multi'; // NEW: multi OR onepage

$safeWebsite = basename($website);
$cleanSlug = preg_replace('/[^a-z0-9\-]/', '', strtolower($slug));

$dir = "Websites/$safeWebsite";

if (!is_dir($dir)) {
    echo json_encode(['status' => 'error', 'message' => 'Website directory does not exist.']);
    exit;
}

// MULTI-PAGE: Delete a .php file in pages/
if ($mode === 'multi') {
    $filepath = "$dir/pages/$cleanSlug.php";

    if (!$slug || !file_exists($filepath)) {
        echo json_encode(['status' => 'error', 'message' => 'File not found or invalid slug.']);
        exit;
    }

    if (unlink($filepath)) {
        echo json_encode(['status' => 'success', 'message' => 'Page file deleted.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete page file.']);
    }
    exit;
}

// ONEPAGE: Delete an entry from onepage_menu.json
if ($mode === 'onepage') {
    $jsonFile = "$dir/onepage_menu.json";
    if (!file_exists($jsonFile)) {
        echo json_encode(['status' => 'error', 'message' => 'One Page menu file not found.']);
        exit;
    }

    $menuData = json_decode(file_get_contents($jsonFile), true);
    if (!is_array($menuData)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid One Page menu data.']);
        exit;
    }

    // Remove item by name match
    $newMenu = array_filter($menuData, function ($item) use ($slug) {
        $slugified = strtolower(trim(preg_replace('/[^a-z0-9\-]/', '-', $item['name'])));
        return $slugified !== $slug;
    });

    if (count($newMenu) === count($menuData)) {
        echo json_encode(['status' => 'error', 'message' => 'Menu item not found.']);
        exit;
    }

    if (false === file_put_contents($jsonFile, json_encode(array_values($newMenu), JSON_PRETTY_PRINT))) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update One Page menu file.']);
        exit;
    }

    echo json_encode(['status' => 'success', 'message' => 'One Page menu item removed.']);
    exit;
}

// If mode is unknown
echo json_encode(['status' => 'error', 'message' => 'Invalid mode.']);
exit;
?>