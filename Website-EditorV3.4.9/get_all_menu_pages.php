<?php
header('Content-Type: application/json');

$website = $_GET['website'] ?? 'default';
$safeWebsite = basename($website);
$pagesDir = "Websites/$safeWebsite/pages";

if (!is_dir($pagesDir)) {
    echo json_encode([
        'status' => 'error',
        'message' => "Website pages directory does not exist: $safeWebsite"
    ]);
    exit;
}

$files = glob("$pagesDir/*.php");

$pages = [];
foreach ($files as $file) {
    $filename = basename($file, '.php');
    $pages[] = $filename;
}

echo json_encode([
    'status' => 'success',
    'pages' => $pages
]);
exit;
?>
