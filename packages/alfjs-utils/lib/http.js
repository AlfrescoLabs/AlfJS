require('alfjs-core/core');
require('alfjs-vendor/reqwest');

//Adds $.xhr and jQuery-like $.ajax methods to the prescribed namespace.
//Inspired from David Flanagans excellent cross-platform utils http://www.davidflanagan.com/javascript5/display.php?n=20-1&f=20/01.js
//Includes underscore.js _.each and _.extend methods
//modified to behave like jQuery's $.ajax(), not complete.

AlfJS.ajax = reqwest.compat;

AlfJS.request = reqwest;