<?php
header('Content-Type: application/json');
$rootDir = 'Websites';
$sites = [];

if (is_dir($rootDir)) {
    $items = scandir($rootDir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        if (is_dir("$rootDir/$item")) {
            $sites[] = $item;
        }
    }
}

echo json_encode($sites);
?>