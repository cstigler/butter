/*global Butter,asyncTest,equal,start,ok*/
require( [ "../src/core/popcorn-wrapper" ], function( PopcornWrapper ) {
  var defaultEvent = { start: 1, end: 4, text: "Track Event" },
      _iframe,
      _butter,
      _trackEventData = { start: 2, end: 3, text: "Updated with updateEvent" };

  function prepare( events ) {
    var popcornWrapper = new PopcornWrapper( "video", events );

    popcornWrapper.prepare(
      [
        "../../external/popcorn-js/test/trailer.ogv",
        "../../external/popcorn-js/test/trailer.mp4"
      ],
      "video",
      [
        { frameAnimation: true }
      ]
    );
    
    return popcornWrapper;
  }

  module( "Popcorn Wrapper" );

  asyncTest( "Prepare", 2, function() {
    var _pPrepare = prepare( {} );

    ok( _pPrepare.popcorn, "Successfully generated popcorn instance" );
    ok( _pPrepare.popcorn.options[ 0 ].frameAnimation, "Successfully set true flag for frameAnimation" );
    _pPrepare.popcorn.destroy();
    start();
  });
  
  asyncTest( "destroyEvent", 1, function() {
    var id,
        trackEvent,
        _pDestroy = prepare( {} );

    // Add some dummy text events
    _pDestroy.popcorn.text( defaultEvent );
    id = _pDestroy.popcorn.getLastTrackEventId();
   
    // Need to update an event first since it's id won't be in the butterMap until then
    _pDestroy.updateEvent({
      type: "text",
      id: id,
      popcornOptions: _trackEventData
    });
    
    _pDestroy.destroyEvent( { id: id } );

    /*
     * Since we are doing this outside of the butter instance itself, we wind up with a second track event
     * because the TrackEvent Id hasn't been stored in the _butterMap object yet, which causes it to create
     * a new one. This means we will still have one track event left with the original data before the update.
     */
    equal( _pDestroy.popcorn.getTrackEvents().length, 1, "Successfully removed trackevent with destroyEvent" );
    _pDestroy.popcorn.destroy();
    start();
  });
  
  asyncTest( "updateEvent", 3, function() {
    var id,
        trackEvent,
        _pUpdate = prepare( {} );

    // Add some dummy text events
    _pUpdate.popcorn.text( defaultEvent );
    id = _pUpdate.popcorn.getLastTrackEventId();
    
    _pUpdate.updateEvent({
      type: "text",
      id: id,
      popcornOptions: _trackEventData
    });

    /*
     * Since we are doing this outside of the butter instance itself, we wind up with a second track event
     * because the TrackEvent Id hasn't been stored in the _butterMap object yet, which causes it to create
     * a new one.
     */
    trackEvent = _pUpdate.popcorn.getTrackEvents()[ 1 ];

    // Check new data vs stored values
    equal( trackEvent.start, _trackEventData.start, "Successfully updated start time to " + _trackEventData.start );
    equal( trackEvent.end, _trackEventData.end, "Successfully updated end time to " + _trackEventData.end );
    equal( trackEvent.text, _trackEventData.text, "Successfully updated text to " + _trackEventData.text );

    _pUpdate.popcorn.destroy();
    start();
  });

  asyncTest( "unbind ", 2, function() {
    var _pBind = prepare( {} ),
        popcorn = _pBind.popcorn;

    ok( popcorn !== undefined, "Popcorn instance is not undefined after prepare" );

    // Destroys popcorn instance
    _pBind.unbind();

    popcorn = _pBind.popcorn;
    ok( !popcorn, "Popcorn instance is successfully unbound" );

    start();
  });

  asyncTest( "play passthrough", 1, function() {
    var _eventsPlay = {
          "popcornEvents": {
            "play": function() {
              ok( true, "PopcornWrapper play passthrough successfully played video" );
              start();
            }
          }
        },
        _pPlay = prepare( _eventsPlay );

    _pPlay.play();
  });

  asyncTest( "pause passthrough", 1, function() {
    var _eventsPause = {
          "popcornEvents": {
            pause: function() {
              ok( true, "PopcornWrapper pause passthrough successfully paused video" );
              start();
            }
          }
        },
        _pPause = prepare( _eventsPause );

    // Seems to require a play fired first of some sort
    _pPause.play();
    _pPause.pause();
  });

});
