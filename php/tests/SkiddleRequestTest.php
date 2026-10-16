<?php

require_once __DIR__ . '/../autoloader.php';
require_once __DIR__ . '/SkiddleSessionTest.php';

use SkiddleSDK\SkiddleRequest;

class SkiddleRequestTest extends PHPUnit_Framework_TestCase
{
    public function testSetAndGetApiVersion()
    {
        $req = new SkiddleRequest();
        $this->assertEquals(1, $req->getApiVersion());
        $req->setApiVersion(3);
        $this->assertEquals(3, $req->getApiVersion());
    }

    public function testTransformRequestKeysTranslatesV3ParamsAndPagination()
    {
        $req = new SkiddleRequest();
        $transformed = $req->transformRequestKeys([
            'api_key' => 'secret123',
            'keyword' => 'Warehouse',
            'limit' => 10,
            'offset' => 20,
            'eventcode' => 'fest',
            'ticketsavailable' => 1,
            'order' => 'random',
        ]);

        $this->assertEquals('secret123', $transformed['apiKey']);
        $this->assertEquals('Warehouse', $transformed['keyword']);
        $this->assertEquals(10, $transformed['page[size]']);
        $this->assertEquals(3, $transformed['page[number]']);
        $this->assertEquals('FEST', $transformed['eventCode']);
        $this->assertEquals(1, $transformed['ticketsAvailable']);
        $this->assertFalse(isset($transformed['order']));
    }
}
