<?php
header('Content-Type: application/json');

// Only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method.'
    ]);
    exit;
}

// Vars
$website = $_POST['website'] ?? 'default';
$safeWebsite = basename($website);
$dir = "Websites/$safeWebsite";
$mode = $_POST['mode'] ?? 'multi'; // NEW

if (!is_dir($dir)) {
    echo json_encode([
        'status' => 'error',
        'message' => "Website directory does not exist: $safeWebsite"
    ]);
    exit;
}

$renameDataJson = $_POST['renameData'] ?? '';
if ($renameDataJson === '') {
    echo json_encode([
        'status' => 'error',
        'message' => 'No rename data received.'
    ]);
    exit;
}

$renameData = json_decode($renameDataJson, true);
if ($renameData === null && json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid JSON rename data.'
    ]);
    exit;
}

// Slugify helper
function slugify($text) {
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    $text = trim($text, '-');
    return $text;
}

// ======= MULTI-PAGE MODE =======
if ($mode === 'multi') {
    $pagesDir = "$dir/pages";
    if (!is_dir($pagesDir)) {
        mkdir($pagesDir, 0755, true);
    }

    $existingFiles = [];
    foreach (glob("$pagesDir/*.php") as $file) {
        $existingFiles[basename($file, ".php")] = $file;
    }

    foreach ($renameData as $item) {
        $oldSlug = $item['oldSlug'] ?? '';
        $newName = $item['newName'] ?? '';

        if (!$oldSlug || !$newName) continue;

        $newSlug = slugify($newName);
        $oldFilePath = $existingFiles[$oldSlug] ?? null;
        $newFilePath = "$pagesDir/$newSlug.php";

        // Rename file if changed
        if ($oldFilePath && $oldSlug !== $newSlug) {
            if (file_exists($newFilePath)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => "Target file $newSlug.php already exists."
                ]);
                exit;
            }
            if (!rename($oldFilePath, $newFilePath)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => "Failed to rename $oldSlug.php to $newSlug.php."
                ]);
                exit;
            }
            unset($existingFiles[$oldSlug]);
            $existingFiles[$newSlug] = $newFilePath;
        }

        // Create if missing
        if (!$oldFilePath && !file_exists($newFilePath)) {
            if (false === file_put_contents($newFilePath, "<!-- New page for menu item: $newName -->")) {
                echo json_encode([
                    'status' => 'error',
                    'message' => "Failed to create $newSlug.php."
                ]);
                exit;
            }
            $existingFiles[$newSlug] = $newFilePath;
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Multi-page menu validated.'
    ]);
    exit;
}

// ======= ONE PAGE MODE =======
if ($mode === 'onepage') {
    $pagesDir = "$dir/pages";

    if (is_dir($pagesDir)) {
        // Get all files in the pages folder except home.php
        $files = glob("$pagesDir/*.php");

        foreach ($files as $file) {
            if (basename($file) !== 'home.php' && is_file($file)) {
                unlink($file);
            }
        }
        // Do NOT remove the directory itself
    }

    // Optionally, save IDs somewhere? E.g. as JSON:
    $saveFile = "$dir/onepage_menu.json";
    if (false === file_put_contents($saveFile, json_encode($renameData, JSON_PRETTY_PRINT))) {
        echo json_encode([
            'status' => 'error',
            'message' => "Failed to save One Page menu config."
        ]);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'One Page menu validated. Pages folder files (except home.php) deleted.'
    ]);
    exit;
}

echo json_encode([
    'status' => 'error',
    'message' => 'Unknown mode.'
]);
exit;
?>