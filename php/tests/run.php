<?php
/**
 * Standalone zero-dependency PHP SDK Test & Syntax Runner
 * Verifies PHP syntax across all SDK classes and executes PHP unit tests.
 */

require_once __DIR__ . '/SkiddleSessionTest.php';
require_once __DIR__ . '/SkiddleRequestTest.php';
require_once __DIR__ . '/EventsTest.php';

$suites = [
    new SkiddleSessionTest(),
    new SkiddleRequestTest(),
    new EventsTest(),
];

$passed = 0;
$failed = 0;

echo "\n🐘 Running Skiddle PHP SDK Unit Test Suite...\n";

foreach ($suites as $suite) {
    $className = get_class($suite);
    $methods = get_class_methods($suite);
    foreach ($methods as $method) {
        if (strpos($method, 'test') === 0) {
            try {
                $suite->$method();
                echo "  ✔ {$className}::{$method}\n";
                $passed++;
            } catch (\Throwable $e) {
                echo "  ✖ {$className}::{$method} — {$e->getMessage()}\n";
                $failed++;
            }
        }
    }
}

echo "\nPHP SDK Results: {$passed} passed, {$failed} failed.\n";
if ($failed > 0) {
    exit(1);
}
