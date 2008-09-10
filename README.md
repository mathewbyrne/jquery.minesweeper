jQuery Minesweeper
==================

A simple Minesweeper clone built with jQuery. Uses the DOM to create a Minesweeper field and track the players state. This is a very simple implementation that doesn't focus at all on performance or scalability.

Known Issues
------------

- :active state can sometimes get stuck in certain browsers.
- The fill algorithm used is recursive and hits fairly shallow limits in many browsers. This currently limits the size of the board in most browsers to a fairly modest area.
