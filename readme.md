NodeJS Linux WAN Emulator Control
=================================

Its a simple wan emaulator that just used the linux netem stack, but puts a web gui in front of it.
Wrote it for myself, but figure someone might find it useful.



Network Setup
=============

wanemu.js tries to automagically modprobe the modules required for the netem component of the linux
QoS/CoS stack, this requires root to do, as does modifying the netem parameters so the wanemu.js 
should be run via sudo or as root. 

wanemu.js will look for interfaces on startup, either by finding interfaces with a name starting
with emu or they can be added to the command line directly.

The best way of using wanemu/netem is by putting it inline as a layer 2 device (in my opinion) using
a bridge setup.

Setting up a bridge in linux is pretty simple, Such a thing can be done using the brctl commands 
like so:

	# brctl addbr emu-e0e1-0
	# brctl addif emu-e0e1-0 eth0
	# brctl addif emu-e0e1-0 eth1

This would create a bridge named "emu-e0e1-0" and add eth0 and eth1 interfaces to it, dont forget
to "up" it afterwwards.

	# ifconfig eth0 up
	# ifconfig eth1 up
	# ifconfig emu-e0e1-0 up

It is possible to control any interface which netem supports, and to tell wanemu.js which interfaces
to use, these can be added to the command line after the port number.

installation
============

Copy the wanemu.js file to your server and run:

	nodejs wanemu.js 8080

which starts the web gui on port 8080.

to add control for additional interfaces, simply append the interface names to the end of the command line, i.e:

	nodejs wanemu.js 8080 eth1 eth2 eth3 dummy0 etc


TODO
====
- open to suggestions...?


DONE
====
- add interfaces via command line


BUGS
====

 - no form validation of any kind....
