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


OPENWRT/LEDE VM
===============

There is an openwrt/lede based vm here will all you need to get started - it was written for eve-ng so to import
into there, login to eve-ng and run the following:

	wget ...
	mkdir -p /opt/unetlab/addons/qemu/linux-wanemu-gui
	gunzip -c lede-based-vm.qcow2.gz sataa.qcow2
	
And your done.. eve-ng will default to 1 ethernet interface, but you want more (start with 3 and go up by
increments of 2). As this is a web gui, you want to create the first interface on a cloud network. Assuming
dhcp is enabled, tthe vm will get an ip address and you can browse to http://its_ip_address/ to pull up 
the wanem gui. You can also browse to http://its_ip_address:8080 to get to the openwrt/lede interface

The interfaces are configured such that eth0 (first interface) is its web gui interface and every other
two interfaces are in a bridge (eth1, eth2 = bridge 1, eth3, eth4 = bridge 2 and so on). There are 4 bridges
by default, but if you know openwrt, this is easy enough to extend. 

To modify the startup for wanemu to also detect more interfaces, have a look at /opt/wanemu/startwanemu.sh
and it should be reasonably obvious what you need to do there.


TODO
====
- open to suggestions...?


DONE
====
- add interfaces via command line


BUGS
====

 - no form validation of any kind....
