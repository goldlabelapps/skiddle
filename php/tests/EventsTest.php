<?php

require_once __DIR__ . '/../autoloader.php';
require_once __DIR__ . '/SkiddleSessionTest.php';

use SkiddleSDK\Events;
use SkiddleSDK\Artists;
use SkiddleSDK\Venues;
use SkiddleSDK\SkiddleSession;
use SkiddleSDK\SkiddleException;

class EventsTest extends PHPUnit_Framework_TestCase
{
    public function testFluentConditionsManagementParity()
    {
        $events = new Events();
        $events->addCond('keyword', 'Creamfields');
        $events->addCond('genres', ['house', 'techno']);
        $events->addCond('limit', 10);

        $conds = $events->getConditions();
        $this->assertEquals('Creamfields', $conds['keyword']);
        $this->assertEquals('house,techno', $conds['genres']);
        $this->assertEquals(10, $conds['limit']);

        $events->delCond('keyword');
        $this->assertFalse(isset($events->getConditions()['keyword']));

        $events->clearConditions();
        $this->assertEquals([], $events->getConditions());
    }

    public function testDelCondThrowsOnMissingCondition()
    {
        $events = new Events();
        $thrown = false;
        try {
            $events->delCond('missing_key');
        } catch (SkiddleException $e) {
            $thrown = true;
            $this->assertEquals('Trying to delete condition missing_key, but condition not found', $e->getMessage());
        }
        $this->assertTrue($thrown);
    }

    public function testEntitiesBindSessionCorrectly()
    {
        $session = new SkiddleSession(['api_key' => 'php_test_key', 'dev_mode' => true]);
        $events = new Events();
        $artists = new Artists();
        $venues = new Venues();

        $events->setSession($session);
        $artists->setSession($session);
        $venues->setSession($session);

        $this->assertEquals('php_test_key', $events->session->getApiKey());
        $this->assertTrue($events->request->dev_mode);
        $this->assertEquals('/events/instant-search/', Events::ENDPOINT);
        $this->assertEquals('/artists/', Artists::ENDPOINT);
        $this->assertEquals('/venues/', Venues::ENDPOINT);
    }

    public function testArtistsAndVenuesFluentConditions()
    {
        $artists = new Artists();
        $artists->addCond('name', 'Bicep');
        $this->assertEquals('Bicep', $artists->getConditions()['name']);

        $venues = new Venues();
        $venues->addCond('keyword', 'The Warehouse Project');
        $this->assertEquals('The Warehouse Project', $venues->getConditions()['keyword']);
        $venues->delCond('keyword');
        $this->assertFalse(isset($venues->getConditions()['keyword']));
    }
}
