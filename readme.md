wanemu
======

Its a simple wan emaulator that just used the linux netem stack, but puts a web gui in front of it.



network setup
=============

wanemu, on boot, looks for the modules it needs an installs them, this requires root priveledges. 
wanemu will also only work on interfaces with names that start with the name "emu", generally you'll
do this by createing a bridge across two itnerfaces on your linux box and controlling packets coming 
thru that bridge, eg:

	# brctl addbr emu-e0e1-0
	# brctl addif emu-e0e1-0 eth0
	# brctl addif emu-e0e1-0 eth1

This would create a bridge named "emu-e0e1-0" and add eth0 and eth1 interfaces to it, dont forget
to "up" it afterwwards.

You can control multiple bridges at once, so go nuts.



installation
============

copy the wanemu.js file to your server and run "nodejs wanemu.js 8080" which starts the web gui on port 8080.
