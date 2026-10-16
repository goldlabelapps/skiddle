<?php

require_once __DIR__ . '/../autoloader.php';

use SkiddleSDK\SkiddleSession;
use SkiddleSDK\SkiddleException;

if (!class_exists('PHPUnit_Framework_TestCase')) {
    abstract class PHPUnit_Framework_TestCase
    {
        public function assertEquals($expected, $actual, $message = '')
        {
            if ($expected !== $actual) {
                throw new \RuntimeException($message ?: "Expected " . var_export($expected, true) . " but got " . var_export($actual, true));
            }
        }

        public function assertNotEmpty($actual, $message = '')
        {
            if (empty($actual)) {
                throw new \RuntimeException($message ?: "Expected value not to be empty");
            }
        }

        public function assertTrue($condition, $message = '')
        {
            if ($condition !== true) {
                throw new \RuntimeException($message ?: "Expected true");
            }
        }

        public function assertFalse($condition, $message = '')
        {
            if ($condition !== false) {
                throw new \RuntimeException($message ?: "Expected false");
            }
        }
    }
}

class SkiddleSessionTest extends PHPUnit_Framework_TestCase
{
    public function testInitializesWithExplicitApiKey()
    {
        $session = new SkiddleSession(['api_key' => '01234567890', 'dev_mode' => true]);
        $this->assertEquals('01234567890', $session->getApiKey());
        $this->assertTrue($session->dev_mode);
    }

    public function testFallsBackToEnvironmentVariable()
    {
        putenv('SKIDDLE_API_KEY=env_test_key_999');
        $session = new SkiddleSession([]);
        $this->assertEquals('env_test_key_999', $session->getApiKey());
        $this->assertFalse($session->dev_mode);
        putenv('SKIDDLE_API_KEY');
    }

    public function testThrowsWhenApiKeyIsMissing()
    {
        putenv('SKIDDLE_API_KEY');
        $thrown = false;
        try {
            new SkiddleSession([]);
        } catch (SkiddleException $e) {
            $thrown = true;
            $this->assertEquals('API Key is missing', $e->getMessage());
        }
        $this->assertTrue($thrown, 'Expected SkiddleException when API key is missing');
    }
}
